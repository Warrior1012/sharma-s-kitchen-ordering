import { describe, expect, it } from "vitest";
import { clampQty, computeTotals } from "./cart";
import { SEED_MENU, SEED_SETTINGS } from "@/data/seed";

describe("cart calculations", () => {
  it("calculates subtotal and delivery fee in integer paise", () => {
    const totals = computeTotals([{ menuItemId: "itm-paneer-tikka", quantity: 2 }], SEED_MENU, SEED_SETTINGS, "delivery");
    expect(totals.subtotalPaise).toBe(52000);
    expect(totals.deliveryFeePaise).toBe(3000);
    expect(totals.totalPaise).toBe(55000);
    expect(totals.itemCount).toBe(2);
  });

  it("does not charge a delivery fee for takeaway", () => {
    const totals = computeTotals([{ menuItemId: "itm-paneer-tikka", quantity: 1 }], SEED_MENU, SEED_SETTINGS, "takeaway");
    expect(totals.deliveryFeePaise).toBe(0);
    expect(totals.totalPaise).toBe(totals.subtotalPaise);
  });

  it("rejects the minimum boundary below ₹150 and accepts exactly ₹150", () => {
    const item = { ...SEED_MENU[0]!, pricePaise: 14900 };
    const below = computeTotals([{ menuItemId: item.id, quantity: 1 }], [item], SEED_SETTINGS, "takeaway");
    const exact = computeTotals([{ menuItemId: item.id, quantity: 1 }], [{ ...item, pricePaise: 15000 }], SEED_SETTINGS, "takeaway");
    expect(below.meetsMinimum).toBe(false);
    expect(below.shortfallPaise).toBe(100);
    expect(exact.meetsMinimum).toBe(true);
    expect(exact.shortfallPaise).toBe(0);
  });

  it("caps item quantity at 50 and removes non-finite values", () => {
    expect(clampQty(100)).toBe(50);
    expect(clampQty(4.8)).toBe(4);
    expect(clampQty(Number.NaN)).toBe(0);
  });

  it("reports unavailable item IDs without charging for them", () => {
    const totals = computeTotals([{ menuItemId: "missing", quantity: 1 }], SEED_MENU, SEED_SETTINGS, "delivery");
    expect(totals.unavailableIds).toEqual(["missing"]);
    expect(totals.totalPaise).toBe(0);
  });
});
