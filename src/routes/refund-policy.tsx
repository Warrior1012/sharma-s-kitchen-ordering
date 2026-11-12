import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/ui";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/refund-policy")({
  head: () => pageMeta("Cancellation and refund policy", "Sample cancellation and refund information for the portfolio demo.", { path: "/refund-policy" }),
  component: RefundPage,
});

function RefundPage() {
  return (
    <>
      <PageHeader title="Cancellation and refund policy" intro="Illustrative policy layout only. No actual payments or orders are processed." />
      <article className="container-page max-w-3xl space-y-6 py-10 text-sm leading-7 text-muted-foreground">
        <section><h2 className="font-display text-xl font-semibold text-foreground">Demo orders</h2><p>Orders placed on this site are simulated and remain in the current browser. The demo does not charge a payment method, submit an order to a restaurant or initiate a refund.</p></section>
        <section><h2 className="font-display text-xl font-semibold text-foreground">Illustrative restaurant policy</h2><p>A real business may define cancellation cut-offs, handling of accepted orders, and refund timing for verified online payments. The owner must supply and approve those rules. This sample does not set a binding commercial policy.</p></section>
        <section><h2 className="font-display text-xl font-semibold text-foreground">Payment verification</h2><p>The owner dashboard can mark a sample UPI order as verified for demonstration. This action does not contact a bank, confirm a transfer or move money.</p></section>
        <p className="border-t pt-5 text-xs">Replace this page with the business's approved cancellation and refund terms before accepting real customers.</p>
      </article>
    </>
  );
}
