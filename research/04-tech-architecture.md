# 04 — Technical Architecture & Stack Recommendation

**Project:** Seema — Homemade Chakli & Chivda (D2C food, India)
**Brief:** Mobile-first, animation-heavy marketing site with scroll animations, carousels, parallax, plus online ordering & payments. Small/new brand → pragmatic MVP that scales.
**Date:** 2026-06-27
**Author:** Principal Engineer advisory

---

## TL;DR

Build on **Next.js (App Router) + TypeScript + Tailwind CSS**, with **GSAP ScrollTrigger + Lenis** for scroll/parallax, **Framer Motion** for component micro-interactions, and **Embla** for carousels. Host on **Vercel**. For commerce, **do NOT build a full cart on day one.** Ship **Phase 1 = marketing site + Razorpay Payment Links / WhatsApp ordering** (zero backend), then upgrade to **Phase 2 = custom cart + Razorpay Checkout + Supabase (products/orders/inventory) + a light admin**. Reserve Shopify Headless/Medusa only if volume and SKU complexity explode. Razorpay is the clear payments choice for India (native UPI + COD; UPI is effectively free under ₹2,000). Use **Shiprocket** for shipping (multi-courier aggregator, easiest for small brands). Sort out **FSSAI Basic Registration + GST** before taking online orders.

---

## 1. FRONTEND STACK

### The recommended stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 15/16 (App Router)** | SSR/SSG + RSC for SEO, image optimization, API routes for payments/webhooks, one codebase scales marketing → commerce. |
| Language | **TypeScript** | Type-safe product/order/payment models; fewer runtime bugs at checkout. |
| Styling | **Tailwind CSS** | Fast, consistent, mobile-first responsive utilities; tiny production CSS. |
| Scroll engine | **Lenis** (~3 KB) | Smooth momentum scrolling that drives the whole animation timeline. |
| Scroll animation | **GSAP + ScrollTrigger** | Industry standard for scroll-pinned, parallax, and timeline sequences; precise positional control. |
| Component motion | **Framer Motion** | Declarative enter/exit, hover, layout, and gesture animations inside React. |
| Carousels | **Embla Carousel** (primary) | Lightweight (~10 KB), buttery on touch, headless/unstyled, React hook. Swiper is the fallback if you need heavy built-in features (thumbnails, zoom). |

### Why this stack for "unique + animation-heavy + we control the code"

You want a **bespoke, branded, animation-led experience that you own end to end** — that rules out template platforms and points to a code-first framework. Within code-first, the real contest is **Next.js vs Astro**.

#### Next.js vs Astro (the genuine trade-off)

- **Astro** wins on raw marketing-page performance. Its Islands architecture ships almost no JS by default; 2026 benchmarks show Astro shipping ~9 KB vs ~463 KB of JS on comparable content sites, loading 2–3× faster. It's superb for a pure brochure site.
- **Next.js** wins the moment you need **continuous interactive flows** — cart, checkout, account, order tracking, admin. Astro can do commerce via islands, but you end up stitching tools and fighting hydration boundaries; Next.js gives you one integrated model (RSC + client components + API routes + middleware).
- **Decision:** Seema is *both* a showcase *and* a shop, and the shop is the whole point of the project. Choosing Astro optimizes Phase 1 but creates a re-platform risk at Phase 2. **Next.js is the pragmatic single bet** that serves marketing today and commerce tomorrow. With RSC + `next/image` + per-route code-splitting, a well-built Next.js site hits excellent Core Web Vitals — the JS-weight gap is closeable with discipline (see §4), and is not worth a re-platform.

#### Why not the alternatives

| Alternative | Verdict for Seema |
|---|---|
| **Astro** | Excellent for the marketing layer; weaker fit once cart/checkout/admin become central. Re-platform risk. Strong *runner-up* if you decided commerce stays off-site forever (e.g., always WhatsApp/Payment Links). |
| **Plain Vite + React (SPA)** | No SSR/SSG → poor SEO out of the box, manual routing/meta/image work. You'd rebuild what Next.js gives free. |
| **Shopify themes (Liquid)** | Fast to launch, but you do NOT fully control the code; deep custom GSAP/Lenis choreography fights the theme; monthly fees; over-engineered for a few SKUs. |
| **Webflow** | Great visual animations without code, but you don't own exportable production code, custom logic is constrained, and ongoing subscription. Not "we control the code." |
| **Wix** | Easiest for non-devs, weakest for custom animation/performance/SEO control and code ownership. Not appropriate for a deliberately distinctive build. |

