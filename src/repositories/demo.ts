import { SEED_CATEGORIES, SEED_MENU, SEED_SETTINGS } from "@/data/seed";
import { computeTotals } from "@/domain/cart";
import { isStoreOpen, storeClock } from "@/domain/hours";
import { canTransition } from "@/domain/order-status";
import type { Category, MenuItem, Order, StoreSettings } from "@/domain/types";
import type {
  AdminAuthRepository, MenuRepository, OrderRepository, PlaceOrderInput, PlaceOrderResult, SettingsRepository,
} from "./types";

/**
 * PORTFOLIO DEMO ONLY.
 * All records are saved in this browser's storage. This is not authentication,
 * not a production order system, and orders are not sent to a restaurant.
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
  try {
    (store === "local" ? localStorage : sessionStorage).setItem(key, JSON.stringify(value));
  } catch {
    throw new Error("This browser could not save the demo data. Clear some site storage and try again.");
  }
}

const uid = (prefix: string) => `${prefix}-${crypto.randomUUID()}`;

export const demoMenuRepository: MenuRepository = {
  async listCategories(opts) {
    const categories = read<Category[]>(K.cats, SEED_CATEGORIES);
    return [...categories]
      .filter((category) => opts?.includeInactive || category.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  },
  async listMenuItems() {
    return [...read<MenuItem[]>(K.menu, SEED_MENU)].sort((a, b) => a.sortOrder - b.sortOrder);
  },
  async updateMenuItem(id, patch) {
    const items = read<MenuItem[]>(K.menu, SEED_MENU);
    const index = items.findIndex((item) => item.id === id);
    if (index < 0) throw new Error("Menu item not found.");
    if (patch.pricePaise !== undefined && (!Number.isInteger(patch.pricePaise) || patch.pricePaise <= 0))
      throw new Error("Price must be a positive whole number of paise.");
    items[index] = { ...items[index]!, ...patch };
    write(K.menu, items);
    return items[index]!;
  },
  async createMenuItem(input) {
    if (!input.name.trim()) throw new Error("A dish name is required.");
    if (!Number.isInteger(input.pricePaise) || input.pricePaise <= 0) throw new Error("Enter a valid price.");
    const items = read<MenuItem[]>(K.menu, SEED_MENU);
    const item: MenuItem = { ...input, id: uid("item") };
    write(K.menu, [...items, item]);
    return item;
  },
  async upsertCategory(input) {
    if (!input.name.trim()) throw new Error("A category name is required.");
    const categories = read<Category[]>(K.cats, SEED_CATEGORIES);
    const category: Category = { ...input, id: input.id ?? uid("category") };
    const next = input.id
      ? categories.map((current) => current.id === input.id ? category : current)
      : [...categories, category];
    write(K.cats, next);
    return category;
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
  return storeClock(new Date(), "Asia/Kolkata").date;
}

export const demoOrderRepository: OrderRepository = {
  async placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
    try {
      const [menu, settings] = await Promise.all([
        demoMenuRepository.listMenuItems(),
        demoSettingsRepository.getSettings(),
      ]);
      if (!settings.acceptingOrders)
        return { ok: false, reason: "not_accepting", message: "Online orders are switched off in the demo settings." };
      if (!isStoreOpen(settings))
        return { ok: false, reason: "closed", message: "The sample kitchen is closed right now. Update demo hours in Admin to test checkout." };
      if (!input.lines.length)
        return { ok: false, reason: "empty", message: "Your cart is empty." };
      if (input.lines.some((line) => !Number.isInteger(line.quantity) || line.quantity < 1 || line.quantity > 50))
        return { ok: false, reason: "error", message: "Each item quantity must be between 1 and 50." };
      if (input.paymentMethod === "upi") {
        if (!settings.upiId || !settings.upiPayeeName)
          return { ok: false, reason: "error", message: "UPI is not configured for this demo. Choose cash on delivery or pickup." };
        if (!input.upiUtr || !/^\d{12}$/.test(input.upiUtr))
          return { ok: false, reason: "error", message: "Enter the 12-digit UTR from your UPI app." };
        const existing = read<Order[]>(K.orders, []);
        if (existing.some((order) => order.upiUtr === input.upiUtr))
          return { ok: false, reason: "error", message: "That UTR has already been used in this browser demo." };
      }

      // Recalculate using current menu/settings. The browser never supplies item prices.
      const totals = computeTotals(input.lines, menu, settings, input.fulfilment);
      if (totals.unavailableIds.length)
        return { ok: false, reason: "unavailable_items", message: "One or more items are unavailable. Review your cart and try again." };
      if (!totals.lines.length)
        return { ok: false, reason: "empty", message: "Your cart is empty." };
      if (!totals.meetsMinimum)
        return { ok: false, reason: "below_minimum", message: `Add ${Math.ceil(totals.shortfallPaise / 100)} more to reach the minimum order value.` };

      const date = todayIST();
      const counter = read<{ businessDate: string; lastValue: number }>(K.counter, { businessDate: date, lastValue: 0 });
      const value = counter.businessDate === date ? counter.lastValue + 1 : 1;
      write(K.counter, { businessDate: date, lastValue: value });

      const id = crypto.randomUUID();
      const now = new Date().toISOString();
      const order: Order = {
        id,
        orderNumber: `DEMO-${date.replaceAll("-", "")}-${String(value).padStart(4, "0")}`,
        status: "placed",
        fulfilment: input.fulfilment,
        paymentMethod: input.paymentMethod,
        paymentStatus: input.paymentMethod === "upi" ? "submitted" : "pending",
        upiUtr: input.upiUtr,
        customerName: input.customerName.trim(),
        customerPhone: input.customerPhone,
        address: input.fulfilment === "delivery" ? input.address : null,
        note: input.note,
        subtotalPaise: totals.subtotalPaise,
        deliveryFeePaise: totals.deliveryFeePaise,
        totalPaise: totals.totalPaise,
        items: totals.lines.map((line) => ({
          id: crypto.randomUUID(),
          orderId: id,
          menuItemId: line.item.id,
          nameSnapshot: line.item.name,
          isVegSnapshot: line.item.isVeg,
          unitPricePaise: line.item.pricePaise,
          quantity: line.quantity,
          lineTotalPaise: line.lineTotalPaise,
        })),
        createdAt: now,
        updatedAt: now,
        isDemo: true,
        cancelReason: null,
      };
      const orders = read<Order[]>(K.orders, []);
      write(K.orders, [order, ...orders]);
      // The ID is a random demo locator, not a secure 256-bit access token.
      return { ok: true, orderId: id, orderNumber: order.orderNumber, statusToken: "demo-only" };
    } catch (error) {
      return { ok: false, reason: "error", message: error instanceof Error ? error.message : "Could not place the demo order." };
    }
  },
  async getOrder(id) {
    return read<Order[]>(K.orders, []).find((order) => order.id === id) ?? null;
  },
  async listOrders() {
    return read<Order[]>(K.orders, []).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  async updateStatus(id, next, reason) {
    const orders = read<Order[]>(K.orders, []);
    const order = orders.find((entry) => entry.id === id);
    if (!order) throw new Error("Order not found.");
    if (!canTransition(order.status, next, order.fulfilment))
      throw new Error(`That status change is not allowed from ${order.status}.`);
    if (next === "cancelled" && !reason?.trim()) throw new Error("Add a cancellation or rejection reason.");
    order.status = next;
    order.cancelReason = next === "cancelled" ? reason!.trim() : order.cancelReason ?? null;
    order.updatedAt = new Date().toISOString();
    write(K.orders, orders);
    return order;
  },
  async markPaymentVerified(id) {
    const orders = read<Order[]>(K.orders, []);
    const order = orders.find((entry) => entry.id === id);
    if (!order) throw new Error("Order not found.");
    if (order.paymentMethod !== "upi" || !order.upiUtr)
      throw new Error("Only a UPI order with a submitted UTR can be verified.");
    order.paymentStatus = "verified";
    order.updatedAt = new Date().toISOString();
    write(K.orders, orders);
    return order;
  },
};

export const demoAdminAuthRepository: AdminAuthRepository = {
  async isSignedIn() {
    return read<boolean>(K.admin, false, "session");
  },
  async signIn(email, password) {
    if (!email.includes("@") || !password.trim())
      return { ok: false, message: "Enter a valid email and a non-empty demo password." };
    // This is deliberately not authentication. It is only a portfolio-demo gate.
    write(K.admin, true, "session");
    return { ok: true };
  },
  async signOut() {
    if (hasWindow()) sessionStorage.removeItem(K.admin);
  },
};

export function resetDemoData() {
  if (!hasWindow()) return;
  Object.values(K).forEach((key) => localStorage.removeItem(key));
  localStorage.removeItem("sk.cart.v1");
}
