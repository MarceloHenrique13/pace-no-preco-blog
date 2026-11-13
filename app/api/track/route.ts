import { getSql } from "@/lib/db";

const ALLOWED_EVENTS = new Set(["group_click"]);

let tableReady = false;

async function ensureTable(sql: NonNullable<ReturnType<typeof getSql>>) {
  if (tableReady) return;
  await sql`
    CREATE TABLE IF NOT EXISTS page_events (
      id bigserial PRIMARY KEY,
      event text NOT NULL,
      placement text,
      path text,
      utm_content text,
      utm_campaign text,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `;
  tableReady = true;
}

function clean(value: unknown, max = 80): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().slice(0, max);
  return trimmed.length > 0 ? trimmed : null;
}

/** Conta cliques no botão do grupo. Sempre responde 204: rastrear não pode quebrar a página. */
export async function POST(req: Request) {
  try {
    const ua = req.headers.get("user-agent") ?? "";
    if (/bot|crawler|spider|headless/i.test(ua)) {
      return new Response(null, { status: 204 });
    }

    const body = (await req.json()) as Record<string, unknown>;
    const event = clean(body.event, 40);
    if (!event || !ALLOWED_EVENTS.has(event)) {
      return new Response(null, { status: 204 });
    }

    const sql = getSql();
    if (!sql) return new Response(null, { status: 204 });

    await ensureTable(sql);
    await sql`
      INSERT INTO page_events (event, placement, path, utm_content, utm_campaign)
      VALUES (
        ${event},
        ${clean(body.placement, 40)},
        ${clean(body.path, 120)},
        ${clean(body.utmContent)},
        ${clean(body.utmCampaign)}
      )
    `;
  } catch (error) {
    console.error("track failed", error);
  }
  return new Response(null, { status: 204 });
}
