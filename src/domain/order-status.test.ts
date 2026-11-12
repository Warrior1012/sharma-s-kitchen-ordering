import { describe, expect, it } from "vitest";
import { canTransition, nextStatuses, timeline } from "./order-status";

describe("order status rules", () => {
  it("allows only forward transitions for delivery", () => {
    expect(canTransition("placed", "accepted", "delivery")).toBe(true);
    expect(canTransition("ready", "out_for_delivery", "delivery")).toBe(true);
    expect(canTransition("completed", "preparing", "delivery")).toBe(false);
  });

  it("uses a shorter progression for takeaway", () => {
    expect(timeline("takeaway")).toEqual(["placed", "accepted", "preparing", "ready", "completed"]);
    expect(nextStatuses("ready", "takeaway")).toEqual(["completed"]);
  });

  it("does not allow transitions from terminal states", () => {
    expect(nextStatuses("cancelled", "delivery")).toEqual([]);
    expect(nextStatuses("completed", "takeaway")).toEqual([]);
  });
});
