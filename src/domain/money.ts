import type { Paise } from "./types";

const fmt = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function formatINR(paise: Paise): string {
  if (!Number.isInteger(paise)) throw new Error("Money must be integer paise");
  return fmt.format(paise / 100);
}

export function rupeesToPaise(rupees: number): Paise {
  return Math.round(rupees * 100);
}
