import { Plus } from "lucide-react";
import { DISH_IMAGES } from "@/data/images";
import { formatINR } from "@/domain/money";
import type { MenuItem } from "@/domain/types";
import { useCart } from "@/lib/cart-store";
import { Button, QtyStepper, VegMark } from "./ui";

export function MenuItemCard({ item }: { item: MenuItem }) {
  const { qtyOf, setQty, add } = useCart();
  const qty = qtyOf(item.id);
  const fallback = item.imageKey ? DISH_IMAGES[item.imageKey] : null;
  const imageSrc = item.imageUrl || fallback?.src;
  const imageAlt = item.imageUrl ? `${item.name} sample menu image` : fallback?.alt || `${item.name} dish illustration`;

  return (
    <article className={`fade-up flex flex-col overflow-hidden rounded-lg border bg-card shadow-card transition-transform duration-200 motion-safe:hover:-translate-y-0.5 ${!item.isAvailable ? "opacity-60" : ""}`}>
      {imageSrc && (
        <div className="relative">
          <img src={imageSrc} alt={imageAlt} width={944} height={704} loading="lazy" decoding="async" className="aspect-[4/3] w-full object-cover" />
          {item.isPopular && <span className="absolute left-3 top-3 rounded-[4px] bg-background/95 px-2 py-1 text-xs font-semibold text-foreground">Popular</span>}
        </div>
      )}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start gap-2">
          <VegMark isVeg={item.isVeg} className="mt-1" />
          <h3 className="flex-1 text-lg font-semibold leading-snug">{item.name}</h3>
          {item.isPopular && !imageSrc && <span className="rounded-[4px] bg-secondary px-2 py-1 text-xs font-semibold">Popular</span>}
        </div>
        <p className="flex-1 line-clamp-2 text-sm text-muted-foreground">{item.description}</p>
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="font-semibold tabular-nums">{formatINR(item.pricePaise)}</span>
          {!item.isAvailable ? (
            <span className="rounded-[4px] bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">Unavailable today</span>
          ) : qty > 0 ? (
            <QtyStepper qty={qty} name={item.name} onChange={(quantity) => setQty(item.id, quantity)} max={50} />
          ) : (
            <Button variant="outline" onClick={() => add(item.id)} aria-label={`Add ${item.name} to cart`}>
              <Plus aria-hidden /> Add
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
