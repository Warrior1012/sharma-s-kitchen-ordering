import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Bike, Clock, ShoppingBag } from "lucide-react";
import hero from "@/assets/hero-thali.webp";
import { MenuItemCard } from "@/components/site/menu-item-card";
import { buttonStyles } from "@/components/site/ui";
import { SEED_SETTINGS } from "@/data/seed";
import { schemaOpeningHours } from "@/domain/hours";
import { formatINR } from "@/domain/money";
import { pageMeta } from "@/lib/seo";
import { useMenuItems, useSettings } from "@/repositories/queries";

export const Route = createFileRoute("/")({
  head: () => {
    const s = SEED_SETTINGS;
    const ld: Record<string, unknown> = { "@context": "https://schema.org", "@type": "Restaurant", name: s.name, servesCuisine: s.cuisine, openingHours: schemaOpeningHours(s.openingHours) };
    if (s.phone) ld.telephone = s.phone;
    if (s.address) ld.address = s.address;
    return {
      ...pageMeta("North Indian food to order", "Browse the Sharma's Kitchen menu and place a demo order for delivery or takeaway.", { path: "/" }),
      scripts: [{ type: "application/ld+json", children: JSON.stringify(ld) }],
    };
  },
  component: Home,
});

function Home() {
  const { data: items } = useMenuItems();
  const { data: s } = useSettings();
  const featured = items.filter((i) => i.imageKey && i.isAvailable).slice(0, 3);
  return (
    <>
      <section className="container-page grid items-center gap-8 py-10 md:grid-cols-2 md:py-16">
        <div className="fade-up">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">{s.cuisine} kitchen</p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight md:text-6xl">Slow cooked food, made for your table.</h1>
          <p className="mt-4 max-w-md text-lg text-muted-foreground">Dal simmered overnight, breads from the tandoor and biryani sealed in the pot. Order for delivery or pick it up yourself.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/menu" className={buttonStyles({ size: "lg" })}>View menu <ArrowRight className="size-4" /></Link>
            <Link to="/about" className={buttonStyles({ size: "lg", variant: "outline" })}>About us</Link>
          </div>
        </div>
        <img src={hero} alt="Demo image: North Indian thali with dal, paneer, rice and naan" width={1600} height={912} fetchPriority="high" className="aspect-[16/10] w-full rounded-lg object-cover shadow-card" />
      </section>
      <section aria-label="Ordering details" className="border-y bg-secondary/60">
        <ul className="container-page grid gap-4 py-6 text-sm sm:grid-cols-3">
          <li className="flex items-center gap-3"><Clock className="size-5 text-primary" aria-hidden /> Tue to Sun, 11am to 11pm. Monday closed.</li>
          <li className="flex items-center gap-3"><Bike className="size-5 text-primary" aria-hidden /> Delivery within {s.deliveryRadiusKm} km, {formatINR(s.deliveryFeePaise)} fee</li>
          <li className="flex items-center gap-3"><ShoppingBag className="size-5 text-primary" aria-hidden /> Minimum order {formatINR(s.minimumOrderPaise)}</li>
        </ul>
      </section>
      <section className="container-page py-12">
        <div className="mb-6 flex items-end justify-between gap-4">
          <h2 className="text-3xl font-semibold">From the kitchen</h2>
          <Link to="/menu" className={buttonStyles({ variant: "link" })}>Full menu</Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{featured.map((i) => <MenuItemCard key={i.id} item={i} />)}</div>
        <p className="mt-4 text-xs text-muted-foreground">Business hours and fees shown are configurable demo values.</p>
      </section>
    </>
  );
}
