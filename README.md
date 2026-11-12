# Sharma's Kitchen Ordering Demo

A responsive restaurant-ordering portfolio project built with React 19, TypeScript, TanStack Start, TanStack Router, Tailwind CSS, TanStack Query, Zod and Lucide icons.

**This is a fictional portfolio demo, not a live restaurant.** Menu items, prices, food images, business hours and order records are sample data. No order is transmitted to a kitchen, no payment is collected, and no delivery or pickup is arranged.

## What is included

### Customer experience
- Home page with sample dishes, ordering steps, delivery information and opening hours.
- Menu with categories, search, vegetarian/non-vegetarian filters, availability, popular tags and quantity controls.
- Persistent cart storing only item IDs and quantities, with price and total calculations in integer paise.
- Checkout for delivery or takeaway, with Indian mobile number, address, PIN code, note and UPI UTR validation.
- Cash-on-delivery demo flow. UPI is hidden until a UPI ID and payee name are configured in the demo settings.
- Simulated order confirmation and tracking, refreshed every 15 seconds.
- About, Contact, Terms, Privacy and Cancellation/Refund pages.
- Favicon, robots.txt, sitemap.xml, page metadata and configured-field-only Restaurant JSON-LD.

### Owner dashboard
Open **/admin** and use any valid email address plus a non-empty demo password. This is a session flag, not authentication.

- Order queue with today/all filters, status and payment filters, search, pending count and daily sample sales.
- Order detail with customer/contact fields, item and price snapshots, status transitions, cancellation reason, UTR display and manual demo payment verification.
- Menu item create/edit, price and category changes, veg/popular/availability flags, compressed JPG/PNG/WebP image uploads and archive/restore.
- Category add/rename/reorder/hide.
- Store hours, accepting-orders switch, delivery fee, minimum order, radius, phone, WhatsApp, email, address, FSSAI and UPI demo settings.
- Reset control to clear local demo orders, menu edits, settings and cart.

## Run locally

The repository includes a Bun lockfile.

```sh
bun install --frozen-lockfile
bun run dev
```

Other checks:

```sh
bun run test
bunx tsc --noEmit
bun run build
bun run lint
```

## Demo behaviour and boundaries

All order, menu, category and settings data is stored in the current browser's local storage. The demo admin flag is stored in session storage. The dashboard polls browser storage; it is not a realtime server connection and another person on another device will not see these orders.

The order repository deliberately mirrors some production validation steps: current menu lookup, item availability, positive bounded quantities, opening hours, minimum order, integer-paise totals and duplicate UTR detection within this browser. These checks are **client-side demo logic only**. They are not a security boundary and can be bypassed by a browser user.

Use fictional test details. Do not enter real customer information, real payment references, bank credentials or production passwords. A demo tracking URL is not a secure token URL.

Business phone, WhatsApp, address, email, FSSAI, UPI ID, payee and QR details are blank by default. Only configure values supplied by the actual business. No owner identity, restaurant story, licence, map pin, social profile, review, award or operating claim has been invented.

To test checkout when the sample business is closed, open **/admin → Settings**, enable accepting orders, and select today's IST weekday with an opening window that contains the current IST time. Default hours are Tuesday to Sunday, 11:00 to 23:00 IST, with Monday closed.

## Architecture

- `src/domain`: typed entities, cart calculations, checkout schema, opening-hours checks, currency formatting and order-status transitions.
- `src/repositories`: repository interfaces and the local-storage demo implementation. A real backend adapter can replace the demo implementation without rewriting the page layer.
- `src/routes`: file-based customer and owner routes.
- `src/components/site`: shared site navigation, footer, design primitives and menu cards.
- `src/data`: editable sample menu and replaceable demo dish imagery.
- `src/test` and domain test files: route and domain QA.

## Production work still required

This repository is a complete *showcaseable demo*, not a production ordering service. Before a real restaurant uses it, implement and security-review:

1. Supabase/Postgres schema and migrations for categories, menu items, store settings, orders, order items, daily counters and admin users.
2. RLS that exposes only public menu/settings data. Order records and admin operations must be unavailable to anonymous users.
3. Supabase Auth with owner/staff role checks on every server-side admin action. Replace the demo sign-in immediately.
4. A transactional server-side `place_order` path that recalculates database prices, checks opening hours and availability, enforces minimum order and quantity limits, applies the delivery fee, atomically allocates an order number and stores item price/name snapshots.
5. Random 256-bit order access tokens with only token hashes persisted, plus rate limiting for checkout and login.
6. A unique database constraint for UTR values, manual bank verification workflow and audited status changes.
7. Realtime order updates, server-side storage for uploaded images, backups, monitoring and operational email/WhatsApp integrations.
8. Real business content, legal review of policies, domain-specific sitemap/robots URLs, payment-provider approval and accessibility/performance testing on actual devices.

Never put a Supabase service-role key in browser code or any `VITE_*` variable. `.env.example` contains placeholders only.

## Design and accessibility

Warm cream, dark brown and orange palette; Fraunces display font and DM Sans body font; 6-8px button radius; Lucide icons; visible focus states; semantic labels; reduced-motion support; responsive layouts for phone, tablet and desktop. Food illustrations are labelled as demo imagery and should be replaced with client-owned photos before commercial use.

## Deployment notes

The current sitemap points at the Lovable preview hostname. Replace those URLs and the canonical/metadata URLs when the project receives its final public domain. Review privacy, terms and refund copy before any real commercial launch.

## Live demo

- Public site: https://sharmas-kitchen-ordering.lovable.app
- Preview: https://id-preview--66c51ab8-8cbb-478e-bdcb-1daecd8ac101.lovable.app

## Repository

- GitHub: https://github.com/Warrior1012/sharma-s-kitchen-ordering
- Lovable editor: https://lovable.dev/projects/66c51ab8-8cbb-478e-bdcb-1daecd8ac101
