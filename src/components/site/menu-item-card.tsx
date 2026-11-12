import { Plus } from "lucide-react";
import { DISH_IMAGES } from "@/data/images";
import { formatINR } from "@/domain/money";
import type { MenuItem } from "@/domain/types";
import { useCart } from "@/lib/cart-store";
import { Button, QtyStepper, VegMark } from "./ui";

export function MenuItemCard({ item }: { item: MenuItem }) {
  const { qtyOf, setQty, add } = useCart();
  const qty = qtyOf(item.id);
  const img = item.imageKey ? DISH_IMAGES[item.imageKey] : null;
  return (
    <article className="fade-up flex flex-col overflow-hidden rounded-lg border bg-card shadow-card">
      {img && (
        <img src={img.src} alt={img.alt} width={944} height={704} loading="lazy" decoding="async" className="aspect-[4/3] w-full object-cover" />
      )}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start gap-2">
          <VegMark isVeg={item.isVeg} className="mt-1" />
          <h3 className="flex-1 text-lg font-semibold leading-snug">{item.name}</h3>
        </div>
        <p className="flex-1 text-sm text-muted-foreground">{item.description}</p>
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="font-semibold tabular-nums">{formatINR(item.pricePaise)}</span>
          {!item.isAvailable ? (
            <span className="rounded-[4px] bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">Unavailable today</span>
          ) : qty > 0 ? (
            <QtyStepper qty={qty} name={item.name} onChange={(q) => setQty(item.id, q)} />
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
