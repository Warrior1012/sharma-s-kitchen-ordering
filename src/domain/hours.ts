import type { OpeningWindow, StoreSettings } from "./types";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function to12h(t: string): string {
  const h = Number(t.slice(0, 2));\n  const m = Number(t.slice(3, 5));
  const suffix = h >= 12 ? "pm" : "am";
  const hh = h % 12 === 0 ? 12 : h % 12;
  return m ? `${hh}:${String(m).padStart(2, "0")}${suffix}` : `${hh}${suffix}`;
}

export function weeklyHours(windows: OpeningWindow[]): { day: string; hours: string }[] {
  return [1, 2, 3, 4, 5, 6, 0].map((d) => {
    const w = windows.filter((x) => x.day === d);
    return { day: DAYS[d] ?? "Unknown", hours: w.length ? w.map((x) => `${to12h(x.open)} to ${to12h(x.close)}`).join(", ") : "Closed" };
  });
}

export function schemaOpeningHours(windows: OpeningWindow[]): string[] {
  const ab = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  return windows.map((w) => `${ab[w.day]} ${w.open}-${w.close}`);
}

export interface StoreClock {
  day: number;
  minutes: number;
  date: string;
}

export function storeClock(now = new Date(), timeZone = "Asia/Kolkata"): StoreClock {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "0";
  const weekday = get("weekday");
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(weekday);
  return {
    day: day < 0 ? 0 : day,
    minutes: Number(get("hour")) * 60 + Number(get("minute")),
    date: `${get("year")}-${get("month")}-${get("day")}`,
  };
}

function minutesOf(value: string): number {
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
}

/** Client-side demo guard. A real deployment must repeat this check in a DB transaction. */
export function isStoreOpen(settings: Pick<StoreSettings, "acceptingOrders" | "openingHours" | "timezone">, now = new Date()): boolean {
  if (!settings.acceptingOrders) return false;
  const clock = storeClock(now, settings.timezone || "Asia/Kolkata");
  return settings.openingHours.some((window) => {
    if (window.day !== clock.day) return false;
    const open = minutesOf(window.open);
    const close = minutesOf(window.close);
    return open <= close ? clock.minutes >= open && clock.minutes < close : clock.minutes >= open || clock.minutes < close;
  });
}

export function formatStoreTime(now = new Date(), timeZone = "Asia/Kolkata"): string {
  return new Intl.DateTimeFormat("en-IN", { timeZone, dateStyle: "medium", timeStyle: "short" }).format(now);
}
