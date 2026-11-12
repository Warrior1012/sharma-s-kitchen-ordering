import type { CartLine, FulfilmentType, MenuItem, Paise, StoreSettings } from "./types";

export const MAX_QTY_PER_ITEM = 50;

export interface ResolvedLine {
  item: MenuItem;
  quantity: number;
  lineTotalPaise: Paise;
}

export interface CartTotals {
  lines: ResolvedLine[];
  unavailableIds: string[];
  itemCount: number;
  subtotalPaise: Paise;
  deliveryFeePaise: Paise;
  totalPaise: Paise;
  meetsMinimum: boolean;
  shortfallPaise: Paise;
}

/** Display estimate only. The connected production backend must recompute totals from the database. */
export function computeTotals(
  cart: CartLine[],
  menu: MenuItem[],
  settings: Pick<StoreSettings, "deliveryFeePaise" | "minimumOrderPaise">,
  fulfilment: FulfilmentType,
): CartTotals {
  const byId = new Map(menu.map((m) => [m.id, m]));
  const lines: ResolvedLine[] = [];
  const unavailableIds: string[] = [];
  for (const line of cart) {
    const item = byId.get(line.menuItemId);
    if (!item || !item.isAvailable) {
      unavailableIds.push(line.menuItemId);
      continue;
    }
    const quantity = clampQty(line.quantity);
    if (quantity > 0) lines.push({ item, quantity, lineTotalPaise: item.pricePaise * quantity });
  }
  const subtotalPaise = lines.reduce((sum, line) => sum + line.lineTotalPaise, 0);
  const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);
  const deliveryFeePaise = fulfilment === "delivery" && lines.length ? settings.deliveryFeePaise : 0;
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

export function clampQty(quantity: number): number {
  if (!Number.isFinite(quantity)) return 0;
  return Math.max(0, Math.min(MAX_QTY_PER_ITEM, Math.floor(quantity)));
}
