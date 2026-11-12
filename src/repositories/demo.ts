import { SEED_CATEGORIES, SEED_MENU, SEED_SETTINGS } from "@/data/seed";
import { computeTotals } from "@/domain/cart";
import { canTransition } from "@/domain/order-status";
import type { Category, MenuItem, Order, StoreSettings } from "@/domain/types";
import type {
  AdminAuthRepository, MenuRepository, OrderRepository, PlaceOrderInput, PlaceOrderResult, SettingsRepository,
} from "./types";

/**
 * DEMO ONLY. Everything here lives in this browser's localStorage. Nothing is sent
 * anywhere, nothing is secure, and "orders" are never seen by a restaurant.
 */
const K = {
  menu: "sk.demo.menu.v1",
  cats: "sk.demo.categories.v1",
  settings: "sk.demo.settings.v1",
  orders: "sk.demo.orders.v1",
  counter: "sk.demo.counter.v1",
  admin: "sk.demo.admin",
};

const hasWindow = () => typeof window !== "undefined";
function read<T>(key: string, fallback: T, store: "local" | "session" = "local"): T {
  if (!hasWindow()) return fallback;
  try {
    const raw = (store === "local" ? localStorage : sessionStorage).getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, value: unknown, store: "local" | "session" = "local") {
  if (!hasWindow()) return;
  (store === "local" ? localStorage : sessionStorage).setItem(key, JSON.stringify(value));
}
const uid = (p: string) => `${p}-${crypto.randomUUID().slice(0, 8)}`;

export const demoMenuRepository: MenuRepository = {
  async listCategories(opts) {
    const cats = read<Category[]>(K.cats, SEED_CATEGORIES);
    return [...cats].filter((c) => opts?.includeInactive || c.isActive).sort((a, b) => a.sortOrder - b.sortOrder);
  },
  async listMenuItems() {
    return [...read<MenuItem[]>(K.menu, SEED_MENU)].sort((a, b) => a.sortOrder - b.sortOrder);
  },
  async updateMenuItem(id, patch) {
    const items = read<MenuItem[]>(K.menu, SEED_MENU);
    const idx = items.findIndex((m) => m.id === id);
    if (idx < 0) throw new Error("Item not found");
    if (patch.pricePaise !== undefined && (!Number.isInteger(patch.pricePaise) || patch.pricePaise <= 0))
      throw new Error("Price must be a positive whole number of paise");
    items[idx] = { ...items[idx], ...patch };
    write(K.menu, items);
    return items[idx];
  },
  async createMenuItem(input) {
    const items = read<MenuItem[]>(K.menu, SEED_MENU);
    const item = { ...input, id: uid("itm") };
    write(K.menu, [...items, item]);
    return item;
  },
  async upsertCategory(input) {
    const cats = read<Category[]>(K.cats, SEED_CATEGORIES);
    const cat: Category = { ...input, id: input.id ?? uid("cat") };
    const next = input.id ? cats.map((c) => (c.id === input.id ? cat : c)) : [...cats, cat];
    write(K.cats, next);
    return cat;
  },
};

export const demoSettingsRepository: SettingsRepository = {
  async getSettings() {
    return { ...SEED_SETTINGS, ...read<Partial<StoreSettings>>(K.settings, {}) };
  },
  async updateSettings(patch) {
    const merged = { ...read<Partial<StoreSettings>>(K.settings, {}), ...patch };
    write(K.settings, merged);
    return { ...SEED_SETTINGS, ...merged };
  },
};

function todayIST(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
}

export const demoOrderRepository: OrderRepository = {
  async placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
    // Mirrors what the server-side place_order must do: recompute prices from the
    // menu (ignoring any client price), check availability and minimum, snapshot items.
    const [menu, settings] = await Promise.all([demoMenuRepository.listMenuItems(), demoSettingsRepository.getSettings()]);
    if (!settings.acceptingOrders) return { ok: false, reason: "not_accepting", message: "The kitchen is not accepting orders right now." };
    const t = computeTotals(input.lines, menu, settings, input.fulfilment);
    if (t.unavailableIds.length) return { ok: false, reason: "unavailable_items", message: "Some items are no longer available. Please review your cart." };
    if (!t.lines.length) return { ok: false, reason: "empty", message: "Your cart is empty." };
    if (!t.meetsMinimum) return { ok: false, reason: "below_minimum", message: "Your order is below the minimum order value." };

    const date = todayIST();
    const counter = read<{ businessDate: string; lastValue: number }>(K.counter, { businessDate: date, lastValue: 0 });
    const value = counter.businessDate === date ? counter.lastValue + 1 : 1;
    write(K.counter, { businessDate: date, lastValue: value });

    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const order: Order = {
      id,
      orderNumber: `DEMO-${date.replaceAll("-", "").slice(2)}-${String(value).padStart(3, "0")}`,
      status: "placed",
      fulfilment: input.fulfilment,
      paymentMethod: input.paymentMethod,
      paymentStatus: input.paymentMethod === "upi" ? "submitted" : "pending",
      upiUtr: input.upiUtr,
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      address: input.fulfilment === "delivery" ? input.address : null,
      note: input.note,
      subtotalPaise: t.subtotalPaise,
      deliveryFeePaise: t.deliveryFeePaise,
      totalPaise: t.totalPaise,
      items: t.lines.map((l) => ({
        id: crypto.randomUUID(),
        orderId: id,
        menuItemId: l.item.id,
        nameSnapshot: l.item.name,
        isVegSnapshot: l.item.isVeg,
        unitPricePaise: l.item.pricePaise,
        quantity: l.quantity,
        lineTotalPaise: l.lineTotalPaise,
      })),
      createdAt: now,
      updatedAt: now,
      isDemo: true,
    };
    write(K.orders, [order, ...read<Order[]>(K.orders, [])]);
    // Demo token is not stored or checked. Real backend: random 256-bit token, store only its hash.
    return { ok: true, orderId: id, orderNumber: order.orderNumber, statusToken: "demo" };
  },
  async getOrder(id) {
    return read<Order[]>(K.orders, []).find((o) => o.id === id) ?? null;
  },
  async listOrders() {
    return read<Order[]>(K.orders, []);
  },
  async updateStatus(id, next) {
    const orders = read<Order[]>(K.orders, []);
    const o = orders.find((x) => x.id === id);
    if (!o) throw new Error("Order not found");
    if (!canTransition(o.status, next, o.fulfilment)) throw new Error(`Cannot move from ${o.status} to ${next}`);
    o.status = next;
    o.updatedAt = new Date().toISOString();
    write(K.orders, orders);
    return o;
  },
};

export const demoAdminAuthRepository: AdminAuthRepository = {
  async isSignedIn() {
    return read<boolean>(K.admin, false, "session");
  },
  async signIn(email) {
    // Demo gate only: not authentication. Any email unlocks the shell for this tab.
    if (!email.includes("@")) return { ok: false, message: "Enter an email address" };
    write(K.admin, true, "session");
    return { ok: true };
  },
  async signOut() {
    write(K.admin, false, "session");
  },
};

export function resetDemoData() {
  if (!hasWindow()) return;
  Object.values(K).forEach((k) => localStorage.removeItem(k));
  localStorage.removeItem("sk.cart.v1");
}
