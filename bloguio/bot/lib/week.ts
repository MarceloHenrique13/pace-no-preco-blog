const MONTHS = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
] as const;

const SAO_PAULO_OFFSET_MS = 3 * 60 * 60 * 1000;

export type SaoPauloWeek = {
  weekLabel: string;
  updatedAt: string;
};

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

/** Data civil em America/Sao_Paulo. O fuso é UTC−3 o ano inteiro. */
export function saoPauloWeek(now = new Date()): SaoPauloWeek {
  const local = new Date(now.getTime() - SAO_PAULO_OFFSET_MS);
  const year = local.getUTCFullYear();
  const month = local.getUTCMonth();
  const day = local.getUTCDate();
  const weekday = local.getUTCDay();
  const fromMonday = (weekday + 6) % 7;
  const monday = new Date(Date.UTC(year, month, day - fromMonday));
  const sunday = new Date(Date.UTC(year, month, day - fromMonday + 6));
  const mondayMonth = MONTHS[monday.getUTCMonth()];
  const sundayMonth = MONTHS[sunday.getUTCMonth()];
  const weekLabel =
    mondayMonth === sundayMonth
      ? `${monday.getUTCDate()} a ${sunday.getUTCDate()} de ${mondayMonth}`
      : `${monday.getUTCDate()} de ${mondayMonth} a ${sunday.getUTCDate()} de ${sundayMonth}`;

  return {
    weekLabel,
    updatedAt: `${year}-${pad(month + 1)}-${pad(day)}`,
  };
}
