import { z } from "zod";

const optionalText = z
  .string()
  .trim()
  .max(200, "Keep this under 200 characters")
  .optional()
  .transform((v) => (v ? v : null));

export const checkoutSchema = z
  .object({
    name: z.string().trim().min(2, "Enter at least 2 characters").max(60, "Keep your name under 60 characters"),
    phone: z
      .string()
      .trim()
      .regex(/^[6-9]\d{9}$/, "Enter a 10 digit Indian mobile number starting with 6, 7, 8 or 9"),
    fulfilment: z.enum(["delivery", "takeaway"]),
    paymentMethod: z.enum(["cod", "upi"]),
    addressLine: z.string().trim().optional(),
    sector: z.string().trim().optional(),
    pincode: z.string().trim().optional(),
    landmark: optionalText,
    note: optionalText,
    upiUtr: z.string().trim().optional(),
  })
  .superRefine((v, ctx) => {
    if (v.fulfilment === "delivery") {
      const a = v.addressLine ?? "";
      if (a.length < 10 || a.length > 200)
        ctx.addIssue({ code: "custom", path: ["addressLine"], message: "Address must be 10 to 200 characters" });
      if (!v.sector)
        ctx.addIssue({ code: "custom", path: ["sector"], message: "Sector is required for delivery" });
      if (!/^\d{6}$/.test(v.pincode ?? ""))
        ctx.addIssue({ code: "custom", path: ["pincode"], message: "Enter a 6 digit pincode" });
    }
    if (v.paymentMethod === "upi" && !/^\d{12}$/.test(v.upiUtr ?? ""))
      ctx.addIssue({ code: "custom", path: ["upiUtr"], message: "Enter the 12 digit UTR from your UPI app" });
  });

export type CheckoutInput = z.input<typeof checkoutSchema>;
export type CheckoutValues = z.output<typeof checkoutSchema>;
