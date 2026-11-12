import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, Copy } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button, PageHeader, fieldClass } from "@/components/site/ui";
import { checkoutSchema, type CheckoutInput } from "@/domain/checkout-schema";
import { isStoreOpen } from "@/domain/hours";
import { formatINR } from "@/domain/money";
import type { FulfilmentType, PaymentMethod } from "@/domain/types";
import { orderRepo } from "@/repositories";
import { pageMeta } from "@/lib/seo";
import { useCart } from "@/lib/cart-store";
import { useMenuItems, useSettings } from "@/repositories/queries";
import { computeTotals } from "@/domain/cart";

export const Route = createFileRoute("/checkout")({
  validateSearch: (search: Record<string, unknown>) => ({
    fulfilment: search.fulfilment === "takeaway" ? "takeaway" as const : "delivery" as const,
  }),
  head: () => pageMeta("Checkout", "Complete the sample order checkout flow.", { path: "/checkout", noindex: true }),
  component: CheckoutPage,
});

const initialForm: CheckoutInput = {
  name: "", phone: "", fulfilment: "delivery", paymentMethod: "cod",
  addressLine: "", sector: "", pincode: "", landmark: "", note: "", upiUtr: "",
};

function CheckoutPage() {
  const search = Route.useSearch();
  const cart = useCart();
  const navigate = useNavigate();
  const { data: menu } = useMenuItems();
  const { data: settings } = useSettings();
  const [form, setForm] = useState<CheckoutInput>({ ...initialForm, fulfilment: search.fulfilment });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const totals = computeTotals(cart.lines, menu, settings, form.fulfilment || "delivery");
  const upiAvailable = Boolean(settings.upiId && settings.upiPayeeName);
  const accepting = isStoreOpen(settings);

  function update<K extends keyof CheckoutInput>(key: K, value: CheckoutInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
    setMessage("");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const parsed = checkoutSchema.safeParse(form);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => { const key = String(issue.path[0] ?? "form"); if (!next[key]) next[key] = issue.message; });
      setErrors(next);
      setMessage("Review the highlighted fields and try again.");
      return;
    }
    if (!cart.hydrated || totals.itemCount === 0 || totals.unavailableIds.length || !totals.meetsMinimum) {
      setMessage("Your cart needs attention before checkout.");
      return;
    }
    if (form.paymentMethod === "upi" && !upiAvailable) {
      setMessage("UPI is not configured. Choose cash on delivery or pickup.");
      return;
    }
    setSubmitting(true);
    try {
      const value = parsed.data;
      const result = await orderRepo.placeOrder({
        lines: cart.lines,
        fulfilment: value.fulfilment as FulfilmentType,
        paymentMethod: value.paymentMethod as PaymentMethod,
        upiUtr: value.paymentMethod === "upi" ? value.upiUtr || null : null,
        customerName: value.name,
        customerPhone: value.phone,
        address: value.fulfilment === "delivery" ? {
          line: value.addressLine || "",
          sector: value.sector || "",
          pincode: value.pincode || "",
          landmark: value.landmark,
        } : null,
        note: value.note,
      });
      if (!result.ok) {
        setMessage(result.message);
        return;
      }
      cart.clear();
      await navigate({ to: "/order/$orderId", params: { orderId: result.orderId } });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not complete demo checkout.");
    } finally {
      setSubmitting(false);
    }
  }

  const field = (key: keyof CheckoutInput, label: string, type = "text", required = false, hint?: string) => (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}{required && <span aria-hidden="true"> *</span>}</span>
      <input
        className={fieldClass}
        type={type}
        value={String(form[key] ?? "")}
        required={required}
        aria-invalid={Boolean(errors[key])}
        aria-describedby={errors[key] ? `${String(key)}-error` : hint ? `${String(key)}-hint` : undefined}
        onChange={(event) => update(key, event.target.value as CheckoutInput[typeof key])}
      />
      {errors[key] && <span id={`${String(key)}-error`} className="mt-1 block text-sm text-destructive">{errors[key]}</span>}
      {!errors[key] && hint && <span id={`${String(key)}-hint`} className="mt-1 block text-xs text-muted-foreground">{hint}</span>}
    </label>
  );

  if (cart.hydrated && cart.lines.length === 0) {
    return <div className="container-page py-12"><div className="rounded-lg border bg-card p-8 text-center"><h1 className="font-display text-3xl">Your cart is empty</h1><Link className="mt-4 inline-block text-primary underline" to="/menu">Browse the menu</Link></div></div>;
  }

  return (
    <>
      <PageHeader title="Checkout" intro="This portfolio demo simulates checkout. No payment is collected and no restaurant receives this order." />
      <div className="container-page grid gap-8 py-8 lg:grid-cols-[1fr_340px]">
        <form onSubmit={submit} className="space-y-6" noValidate>
          <section className="rounded-lg border bg-card p-5">
            <h2 className="font-display text-2xl font-semibold">Your details</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {field("name", "Full name", "text", true)}
              {field("phone", "Mobile number", "tel", true, "10 digits, starting with 6, 7, 8 or 9")}
            </div>
          </section>
          <section className="rounded-lg border bg-card p-5">
            <h2 className="font-display text-2xl font-semibold">Fulfilment</h2>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {(["delivery", "takeaway"] as const).map((value) => (
                <label key={value} className={`cursor-pointer rounded-md border p-3 text-center text-sm capitalize ${form.fulfilment === value ? "border-primary bg-primary/5 font-semibold" : "border-input"}`}>
                  <input className="sr-only" type="radio" name="fulfilment" checked={form.fulfilment === value} onChange={() => update("fulfilment", value)} />
                  {value}
                </label>
              ))}
            </div>
            {form.fulfilment === "delivery" && (
              <div className="mt-4 space-y-4">
                {field("addressLine", "House / street address", "text", true)}
                <div className="grid gap-4 sm:grid-cols-2">
                  {field("sector", "Sector / locality", "text", true)}
                  {field("pincode", "PIN code", "text", true)}
                </div>
                {field("landmark", "Landmark (optional)")}
                <p className="text-xs text-muted-foreground">Delivery availability is confirmed by the restaurant. Delivery is limited to the sample {settings.deliveryRadiusKm} km radius.</p>
              </div>
            )}
            <div className="mt-4">{field("note", "Order note (optional)", "text", false, "Up to 200 characters.")}</div>
          </section>
          <section className="rounded-lg border bg-card p-5">
            <h2 className="font-display text-2xl font-semibold">Payment</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className={`cursor-pointer rounded-md border p-3 ${form.paymentMethod === "cod" ? "border-primary bg-primary/5" : "border-input"}`}>
                <input className="mr-2" type="radio" name="paymentMethod" value="cod" checked={form.paymentMethod === "cod"} onChange={() => update("paymentMethod", "cod")} />
                <span className="font-medium">Cash on delivery / pickup</span>
                <span className="mt-1 block text-xs text-muted-foreground">Demo selection only. No collection is made.</span>
              </label>
              <label className={`rounded-md border p-3 ${upiAvailable ? "cursor-pointer" : "cursor-not-allowed opacity-50"} ${form.paymentMethod === "upi" ? "border-primary bg-primary/5" : "border-input"}`}>
                <input className="mr-2" type="radio" name="paymentMethod" value="upi" disabled={!upiAvailable} checked={form.paymentMethod === "upi"} onChange={() => update("paymentMethod", "upi")} />
                <span className="font-medium">UPI</span>
                <span className="mt-1 block text-xs text-muted-foreground">{upiAvailable ? "Demo only. Requires a configured UPI ID." : "Unavailable until demo settings contain verified merchant details."}</span>
              </label>
            </div>
            {form.paymentMethod === "upi" && upiAvailable && (
              <div className="mt-4 rounded-md border bg-secondary/50 p-4">
                {settings.upiQrDataUrl && <img src={settings.upiQrDataUrl} alt="Configured sample UPI QR code" className="mb-3 size-40 object-contain" />}
                <p className="text-sm">Payee: <strong>{settings.upiPayeeName}</strong></p>
                <div className="mt-2 flex items-center gap-2">
                  <code className="break-all text-sm">{settings.upiId}</code>
                  <Button type="button" size="sm" variant="outline" onClick={() => navigator.clipboard?.writeText(settings.upiId || "")}><Copy /> Copy</Button>
                </div>
                <p className="mt-2 text-sm">Amount: <strong>{formatINR(totals.totalPaise)}</strong></p>
                {field("upiUtr", "12-digit UTR / reference", "text", true)}
                <p className="mt-2 text-xs text-muted-foreground">This demo does not verify payments. A real owner would need to check their bank account manually.</p>
              </div>
            )}
          </section>
          {!accepting && <p className="rounded-md border border-warning/60 bg-warning/30 p-3 text-sm">The sample kitchen is closed or orders are switched off. Checkout is paused. Update opening hours in Admin to test orders.</p>}
          {message && <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{message}</p>}
          <Button type="submit" className="w-full sm:w-auto" size="lg" loading={submitting} disabled={submitting || !accepting || !cart.hydrated || !totals.itemCount || !totals.meetsMinimum || totals.unavailableIds.length > 0}>
            <CheckCircle2 /> Place demo order
          </Button>
        </form>
        <aside className="h-fit rounded-lg border bg-card p-5 lg:sticky lg:top-24">
          <h2 className="font-display text-2xl font-semibold">Order summary</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {totals.lines.map((line) => <li key={line.item.id} className="flex justify-between gap-3"><span>{line.quantity} × {line.item.name}</span><span className="tabular-nums">{formatINR(line.lineTotalPaise)}</span></li>)}
          </ul>
          <dl className="mt-5 space-y-2 border-t pt-4 text-sm">
            <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatINR(totals.subtotalPaise)}</dd></div>
            <div className="flex justify-between"><dt>Delivery</dt><dd>{formatINR(totals.deliveryFeePaise)}</dd></div>
            <div className="flex justify-between border-t pt-3 text-base font-semibold"><dt>Total</dt><dd>{formatINR(totals.totalPaise)}</dd></div>
          </dl>
          {!totals.meetsMinimum && <p className="mt-3 text-sm text-destructive">Add {formatINR(totals.shortfallPaise)} to meet the minimum.</p>}
          <p className="mt-4 text-xs text-muted-foreground">Sample values only. No real order, payment, delivery or customer notification is created.</p>
        </aside>
      </div>
    </>
  );
}
