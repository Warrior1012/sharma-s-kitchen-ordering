/**
 * Domain models. These mirror the planned database tables
 * (categories, menu_items, store_settings, orders, order_items, order_counters, admin_users).
 * All money values are integer paise (1 rupee = 100 paise).
 */
export type Paise = number;

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
}

export type ImageKey = "biryani" | "paneer-tikka" | "dal-makhani" | "thali";

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  pricePaise: Paise;
  isVeg: boolean;
  isAvailable: boolean;
  imageKey: ImageKey | null;
  sortOrder: number;
}

/** 0 = Sunday ... 6 = Saturday. A day with no entry is closed. */
export interface OpeningWindow {
  day: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  open: string; // "HH:MM" 24h, in store timezone
  close: string;
}

export interface SocialLink {
  label: string;
  url: string;
}

export interface StoreSettings {
  name: string;
  cuisine: string;
  timezone: string;
  openingHours: OpeningWindow[];
  deliveryRadiusKm: number;
  deliveryFeePaise: Paise;
  minimumOrderPaise: Paise;
  acceptingOrders: boolean;
  /** Unknown values stay null and are hidden in the UI. */
  phone: string | null;
  email: string | null;
  address: string | null;
  fssaiLicense: string | null;
  upiId: string | null;
  upiPayeeName: string | null;
  socialLinks: SocialLink[];
}

export type FulfilmentType = "delivery" | "takeaway";
export type PaymentMethod = "cod" | "upi";
export type PaymentStatus = "pending" | "submitted" | "verified" | "failed";
export type OrderStatus =
  | "placed"
  | "accepted"
  | "preparing"
  | "ready"
  | "out_for_delivery"
  | "completed"
  | "cancelled";

export interface DeliveryAddress {
  line: string;
  sector: string;
  pincode: string;
  landmark: string | null;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  fulfilment: FulfilmentType;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  upiUtr: string | null;
  customerName: string;
  customerPhone: string;
  address: DeliveryAddress | null;
  note: string | null;
  subtotalPaise: Paise;
  deliveryFeePaise: Paise;
  totalPaise: Paise;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
  /** Always true until a real backend exists. */
  isDemo: boolean;
}

export interface OrderItem {
  id: string;
  orderId: string;
  menuItemId: string;
  nameSnapshot: string;
  isVegSnapshot: boolean;
  unitPricePaise: Paise;
  quantity: number;
  lineTotalPaise: Paise;
}

export interface OrderCounter {
  /** Business date in store timezone, YYYY-MM-DD. */
  businessDate: string;
  lastValue: number;
}

export interface AdminUser {
  id: string;
  userId: string;
  role: "owner" | "staff";
  displayName: string;
  createdAt: string;
}

export interface CartLine {
  menuItemId: string;
  quantity: number;
}
