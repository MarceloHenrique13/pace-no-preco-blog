import { getSql } from "@/lib/db";

export type GroupClickStats = {
  total: number;
  today: number;
  last7Days: number;
  byPlacement: { label: string; count: number }[];
  byAd: { label: string; count: number }[];
};

type Row = { label: string | null; count: number };

/**
 * Cliques no botão "Entrar no grupo" da /grupo, gravados por POST /api/track
 * na tabela page_events (Neon). "Hoje" usa o fuso de São Paulo.
 * Retorna null se o banco não estiver configurado ou a tabela ainda não existir
 * (ela é criada no primeiro clique registrado).
 */
export async function getGroupClickStats(): Promise<GroupClickStats | null> {
  const sql = getSql();
  if (!sql) return null;

  try {
    const [totals] = (await sql`
      SELECT
        count(*)::int AS total,
        count(*) FILTER (
          WHERE (created_at AT TIME ZONE 'America/Sao_Paulo')::date
              = (now() AT TIME ZONE 'America/Sao_Paulo')::date
        )::int AS today,
        count(*) FILTER (WHERE created_at >= now() - interval '7 days')::int AS last7
      FROM page_events
      WHERE event = 'group_click'
    `) as { total: number; today: number; last7: number }[];

    const placements = (await sql`
      SELECT placement AS label, count(*)::int AS count
      FROM page_events
      WHERE event = 'group_click'
      GROUP BY placement
      ORDER BY count DESC
    `) as Row[];

    const ads = (await sql`
      SELECT utm_content AS label, count(*)::int AS count
      FROM page_events
      WHERE event = 'group_click' AND utm_content IS NOT NULL
      GROUP BY utm_content
      ORDER BY count DESC
      LIMIT 10
    `) as Row[];

    const toList = (rows: Row[]) =>
      rows.map((row) => ({ label: row.label ?? "(sem nome)", count: row.count }));

    return {
      total: totals?.total ?? 0,
      today: totals?.today ?? 0,
      last7Days: totals?.last7 ?? 0,
      byPlacement: toList(placements),
      byAd: toList(ads),
    };
  } catch (error) {
    // Tabela ainda não criada (nenhum clique registrado) ou banco indisponível.
    const message = error instanceof Error ? error.message : String(error);
    if (!/page_events/.test(message)) {
      console.error("getGroupClickStats failed", error);
    }
    return null;
  }
}