**Recommendation:** **Next.js (App Router) + TypeScript + Tailwind + GSAP/ScrollTrigger + Lenis + Framer Motion + Embla.**

---

## 2. ORDERING / COMMERCE

For a small Indian D2C food brand with few SKUs, the right answer is **start lightweight, upgrade only when order volume justifies it.** Building a full custom store on day one is the classic over-build that delays launch and burns budget before product-market fit.

### The three approaches

#### (a) Lightweight — **recommended MVP (Phase 1)**
- On-site catalog (static/CMS-driven product pages) + a simple "Order" CTA.
- Checkout via **Razorpay Payment Links** (shareable URL / QR / UPI deep link, WhatsApp-friendly) **or WhatsApp-order → Razorpay link**.
- **Pros:** Zero backend, near-zero cost, live in days, India-native UPI, no PCI burden, you handle a handful of orders manually.
- **Cons:** Manual order/inventory tracking; no real cart; doesn't scale past ~dozens of orders/week.

#### (b) Mid — **recommended target (Phase 2)**
- Custom on-site **cart + Razorpay Checkout (Standard/Magic)**.
- **Supabase** (Postgres) for products, orders, inventory, customers + RLS.
- Simple **admin** (protected Next.js route or Supabase dashboard) to manage SKUs, stock, and order status.
- **Pros:** Real e-commerce UX, automated orders/inventory, conversion-optimized checkout, still cheap, you own everything.
- **Cons:** Real build effort; you own webhooks, reconciliation, and edge cases.

#### (c) Full — **defer (Phase 3+ / only if needed)**
- **Shopify Headless** (Hydrogen / Storefront API) or **Medusa** (open-source, self-hosted/Cloud).
- **Pros:** Battle-tested cart/checkout/inventory/discounts/tax, huge app ecosystem (Shiprocket, GST apps), abandoned-cart, multi-channel.
- **Cons:** Shopify = monthly fee + per-txn cut + you re-skin within their checkout constraints; Medusa = you operate infra. Both are overkill for a few SKUs and slow the distinctive front-end. Adopt **only** when SKU count, promotions, or volume make hand-rolled commerce a liability.

### India-specific commerce notes

**Payments — use Razorpay.**
- **UPI** dominates Indian checkout; Razorpay charges effectively **₹0 on UPI under ₹2,000** (NPCI MDR waiver) vs Stripe's 2% on all UPI. For a snack brand with low AOV, this is decisive.
- **COD** is 40–60% of Indian D2C orders. **Stripe has no native COD**; Razorpay supports COD (with OTP) and **Magic Checkout** improves prepaid share and reduces RTO. Stripe also generally doesn't onboard standard India domestic businesses the way Razorpay does.
- COD caution for food: high **RTO (return-to-origin) ~25–35%** on COD vs 2–5% prepaid. For perishable snacks, RTO = dead stock. **Recommendation: push prepaid (UPI/cards) hard via Magic Checkout; offer COD selectively (pin-code gated) or with partial advance.**
- Cards/netbanking/wallets ~2%; T+1 settlement. **Razorpay Payment Links** are first-class for India (QR, UPI deep links, WhatsApp share) — ideal for Phase 1.

**Order management & inventory.** Phase 1: a spreadsheet or Razorpay dashboard is fine. Phase 2: Supabase tables (`products`, `inventory`, `orders`, `order_items`, `customers`) with stock decrement on paid webhook; status enum (`pending → paid → packed → shipped → delivered / cancelled / refunded`).

**Shipping — start with Shiprocket.**
- **Shiprocket** = multi-courier aggregator: pick the cheapest/fastest courier per pincode, more consistent nationwide RTO (~10–12%), easiest onboarding for small brands, polished integrations, no direct courier contracts needed. Adds ~20–30% markup over direct rates but removes all complexity.
- **Delhivery** (direct) is excellent in North India (RTO ~7–8%) and cheaper at high volume (3,000+ shipments/mo with negotiated discounts), but weaker in South India and needs a direct contract. **Graduate to Delhivery direct (or multi-courier) only at volume.**
- For homemade snacks: use sealed, tamper-evident, food-grade packaging; print FSSAI license number, batch/best-before, and ingredients on the label; choose surface/air per shelf-life.

