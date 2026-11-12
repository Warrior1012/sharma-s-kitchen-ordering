import { describe, expect, it } from "vitest";
import { checkoutSchema } from "./checkout-schema";

const validDelivery = {
  name: "Test Customer",
  phone: "9876543210",
  fulfilment: "delivery",
  paymentMethod: "cod",
  addressLine: "12 Sample Road, Block A",
  sector: "Sector 62",
  pincode: "201309",
  landmark: "",
  note: "",
  upiUtr: "",
};

describe("checkout validation", () => {
  it("accepts a valid delivery checkout", () => {
    expect(checkoutSchema.safeParse(validDelivery).success).toBe(true);
  });

  it("rejects an invalid Indian mobile number", () => {
    expect(checkoutSchema.safeParse({ ...validDelivery, phone: "12345" }).success).toBe(false);
  });

  it("requires delivery address and pincode", () => {
    expect(checkoutSchema.safeParse({ ...validDelivery, addressLine: "", pincode: "123" }).success).toBe(false);
  });

  it("does not require address fields for takeaway", () => {
    expect(checkoutSchema.safeParse({ ...validDelivery, fulfilment: "takeaway", addressLine: "", sector: "", pincode: "" }).success).toBe(true);
  });

  it("requires a 12 digit UTR only when UPI is selected", () => {
    expect(checkoutSchema.safeParse({ ...validDelivery, paymentMethod: "upi", upiUtr: "123" }).success).toBe(false);
    expect(checkoutSchema.safeParse({ ...validDelivery, paymentMethod: "upi", upiUtr: "123456789012" }).success).toBe(true);
  });
});
