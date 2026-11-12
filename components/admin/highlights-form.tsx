"use client";

import { upload } from "@vercel/blob/client";
import { useState } from "react";
import { compressImageForUpload } from "@/lib/compress-image";
import type { WeeklyHighlights } from "@/lib/schema";

type Props = {
  initial: WeeklyHighlights;
};

type ShoeDraft = WeeklyHighlights["shoes"][number];

export function HighlightsForm({ initial }: Props) {
  const [weekLabel, setWeekLabel] = useState(initial.weekLabel);
  const [shoes, setShoes] = useState<ShoeDraft[]>(
    [...initial.shoes].sort((a, b) => a.rank - b.rank),
  );
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [uploadingRank, setUploadingRank] = useState<number | null>(null);

  function updateShoe(index: number, patch: Partial<ShoeDraft>) {
    setShoes((prev) =>
      prev.map((shoe, i) => (i === index ? { ...shoe, ...patch } : shoe)),
    );
  }

  async function onPickImage(index: number, file: File | null) {
    if (!file) return;
    setUploadingRank(shoes[index]?.rank ?? null);
    setError(null);
    setMessage(null);
    try {
      const prepared = await compressImageForUpload(file);
      const blob = await upload(`highlights/${prepared.name}`, prepared, {
        access: "public",
        handleUploadUrl: "/api/admin/upload",
      });
      updateShoe(index, { image: blob.url });
      setMessage("Imagem enviada. Clique em Salvar destaques para publicar.");
    } catch {
      setError(
        "Não foi possível enviar a imagem. Confira o login e tente de novo.",
      );
    } finally {
      setUploadingRank(null);
    }
  }

  return (
    <form
      className="space-y-6"
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);
        setMessage(null);
        setError(null);
        const res = await fetch("/api/admin/highlights", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            weekLabel,
            updatedAt: new Date().toISOString().slice(0, 10),
            shoes,
          }),
        });
        setPending(false);
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(
            data.error === "invalid_affiliate_url"
              ? `Link inválido em ${data.shoe ?? "um tênis"} (use meli.la ou mercadolivre.com.br).`
              : "Não foi possível salvar. Confira o banco e os campos.",
          );
          return;
        }
        setMessage("Destaques salvos. A home já pode refletir a mudança.");
      }}
    >
      <label className="block text-sm">
        <span className="mb-1 block text-muted">Rótulo da semana</span>
        <input
          value={weekLabel}
          onChange={(event) => setWeekLabel(event.target.value)}
          className="w-full rounded-lg border border-line bg-white px-3 py-2.5"
          required
        />
      </label>

      {shoes.map((shoe, index) => (
        <fieldset
          key={shoe.rank}
          className="space-y-3 rounded-xl border border-line bg-white p-4"
        >
          <legend className="px-1 text-sm font-semibold">#{shoe.rank}</legend>
          {(
            [
              ["name", "Nome"],
              ["brand", "Marca"],
              ["bestFor", "Melhor para"],
              ["image", "Imagem (path ou URL)"],
              ["affiliateUrl", "Link afiliado"],
            ] as const
          ).map(([field, label]) => (
            <label key={field} className="block text-sm">
              <span className="mb-1 block text-muted">{label}</span>
              <input
                value={shoe[field]}
                onChange={(event) =>
                  updateShoe(index, { [field]: event.target.value })
                }
                className="w-full rounded-lg border border-line bg-white px-3 py-2.5"
                required
              />
            </label>
          ))}

          <label className="block text-sm">
            <span className="mb-1 block text-muted">
              Ou enviar imagem do celular/PC
            </span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={uploadingRank !== null || pending}
              onChange={(event) => {
                const file = event.target.files?.[0] ?? null;
                void onPickImage(index, file);
                event.target.value = "";
              }}
              className="block w-full text-sm text-muted file:mr-3 file:rounded-full file:border-0 file:bg-court file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
            />
            {uploadingRank === shoe.rank ? (
              <p className="mt-2 text-sm text-muted">Enviando e comprimindo…</p>
            ) : null}
          </label>
        </fieldset>
      ))}

      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      {message ? <p className="text-sm text-court">{message}</p> : null}

      <button
        type="submit"
        disabled={pending || uploadingRank !== null}
        className="inline-flex min-h-11 items-center justify-center rounded-full bg-court px-5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Salvando…" : "Salvar destaques"}
      </button>
    </form>
  );
}
