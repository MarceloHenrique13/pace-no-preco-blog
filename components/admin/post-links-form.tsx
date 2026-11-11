"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type ShoeRow = {
  name: string;
  brand: string;
  mdxUrl: string;
  overrideUrl: string | null;
};

type Props = {
  slug: string;
  shoes: ShoeRow[];
  publishedViaAdmin: boolean;
};

export function PostLinksForm({ slug, shoes, publishedViaAdmin }: Props) {
  const router = useRouter();
  const [values, setValues] = useState(
    Object.fromEntries(
      shoes.map((shoe) => [shoe.name, shoe.overrideUrl ?? ""]),
    ),
  );
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const linksReady = useMemo(
    () => shoes.every((shoe) => (values[shoe.name] ?? "").trim().length > 0),
    [shoes, values],
  );

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

  return (
    <div className="space-y-6">
      {shoes.map((shoe) => (
        <label key={shoe.name} className="block rounded-xl border border-line bg-white p-4">
          <span className="font-semibold text-ink">
            {shoe.name}{" "}
            <span className="font-normal text-muted">· {shoe.brand}</span>
          </span>
          <span className="mt-1 block text-xs text-muted">
            MDX: {shoe.mdxUrl}
          </span>
          <input
            className="mt-3 w-full rounded-lg border border-line px-3 py-2.5 text-sm"
            placeholder="https://meli.la/..."
            value={values[shoe.name] ?? ""}
            onChange={(event) =>
              setValues((prev) => ({ ...prev, [shoe.name]: event.target.value }))
            }
          />
        </label>
      ))}

      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      {message ? <p className="text-sm text-court">{message}</p> : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={pending}
          onClick={saveLinks}
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-court px-5 text-sm font-semibold text-white disabled:opacity-60"
        >
          Salvar links
        </button>
        <button
          type="button"
          disabled={pending || !linksReady}
          onClick={publish}
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-court px-5 text-sm font-semibold text-court disabled:opacity-60"
        >
          Publicar
        </button>
        {publishedViaAdmin ? (
          <button
            type="button"
            disabled={pending}
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
