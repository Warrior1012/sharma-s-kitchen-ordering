import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, ShoppingBag } from "lucide-react";
import { useMemo, useState } from "react";
import { Button, PageHeader, StateBlock, VegMark, fieldClass } from "@/components/site/ui";
import { MenuItemCard } from "@/components/site/menu-item-card";
import { computeTotals } from "@/domain/cart";
import { formatINR } from "@/domain/money";
import { pageMeta } from "@/lib/seo";
import { useCart } from "@/lib/cart-store";
import { cn } from "@/lib/utils";
import { useCategories, useMenuItems, useSettings } from "@/repositories/queries";

export const Route = createFileRoute("/menu")({
  head: () => pageMeta("Menu", "Browse sample starters, curries, biryani, breads, desserts and drinks.", { path: "/menu" }),
  component: MenuPage,
});

type Diet = "all" | "veg" | "nonveg";

function MenuPage() {
  const items = useMenuItems();
  const cats = useCategories();
  const cart = useCart();
  const { data: settings } = useSettings();
  const [query, setQuery] = useState("");
  const [diet, setDiet] = useState<Diet>("all");
  const [category, setCategory] = useState("all");
  const totals = computeTotals(cart.lines, items.data, settings, "delivery");

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    const active = new Set(cats.data.map((cat) => cat.id));
    return items.data.filter((item) =>
      active.has(item.categoryId) &&
      (category === "all" || item.categoryId === category) &&
      (diet === "all" || (diet === "veg" ? item.isVeg : !item.isVeg)) &&
      (!term || item.name.toLowerCase().includes(term) || item.description.toLowerCase().includes(term)),
    );
  }, [items.data, cats.data, query, diet, category]);

  return (
    <>
      <PageHeader title="The menu" intro="Browse the sample menu. Prices and availability are editable in the owner demo." />
      <div className="container-page pb-28 pt-7 md:pb-10">
        <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Search dishes</span>
            <span className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try paneer or biryani" className={cn(fieldClass, "pl-9")} />
            </span>
          </label>
          <fieldset className="flex flex-wrap gap-2">
            <legend className="sr-only">Dietary filter</legend>
            {(["all", "veg", "nonveg"] as const).map((value) => (
              <button key={value} type="button" onClick={() => setDiet(value)} aria-pressed={diet === value} className={cn("inline-flex h-10 items-center gap-2 rounded-md border px-3 text-sm capitalize", diet === value ? "border-primary bg-primary/5 font-semibold" : "border-input bg-card")}>
                {value === "veg" && <VegMark isVeg />} {value === "nonveg" && <VegMark isVeg={false} />} {value === "all" ? "All dishes" : value === "veg" ? "Vegetarian" : "Non-veg"}
              </button>
            ))}
          </fieldset>
        </div>

        <nav aria-label="Menu categories" className="sticky top-16 z-20 -mx-4 mt-6 overflow-x-auto border-y bg-background/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-md sm:border">
          <div className="flex min-w-max gap-2">
            <button type="button" onClick={() => setCategory("all")} aria-pressed={category === "all"} className={cn("rounded-md px-3 py-2 text-sm", category === "all" ? "bg-ink text-ink-foreground" : "bg-secondary hover:bg-secondary/70")}>All</button>
            {cats.data.map((cat) => <button key={cat.id} type="button" onClick={() => setCategory(cat.id)} aria-pressed={category === cat.id} className={cn("rounded-md px-3 py-2 text-sm", category === cat.id ? "bg-ink text-ink-foreground" : "bg-secondary hover:bg-secondary/70")}>{cat.name}</button>)}
          </div>
        </nav>

        <div className="mb-4 mt-6 flex items-center justify-between gap-3 text-sm text-muted-foreground">
          <p>{filtered.length} {filtered.length === 1 ? "dish" : "dishes"}</p>
          {query && <button type="button" className="text-primary hover:underline" onClick={() => setQuery("")}>Clear search</button>}
        </div>

        {items.isError ? <StateBlock kind="error" title="Menu could not load">Refresh the page and try again.</StateBlock> : filtered.length === 0 ? (
          <StateBlock kind="empty" title="No matching dishes" action={<Button variant="outline" onClick={() => { setQuery(""); setDiet("all"); setCategory("all"); }}>Clear filters</Button>}>Nothing in this sample menu matches your search.</StateBlock>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{filtered.map((item) => <MenuItemCard key={item.id} item={item} />)}</div>
        )}
      </div>

      {totals.itemCount > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 p-3 shadow-card backdrop-blur md:hidden">
          <Link to="/cart" className="container-page flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-sm font-semibold"><ShoppingBag className="size-4" /> {totals.itemCount} {totals.itemCount === 1 ? "item" : "items"} · {formatINR(totals.totalPaise)}</span>
            <span className="rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">View cart</span>
          </Link>
        </div>
      )}
    </>
  );
}
