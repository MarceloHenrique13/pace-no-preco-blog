import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import {
  AFFILIATE_PLACEHOLDER,
  classifyAffiliateUrl,
  commerceUrlsInText,
} from "./affiliates.js";
import { checkImageReference, imagePublicPath, slugify } from "./images.js";
import { type BlogPaths, postFilePath } from "./paths.js";

const CATEGORIES = new Set(["tenis", "corrida", "treino", "iniciantes", "ofertas"]);
const PT_PT = ["telemóvel", "telemovel", "desporto", "autocarro", "rapariga", "pequeno-almoço"];
const BANNED_VISIBLE = ["afiliado", "afiliados", "comissão", "comissao", "disclosure"];

export type ShoeInput = {
  rank: number;
  name: string;
  brand: string;
  affiliateUrl: string;
  image: string;
  pros: string[];
  bestFor: string;
};

export type FaqInput = {
  question: string;
  answer: string;
};

export type PostInput = {
  keyword: string;
  intention: "informacional" | "comercial" | "comparativa";
  secondaryKeywords: string[];
  title: string;
  slug: string;
  description: string;
  publishedAt: string;
  updatedAt: string;
  category: string;
  tags: string[];
  coverImage: string;
  shoes: ShoeInput[];
  faq: FaqInput[];
  body: string;
  linksInformadosPeloMarcelo: string[];
};

export type PostDraft = {
  title: string;
  slug: string;
  description: string;
  publishedAt: string;
  updatedAt: string;
  category: string;
  tags: string[];
  coverImage: string;
  affiliateDisclosure: true;
  draft: true;
  shoes: Array<{
    rank: number;
    name: string;
    brand: string;
    affiliateUrl: string;
    image: string;
    pros: string[];
    bestFor: string;
  }>;
  faq: FaqInput[];
  body: string;
};

export type ExistingPost = {
  file: string;
  slug: string;
  draft: boolean;
};

export type GateOk = {
  ok: true;
  format: "ranking" | "guia";
  post: PostDraft;
  imageFlags: string[];
  linksParaColarNoAdmin: string[];
  needsHumanLinkApproval: boolean;
};

export type GateFailure = { ok: false; errors: string[] };

function chars(value: string): number {
  return [...value].length;
}

function yamlQuote(value: string): string {
  return JSON.stringify(value);
}

function frontmatterOf(raw: string): string | undefined {
  if (!raw.startsWith("---\n")) return undefined;
  const end = raw.indexOf("\n---", 4);
  if (end === -1) return undefined;
  return raw.slice(4, end);
}

