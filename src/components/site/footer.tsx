import { Link } from "@tanstack/react-router";
import { weeklyHours } from "@/domain/hours";
import { useSettings } from "@/repositories/queries";

export function SiteFooter() {
  const { data: settings } = useSettings();
  const phone = settings.phone?.replace(/\s+/g, "") || null;
  const whatsapp = settings.whatsapp?.replace(/\D/g, "") || null;

  return (
    <footer className="mt-16 bg-ink text-ink-foreground">
      <div className="container-page grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-display text-2xl font-semibold">{settings.name}</p>
          <p className="mt-2 max-w-xs text-sm leading-6 opacity-80">{settings.cuisine} kitchen. A portfolio ordering demo with sample dishes and editable settings.</p>
          {settings.address && <p className="mt-3 text-sm opacity-80">{settings.address}</p>}
          {settings.fssaiLicense && <p className="mt-3 text-xs opacity-70">FSSAI licence details supplied for this demo: {settings.fssaiLicense}</p>}
        </div>
        <div>
          <h2 className="text-base font-semibold">Hours <span className="text-xs font-normal opacity-70">(IST demo values)</span></h2>
          <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm opacity-90">
            {weeklyHours(settings.openingHours).map((row) => <div key={row.day} className="contents"><dt>{row.day}</dt><dd>{row.hours}</dd></div>)}
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
          <h2 className="text-base font-semibold">Policies and contact</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link to="/terms" className="hover:underline">Terms and conditions</Link></li>
            <li><Link to="/privacy" className="hover:underline">Privacy policy</Link></li>
            <li><Link to="/refund-policy" className="hover:underline">Cancellation and refund</Link></li>
            <li><Link to="/admin" className="hover:underline">Owner dashboard (demo)</Link></li>
          </ul>
          {(phone || whatsapp || settings.email) && <div className="mt-4 space-y-2 text-sm opacity-90">
            {phone && <a className="block hover:underline" href={`tel:${phone}`}>Call {settings.phone}</a>}
            {whatsapp && <a className="block hover:underline" href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer">WhatsApp</a>}
            {settings.email && <a className="block hover:underline" href={`mailto:${settings.email}`}>{settings.email}</a>}
          </div>}
        </div>
      </div>
      <div className="border-t border-ink-foreground/15">
        <p className="container-page flex flex-wrap justify-between gap-2 py-4 text-xs opacity-70"><span>Portfolio demo · No real orders, payments or deliveries.</span><span>Sample food illustrations, replaceable with client assets.</span></p>
      </div>
    </footer>
  );
}
