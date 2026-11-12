import { Link } from "@tanstack/react-router";
import { Menu as MenuIcon, ShoppingBag, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/lib/cart-store";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/menu", label: "Menu" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const { count, hydrated } = useCart();
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link to="/" className="font-display text-xl font-semibold tracking-tight md:text-2xl">
          Sharma's <span className="text-primary">Kitchen</span>
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} className="rounded-[6px] px-3 py-2 text-sm font-medium hover:bg-secondary" activeProps={{ className: "text-primary" }}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/cart" className="relative inline-flex h-10 items-center gap-2 rounded-[6px] bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover">
            <ShoppingBag className="size-4" aria-hidden />
            <span>Cart</span>
            <span className="min-w-5 rounded-[4px] bg-primary-foreground/20 px-1 text-center tabular-nums" aria-label={`${hydrated ? count : 0} items in cart`}>
              {hydrated ? count : 0}
            </span>
          </Link>
          <button type="button" className="inline-flex size-10 items-center justify-center rounded-[6px] hover:bg-secondary md:hidden" aria-expanded={open} aria-controls="mobile-nav" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen((v) => !v)}>
            {open ? <X className="size-5" /> : <MenuIcon className="size-5" />}
          </button>
        </div>
      </div>
      <nav id="mobile-nav" aria-label="Mobile" className={cn("border-t md:hidden", open ? "block" : "hidden")}>
        <ul className="container-page py-2">
          {NAV.map((n) => (
            <li key={n.to}>
              <Link to={n.to} onClick={() => setOpen(false)} className="block rounded-[6px] px-2 py-3 font-medium hover:bg-secondary">{n.label}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