function field(frontmatter: string, key: string): string | undefined {
  const match = frontmatter.match(new RegExp(`^${key}:\\s*(.*)$`, "m"));
  if (!match) return undefined;
  return match[1].trim().replace(/^["']|["']$/g, "");
}

export function existingPosts(paths: BlogPaths): ExistingPost[] {
  if (!existsSync(paths.postsDir)) return [];
  return readdirSync(paths.postsDir)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => {
      const raw = readFileSync(path.join(paths.postsDir, file), "utf8");
      const frontmatter = frontmatterOf(raw) ?? "";
      const slug = field(frontmatter, "slug") ?? file.replace(/\.mdx$/, "");
      return {
        file,
        slug,
        draft: field(frontmatter, "draft") === "true",
      };
    });
}

function firstParagraph(body: string): string {
  return body.trim().split(/\n\s*\n/)[0] ?? "";
}

function mentions(haystack: string, needle: string): boolean {
  return haystack.toLocaleLowerCase("pt-BR").includes(needle.toLocaleLowerCase("pt-BR"));
}

function internalSlugs(body: string): string[] {
  const found = new Set<string>();
  for (const match of body.matchAll(/\/blog\/([a-z0-9]+(?:-[a-z0-9]+)*)/g)) {
    found.add(match[1]);
  }
  return [...found];
}

function resolveCover(
  paths: BlogPaths,
  input: PostInput,
  imageFlags: string[],
  errors: string[],
): string | undefined {
  const raw = input.coverImage.trim();
  if (/^https?:\/\//i.test(raw)) {
    errors.push("Capa tem de ser arquivo local em /images/posts, nunca URL e nunca foto do Mercado Livre.");
    return undefined;
  }
  const publicPath = imagePublicPath(raw);
  if (!publicPath?.startsWith("/images/posts/")) {
    errors.push("coverImage tem de começar com /images/posts/.");
    return undefined;
  }
  const base = path.posix.basename(publicPath);
  const absolute = path.join(paths.imagePostsDir, base);
  if (path.resolve(absolute) !== path.join(paths.imagePostsDir, base)) {
    errors.push("Caminho de capa inválido.");
    return undefined;
  }
  if (existsSync(absolute)) {
    imageFlags.push(
      `Capa existente ${publicPath}. Se ela mostra um tênis, tem de ser o modelo do post, não um parecido.`,
    );
    return publicPath;
  }
  const pendingNames = [`pendente-${input.slug}`, `pendente-${slugify(input.title)}`];
  const stem = base.replace(/\.[a-z0-9]+$/i, "");
  if (pendingNames.some((name) => stem === name || stem.startsWith(`${name}-`))) {
    imageFlags.push(`Capa pendente: ${publicPath}. Não invente a foto.`);
    return publicPath;
  }
  errors.push(
    `Capa ${publicPath} não existe. Use /images/posts/pendente-${input.slug}.jpg e sinalize, ou uma imagem que já esteja em public/images/posts/.`,
  );
  return undefined;
}

function dateOk(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function gatePost(paths: BlogPaths, input: PostInput): GateOk | GateFailure {
  const errors: string[] = [];
  const imageFlags: string[] = [];
  const linksParaColarNoAdmin: string[] = [];
  const shoes = input.shoes ?? [];
  const format = shoes.length > 0 ? "ranking" : "guia";
  const keyword = input.keyword.trim();

  if (chars(keyword) < 8) errors.push("Keyword principal curta demais.");
  if (input.secondaryKeywords.length < 3 || input.secondaryKeywords.length > 5) {
    errors.push("Informe 3 a 5 keywords secundárias.");
  }
  if (!input.title.trim().toLocaleLowerCase("pt-BR").includes(keyword.toLocaleLowerCase("pt-BR"))) {
    errors.push("A keyword principal tem de aparecer no title, do jeito que a pessoa pesquisa.");
  }
  if (format === "ranking" && !input.title.startsWith("Os 5 melhores")) {
    errors.push('Ranking usa title começando com "Os 5 melhores".');
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.slug)) {
    errors.push("Slug tem de ser kebab-case, sem acento.");
  }
  const descriptionLength = chars(input.description.trim());
  if (descriptionLength < 120 || descriptionLength > 160) {
    errors.push(`Description tem ${descriptionLength} caracteres; o contrato pede 120 a 160.`);
  }
  if (!dateOk(input.publishedAt) || !dateOk(input.updatedAt)) {
    errors.push("publishedAt e updatedAt no formato YYYY-MM-DD.");
  } else if (input.updatedAt < input.publishedAt) {
    errors.push("updatedAt não pode ser anterior a publishedAt.");
  }
  if (!CATEGORIES.has(input.category)) {
    errors.push("Categoria deve ser tenis, corrida, treino, iniciantes ou ofertas.");
  }
  if (input.tags.length < 2 || input.tags.some((tag) => !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(tag))) {
    errors.push("Tags: 2 ou mais, em kebab-case sem acento.");
  }

  const body = input.body.trim();
  if (chars(body) < 280) errors.push("Corpo fino demais. Escreva um texto útil, não só o card.");
  if (/^#\s/m.test(body)) errors.push("Não repita H1 no corpo. O H1 é o title.");
  if (!mentions(firstParagraph(body), keyword)) {
    errors.push("A keyword principal tem de aparecer no primeiro parágrafo.");
  }

  const visible = [input.title, input.description, body, ...input.faq.map((item) => `${item.question} ${item.answer}`)].join("\n");
  const visibleFold = visible.toLocaleLowerCase("pt-BR");
  for (const word of [...PT_PT, ...BANNED_VISIBLE]) {
    if (visibleFold.includes(word)) {
      errors.push(`Texto visível não pode conter "${word}".`);
    }
  }

  const posts = existingPosts(paths);
  const targetName = `${input.slug}.mdx`;
  for (const post of posts) {
    if (post.slug === input.slug && post.file !== targetName) {
      errors.push(`Slug ${input.slug} já existe em ${post.file}. Escolha outro ângulo.`);
    }
  }
  const target = postFilePath(paths, input.slug);
  if (existsSync(target)) {
    const current = posts.find((post) => post.file === targetName);
    if (!current?.draft) {
      errors.push("Esse arquivo não está draft: true. Não altero post publicado nem tiro o rascunho.");
    }
  }

  const others = posts.filter((post) => post.slug !== input.slug);
  const linked = internalSlugs(body).filter((slug) => slug !== input.slug);
  const unknown = linked.filter((slug) => !others.some((post) => post.slug === slug));
  if (unknown.length > 0) {
    errors.push(`Link interno inventado: ${unknown.join(", ")}.`);
  }
  const minimum = Math.min(2, others.length);
  if (linked.length < minimum || linked.length > 4) {
    errors.push(
      minimum === 0
        ? "Ainda não há outro post real para link interno."
        : `Use de ${minimum} a 4 links internos para slugs que já existem (há ${others.length}).`,
    );
  }

  if (format === "ranking" && shoes.length !== 5) {
    errors.push("Ranking precisa de exatamente 5 itens em shoes[].");
  }
  const ranks = shoes.map((shoe) => shoe.rank);
  if (format === "ranking" && new Set(ranks).size !== 5) {
    errors.push("Os ranks do ranking têm de ser 1, 2, 3, 4 e 5, sem repetir.");
  }
  if (format === "ranking" && !ranks.every((rank) => rank >= 1 && rank <= 5)) {
    errors.push("Rank de tênis fica entre 1 e 5.");
  }

  const faq = input.faq ?? [];
  if (format === "ranking" && (faq.length < 3 || faq.length > 6)) {
    errors.push("Ranking precisa de FAQ com 3 a 6 perguntas.");
  }
  if (format === "guia" && faq.length > 0 && (faq.length < 3 || faq.length > 6)) {
    errors.push("FAQ, quando existir, tem 3 a 6 perguntas.");
  }
  for (const item of faq) {
    if (!item.question.trim().endsWith("?")) {
      errors.push("Cada pergunta do FAQ termina com ?.");
    }
    if (chars(item.answer.trim()) < 40) {
      errors.push("Resposta de FAQ curta demais para ser útil.");
    }
  }

  const provided = input.linksInformadosPeloMarcelo ?? [];
  const draftShoes: PostDraft["shoes"] = [];
  const seenNames = new Set<string>();
  const seenImages = new Set<string>();
  for (const shoe of shoes) {
    const name = shoe.name.trim();
    if (seenNames.has(name.toLocaleLowerCase("pt-BR"))) {
      errors.push(`Modelo repetido: ${name}.`);
    }
    seenNames.add(name.toLocaleLowerCase("pt-BR"));
    if (!shoe.brand.trim() || !shoe.bestFor.trim()) {
      errors.push(`Marca e bestFor são obrigatórios em ${name || "tênis sem nome"}.`);
    }
    if (shoe.pros.length < 2 || shoe.pros.some((item) => !item.trim())) {
      errors.push(`${name}: informe ao menos 2 pros reais. Sem campo cons.`);
    }
    const affiliate = classifyAffiliateUrl(shoe.affiliateUrl, provided);
    if (affiliate.kind === "reject") {
      errors.push(`${name}: ${affiliate.reason}`);
      continue;
    }
    if (affiliate.kind === "provided") linksParaColarNoAdmin.push(affiliate.url);
    const image = checkImageReference(paths, shoe.image, name, "shoes");
    if (!image.ok) {
      errors.push(`${name}: ${image.reason}`);
      continue;
    }
    if (seenImages.has(image.publicPath)) {
      errors.push(`A mesma foto ${image.publicPath} não pode ilustrar dois modelos.`);
    }
    seenImages.add(image.publicPath);
    if (image.flag) imageFlags.push(image.flag);
    draftShoes.push({
      rank: shoe.rank,
      name,
      brand: shoe.brand.trim(),
      affiliateUrl: affiliate.url,
      image: image.publicPath,
      pros: shoe.pros.map((item) => item.trim()),
      bestFor: shoe.bestFor.trim(),
    });
  }

  const coverImage = resolveCover(paths, input, imageFlags, errors);

  for (const url of commerceUrlsInText(visible)) {
    if (url === AFFILIATE_PLACEHOLDER) continue;
    const decision = classifyAffiliateUrl(url, provided);
    if (decision.kind === "reject") {
      errors.push(`No texto: ${decision.reason}`);
    } else if (decision.kind === "provided" && !linksParaColarNoAdmin.includes(decision.url)) {
      linksParaColarNoAdmin.push(decision.url);
    }
  }

  if (format === "ranking" && shoes.length === 5 && draftShoes.length !== 5) {
    errors.push("O ranking não fechou os 5 tênis. Nada foi gravado.");
  }
  if (errors.length > 0 || !coverImage) {
    return { ok: false, errors };
  }

  const post: PostDraft = {
    title: input.title.trim(),
    slug: input.slug,
    description: input.description.trim(),
    publishedAt: input.publishedAt,
    updatedAt: input.updatedAt,
    category: input.category,
    tags: input.tags,
    coverImage,
    affiliateDisclosure: true,
    draft: true,
    shoes: draftShoes.sort((a, b) => a.rank - b.rank),
    faq,
    body,
  };

  return {
    ok: true,
    format,
    post,
    imageFlags,
    linksParaColarNoAdmin,
    needsHumanLinkApproval: draftShoes.some((shoe) => shoe.affiliateUrl !== AFFILIATE_PLACEHOLDER) || linksParaColarNoAdmin.length > 0,
  };
}

export function renderMdx(post: PostDraft): string {
  const tags = post.tags.map((tag) => `  - ${yamlQuote(tag)}`).join("\n");
  const shoes = post.shoes
    .map((shoe) =>
      [
        `  - rank: ${shoe.rank}`,
        `    name: ${yamlQuote(shoe.name)}`,
        `    brand: ${yamlQuote(shoe.brand)}`,
        `    affiliateUrl: ${yamlQuote(shoe.affiliateUrl)}`,
        `    image: ${yamlQuote(shoe.image)}`,
        `    pros:`,
        ...shoe.pros.map((item) => `      - ${yamlQuote(item)}`),
        `    bestFor: ${yamlQuote(shoe.bestFor)}`,
      ].join("\n"),
    )
    .join("\n");
  const faq = post.faq
    .map(
      (item) =>
        `  - question: ${yamlQuote(item.question)}\n    answer: ${yamlQuote(item.answer)}`,
    )
    .join("\n");
  const lines = [
    "---",
    `title: ${yamlQuote(post.title)}`,
    `slug: ${post.slug}`,
    `description: ${yamlQuote(post.description)}`,
    `publishedAt: ${post.publishedAt}`,
    `updatedAt: ${post.updatedAt}`,
    `category: ${post.category}`,
    "tags:",
    tags,
    `coverImage: ${yamlQuote(post.coverImage)}`,
    "affiliateDisclosure: true",
    "draft: true",
  ];
  if (post.shoes.length > 0) {
    lines.push("shoes:", shoes);
  } else {
    lines.push("shoes: []");
  }
  if (post.faq.length > 0) {
    lines.push("faq:", faq);
  }
  lines.push("---", "", post.body.trim(), "");
  const rendered = lines.join("\n");
  if (!rendered.includes("\ndraft: true\n")) {
    throw new Error("Renderização sem draft: true.");
  }
  if (slugify(post.slug) !== post.slug) {
    throw new Error("Slug escapou da normalização.");
  }
  return rendered;
}
