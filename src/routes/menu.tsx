import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { MenuItemCard } from "@/components/site/menu-item-card";
import { Button, PageHeader, StateBlock, VegMark, fieldClass } from "@/components/site/ui";
import { pageMeta } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { useCategories, useMenuItems } from "@/repositories/queries";

export const Route = createFileRoute("/menu")({
  head: () => pageMeta("Menu", "Starters, curries, biryani, breads, desserts and drinks. Filter by veg or non-veg and search dishes.", { path: "/menu" }),
  component: MenuPage,
});

type Diet = "all" | "veg" | "nonveg";

function MenuPage() {
  const items = useMenuItems();
  const cats = useCategories();
  const [q, setQ] = useState("");
  const [diet, setDiet] = useState<Diet>("all");
  const [cat, setCat] = useState<string>("all");
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const active = new Set(cats.data.map((c) => c.id));
    return items.data.filter((i) =>
      active.has(i.categoryId) &&
      (cat === "all" || i.categoryId === cat) &&
      (diet === "all" || (diet === "veg" ? i.isVeg : !i.isVeg)) &&
      (!term || i.name.toLowerCase().includes(term) || i.description.toLowerCase().includes(term)));
  }, [items.data, cats.data, q, diet, cat]);

  return (
    <>
      <PageHeader title="Menu" intro="Sample menu and prices for demo purposes." />
      <div className="container-page py-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end">
          <label className="flex-1">
            <span className="mb-1 block text-sm font-medium">Search dishes</span>
            <span className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Try paneer or biryani" className={cn(fieldClass, "pl-9")} />
            </span>
          </label>
          <fieldset className="flex gap-2">
            <legend className="mb-1 text-sm font-medium">Diet</legend>
            {(["all", "veg", "nonveg"] as Diet[]).map((d) => (
              <Button key={d} variant={diet === d ? "ink" : "outline"} aria-pressed={diet === d} onClick={() => setDiet(d)}>
                {d !== "all" && <VegMark isVeg={d === "veg"} />}
                {d === "all" ? "All" : d === "veg" ? "Veg" : "Non-veg"}
              </Button>
            ))}
          </fieldset>
        </div>
        <nav aria-label="Categories" className="-mx-4 mt-6 flex gap-2 overflow-x-auto px-4 pb-2">
          {[{ id: "all", name: "All" }, ...cats.data].map((c) => (
            <Button key={c.id} size="sm" variant={cat === c.id ? "primary" : "outline"} aria-pressed={cat === c.id} onClick={() => setCat(c.id)} className="shrink-0">{c.name}</Button>
          ))}
        </nav>
        <div className="mt-8 space-y-12">
          {items.isError ? (
            <StateBlock kind="error" title="Menu could not load" action={<Button onClick={() => items.refetch()}>Try again</Button>} />
          ) : filtered.length === 0 ? (
            <StateBlock kind="empty" title="No dishes match" action={<Button variant="outline" onClick={() => { setQ(""); setDiet("all"); setCat("all"); }}>Clear filters</Button>}>Try a different search or filter.</StateBlock>
          ) : (
            cats.data.map((c) => {
              const list = filtered.filter((i) => i.categoryId === c.id);
              if (!list.length) return null;
              return (
                <section key={c.id} aria-labelledby={`h-${c.id}`}>
                  <h2 id={`h-${c.id}`} className="text-2xl font-semibold">{c.name}</h2>
                  {c.description && <p className="text-sm text-muted-foreground">{c.description}</p>}
                  <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{list.map((i) => <MenuItemCard key={i.id} item={i} />)}</div>
                </section>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
