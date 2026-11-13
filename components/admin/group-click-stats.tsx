import type { GroupClickStats } from "@/lib/page-events";

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-line bg-white p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
      <p className="font-display mt-1 text-4xl italic text-ink">{value}</p>
    </div>
  );
}

function Breakdown({
  title,
  rows,
}: {
  title: string;
  rows: { label: string; count: number }[];
}) {
  if (rows.length === 0) return null;
  return (
    <div className="rounded-xl border border-line bg-white p-5">
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      <ul className="mt-3 space-y-1.5 text-sm">
        {rows.map((row) => (
          <li key={row.label} className="flex items-center justify-between gap-4">
            <span className="text-muted">{row.label}</span>
            <span className="font-semibold text-ink">{row.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function GroupClickStatsPanel({ stats }: { stats: GroupClickStats | null }) {
  return (
    <section aria-labelledby="group-clicks-title" className="space-y-4">
      <div>
        <h2 id="group-clicks-title" className="font-semibold text-ink">
          Cliques em &ldquo;Entrar no grupo&rdquo;
        </h2>
        <p className="mt-1 text-sm text-muted">
          Contados na página /grupo (banco do site). Visitas da página ficam no painel de
          Analytics da Vercel; a taxa de clique é cliques ÷ visitantes.
        </p>
      </div>

      {stats === null ? (
        <p className="rounded-xl border border-line bg-white p-5 text-sm text-muted">
          Ainda sem dados: o primeiro clique no botão cria a tabela e o contador aparece aqui.
        </p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Stat label="Hoje" value={stats.today} />
            <Stat label="Últimos 7 dias" value={stats.last7Days} />
            <Stat label="Total" value={stats.total} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Breakdown title="Por botão (topo ou rodapé)" rows={stats.byPlacement} />
            <Breakdown title="Por anúncio (utm_content)" rows={stats.byAd} />
          </div>
        </>
      )}
    </section>
  );
}
