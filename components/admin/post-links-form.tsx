"use client";

import { upload } from "@vercel/blob/client";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { compressImageForUpload } from "@/lib/compress-image";

type ShoeRow = {
  name: string;
  brand: string;
  mdxUrl: string;
  overrideUrl: string | null;
  mdxImage: string;
  overrideImage: string | null;
};

type Props = {
  slug: string;
  shoes: ShoeRow[];
  publishedViaAdmin: boolean;
  mdxCoverImage: string;
  overrideCoverImage: string | null;
};

export function PostLinksForm({
  slug,
  shoes,
  publishedViaAdmin,
  mdxCoverImage,
  overrideCoverImage,
}: Props) {
  const router = useRouter();
  const [values, setValues] = useState(
    Object.fromEntries(
      shoes.map((shoe) => [shoe.name, shoe.overrideUrl ?? ""]),
    ),
  );
  const [coverImage, setCoverImage] = useState(overrideCoverImage ?? "");
  const [shoeImages, setShoeImages] = useState(
    Object.fromEntries(
      shoes.map((shoe) => [shoe.name, shoe.overrideImage ?? ""]),
    ),
  );
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);

  const linksReady = useMemo(
    () => shoes.every((shoe) => (values[shoe.name] ?? "").trim().length > 0),
    [shoes, values],
  );

  async function uploadImage(pathname: string, file: File) {
    const prepared = await compressImageForUpload(file);
    const blob = await upload(pathname, prepared, {
      access: "public",
      handleUploadUrl: "/api/admin/upload",
    });
    return blob.url;
  }

  async function onPickCover(file: File | null) {
    if (!file) return;
    setUploading("cover");
    setError(null);
    setMessage(null);
    try {
      const url = await uploadImage(`posts/${slug}/cover-${preparedName(file)}`, file);
      setCoverImage(url);
      setMessage("Capa enviada. Clique em Salvar imagens para publicar.");
    } catch {
      setError(
        "Não foi possível enviar a capa. Confira o login e tente de novo.",
      );
    } finally {
      setUploading(null);
    }
  }

  async function onPickShoe(shoeName: string, file: File | null) {
    if (!file) return;
    setUploading(shoeName);
    setError(null);
    setMessage(null);
    try {
      const url = await uploadImage(
        `posts/${slug}/${slugify(shoeName)}-${preparedName(file)}`,
        file,
      );
      setShoeImages((prev) => ({ ...prev, [shoeName]: url }));
      setMessage("Imagem enviada. Clique em Salvar imagens para publicar.");
    } catch {
      setError(
        "Não foi possível enviar a imagem. Confira o login e tente de novo.",
      );
    } finally {
      setUploading(null);
    }
  }

  async function saveLinks() {
    setPending(true);
    setMessage(null);
    setError(null);
    const res = await fetch(`/api/admin/posts/${slug}/links`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        links: shoes.map((shoe) => ({
          shoeName: shoe.name,
          affiliateUrl: values[shoe.name] ?? "",
        })),
      }),
    });
    setPending(false);
    if (!res.ok) {
      setError("Falha ao salvar links. Use meli.la ou mercadolivre.com.br.");
      return;
    }
    setMessage("Links salvos.");
    router.refresh();
  }

  async function saveImages() {
    setPending(true);
    setMessage(null);
    setError(null);
    const res = await fetch(`/api/admin/posts/${slug}/images`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        coverImage: coverImage.trim() || null,
        shoes: shoes.map((shoe) => ({
          shoeName: shoe.name,
          imageUrl: (shoeImages[shoe.name] ?? "").trim() || null,
        })),
      }),
    });
    setPending(false);
    if (!res.ok) {
      setError("Falha ao salvar imagens. Use path /images/... ou URL https.");
      return;
    }
    setMessage("Imagens salvas. Já refletem no site (posts públicos).");
    router.refresh();
  }

  async function publish() {
    setPending(true);
    setMessage(null);
    setError(null);
    const res = await fetch(`/api/admin/posts/${slug}/publish`, {
      method: "POST",
    });
    setPending(false);
    if (res.status === 409) {
      setError("Preencha o link afiliado de todos os tênis antes de publicar.");
      return;
    }
    if (!res.ok) {
      setError("Não foi possível publicar.");
      return;
    }
    setMessage("Post publicado. Já pode aparecer no blog.");
    router.refresh();
  }

  async function unpublish() {
    setPending(true);
    setMessage(null);
    setError(null);
    const res = await fetch(`/api/admin/posts/${slug}/publish`, {
      method: "DELETE",
    });
    setPending(false);
    if (!res.ok) {
      setError("Não foi possível despublicar.");
      return;
    }
    setMessage("Publicação via admin removida.");
    router.refresh();
  }

  const busy = pending || uploading !== null;

  return (
    <div className="space-y-8">
      <section className="space-y-3 rounded-xl border border-line bg-white p-4">
        <h3 className="font-semibold text-ink">Capa do post</h3>
        <p className="text-xs text-muted">MDX: {mdxCoverImage}</p>
        {(coverImage || mdxCoverImage) && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverImage || mdxCoverImage}
            alt=""
            className="mt-2 h-36 w-full max-w-md rounded-lg object-cover"
          />
        )}
        <label className="block text-sm">
          <span className="mb-1 block text-muted">Imagem (path ou URL)</span>
          <input
            className="w-full rounded-lg border border-line px-3 py-2.5 text-sm"
            placeholder="/images/posts/... ou https://..."
            value={coverImage}
            onChange={(event) => setCoverImage(event.target.value)}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-muted">
            Ou enviar imagem do celular/PC
          </span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={busy}
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null;
              void onPickCover(file);
              event.target.value = "";
            }}
            className="block w-full text-sm text-muted file:mr-3 file:rounded-full file:border-0 file:bg-court file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
          />
          {uploading === "cover" ? (
            <p className="mt-2 text-sm text-muted">Enviando e comprimindo…</p>
          ) : null}
        </label>
      </section>

      {shoes.map((shoe) => (
        <fieldset
          key={shoe.name}
          className="space-y-3 rounded-xl border border-line bg-white p-4"
        >
          <legend className="px-1 font-semibold text-ink">
            {shoe.name}{" "}
            <span className="font-normal text-muted">· {shoe.brand}</span>
          </legend>
          <p className="text-xs text-muted">Link MDX: {shoe.mdxUrl}</p>
          <p className="text-xs text-muted">Imagem MDX: {shoe.mdxImage}</p>
          {(shoeImages[shoe.name] || shoe.mdxImage) && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={shoeImages[shoe.name] || shoe.mdxImage}
              alt=""
              className="h-28 w-28 rounded-lg object-cover"
            />
          )}
          <label className="block text-sm">
            <span className="mb-1 block text-muted">Link afiliado</span>
            <input
              className="w-full rounded-lg border border-line px-3 py-2.5 text-sm"
              placeholder="https://meli.la/..."
              value={values[shoe.name] ?? ""}
              onChange={(event) =>
                setValues((prev) => ({
                  ...prev,
                  [shoe.name]: event.target.value,
                }))
              }
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-muted">Imagem (path ou URL)</span>
            <input
              className="w-full rounded-lg border border-line px-3 py-2.5 text-sm"
              placeholder="/images/shoes/... ou https://..."
              value={shoeImages[shoe.name] ?? ""}
              onChange={(event) =>
                setShoeImages((prev) => ({
                  ...prev,
                  [shoe.name]: event.target.value,
                }))
              }
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-muted">
              Ou enviar imagem do celular/PC
            </span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={busy}
              onChange={(event) => {
                const file = event.target.files?.[0] ?? null;
                void onPickShoe(shoe.name, file);
                event.target.value = "";
              }}
              className="block w-full text-sm text-muted file:mr-3 file:rounded-full file:border-0 file:bg-court file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
            />
            {uploading === shoe.name ? (
              <p className="mt-2 text-sm text-muted">Enviando e comprimindo…</p>
            ) : null}
          </label>
        </fieldset>
      ))}

      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      {message ? <p className="text-sm text-court">{message}</p> : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={busy}
          onClick={saveLinks}
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-court px-5 text-sm font-semibold text-white disabled:opacity-60"
        >
          Salvar links
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={saveImages}
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-court px-5 text-sm font-semibold text-court disabled:opacity-60"
        >
          Salvar imagens
        </button>
        <button
          type="button"
          disabled={busy || !linksReady}
          onClick={publish}
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-court px-5 text-sm font-semibold text-court disabled:opacity-60"
        >
          Publicar
        </button>
        {publishedViaAdmin ? (
          <button
            type="button"
            disabled={busy}
            onClick={unpublish}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-line px-5 text-sm font-semibold text-muted disabled:opacity-60"
          >
            Despublicar
          </button>
        ) : null}
      </div>
    </div>
  );
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

function preparedName(file: File) {
  return file.name.replace(/\s+/g, "-").toLowerCase();
}
