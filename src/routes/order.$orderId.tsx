import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Clock3, Copy, PackageCheck } from "lucide-react";
import { useState } from "react";
import { Button, PageHeader, StateBlock } from "@/components/site/ui";
import { timeline, STATUS_LABEL } from "@/domain/order-status";
import { formatINR } from "@/domain/money";
import { formatStoreTime } from "@/domain/hours";
import { pageMeta } from "@/lib/seo";
import { useOrder, useSettings } from "@/repositories/queries";

export const Route = createFileRoute("/order/$orderId")({
  head: () => pageMeta("Order status", "View the status of your sample restaurant order.", { noindex: true }),
  component: OrderStatusPage,
});

function maskPhone(value: string) {
  return value.length >= 4 ? `${value.slice(0, 2)}XXXXXX${value.slice(-2)}` : "Hidden";
}

function OrderStatusPage() {
  const { orderId } = Route.useParams();
  const { data: order, isLoading } = useOrder(orderId);
  const { data: settings } = useSettings();
  const [copied, setCopied] = useState(false);

  if (isLoading) return <div className="container-page py-12"><StateBlock kind="loading" title="Loading order status" /></div>;
  if (!order) {
    return <div className="container-page py-12"><StateBlock kind="empty" title="Order not found in this browser" action={<Link to="/menu"><Button>Back to menu</Button></Link>}>Demo orders are stored locally. Open this link in the same browser profile where the order was placed.</StateBlock></div>;
  }

  const steps = timeline(order.fulfilment);
  const currentIndex = steps.indexOf(order.status);
  const message = `Demo order ${order.orderNumber}: ${STATUS_LABEL[order.status]}. Total ${formatINR(order.totalPaise)}.`;
  const whatsappUrl = settings.whatsapp ? `https://wa.me/${settings.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(message)}` : null;

  async function copyOrder() {
    try {
      await navigator.clipboard.writeText(order!.orderNumber);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <>
      <PageHeader title={order.status === "cancelled" ? "Order cancelled" : "Order received"} intro="This is a simulated order timeline saved only in this browser." />
      <div className="container-page grid gap-6 py-8 lg:grid-cols-[1fr_340px]">
        <section className="rounded-lg border bg-card p-5 md:p-7">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><p className="text-sm text-muted-foreground">Demo order number</p><h2 className="mt-1 text-2xl font-semibold tabular-nums">{order.orderNumber}</h2><p className="mt-2 text-xs text-muted-foreground">Placed {formatStoreTime(new Date(order.createdAt), settings.timezone)}</p></div>
            <Button variant="outline" size="sm" onClick={copyOrder}><Copy /> {copied ? "Copied" : "Copy ID"}</Button>
          </div>
          {order.status === "cancelled" ? (
            <div className="mt-6 rounded-md border border-destructive/30 bg-destructive/5 p-4">
              <p className="font-semibold text-destructive">This demo order was cancelled.</p>
              {order.cancelReason && <p className="mt-1 text-sm">{order.cancelReason}</p>}
            </div>
          ) : (
            <ol className="mt-8 space-y-0">
              {steps.map((step, index) => {
                const done = currentIndex >= index;
                const current = order.status === step;
                return <li key={step} className="relative flex gap-4 pb-7 last:pb-0">
                  {index < steps.length - 1 && <span className={`absolute left-[15px] top-8 h-[calc(100%-16px)] w-0.5 ${done && currentIndex > index ? "bg-primary" : "bg-border"}`} />}
                  <span className={`relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border ${done ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-muted-foreground"}`}>{done ? <Check className="size-4" /> : <span className="text-xs">{index + 1}</span>}</span>
                  <span><strong className={current ? "text-primary" : ""}>{STATUS_LABEL[step]}</strong>{current && <span className="ml-2 text-xs text-muted-foreground">Current status</span>}</span>
                </li>;
              })}
            </ol>
          )}
          <div className="mt-7 flex flex-wrap gap-2 border-t pt-5">
            {whatsappUrl && <a className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-secondary" href={whatsappUrl} target="_blank" rel="noreferrer">Share status on WhatsApp</a>}
            <span className="inline-flex items-center gap-2 text-xs text-muted-foreground"><Clock3 className="size-4" /> Refreshes automatically every 15 seconds</span>
          </div>
        </section>
        <aside className="h-fit rounded-lg border bg-card p-5">
          <h2 className="font-display text-xl font-semibold">Order summary</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {order.items.map((item) => <li key={item.id} className="flex justify-between gap-3"><span>{item.quantity} × {item.nameSnapshot}</span><span>{formatINR(item.lineTotalPaise)}</span></li>)}
          </ul>
          <dl className="mt-4 space-y-2 border-t pt-4 text-sm">
            <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatINR(order.subtotalPaise)}</dd></div>
            <div className="flex justify-between"><dt>Delivery</dt><dd>{formatINR(order.deliveryFeePaise)}</dd></div>
            <div className="flex justify-between border-t pt-3 text-base font-semibold"><dt>Total</dt><dd>{formatINR(order.totalPaise)}</dd></div>
          </dl>
          <div className="mt-5 space-y-2 border-t pt-4 text-sm">
            <p><span className="text-muted-foreground">Payment: </span>{order.paymentMethod === "upi" ? "UPI demo" : "Cash on delivery / pickup"}</p>
            <p><span className="text-muted-foreground">Payment status: </span>{order.paymentStatus === "verified" ? "Marked paid in demo" : order.paymentStatus === "submitted" ? "Pending manual verification" : "Pending"}</p>
            <p><span className="text-muted-foreground">Fulfilment: </span>{order.fulfilment}</p>
            <p><span className="text-muted-foreground">Phone: </span>{maskPhone(order.customerPhone)}</p>
            {order.address && <p><span className="text-muted-foreground">Address: </span>{order.address.line.slice(0, 6)}… · {order.address.sector} · PIN ending {order.address.pincode.slice(-2)}</p>}
          </div>
          <p className="mt-5 rounded-md bg-warning/40 p-3 text-xs">Demo data is stored locally. This page is not a secure tracking link and does not notify a real restaurant.</p>
          <Link to="/menu" className="mt-4 flex items-center gap-2 text-sm font-medium text-primary hover:underline"><PackageCheck className="size-4" /> Browse more dishes</Link>
        </aside>
      </div>
    </>
  );
}
