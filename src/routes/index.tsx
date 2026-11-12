import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Bike, Clock3, ClipboardList, CookingPot, MapPin, ShoppingBag, Utensils } from "lucide-react";
import hero from "@/assets/hero-thali.webp";
import { MenuItemCard } from "@/components/site/menu-item-card";
import { buttonStyles, DemoTag } from "@/components/site/ui";
import { SEED_SETTINGS } from "@/data/seed";
import { isStoreOpen, schemaOpeningHours, weeklyHours } from "@/domain/hours";
import { formatINR } from "@/domain/money";
import { pageMeta } from "@/lib/seo";
import { useMenuItems, useSettings } from "@/repositories/queries";

export const Route = createFileRoute("/")({
  head: () => {
    const settings = SEED_SETTINGS;
    const jsonLd: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@type": "Restaurant",
      name: settings.name,
      servesCuisine: settings.cuisine,
      openingHours: schemaOpeningHours(settings.openingHours),
    };
    if (settings.phone) jsonLd["telephone"] = settings.phone;
    if (settings.address) jsonLd["address"] = settings.address;
    return {
      ...pageMeta("North Indian food, made for your table", "Explore a sample restaurant menu, build a cart and try the demo ordering flow.", { path: "/" }),
      scripts: [{ type: "application/ld+json", children: JSON.stringify(jsonLd) }],
    };
  },
  component: Home,
});

function Home() {
  const { data: items } = useMenuItems();
  const { data: settings } = useSettings();
  const featured = items.filter((item) => item.isPopular && item.isAvailable).slice(0, 5);
  const open = isStoreOpen(settings);

  return (
    <>
      <section className="container-page grid items-center gap-8 py-10 md:grid-cols-[1fr_0.95fr] md:py-16">
        <div className="fade-up">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">{settings.cuisine} kitchen</p>
            <DemoTag>Portfolio demo</DemoTag>
          </div>
          <h1 className="mt-4 max-w-xl font-display text-5xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
            Comfort food, from our kitchen to your table.
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-8 text-muted-foreground">
            Explore a sample neighbourhood restaurant ordering experience. Find a favourite, customise your basket and walk through checkout.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/menu" className={buttonStyles({ size: "lg" })}>Explore the menu <ArrowRight /></Link>
            <Link to="/about" className={buttonStyles({ size: "lg", variant: "outline" })}>Our story</Link>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
            <span className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 ${open ? "border-veg/30 bg-veg/5" : "border-border bg-secondary"}`}>
              <span className={`size-2 rounded-full ${open ? "bg-veg" : "bg-muted-foreground"}`} />
              {open ? "Sample kitchen open" : "Sample kitchen closed"}
            </span>
            <span className="text-xs text-muted-foreground">Hours shown in IST</span>
          </div>
        </div>
        <div className="relative">
          <img src={hero} alt="Illustrative sample North Indian thali with dal, paneer, rice and naan" width={1600} height={912} fetchPriority="high" className="aspect-[16/10] w-full rounded-lg object-cover shadow-card" />
          <div className="absolute -bottom-4 left-4 max-w-[240px] rounded-lg border bg-background p-4 shadow-card sm:left-8">
            <p className="font-display text-xl font-semibold">Made for sharing</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">Sample menu, sample imagery and editable demo settings.</p>
          </div>
        </div>
      </section>

      <section aria-label="Ordering details" className="mt-12 border-y bg-secondary/60">
        <ul className="container-page grid gap-4 py-6 text-sm sm:grid-cols-3">
          <li className="flex items-center gap-3"><Bike className="size-5 text-primary" aria-hidden /><span>Sample delivery radius <strong>{settings.deliveryRadiusKm} km</strong></span></li>
          <li className="flex items-center gap-3"><ShoppingBag className="size-5 text-primary" aria-hidden /><span>Delivery fee <strong>{formatINR(settings.deliveryFeePaise)}</strong></span></li>
          <li className="flex items-center gap-3"><Clock3 className="size-5 text-primary" aria-hidden /><span>Minimum order <strong>{formatINR(settings.minimumOrderPaise)}</strong></span></li>
        </ul>
      </section>

      <section className="container-page py-14 md:py-16">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div><p className="text-sm font-semibold uppercase tracking-wider text-primary">A few favourites</p><h2 className="mt-2 font-display text-3xl font-semibold md:text-4xl">Popular from the menu</h2></div>
          <Link to="/menu" className={buttonStyles({ variant: "link" })}>View full menu <ArrowRight /></Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((item) => <MenuItemCard key={item.id} item={item} />)}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">Dishes, prices and photos are demonstration content and can be replaced by a restaurant owner.</p>
      </section>

      <section className="bg-ink text-ink-foreground">
        <div className="container-page py-14 md:py-16">
          <div className="max-w-2xl"><p className="text-sm font-semibold uppercase tracking-wider text-primary-foreground/70">How it works</p><h2 className="mt-2 font-display text-3xl font-semibold md:text-4xl">A simple path from menu to order</h2></div>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              { icon: Utensils, title: "Choose your dishes", body: "Browse categories, search the menu and set the quantity for each item." },
              { icon: ClipboardList, title: "Add your details", body: "Choose delivery or takeaway and enter the sample checkout details." },
              { icon: CookingPot, title: "Follow the status", body: "See a simulated order timeline and explore the owner dashboard." },
            ].map(({ icon: Icon, title, body }, index) => <article key={title} className="rounded-lg border border-ink-foreground/20 p-5"><div className="flex size-10 items-center justify-center rounded-md bg-ink-foreground/10"><Icon className="size-5" /></div><p className="mt-5 text-xs uppercase tracking-wider opacity-70">Step 0{index + 1}</p><h3 className="mt-1 text-lg font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 opacity-80">{body}</p></article>)}
          </div>
        </div>
      </section>

      <section className="container-page grid gap-8 py-14 md:grid-cols-2 md:py-16">
        <div><p className="text-sm font-semibold uppercase tracking-wider text-primary">A neighbourhood kitchen concept</p><h2 className="mt-2 font-display text-3xl font-semibold">A warm welcome, without the guesswork.</h2><p className="mt-4 leading-7 text-muted-foreground">This concept site is designed around the details local restaurants need: an easy-to-scan menu, a clear checkout, and a practical owner view. The story and contact details are intentionally left configurable rather than invented.</p><Link to="/about" className={buttonStyles({ variant: "link", className: "mt-4" })}>Read about this demo <ArrowRight /></Link></div>
        <div className="rounded-lg border bg-card p-5 md:p-7">
          <div className="flex items-center gap-2"><MapPin className="size-5 text-primary" /><h3 className="font-display text-2xl font-semibold">Hours and location</h3></div>
          <p className="mt-2 text-sm text-muted-foreground">{settings.address || "Restaurant address has not been supplied for this portfolio demo."}</p>
          <dl className="mt-5 grid grid-cols-[1fr_auto] gap-x-6 gap-y-2 text-sm">
            {weeklyHours(settings.openingHours).map((row) => <div key={row.day} className="contents"><dt>{row.day}</dt><dd className="text-right text-muted-foreground">{row.hours}</dd></div>)}
          </dl>
          <p className="mt-4 text-xs text-muted-foreground">Hours are editable in the demo admin panel. Opening checks use the Asia/Kolkata timezone.</p>
          <Link to="/contact" className={buttonStyles({ variant: "outline", className: "mt-5 w-full" })}>Contact details <ArrowRight /></Link>
        </div>
      </section>
    </>
  );
}
