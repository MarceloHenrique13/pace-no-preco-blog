import { HighlightsForm } from "@/components/admin/highlights-form";
import { requireAdminPage } from "@/lib/admin-guard";
import { getWeeklyHighlights } from "@/lib/content";

export default async function AdminHighlightsPage() {
  await requireAdminPage();
  const initial = await getWeeklyHighlights();

  return (
    <div>
      <h2 className="font-display text-3xl italic text-ink">Destaques da semana</h2>
      <p className="mt-2 text-sm text-muted">
        Exatamente 5 tênis. Links precisam ser meli.la ou mercadolivre.com.br.
      </p>
      <div className="mt-8">
        <HighlightsForm initial={initial} />
      </div>
    </div>
  );
}
