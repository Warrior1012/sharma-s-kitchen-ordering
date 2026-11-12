import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { clampQty } from "@/domain/cart";
import type { CartLine } from "@/domain/types";

const KEY = "sk.cart.v1";

interface CartCtx {
  lines: CartLine[];
  hydrated: boolean;
  count: number;
  qtyOf: (id: string) => number;
  setQty: (id: string, qty: number) => void;
  add: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
}
const Ctx = createContext<CartCtx | null>(null);

/** Persists only menu item IDs and quantities. Prices are always looked up fresh. */
export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed))
        setLines(
          parsed
            .filter((l) => l && typeof l.menuItemId === "string")
            .map((l) => ({ menuItemId: l.menuItemId, quantity: clampQty(Number(l.quantity)) }))
            .filter((l) => l.quantity > 0),
        );
    } catch {
      /* corrupted storage: start empty */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(KEY, JSON.stringify(lines));
  }, [lines, hydrated]);

  const setQty = useCallback((id: string, qty: number) => {
    const q = clampQty(qty);
    setLines((prev) => {
      const rest = prev.filter((l) => l.menuItemId !== id);
      if (q === 0) return rest;
      const exists = prev.some((l) => l.menuItemId === id);
      return exists ? prev.map((l) => (l.menuItemId === id ? { ...l, quantity: q } : l)) : [...prev, { menuItemId: id, quantity: q }];
    });
  }, []);

  const value = useMemo<CartCtx>(() => {
    const qtyOf = (id: string) => lines.find((l) => l.menuItemId === id)?.quantity ?? 0;
    return {
      lines,
      hydrated,
      count: lines.reduce((s, l) => s + l.quantity, 0),
      qtyOf,
      setQty,
      add: (id) => setQty(id, qtyOf(id) + 1),
      remove: (id) => setQty(id, 0),
      clear: () => setLines([]),
    };
  }, [lines, hydrated, setQty]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used inside CartProvider");
  return c;
}
