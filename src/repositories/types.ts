import type {
  Category, CartLine, DeliveryAddress, FulfilmentType, MenuItem, Order, OrderStatus,
  PaymentMethod, StoreSettings,
} from "@/domain/types";

/**
 * Repository contracts. The demo implementation (./demo.ts) satisfies these with
 * seed data and browser storage. A Supabase implementation will replace it without
 * changing pages: swap the export in ./index.ts.
 */
export interface MenuRepository {
  listCategories(opts?: { includeInactive?: boolean }): Promise<Category[]>;
  listMenuItems(): Promise<MenuItem[]>;
  updateMenuItem(id: string, patch: Partial<Omit<MenuItem, "id">>): Promise<MenuItem>;
  createMenuItem(input: Omit<MenuItem, "id">): Promise<MenuItem>;
  upsertCategory(input: Omit<Category, "id"> & { id?: string }): Promise<Category>;
}

export interface SettingsRepository {
  getSettings(): Promise<StoreSettings>;
  updateSettings(patch: Partial<StoreSettings>): Promise<StoreSettings>;
}

/** Client sends only IDs, quantities and customer details. Never prices. */
export interface PlaceOrderInput {
  lines: CartLine[];
  fulfilment: FulfilmentType;
  paymentMethod: PaymentMethod;
  upiUtr: string | null;
  customerName: string;
  customerPhone: string;
  address: DeliveryAddress | null;
  note: string | null;
}

export type PlaceOrderResult =
  | { ok: true; orderId: string; orderNumber: string; statusToken: string }
  | { ok: false; reason: "below_minimum" | "unavailable_items" | "not_accepting" | "empty" | "error"; message: string };

export interface OrderRepository {
  placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult>;
  getOrder(id: string): Promise<Order | null>;
  listOrders(): Promise<Order[]>;
  updateStatus(id: string, next: OrderStatus): Promise<Order>;
}

export interface AdminAuthRepository {
  /** Demo: a session flag. Real: Supabase Auth + admin_users role check server-side. */
  isSignedIn(): Promise<boolean>;
  signIn(email: string, password: string): Promise<{ ok: boolean; message?: string }>;
  signOut(): Promise<void>;
}
