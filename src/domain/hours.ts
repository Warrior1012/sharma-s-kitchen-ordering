import type { OpeningWindow } from "./types";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function to12h(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const suffix = h >= 12 ? "pm" : "am";
  const hh = h % 12 === 0 ? 12 : h % 12;
  return m ? `${hh}:${String(m).padStart(2, "0")}${suffix}` : `${hh}${suffix}`;
}

/** Week starting Monday, for display only. Opening hours are enforced server-side once a backend exists. */
export function weeklyHours(windows: OpeningWindow[]): { day: string; hours: string }[] {
  return [1, 2, 3, 4, 5, 6, 0].map((d) => {
    const w = windows.filter((x) => x.day === d);
    return {
      day: DAYS[d],
      hours: w.length ? w.map((x) => `${to12h(x.open)} to ${to12h(x.close)}`).join(", ") : "Closed",
    };
  });
}

/** schema.org openingHours strings, e.g. "Tu 11:00-23:00". */
export function schemaOpeningHours(windows: OpeningWindow[]): string[] {
  const ab = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  return windows.map((w) => `${ab[w.day]} ${w.open}-${w.close}`);
}
