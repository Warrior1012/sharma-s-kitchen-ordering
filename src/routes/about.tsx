import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BadgeCheck, ClipboardList, Utensils } from "lucide-react";
import { PageHeader, DemoTag, buttonStyles } from "@/components/site/ui";
import { pageMeta } from "@/lib/seo";
import { useSettings } from "@/repositories/queries";

export const Route = createFileRoute("/about")({
  head: () => pageMeta("About", "Learn about the Sharma's Kitchen portfolio restaurant concept.", { path: "/about" }),
  component: AboutPage,
});

function AboutPage() {
  const { data: settings } = useSettings();
  return (
    <>
      <PageHeader title="About this kitchen" eyebrow="The story" intro="A neighbourhood restaurant concept built to demonstrate a complete digital ordering experience." />
      <div className="container-page grid gap-8 py-10 md:grid-cols-[1fr_0.8fr] md:py-14">
        <div>
          <DemoTag>Fictional portfolio business</DemoTag>
          <h2 className="mt-5 font-display text-3xl font-semibold">Designed around the everyday restaurant experience.</h2>
          <p className="mt-4 leading-7 text-muted-foreground">Sharma's Kitchen is a sample business created for a web development portfolio. The dishes, prices, business hours and food illustrations are editable demonstration content. No real owner history or restaurant operation is being claimed.</p>
          <p className="mt-4 leading-7 text-muted-foreground">The product goal is practical: customers should be able to browse a menu, understand the order total, enter delivery or takeaway details, and follow a sample order status. The owner can explore a demo dashboard for orders, menu items and store settings.</p>
          <Link to="/menu" className={buttonStyles({ size: "lg", className: "mt-6" })}>Explore the sample menu <ArrowRight /></Link>
        </div>
        <div className="grid gap-3">
          {[
            { icon: Utensils, title: "A clear menu", body: "Categories, search, vegetarian filters, availability and simple quantity controls." },
            { icon: ClipboardList, title: "A guided order flow", body: "Cart totals, delivery or takeaway, form validation and a simulated status timeline." },
            { icon: BadgeCheck, title: "An owner workspace", body: "Demo order management, menu editing, category controls and configurable business settings." },
          ].map(({ icon: Icon, title, body }) => <article key={title} className="rounded-lg border bg-card p-5"><Icon className="size-6 text-primary" /><h3 className="mt-3 font-semibold">{title}</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">{body}</p></article>)}
        </div>
      </div>
      <div className="bg-secondary/60"><div className="container-page py-8 text-sm text-muted-foreground">Restaurant name in this demo: <strong className="text-foreground">{settings.name}</strong>. Address, contact details, owner story and licences remain blank until supplied by a real business.</div></div>
    </>
  );
}
