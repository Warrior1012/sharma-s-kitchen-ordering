import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock3, Mail, MapPin, Phone } from "lucide-react";
import { PageHeader, StateBlock } from "@/components/site/ui";
import { weeklyHours } from "@/domain/hours";
import { pageMeta } from "@/lib/seo";
import { useSettings } from "@/repositories/queries";

export const Route = createFileRoute("/contact")({
  head: () => pageMeta("Contact", "View configured sample restaurant contact details and opening hours.", { path: "/contact" }),
  component: ContactPage,
});

function ContactPage() {
  const { data: settings } = useSettings();
  const phone = settings.phone?.replace(/\s+/g, "") || null;
  const whatsapp = settings.whatsapp?.replace(/\D/g, "") || null;
  const mapQuery = settings.address ? encodeURIComponent(settings.address) : null;
  const hasContact = Boolean(phone || whatsapp || settings.email || settings.address || settings.socialLinks.length);

  return (
    <>
      <PageHeader title="Contact" intro="Business contact fields are intentionally blank until a real restaurant supplies them." />
      <div className="container-page grid gap-8 py-10 lg:grid-cols-[1fr_1fr]">
        <section className="space-y-4">
          {phone && <a href={`tel:${phone}`} className="flex items-center gap-4 rounded-lg border bg-card p-4 hover:border-primary"><Phone className="size-5 text-primary" /><span><strong className="block">Phone</strong><span className="text-sm text-muted-foreground">{settings.phone}</span></span></a>}
          {whatsapp && <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer" className="flex items-center gap-4 rounded-lg border bg-card p-4 hover:border-primary"><Phone className="size-5 text-primary" /><span><strong className="block">WhatsApp</strong><span className="text-sm text-muted-foreground">Message the configured business number</span></span></a>}
          {settings.email && <a href={`mailto:${settings.email}`} className="flex items-center gap-4 rounded-lg border bg-card p-4 hover:border-primary"><Mail className="size-5 text-primary" /><span><strong className="block">Email</strong><span className="text-sm text-muted-foreground">{settings.email}</span></span></a>}
          {settings.address && <div className="flex items-start gap-4 rounded-lg border bg-card p-4"><MapPin className="mt-1 size-5 text-primary" /><span><strong className="block">Address</strong><span className="text-sm text-muted-foreground">{settings.address}</span><a className="mt-2 inline-block text-sm font-medium text-primary hover:underline" href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`} target="_blank" rel="noreferrer">Get directions</a></span></div>}
          {settings.socialLinks.map((social) => <a key={social.label} href={social.url} target="_blank" rel="noreferrer" className="block rounded-lg border bg-card p-4 text-sm font-medium hover:border-primary">{social.label}</a>)}
          {!hasContact && <StateBlock kind="info" title="No real contact details configured">The owner can add a phone, WhatsApp number, email and address from the demo Admin settings. Nothing has been invented for this portfolio sample.</StateBlock>}
        </section>
        <section className="rounded-lg border bg-card p-5">
          <div className="flex items-center gap-3"><Clock3 className="size-5 text-primary" /><h2 className="font-display text-2xl font-semibold">Opening hours</h2></div>
          <dl className="mt-5 grid grid-cols-[1fr_auto] gap-x-6 gap-y-3 text-sm">
            {weeklyHours(settings.openingHours).map((row) => <div key={row.day} className="contents"><dt>{row.day}</dt><dd className="text-right text-muted-foreground">{row.hours}</dd></div>)}
          </dl>
          <p className="mt-5 border-t pt-4 text-xs text-muted-foreground">Hours are sample settings and are interpreted in {settings.timezone}.</p>
          {mapQuery && <div className="mt-5 overflow-hidden rounded-md border"><iframe title="Map showing configured restaurant address" src={`https://maps.google.com/maps?q=${mapQuery}&output=embed`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="h-64 w-full border-0" /></div>}
        </section>
      </div>
      <div className="container-page pb-10 text-sm text-muted-foreground">For this portfolio demonstration, use the <Link to="/admin" className="font-medium text-primary hover:underline">owner dashboard</Link> to configure contact information.</div>
    </>
  );
}
