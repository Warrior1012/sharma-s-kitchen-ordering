import type {
  Category, CartLine, DeliveryAddress, FulfilmentType, MenuItem, Order, OrderStatus,
  PaymentMethod, StoreSettings,
} from "@/domain/types";

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
  | { ok: false; reason: "below_minimum" | "unavailable_items" | "not_accepting" | "closed" | "empty" | "error"; message: string };

export interface OrderRepository {
  placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult>;
  getOrder(id: string): Promise<Order | null>;
  listOrders(): Promise<Order[]>;
  updateStatus(id: string, next: OrderStatus, reason?: string): Promise<Order>;
  markPaymentVerified(id: string): Promise<Order>;
}

export interface AdminAuthRepository {
  /** Demo-only browser session flag. Replace with Supabase Auth + server-side role checks. */
  isSignedIn(): Promise<boolean>;
  signIn(email: string, password: string): Promise<{ ok: boolean; message?: string }>;
  signOut(): Promise<void>;
}
