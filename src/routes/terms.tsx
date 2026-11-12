import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/ui";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/terms")({
  head: () => pageMeta("Terms and conditions", "Terms for using the Sharma's Kitchen portfolio demonstration.", { path: "/terms" }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <>
      <PageHeader title="Terms and conditions" intro="Sample terms for a fictional restaurant ordering demonstration." />
      <article className="container-page max-w-3xl space-y-6 py-10 text-sm leading-7 text-muted-foreground">
        <p><strong className="text-foreground">Demo status.</strong> Sharma's Kitchen is a portfolio demonstration, not an operating restaurant. Menu items, prices, hours and availability are sample data. Placing an order only stores a sample record in the current browser.</p>
        <section><h2 className="font-display text-xl font-semibold text-foreground">No real transactions</h2><p>Do not submit real payment details or rely on this site to order food. No payment is collected, no kitchen receives an order, and no delivery or pickup is arranged.</p></section>
        <section><h2 className="font-display text-xl font-semibold text-foreground">Sample information</h2><p>Business details are configurable and may be incomplete. A real restaurant must review and replace all sample information, pricing, opening hours, contact details and legal terms before public use.</p></section>
        <section><h2 className="font-display text-xl font-semibold text-foreground">Production deployment</h2><p>A live ordering service would require a secure server-side order workflow, verified payment integration, appropriate privacy notices, owner authentication and operational policies. Those production services are not connected in this demo.</p></section>
        <p className="border-t pt-5 text-xs">This placeholder is provided to demonstrate page structure and must be reviewed by the actual business and its legal adviser before commercial launch.</p>
      </article>
    </>
  );
}