**Compliance — handle before going live.**
- **FSSAI:** Any food seller (including home-based / online) is a Food Business Operator and needs at minimum **FSSAI Basic Registration**. As of the 2026 revision, businesses up to **₹1.5 crore** annual turnover qualify for the cheaper **Basic Registration** (above that → State License). **Display the FSSAI number on the site and packaging.**
- **GST:** Selling through **online marketplaces** mandates GST registration **regardless of turnover**. Selling via **your own website**, the normal thresholds apply (₹40 lakh goods / lower in special-category states), but many payment gateways/aggregators and invoicing needs make early GST registration sensible. **Confirm specifics with a CA** — snack HSN/GST rates and packaged-vs-loose treatment vary. Treat this section as engineering guidance, not legal/tax advice.

### Commerce recommendation

> **MVP = (a) Lightweight:** catalog + Razorpay Payment Links / WhatsApp ordering.
> **Upgrade path = (b) Mid:** custom cart + Razorpay Checkout + Supabase + light admin.
> **(c) Full (Shopify Headless / Medusa):** only if SKUs, promos, or volume outgrow the custom build.

---

## 3. ARCHITECTURE

### Phase 1 (Marketing + simple order) — minimal

```
            ┌──────────────────────────────────────────┐
  Visitor → │  Next.js (App Router) on Vercel           │
 (mobile)   │  - SSG/ISR pages, RSC                      │
            │  - GSAP/Lenis/Framer Motion/Embla         │
            │  - next/image (AVIF/WebP, responsive)     │
            │  - Product data: MDX or Sanity (read)     │
            └───────────────┬──────────────────────────┘
                            │  "Order" / WhatsApp CTA
                            ▼
              ┌────────────────────────────┐      ┌──────────────────┐
              │ Razorpay Payment Link / QR │  or  │ WhatsApp Business│
              │ (UPI / card / netbanking)  │      │ → manual + RP link│
              └────────────────────────────┘      └──────────────────┘
   Analytics: GA4 + (optional) Plausible    Forms: Vercel route → email/Resend
```

### Phase 2 (Full cart/checkout + admin) — target architecture

```
                                  ┌───────────────────────────────────────────┐
                         Visitor →│  FRONTEND: Next.js (App Router) on Vercel   │
                        (mobile)  │  RSC pages • client cart • TS • Tailwind    │
                                  │  GSAP+ScrollTrigger • Lenis • Framer Motion │
                                  │  Embla carousels • next/image               │
                                  └───┬──────────────┬──────────────┬──────────┘
                                      │              │              │
                         (product content)     (cart/checkout)  (analytics/forms)
                                      │              │              │
                         ┌────────────▼───┐   ┌──────▼───────────┐  ├─ GA4 / Plausible
              CMS layer  │ Sanity (rich   │   │ Next.js API /    │  └─ Resend (email)
            (recommended)│ product pages, │   │ Route Handlers   │
                         │ images, story) │   │ - create order   │
                         └────────────────┘   │ - RP order/verify│
                                  │            │ - webhook verify │
                         (or products live     └───┬──────────┬───┘
                          directly in Supabase)    │          │
                                                    ▼          ▼
                                  ┌───────────────────────┐   ┌──────────────────────┐
                  DATA LAYER      │ Supabase (Postgres)   │   │ Razorpay              │
                                  │ products, inventory,  │◄──┤ Checkout / Magic /    │
                                  │ orders, order_items,  │   │ Payment Links         │
                                  │ customers • RLS       │   │ webhook → mark paid   │
                                  └──────────┬────────────┘   └──────────────────────┘
                                             │
                                  ┌──────────▼────────────┐   ┌──────────────────────┐
                  ADMIN           │ Admin (protected      │   │ Shiprocket           │
                                  │ Next.js route or      │──►│ (label, pickup, track)│
                                  │ Supabase Studio)      │   │ + Delhivery at volume │
                                  └───────────────────────┘   └──────────────────────┘
```

### Layer-by-layer choices

- **Frontend / hosting:** Next.js on **Vercel** (zero-config, edge CDN, image optimization, preview deploys, cron, env management). Custom `.in`/`.com` domain.
- **Product content / CMS:**
  - **MDX in-repo** — Phase 1, a handful of SKUs, devs edit. Free, fastest.
  - **Sanity** — recommended once a non-dev needs to edit rich product pages/images/story (great Next.js DX, free tier). Use Sanity for *editorial product content*.
  - **Supabase** — system of record for *transactional* product/stock data in Phase 2. **Pattern:** Sanity = content, Supabase = inventory/orders (or keep everything in Supabase if you want one store and a simple admin). Don't run both unless the editorial need is real.
