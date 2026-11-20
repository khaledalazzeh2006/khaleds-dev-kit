export interface TimeFormats {
  iso: string;
  utc: string;
  local: string;
  unixSeconds: string;
  unixMs: string;
  relative: string;
}

/**
 * Accepts unix seconds (10 digits), unix milliseconds (13 digits) or any date string Date can parse.
 * Returns null if it can't be understood.
 */
export function parseTime(input: string): Date | null {
  const s = input.trim();
  if (!s) return null;
  if (/^-?\d+(\.\d+)?$/.test(s)) {
    const n = Number(s);
    // Below ~year 5138 in seconds: treat ≤ 11 integer digits as seconds, otherwise milliseconds.
    const ms = Math.abs(Math.trunc(n)).toString().length <= 11 ? n * 1000 : n;
    const d = new Date(ms);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

const units: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 24 * 3600],
  ["month", 30 * 24 * 3600],
  ["week", 7 * 24 * 3600],
  ["day", 24 * 3600],
  ["hour", 3600],
  ["minute", 60],
  ["second", 1],
];

export function relativeTime(date: Date, now = new Date()): string {
  const diff = (date.getTime() - now.getTime()) / 1000;
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  for (const [unit, secs] of units) {
    if (Math.abs(diff) >= secs || unit === "second")
      return rtf.format(Math.round(diff / secs), unit);
  }
  return "";
}

export function formatTime(date: Date, now = new Date(), timeZone?: string): TimeFormats {
  return {
    iso: date.toISOString(),
    utc: date.toUTCString(),
    local: date.toLocaleString("en-GB", { dateStyle: "full", timeStyle: "long", timeZone }),
    unixSeconds: String(Math.floor(date.getTime() / 1000)),
    unixMs: String(date.getTime()),
    relative: relativeTime(date, now),
  };
}
