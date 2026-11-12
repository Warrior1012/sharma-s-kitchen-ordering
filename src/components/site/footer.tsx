import { Link } from "@tanstack/react-router";
import { weeklyHours } from "@/domain/hours";
import { useSettings } from "@/repositories/queries";

export function SiteFooter() {
  const { data: s } = useSettings();
  return (
    <footer className="mt-16 bg-ink text-ink-foreground">
      <div className="container-page grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-display text-2xl font-semibold">{s.name}</p>
          <p className="mt-2 text-sm opacity-80">{s.cuisine} kitchen. This site is running in demo mode.</p>
        </div>
        <div>
          <h2 className="text-base font-semibold">Hours <span className="text-xs font-normal opacity-70">(demo values, IST)</span></h2>
          <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm opacity-90">
            {weeklyHours(s.openingHours).map((h) => (
              <div key={h.day} className="contents"><dt>{h.day}</dt><dd>{h.hours}</dd></div>
            ))}
          </dl>
        </div>
        <div>
          <h2 className="text-base font-semibold">Explore</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link to="/menu" className="hover:underline">Menu</Link></li>
            <li><Link to="/cart" className="hover:underline">Cart</Link></li>
            <li><Link to="/about" className="hover:underline">About</Link></li>
            <li><Link to="/contact" className="hover:underline">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="text-base font-semibold">Policies</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link to="/terms" className="hover:underline">Terms</Link></li>
            <li><Link to="/privacy" className="hover:underline">Privacy</Link></li>
            <li><Link to="/refund-policy" className="hover:underline">Refund policy</Link></li>
            <li><Link to="/admin" className="hover:underline">Staff (demo)</Link></li>
          </ul>
          {s.fssaiLicense && <p className="mt-4 text-xs opacity-80">FSSAI Lic. No. {s.fssaiLicense}</p>}
        </div>
      </div>
      <p className="container-page border-t border-ink-foreground/15 py-4 text-xs opacity-70">
        Food images are replaceable demo illustrations.
      </p>
    </footer>
  );
}
