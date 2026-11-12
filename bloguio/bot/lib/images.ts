import { existsSync } from "node:fs";
import path from "node:path";
import { isBlockedCommerceHost } from "./affiliates.js";
import { type BlogPaths, assertInside } from "./paths.js";

const GENERIC_TOKENS = new Set([
  "tenis",
  "corrida",
  "running",
  "masculino",
  "feminino",
  "feminina",
  "melhor",
  "barato",
  "iniciante",
  "iniciantes",
  "para",
  "com",
]);

export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function imagePublicPath(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed.startsWith("/images/")) return undefined;
  if (trimmed.includes("..") || trimmed.includes("\\") || trimmed.includes("?")) {
    return undefined;
  }
  return trimmed;
}

export function pendenteImagePath(folder: "posts" | "shoes", modelName: string): string {
  return `/images/${folder}/pendente-${slugify(modelName)}.jpg`;
}

function basenameOf(publicPath: string): string {
  return path.posix.basename(publicPath).replace(/\.[a-z0-9]+$/i, "");
}

function distinctiveTokens(modelName: string): string[] {
  return slugify(modelName)
    .split("-")
    .filter((token) => token.length >= 4 && !GENERIC_TOKENS.has(token));
}

export function imageMatchesModel(publicPath: string, modelName: string): boolean {
  const base = basenameOf(publicPath);
  const modelSlug = slugify(modelName);
  if (!modelSlug) return false;
  if (base === `pendente-${modelSlug}` || base.startsWith(`pendente-${modelSlug}-`)) {
    return true;
  }
  const required = distinctiveTokens(modelName);
  if (required.length === 0) return false;
  return required.every((token) => base.includes(token));
}

export type ImageCheck = {
  ok: true;
  publicPath: string;
  pending: boolean;
  flag?: string;
} | {
  ok: false;
  reason: string;
};

export function checkImageReference(
  paths: BlogPaths,
  publicPath: string,
  modelName: string,
  folder: "posts" | "shoes",
): ImageCheck {
  if (/^https?:\/\//i.test(publicPath.trim())) {
    try {
      const host = new URL(publicPath).hostname;
      if (isBlockedCommerceHost(host)) {
        return {
          ok: false,
          reason: "Não baixo nem referencio imagem do Mercado Livre.",
        };
      }
    } catch {
      return { ok: false, reason: "URL de imagem inválida." };
    }
    return {
      ok: false,
      reason: "Imagem tem de ser caminho local em /images, não URL.",
    };
  }

  const normalized = imagePublicPath(publicPath);
  if (!normalized || !normalized.startsWith(`/images/${folder}/`)) {
    return {
      ok: false,
      reason: `Imagem de ${folder === "shoes" ? "tênis" : "capa"} tem de estar em /images/${folder}/.`,
    };
  }

  const base = path.posix.basename(normalized);
  const absolute = assertInside(
    folder === "shoes" ? paths.imageShoesDir : paths.imagePostsDir,
    base,
  );
  const pending = !existsSync(absolute);
  if (pending && !basenameOf(normalized).startsWith("pendente-")) {
    return {
      ok: false,
      reason: `Arquivo ${normalized} não existe. Sem a foto do modelo exato, use ${pendenteImagePath(folder, modelName)} e sinalize.`,
    };
  }
  if (!imageMatchesModel(normalized, modelName)) {
    return {
      ok: false,
      reason: `A foto ${normalized} não corresponde ao modelo "${modelName}". Use a foto desse modelo ou ${pendenteImagePath(folder, modelName)}.`,
    };
  }
  if (pending) {
    return {
      ok: true,
      publicPath: normalized,
      pending: true,
      flag: `Foto pendente de "${modelName}": ${normalized}. Não publique até confirmar o arquivo do modelo exato.`,
    };
  }
  return {
    ok: true,
    publicPath: normalized,
    pending: false,
    flag: `Confirme visualmente se ${normalized} é exatamente "${modelName}" (mesmo modelo e colorway).`,
  };
}

const PNG = [0x89, 0x50, 0x4e, 0x47];

export function imageSize(bytes: Buffer): { width: number; height: number } | undefined {
  if (bytes.length >= 24 && PNG.every((byte, index) => bytes[index] === byte)) {
    return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
  }
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return undefined;
  let offset = 2;
  while (offset + 8 < bytes.length) {
    if (bytes[offset] !== 0xff) return undefined;
    const marker = bytes[offset + 1];
    if (marker === 0xd9 || marker === 0xda) return undefined;
    const length = bytes.readUInt16BE(offset + 2);
    if (length < 2 || offset + 2 + length > bytes.length) return undefined;
    const startOfFrame = [
      0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf,
    ];
    if (startOfFrame.includes(marker)) {
      return {
        height: bytes.readUInt16BE(offset + 5),
        width: bytes.readUInt16BE(offset + 7),
      };
    }
    offset += 2 + length;
  }
  return undefined;
}
