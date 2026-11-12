# Sharma's Kitchen Ordering

Create a production-minded restaurant ordering app named Sharma's Kitchen. Use Lovable for the frontend, React + TypeScript + Tailwind in the supported Lovable stack. Implement the complete customer experience: Home, Menu with categories/search/veg filters, working demo cart with persisted item IDs and quantities, cart totals/minimum order, validated checkout for delivery/takeaway and COD/UPI, order status demo route, About, Contact, Terms, Privacy, Refund policy, 404. Also create an admin UI shell with login, live-order dashboard layout, order details/status transitions, menu/category manager and settings. Until a real Supabase backend is connected, clearly label demo mode, use seed data only, never claim real orders/payments/security, and keep admin demo-gated. Use typed repository/service interfaces for later Supabase integration. Do not connect to unrelated existing Supabase projects or create a paid backend automatically.

Visual system: cream #FAF3E7, dark brown #3B2415, orange #D9631E, Fraunces headings, DM Sans body, 8px grid, max width 1200px, 8px cards, 6-8px button radius, Lucide icons. Veg green square-dot, non-veg red square-dot. Premium warm Indian restaurant feel, no purple gradients, emojis, pill buttons, fake reviews/counters/metrics, em dashes, or AI badges. Use replaceable clearly-demo food imagery, optimized and alt-tagged. Subtle 150-300ms motion and prefers-reduced-motion. Mobile-first at 360/390/768/1280.

Business defaults are configurable demo values only: Tue-Sun 11am-11pm IST, Monday closed, 5km radius, ₹30 delivery, ₹150 minimum. Hide unknown address, phone, FSSAI, owner story, UPI, QR and social links rather than invent them. Checkout validation: name 2-60 chars, Indian mobile 10 digits starting 6-9, delivery address 10-200 chars, sector required, 6-digit pincode required, optional landmark and note max 200, UPI requires 12-digit UTR. Display exact UPI amount only when real config exists. Cart price must be treated as server-authoritative once backend exists; money domain values integer paise. No frontend-only enforcement of opening hours or price authority.

Build typed models for categories, menu_items, store_settings, orders, order_items, order_counters, admin_users. Provide README, .env.example with placeholders, architecture notes, demo limitations, QA checklist, per-page SEO metadata, configured-field-only restaurant JSON-LD, sitemap/robots/favicon where supported. Accessibility: semantic HTML, keyboard navigation, visible focus, labels, contrast. Include robust loading/empty/error/unavailable/success states. Make all demo customer flows genuinely usable, no dead buttons. Clearly document backend work still required: Supabase schema/RLS, secure server-side transactional place_order, random 256-bit status token with hash storage, admin role checks, realtime, storage, shared rate limiting, unique UTR, secret keys server-only. Do not imply backend features are implemented before they are.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/66c51ab8-8cbb-478e-bdcb-1daecd8ac101).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
