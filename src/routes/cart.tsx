import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Button, PageHeader, QtyStepper, StateBlock } from "@/components/site/ui";
import { computeTotals } from "@/domain/cart";
import { formatINR } from "@/domain/money";
import { pageMeta } from "@/lib/seo";
import { useCart } from "@/lib/cart-store";
import { useMenuItems, useSettings } from "@/repositories/queries";

export const Route = createFileRoute("/cart")({
  head: () => pageMeta("Your cart", "Review sample dishes, quantities and estimated order total.", { path: "/cart" }),
  component: CartPage,
});

function CartPage() {
  const cart = useCart();
  const { data: menu } = useMenuItems();
  const { data: settings } = useSettings();
  const [fulfilment, setFulfilment] = useState<"delivery" | "takeaway">("delivery");
  const totals = useMemo(() => computeTotals(cart.lines, menu, settings, fulfilment), [cart.lines, menu, settings, fulfilment]);
  const unavailable = new Set(totals.unavailableIds);

  if (cart.hydrated && cart.lines.length === 0) {
    return (
      <>
        <PageHeader title="Your cart" intro="Your selected dishes will appear here." />
        <div className="container-page py-12">
          <StateBlock kind="empty" title="Your cart is empty" action={<Link to="/menu"><Button>Browse the menu</Button></Link>}>
            Add a few dishes to get started. This demo saves your cart in this browser only.
          </StateBlock>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Your cart" intro="Review quantities before checkout. Prices are sample demo values." />
      <div className="container-page grid gap-8 py-8 lg:grid-cols-[1fr_360px]">
        <section aria-label="Cart items" className="space-y-3">
          {!cart.hydrated ? <StateBlock kind="loading" title="Loading your cart" /> : totals.lines.map(({ item, quantity, lineTotalPaise }) => (
            <article key={item.id} className="flex flex-wrap items-center justify-between gap-4 rounded-lg border bg-card p-4">
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold">{item.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{formatINR(item.pricePaise)} each</p>
                {!item.isAvailable && <p className="mt-1 text-sm text-destructive">This item is currently unavailable.</p>}
              </div>
              <div className="flex items-center gap-4">
                <QtyStepper qty={quantity} name={item.name} onChange={(q) => cart.setQty(item.id, q)} max={50} />
                <span className="w-20 text-right font-semibold tabular-nums">{formatINR(lineTotalPaise)}</span>
                <Button variant="ghost" size="icon" aria-label={`Remove ${item.name}`} onClick={() => cart.remove(item.id)}><Trash2 /></Button>
              </div>
            </article>
          ))}
          {totals.unavailableIds.length > 0 && (
            <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
              <p className="font-medium text-destructive">Some items are no longer available.</p>
              <p className="mt-1 text-sm text-muted-foreground">Remove them to continue.</p>
              <Button className="mt-3" variant="outline" size="sm" onClick={() => totals.unavailableIds.forEach((id) => cart.remove(id))}>Remove unavailable items</Button>
            </div>
          )}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3">
            <Link to="/menu" className="text-sm font-medium text-primary hover:underline">Continue browsing</Link>
            {cart.lines.length > 0 && <Button variant="ghost" size="sm" onClick={cart.clear}>Clear cart</Button>}
          </div>
        </section>

        <aside className="h-fit rounded-lg border bg-card p-5 lg:sticky lg:top-24">
          <h2 className="font-display text-2xl font-semibold">Order summary</h2>
          <fieldset className="mt-4 grid grid-cols-2 gap-2">
            <legend className="mb-2 text-sm font-medium">How would you like it?</legend>
            {(["delivery", "takeaway"] as const).map((value) => (
              <label key={value} className={`cursor-pointer rounded-md border p-3 text-center text-sm capitalize ${fulfilment === value ? "border-primary bg-primary/5 font-semibold" : "border-input"}`}>
                <input className="sr-only" type="radio" name="fulfilment" value={value} checked={fulfilment === value} onChange={() => setFulfilment(value)} />
                {value}
              </label>
            ))}
          </fieldset>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between"><dt>Items ({totals.itemCount})</dt><dd>{formatINR(totals.subtotalPaise)}</dd></div>
            <div className="flex justify-between"><dt>Delivery fee</dt><dd>{totals.deliveryFeePaise ? formatINR(totals.deliveryFeePaise) : "No charge"}</dd></div>
            <div className="flex justify-between border-t pt-3 text-base font-semibold"><dt>Total estimate</dt><dd>{formatINR(totals.totalPaise)}</dd></div>
          </dl>
          {!totals.meetsMinimum && totals.itemCount > 0 && (
            <p className="mt-4 rounded-md bg-warning/50 p-3 text-sm">Add {formatINR(totals.shortfallPaise)} more to reach the {formatINR(settings.minimumOrderPaise)} minimum.</p>
          )}
          <p className="mt-3 text-xs text-muted-foreground">Delivery availability is confirmed by the restaurant. Demo orders are not sent anywhere.</p>
          <Link to="/checkout" search={{ fulfilment }} className="mt-5 block">
            <Button className="w-full" disabled={!cart.hydrated || totals.itemCount === 0 || totals.unavailableIds.length > 0 || !totals.meetsMinimum}>
              Continue to checkout <ArrowRight />
            </Button>
          </Link>
        </aside>
      </div>
    </>
  );
}
