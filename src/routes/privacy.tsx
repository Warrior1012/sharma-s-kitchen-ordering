import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/ui";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/privacy")({
  head: () => pageMeta("Privacy policy", "Privacy information for the Sharma's Kitchen portfolio demonstration.", { path: "/privacy" }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <>
      <PageHeader title="Privacy policy" intro="A plain-language explanation of data handling in this local portfolio demo." />
      <article className="container-page max-w-3xl space-y-6 py-10 text-sm leading-7 text-muted-foreground">
        <section><h2 className="font-display text-xl font-semibold text-foreground">What this demo stores</h2><p>Cart contents, sample checkout details, sample orders and owner-demo changes are stored in the browser's local storage or session storage. The application does not send these records to a restaurant, payment processor or connected database.</p></section>
        <section><h2 className="font-display text-xl font-semibold text-foreground">Personal information</h2><p>Use fictional test details only. Do not enter sensitive personal information, health information, account passwords or real payment references. Anyone with access to this browser profile may be able to inspect local demo records.</p></section>
        <section><h2 className="font-display text-xl font-semibold text-foreground">Retention and removal</h2><p>Demo data remains in this browser until site storage is cleared or the demo reset action is used in the owner dashboard. Signing out of the owner demo does not erase saved sample orders or menu changes.</p></section>
        <section><h2 className="font-display text-xl font-semibold text-foreground">Production requirements</h2><p>A real service needs a reviewed privacy policy, lawful data handling, secure server-side storage, access controls, retention rules and a contact channel for privacy requests. None of those production controls are implemented by this browser-only demonstration.</p></section>
        <p className="border-t pt-5 text-xs">This is sample policy copy, not legal advice. The operating business must replace and review it before launch.</p>
      </article>
    </>
  );
}