- **Data layer:** **Supabase (Postgres)** — generous free tier, RLS, auth (for admin/customer accounts later), instant REST/JS client, TypeScript types.
- **Payments:** **Razorpay** — Payment Links (P1) → Checkout/Magic (P2). Always verify payment **signature server-side** and reconcile via **webhook**; never trust client-side success alone.
- **Images:** `next/image` + AVIF/WebP, responsive `sizes`, blur placeholders; serve from Vercel or Sanity CDN.
- **Analytics:** **GA4** (free, India-standard, conversion tracking) + optional **Plausible** (lightweight, privacy-friendly, fast). Add Meta Pixel only if running ads.
- **Forms:** Next.js Route Handler → **Resend** (transactional email: order confirmation, contact). Add spam protection (honeypot / Turnstile).

---

## 4. PERFORMANCE & MOBILE (animation-heavy, still fast)

Animation budget is real on mid/low-end Android, which dominates India. Principles:

1. **Respect `prefers-reduced-motion`.** Gate GSAP/Lenis/Framer Motion behind it — disable parallax/auto-play and fall back to instant/fade. This is an accessibility requirement (~25% of Apple users enable it), not a nice-to-have.
2. **Code-split animation libs.** GSAP/ScrollTrigger/Lenis are client-only — load via `next/dynamic` with `{ ssr: false }` and lazy-mount heavy sections. Don't ship GSAP on routes that don't animate.
3. **Single RAF loop.** Drive Lenis from GSAP's ticker with Lenis `autoRaf: false` so there's only one requestAnimationFrame loop. Set `syncTouch: false` on mobile for smoother touch scroll.
4. **Degrade on low-end devices.** Skip parallax on small/low-DPR screens (e.g. `if (window.innerWidth < 768 && window.devicePixelRatio < 2) return;`). Prefer transform/opacity (GPU-composited); avoid animating layout properties (width/height/top/left).
5. **Responsive images.** `next/image` everywhere, AVIF/WebP, correct `sizes`, `priority` only on the LCP hero, lazy-load the rest. Compress source assets; cap hero weight.
6. **Core Web Vitals targets:** LCP < 2.5 s, INP < 200 ms, CLS < 0.1. Reserve space for images/embeds (no layout shift); call `ScrollTrigger.refresh()` after font/image load so triggers don't drift and cause jank.
7. **Ship less JS.** Lean on RSC / Server Components; keep `"use client"` to the interactive leaves; tree-shake; import only used Framer Motion features (`m` + `LazyMotion`).
8. **Fonts:** `next/font` (self-hosted, `display: swap`, preloaded), subset to needed glyphs.
9. **Measure, don't guess.** Lighthouse + WebPageTest on throttled mobile; Vercel Speed Insights / GA4 for field CWV.

---

## 5. BUILD PLAN (stack locked in)

### Phase 1 — Marketing site + simple ordering (fastest to launch)
- Next.js (App Router) + TS + Tailwind on Vercel; domain + SEO (metadata, OG, sitemap, schema.org `Product`/`LocalBusiness`).
- Hero + scroll story with **GSAP/ScrollTrigger + Lenis**, **Framer Motion** micro-interactions, **Embla** product carousel.
- Products as **MDX** (or Sanity if a non-dev edits).
- Ordering: **Razorpay Payment Links / QR + WhatsApp** CTA. Contact form → Resend. **GA4**.
- Compliance live: display **FSSAI** number; basic T&C, shipping, returns, privacy pages.
- *Exit criteria:* brand site live, customers can pay, you fulfill manually.

### Phase 2 — Full cart / checkout / orders
- Client **cart** (Zustand or React context) + **Razorpay Checkout/Magic**.
- **Supabase**: `products`, `inventory`, `orders`, `order_items`, `customers` + RLS.
- Next.js Route Handlers: create order, **server-side signature verification**, **webhook** → mark paid + decrement stock + send confirmation (Resend).
- COD pin-code gating; prepaid-first nudges to cut RTO.
- *Exit criteria:* end-to-end automated online ordering with inventory.

### Phase 3 — Admin / inventory / fulfillment
- **Admin**: protected Next.js dashboard (Supabase Auth) or Supabase Studio — manage SKUs, stock, order status, refunds.
- **Shiprocket** integration: generate labels, schedule pickups, push tracking to customers. (Delhivery direct / multi-courier at volume.)
- Add: discount codes, abandoned-checkout follow-up, reviews, GST-compliant invoices (CA-reviewed).
- *Re-evaluate (c):* if SKUs/promotions/volume outgrow the custom build → migrate commerce core to **Shopify Headless** (keep the Next.js front-end via Storefront API) or **Medusa**.

