import { describe, expect, it } from "vitest";
import { isStoreOpen, storeClock } from "./hours";
import { SEED_SETTINGS } from "@/data/seed";

describe("Asia/Kolkata opening hours", () => {
  it("opens at 11:00 IST on an open day", () => {
    expect(isStoreOpen(SEED_SETTINGS, new Date("2026-11-10T05:30:00.000Z"))).toBe(true);
  });

  it("remains closed one minute before opening", () => {
    expect(isStoreOpen(SEED_SETTINGS, new Date("2026-11-10T05:29:00.000Z"))).toBe(false);
  });

  it("closes at 23:00 IST", () => {
    expect(isStoreOpen(SEED_SETTINGS, new Date("2026-11-10T17:30:00.000Z"))).toBe(false);
  });

  it("keeps Monday closed", () => {
    expect(isStoreOpen(SEED_SETTINGS, new Date("2026-11-09T05:30:00.000Z"))).toBe(false);
  });

  it("respects the orders-off setting", () => {
    expect(isStoreOpen({ ...SEED_SETTINGS, acceptingOrders: false }, new Date("2026-11-10T06:00:00.000Z"))).toBe(false);
  });

  it("formats weekday and local clock in the configured timezone", () => {
    expect(storeClock(new Date("2026-11-10T05:30:00.000Z")).day).toBe(2);
    expect(storeClock(new Date("2026-11-10T05:30:00.000Z")).minutes).toBe(660);
  });
});
