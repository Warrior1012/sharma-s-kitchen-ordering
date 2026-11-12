import { Link } from "@tanstack/react-router";
import { Menu as MenuIcon, ShoppingBag, X, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/lib/cart-store";
import { cn } from "@/lib/utils";
import { isStoreOpen } from "@/domain/hours";
import { useSettings } from "@/repositories/queries";

const NAV = [
  { to: "/menu", label: "Menu" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const { count, hydrated } = useCart();
  const { data: settings } = useSettings();
  const [open, setOpen] = useState(false);
  const isOpen = isStoreOpen(settings);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="container-page flex min-h-16 items-center justify-between gap-3 py-2">
        <Link to="/" className="shrink-0 font-display text-xl font-semibold tracking-tight md:text-2xl">
          Sharma's <span className="text-primary">Kitchen</span>
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => <Link key={item.to} to={item.to} className="rounded-md px-3 py-2 text-sm font-medium hover:bg-secondary" activeProps={{ className: "text-primary" }}>{item.label}</Link>)}
        </nav>
        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-2 rounded-md border px-2.5 py-2 text-xs sm:inline-flex">
            <span className={cn("size-2 rounded-full", isOpen ? "bg-veg" : "bg-muted-foreground")} />
            {isOpen ? "Open" : "Closed"}
          </span>
          <Link to="/cart" className="relative inline-flex h-10 items-center gap-2 rounded-md border bg-card px-3 text-sm font-medium hover:bg-secondary">
            <ShoppingBag className="size-4" aria-hidden /><span className="hidden sm:inline">Cart</span>
            <span className="min-w-5 rounded-sm bg-primary px-1 text-center text-xs text-primary-foreground" aria-label={`${hydrated ? count : 0} items in cart`}>{hydrated ? count : 0}</span>
          </Link>
          <Link to="/menu" className="hidden h-10 items-center gap-2 rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground hover:bg-primary-hover sm:inline-flex">Order now <ArrowRight className="size-4" /></Link>
          <button type="button" className="inline-flex size-10 items-center justify-center rounded-md hover:bg-secondary md:hidden" aria-expanded={open} aria-controls="mobile-nav" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen((value) => !value)}>
            {open ? <X className="size-5" /> : <MenuIcon className="size-5" />}
          </button>
        </div>
      </div>
      <nav id="mobile-nav" aria-label="Mobile" className={cn("border-t bg-background md:hidden", open ? "block" : "hidden")}>
        <div className="container-page flex items-center justify-between py-2 text-xs text-muted-foreground"><span>{isOpen ? "Sample kitchen open" : "Sample kitchen closed"} · IST</span><Link to="/menu" onClick={() => setOpen(false)} className="font-semibold text-primary">Order now <ArrowRight className="inline size-3" /></Link></div>
        <ul className="container-page grid grid-cols-3 gap-2 pb-3">
          {NAV.map((item) => <li key={item.to}><Link to={item.to} onClick={() => setOpen(false)} className="block rounded-md bg-secondary px-2 py-3 text-center text-sm font-medium">{item.label}</Link></li>)}
        </ul>
      </nav>
    </header>
  );
}
