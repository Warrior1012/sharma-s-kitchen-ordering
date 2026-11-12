import type { FulfilmentType, OrderStatus } from "./types";

export const STATUS_LABEL: Record<OrderStatus, string> = {
  placed: "Placed",
  accepted: "Accepted",
  preparing: "Preparing",
  ready: "Ready",
  out_for_delivery: "Out for delivery",
  completed: "Completed",
  cancelled: "Cancelled",
};

/** Allowed transitions. The backend must enforce the same table server-side. */
export function nextStatuses(current: OrderStatus, fulfilment: FulfilmentType): OrderStatus[] {
  switch (current) {
    case "placed":
      return ["accepted", "cancelled"];
    case "accepted":
      return ["preparing", "cancelled"];
    case "preparing":
      return ["ready", "cancelled"];
    case "ready":
      return fulfilment === "delivery" ? ["out_for_delivery"] : ["completed"];
    case "out_for_delivery":
      return ["completed"];
    default:
      return [];
  }
}

export function canTransition(from: OrderStatus, to: OrderStatus, f: FulfilmentType): boolean {
  return nextStatuses(from, f).includes(to);
}

export function timeline(fulfilment: FulfilmentType): OrderStatus[] {
  return fulfilment === "delivery"
    ? ["placed", "accepted", "preparing", "ready", "out_for_delivery", "completed"]
    : ["placed", "accepted", "preparing", "ready", "completed"];
}

export const LIVE_STATUSES: OrderStatus[] = ["placed", "accepted", "preparing", "ready", "out_for_delivery"];