---

## RECOMMENDED STACK

```
┌──────────────────────────────────────────────────────────────────────────┐
│                        SEEMA — RECOMMENDED STACK                           │
├──────────────────────────────────────────────────────────────────────────┤
│ FRONTEND     Next.js (App Router) + TypeScript + Tailwind CSS             │
│ ANIMATION    GSAP + ScrollTrigger (scroll/parallax/pin) · Lenis (smooth)  │
│              Framer Motion (component motion) · Embla (carousels)         │
│ HOSTING      Vercel (edge CDN, next/image, ISR, preview deploys)          │
│ CONTENT/CMS  MDX (start) → Sanity (rich product content, non-dev edits)   │
│ DATA         Supabase / Postgres (products, inventory, orders) + RLS      │
│ PAYMENTS     Razorpay — Payment Links (P1) → Checkout/Magic (P2)          │
│              UPI-first (≈₹0 < ₹2,000) · COD pincode-gated, prepaid nudges │
│ SHIPPING     Shiprocket (multi-courier) → Delhivery direct at volume      │
│ EMAIL/FORMS  Resend (order/confirm/contact) via Next.js Route Handlers    │
│ ANALYTICS    GA4 (+ optional Plausible)                                   │
│ COMPLIANCE   FSSAI Basic Registration + GST (CA-reviewed) before go-live  │
├──────────────────────────────────────────────────────────────────────────┤
│ COMMERCE PATH   MVP = catalog + Razorpay Payment Links / WhatsApp         │
│                 → Custom cart + Razorpay Checkout + Supabase + admin      │
│                 → Shopify Headless / Medusa ONLY if volume demands it     │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Sources

- [Smooth Scrolling in Next.js with Lenis & GSAP (2026 Guide) — DevDreaming](https://devdreaming.com/blogs/nextjs-smooth-scrolling-with-lenis-gsap)
- [Patterns for synchronizing ScrollTrigger and Lenis in React/Next — GSAP Forums](https://gsap.com/community/forums/topic/40426-patterns-for-synchronizing-scrolltrigger-and-lenis-in-reactnext/)
- [Astro vs Next.js: Which Framework Should You Use in 2026? — Cosmic](https://www.cosmicjs.com/blog/astro-vs-nextjs-2026)
- [Next.js vs. Astro in 2026: A full comparison guide — Vercel](https://vercel.com/i/astro-vs-next-js)
- [Astro vs Next.js: 9KB vs 463KB JS — tech-insider](https://tech-insider.org/astro-vs-nextjs-2026/)
- [Razorpay vs Stripe for Indian Businesses: Complete 2026 Comparison — triggerAll](https://triggerall.com/blog/razorpay-vs-stripe-india/)
- [Razorpay vs Stripe for Indian MVPs in 2026 — Rohit Raj](https://rohitraj.tech/en/notes/razorpay-vs-stripe-india-mvp-2026)
- [Best Payment Gateway India 2026 — Razorpay vs Cashfree vs PayU — Shop2Host](https://shop2host.com/best-payment-gateway-india)
- [Shiprocket vs Delhivery vs Shipway — Shipway](https://blog.shipway.com/shiprocket-vs-delhivery/)
- [Shiprocket vs Delhivery vs Ecom Express for Shopify India — ProjectSupply](https://projectsupply.in/blog/shiprocket-vs-delhivery-vs-ecom-express-shopify-india)
- [FSSAI New Turnover Threshold 2026: Registration & License — seyecs](https://blogs.seyecs.com/fssai-new-turnover-threshold-2026/)
- [FSSAI Raises Turnover Limits for Food Business Registration and Licensing — Chambers and Partners](https://chambers.com/articles/fssai-raises-turnover-limits-for-food-business-registration-and-licensing)
- [GST Registration For Food Businesses — MyFoodExpert](https://www.myfoodexpert.in/gst-registration-for-food-business/)
- [Best headless CMS for Next.js in 2026: Sanity vs Contentful vs Payload vs Storyblok — DEV](https://dev.to/nayankyada/best-headless-cms-for-nextjs-in-2026-sanity-vs-contentful-vs-payload-vs-storyblok-557k)
- [Next.JS CMS — The Best Headless CMS for Next.JS Apps — Sanity](https://www.sanity.io/nextjs-cms)

*Note: Payments/GST/FSSAI points are engineering guidance, not legal or tax advice — confirm thresholds, HSN codes, and licensing with a qualified CA/consultant before launch.*
