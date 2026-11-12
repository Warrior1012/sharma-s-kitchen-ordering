import type { CartLine, FulfilmentType, MenuItem, Paise, StoreSettings } from "./types";

export const MAX_QTY_PER_ITEM = 20;

export interface ResolvedLine {
  item: MenuItem;
  quantity: number;
  lineTotalPaise: Paise;
}

export interface CartTotals {
  lines: ResolvedLine[];
  /** Cart IDs that no longer exist or are unavailable. */
  unavailableIds: string[];
  itemCount: number;
  subtotalPaise: Paise;
  deliveryFeePaise: Paise;
  totalPaise: Paise;
  meetsMinimum: boolean;
  shortfallPaise: Paise;
}

/**
 * Display estimate only. Once a backend exists the server recomputes every price
 * from the database inside place_order and its result is authoritative.
 */
export function computeTotals(
  cart: CartLine[],
  menu: MenuItem[],
  settings: Pick<StoreSettings, "deliveryFeePaise" | "minimumOrderPaise">,
  fulfilment: FulfilmentType,
): CartTotals {
  const byId = new Map(menu.map((m) => [m.id, m]));
  const lines: ResolvedLine[] = [];
  const unavailableIds: string[] = [];
  for (const l of cart) {
    const item = byId.get(l.menuItemId);
    if (!item || !item.isAvailable) {
      unavailableIds.push(l.menuItemId);
      continue;
    }
    const q = clampQty(l.quantity);
    if (q === 0) continue;
    lines.push({ item, quantity: q, lineTotalPaise: item.pricePaise * q });
  }
  const subtotalPaise = lines.reduce((s, l) => s + l.lineTotalPaise, 0);
  const itemCount = lines.reduce((s, l) => s + l.quantity, 0);
  const deliveryFeePaise = fulfilment === "delivery" && lines.length > 0 ? settings.deliveryFeePaise : 0;
  const meetsMinimum = subtotalPaise >= settings.minimumOrderPaise;
  return {
    lines,
    unavailableIds,
    itemCount,
    subtotalPaise,
    deliveryFeePaise,
    totalPaise: subtotalPaise + deliveryFeePaise,
    meetsMinimum,
    shortfallPaise: meetsMinimum ? 0 : settings.minimumOrderPaise - subtotalPaise,
  };
}

export function clampQty(q: number): number {
  if (!Number.isFinite(q)) return 0;
  return Math.max(0, Math.min(MAX_QTY_PER_ITEM, Math.floor(q)));
}
