# Spielnova — Full Technical & Production-Readiness Audit

**Date:** 2026-05-09  
**Auditor:** OpenHands AI — Senior Software Architecture Analysis  
**Mode:** Read-Only / Analysis Only — No files were modified  
**Scope:** Complete repository analysis including architecture, security, payments, booking system, database, and operational readiness

---

## Table of Contents

- [Preliminary Assessment](#preliminary-assessment)
- [A. Executive Summary](#a-executive-summary)
- [B. Business Workflow Understanding](#b-business-workflow-understanding)
- [C. Technical Architecture Summary](#c-technical-architecture-summary)
- [D. Frontend Analysis](#d-frontend-analysis)
- [E. Backend & Supabase Analysis](#e-backend--supabase-analysis)
- [F. Stripe & Payment Audit](#f-stripe--payment-audit)
- [G. Booking System Audit](#g-booking-system-audit)
- [H. Database Structure Inference](#h-database-structure-inference)
- [I. Security Assessment](#i-security-assessment)
- [J. Operational Risk Assessment](#j-operational-risk-assessment)
- [K. Completed Features List](#k-completed-features-list)
- [L. Missing / Incomplete Features List](#l-missing--incomplete-features-list)
- [M. Technical Debt & Code Quality](#m-technical-debt--code-quality)
- [N. Recommended Next Priorities](#n-recommended-next-priorities)
- [O. Roadmap Toward Production Readiness](#o-roadmap-toward-production-readiness)
- [Top 10 Highest-Risk Issues](#top-10-highest-risk-issues)
- [Top 10 Highest-Impact Improvements](#top-10-highest-impact-improvements)
- [Overall Assessment](#overall-assessment)

---

## Preliminary Assessment

| Dimension | Finding |
|---|---|
| **Technologies detected** | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Radix UI / shadcn, Framer Motion, Supabase (PostgreSQL + Auth + SSR), Stripe v20 SDK, Resend v6, Zod, React Hook Form, date-fns, Lucide icons |
| **Appears runnable?** | Yes — `npm run dev` would start it. Live `.env.local` is present (gitignored). Dependencies installed. No immediate runtime blockers on startup. |
| **Architecture organized or chaotic?** | Moderately organized with clear Next.js App Router conventions, but shows signs of incremental AI-assisted construction. Schema is split across multiple migration files with some duplication/overlap. No middleware layer. Server/client boundary crossings occur. |
| **Initial engineering quality** | Mid-tier MVP. Competent scaffolding, functional core flows, German-language business domain reflected in the codebase. Code is readable but contains several structural shortcuts, leftover debug code, and security gaps typical of rapid AI-assisted development. |
| **Initial production readiness** | **Not production-ready yet.** The payment flow works structurally but has an unconfigured webhook (breaking email delivery). PII is exposed via permissive Supabase RLS. The Stripe webhook secret is a placeholder. Several critical access-control gaps exist. Several pages contain placeholder/mock data. The platform is best described as "advanced MVP nearing production" with targeted hardening needed before going live. |

---

## A. Executive Summary

The Spielnova codebase is a Next.js 16 full-stack web application built for a VR arcade venue in Ingolstadt, Germany. It covers public marketing content, a multi-step online booking flow with Stripe payments, and a password-protected admin dashboard for employees/managers.

The project has clearly been built rapidly — and effectively — with significant AI assistance. The core booking engine, admin dashboard, and email system are architecturally sound and functional. However, the application is not yet production-safe. Specific critical gaps include:

- **The Stripe webhook is not operational** (placeholder secret), meaning confirmation emails are never automatically sent after payment
- **All booking data (customer names, emails) is publicly readable** via the Supabase anon key, which is intentionally embedded in the frontend
- **The DELETE booking API route lacks the promised manager-only authorization check**, allowing any authenticated employee to delete bookings
- **No middleware-level route protection** — admin pages rely only on client-side redirect logic
- **Multiple booking UI pages reference placeholder images** that don't exist
- **Browser `alert()` calls are still in the customer-facing booking flow**
- **A "Demo Mode" notice is shown to customers on the payment button**
- **The `test-email` preview page is publicly accessible** without any authentication

The most urgent priorities before going live are: configuring the Stripe webhook secret, tightening the Supabase RLS policies so customer data isn't publicly readable, fixing the delete authorization bug, and cleaning up all customer-facing debug/demo artefacts.

---

## B. Business Workflow Understanding

### Customer Journey

1. **Discovery** → Customer visits `spielnova.de`, lands on homepage with hero animation, sees game categories (VR Shooter, Escape Room, Simulators, Arcade)
2. **Experience Research** → Customer browses `/shooter_games`, `/escaperooms`, `/simulators`, `/arcade` pages; can click into individual game detail pages via `/experience/[slug]`
3. **Booking** → Customer navigates to `/buchen`, follows a 3-step flow:
   - **Step 1:** Select game type (VR Shooter or Escape Room), select duration (30/60 min), select specific game title
   - **Step 2:** Select player count (2–6), select date from calendar, select available time slot
   - **Step 3:** Enter name and email, review pricing summary, click "Jetzt Buchen & Bezahlen"
4. **Payment** → Redirected to Stripe Checkout (card + PayPal configured); pays; redirected to `/buchen/success?session_id=XXX`
5. **Confirmation** → Success page calls `/api/bookings/confirm` which verifies payment with Stripe and marks the booking confirmed. Email confirmation is supposed to arrive via webhook (currently broken)
6. **Day-of** → Customer arrives 10 minutes early (per email instructions)

> **Current gap:** Simulators and Arcade games cannot be booked online — only VR Shooter and VR Escape Room are supported in the booking flow.

### Employee / Walk-In Workflow

1. Employee logs in at `/admin` with email + password (Supabase auth)
2. Required password change enforced on first login (temporary password flow)
3. Employee views today's bookings on the admin dashboard (real-time via Supabase Realtime)
4. For walk-in customers: Employee clicks "+ Walk-in" → fills in customer name, game, time, player count, payment method (cash/card/free) → booking created immediately as `confirmed`
5. Employee can open any booking → reschedule (sends email), cancel, add internal note, send reminder email, or issue Stripe refund
6. 1-hour inactivity auto-logout

### Manager Workflow (Superset of Employee)

- Access to **"Team"** tab: Create new employees with temporary passwords, toggle active/inactive, delete employees
- Access to **"Einstellungen"** (Settings) tab: Manage holiday periods (Schulferien = opens at 10:00, Feiertage = closed)
- Access to **"Aktivitäten"** (Activity Log) tab: View last 100 audit log entries

### Business Logic (Ingolstadt-Specific)

| Rule | Implementation |
|---|---|
| Closed Sundays | `dayOfWeek === 0` returns empty slots |
| Weekday opens 14:30 | Mon–Thu start at `14:30` (note: displayed as 14:00 on the website) |
| Saturday opens 10:00 | `dayOfWeek === 6` triggers 10:00 start |
| School holidays open 10:00 | Manager-managed `holidays` table with `type: 'school'` |
| Public holidays closed | Manager-managed `holidays` table with `type: 'public'` |
| Weekend pricing (Fri/Sat/Sun) | `[0, 5, 6].includes(dayOfWeek)` — matches "Fr–Sa" displayed on pricing page |
| 2 arenas total | `TOTAL_ARENAS = 2`; groups > 4 players require both arenas |
| Top Gamer Discount | 20% off if customer same email booked in last 30 days |
| Team pricing | Groups ≥4 get team-packet pricing (cheaper per person) |

---

## C. Technical Architecture Summary

```
spielnova/
├── app/                          Next.js App Router
│   ├── page.tsx                  Homepage
│   ├── layout.tsx                Global layout (Navbar, Footer, ThemeProvider)
│   ├── buchen/
│   │   ├── page.tsx              3-step booking wizard (CLIENT component)
│   │   └── success/page.tsx      Payment success page
│   ├── admin/
│   │   ├── page.tsx              Employee login page
│   │   ├── dashboard/page.tsx    Admin dashboard (with sub-components)
│   │   └── reset-password/       Password reset flow
│   ├── api/                      Route Handlers (serverless functions)
│   │   ├── availability/         GET slot availability
│   │   ├── bookings/             POST create booking + Stripe session
│   │   │   └── confirm/          GET post-payment confirmation
│   │   ├── webhooks/stripe/      POST Stripe webhook handler
│   │   └── admin/                Protected admin endpoints
│   │       ├── bookings/         GET list, POST walk-in, PATCH/DELETE by ID
│   │       ├── employees/        Employee CRUD (manager only)
│   │       ├── holidays/         Holiday CRUD (manager for write)
│   │       ├── refund/           Stripe refund issuance
│   │       ├── send-email/       Manual reminder email trigger
│   │       ├── me/               Self profile update
│   │       └── forgot-password/  Password reset flow
│   └── [content pages]/          agb, datenschutz, epilepsie, impressum,
│                                  kontakt, oeffnungszeiten, preise,
│                                  arcade, escaperooms, shooter_games,
│                                  simulators, experience/[slug]
├── components/
│   ├── admin/                    Admin-specific components
│   │   ├── BookingDetailPanel    Booking actions panel
│   │   ├── BookingTable          Tabular booking list
│   │   ├── HolidaySettings       Holiday management UI
│   │   ├── TeamManagement        Employee management UI
│   │   └── WalkInForm            Walk-in booking form
│   ├── ui/                       shadcn/Radix atomic components
│   └── [shared]/                 hero-section, game-card, navbar, footer, etc.
├── lib/
│   ├── availability.ts           Core slot generation + double-booking check
│   ├── constants.ts              TOP_GAMER_DISCOUNT_PERCENT
│   ├── email.ts                  Resend email functions (3 types)
│   ├── stripe.ts                 Stripe client initialization
│   ├── supabase.ts               Anon/public Supabase client
│   ├── supabase-server.ts        SSR Supabase client + auth helpers
│   └── utils.ts                  cn() utility
├── supabase/
│   ├── schema.sql                Initial schema (outdated reference)
│   └── migrations/               5 migration files + fix_rls.sql
└── [config files]                next.config.ts, tsconfig.json, etc.
```

**Key Architectural Decisions:**

- No dedicated `/api/auth` layer — authentication is handled by Supabase client/SSR directly
- No Next.js middleware (`middleware.ts`) — route protection is application-level only
- Public booking flow uses the public Supabase anon client (`lib/supabase.ts`) directly from server route handlers
- Admin routes use the SSR Supabase client (`lib/supabase-server.ts`) with auth session cookies
- Webhook handler uses Supabase service role client to bypass RLS

**Three Distinct Supabase Client Instances:**

| Client | Where | Key Used | Purpose |
|---|---|---|---|
| `lib/supabase.ts` | Public booking API routes, availability lib | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Reads/inserts bookings publicly |
| `lib/supabase-server.ts` | Admin API routes | `NEXT_PUBLIC_SUPABASE_ANON_KEY` + auth session cookie | Authenticated employee operations |
| Inline admin clients | webhook, employees, holidays, me routes | `SUPABASE_SERVICE_ROLE_KEY` | Bypasses RLS for privileged operations |

---

## D. Frontend Analysis

### Stack

| Technology | Version | Role |
|---|---|---|
| Next.js | 16.1.1 | Framework (App Router) |
| React | 19.2.3 | UI rendering (very new, potential compatibility concerns) |
| Tailwind CSS | v4 | Styling |
| shadcn/ui (Radix UI) | Various | Component primitives |
| Framer Motion | 12 | Animations |
| react-hook-form + Zod | 7.x / 4.x | Form validation (admin) |
| react-day-picker | 9.x | Calendar component |
| date-fns | 4.x | Date formatting |
| next-themes | 0.4.x | Theme management (forced dark) |
| Orbitron + Outfit | — | Custom Google Fonts (VR aesthetic) |

### UI Architecture

The UI is split into two distinct worlds:

1. **Public site** — Cyberpunk/neon aesthetic with dark background, gradient accents, Orbitron + Outfit fonts. Cohesive and polished marketing feel.
2. **Admin dashboard** — Functional, dark-theme, card-based layout. Uses inline Tailwind styling rather than component library consistently.

### UX Maturity Issues

| Issue | Location | Severity |
|---|---|---|
| Native `alert()` calls for errors | `buchen/page.tsx` | **Medium** — jarring UX, should use toast/modal |
| "Demo Mode" text on payment button | `buchen/page.tsx` line 429 | **HIGH** — customers see this in production |
| Placeholder images that don't exist | `shooter_games`, `arcade`, `experience/[slug]` | **Medium** — broken images in production |
| **5 of 8 game detail pages show "Erlebnis nicht gefunden"** | `experience/[slug]/page.tsx` | **🔴 HIGH** — confirmed customer-facing bug (see §D.1 below) |
| **Slot availability display ignores player count** | `buchen/page.tsx` line 320 | **🔴 HIGH** — 5–6 player groups see false "available" slots (see §D.2) |
| **No filtering of past time slots on today's date** | `buchen/page.tsx` | **🟠 Medium** — past slots appear bookable, fail on submit (see §D.2) |
| **Max players hardcoded to 6, real capacity is 8** | `buchen/page.tsx` SelectItem list | **🟠 Medium** — business logic error, mismatches walk-in form (see §D.3) |
| Opening hours show 14:00 but slots start 14:30 | `oeffnungszeiten/page.tsx` | **Medium** — customer confusion |
| Contact form has no submit handler | `kontakt/page.tsx` | **High** — customers can't contact the business |
| Birthday party phone: "[Insert Phone Number Here]" | `Pricing.md` | **Medium** |
| Step counter says "Schritt X von 4" but only 3 steps shown | `buchen/page.tsx` | Low |
| `/test-email` page publicly accessible | `/test-email` | **Medium** — looks unprofessional |
| `console.log` statements in admin dashboard | `dashboard/page.tsx` | Low — dev noise in production |
| PayPal listed as payment method but likely not configured | `api/bookings/route.ts` | **Medium** |

### Signs of AI-Generated / Rapid Development

- Hardcoded mock game data with comment `// Mock games data (should ideally come from DB or config)`
- Template placeholder images referenced in multiple pages (`/placeholder-zombie.jpg`, etc.)
- The `README.md` is the unmodified Next.js boilerplate — zero project-specific documentation
- Inline component co-location in dashboard page (`AuditLog`, `ChangePasswordModal` at bottom of `dashboard/page.tsx`)
- Comment: `// Step 4 handling is redundant if we assume 3 steps UI logic`
- Repetitive email HTML templates duplicated across `lib/email.ts` and `app/test-email/page.tsx`
- Multiple test files (`test_emails.ts`, `test_payload.js`, `schema-check.js`) left in the project root
- `bash_events/` directory full of debugging output artefacts present in the workspace

---

### §D.1 — Confirmed Bug: "Erlebnis nicht gefunden" (5 of 8 games broken)

> **Reported by:** Customer feedback. **Status:** Confirmed via code inspection.

The `gamesData` dictionary in `app/experience/[slug]/page.tsx` only defines **3 games**. The listing pages and the booking flow reference **8 games** (4 shooters + 4 escape rooms). When a customer clicks on any of the 5 undefined slugs, they see a blank error page.

**Full slug mismatch map:**

| Game | Slug | Listed in `/shooter_games` or `/escaperooms` | Has detail page | Result |
|---|---|---|---|---|
| Zombie Apocalypse VR | `zombie-apocalypse` | ✅ | ✅ | Works |
| Robot Warfare | `robot-warfare` | ✅ | ✅ | Works |
| Space Marines | `space-marines` | ✅ | ❌ Missing | **"Erlebnis nicht gefunden"** |
| Wild West Shootout | `wild-west` | ✅ | ❌ Missing | **"Erlebnis nicht gefunden"** |
| Escape the Pyramids | `escape-pyramids` | ✅ | ✅ | Works |
| Space Station Tiberia | `space-station` | ✅ | ❌ Missing | **"Erlebnis nicht gefunden"** |
| Alice in Wonderland | `alice-wonderland` | ✅ | ❌ Missing | **"Erlebnis nicht gefunden"** |
| Horror House | `horror-house` | ✅ | ❌ Missing | **"Erlebnis nicht gefunden"** |

**Root cause:** Three separate hardcoded game lists exist in the codebase and are not synchronized. When the listing pages were updated with more games, the detail page dictionary was not updated to match.

**Fix required:** Add the 5 missing game objects to `gamesData` in `app/experience/[slug]/page.tsx`.

> **Note:** This also invalidates the audit entry in Section K that marks `experience/[slug]` as ✅ Complete. It is **partially broken** — 3 of 8 detail pages work, 5 do not.

---

### §D.2 — Confirmed Bug: Slot Display Does Not Reflect Player Count or Current Time

> **Reported by:** Customer feedback ("cannot see booked and available slots"). **Status:** Confirmed via code inspection — two root causes.

**Bug A — Slot availability ignores the selected player count:**

The availability check in the booking UI is:
```javascript
const isAvailable = status.arena1 || status.arena2;
```
This returns `true` if **any** arena is free. It is correct for groups of 1–4 players (1 arena needed). However, for groups of **5–6 players** (2 arenas required), a slot with only one free arena appears as available (outlined, clickable) even though the group cannot actually book it.

**Customer experience:** The customer with 5+ players selects a slot, fills in their details, and clicks "Jetzt Buchen & Bezahlen" — only to receive an error: *"This time slot is no longer available."* The slot looked available; they cannot understand why it failed. This erodes trust.

**Fix required:** Replace the static `isAvailable` with a player-count-aware check:
```javascript
const needsBothArenas = parseInt(playerCount) > 4;
const isAvailable = needsBothArenas
  ? (status.arena1 && status.arena2)   // needs both free
  : (status.arena1 || status.arena2);  // needs at least one free
```

**Bug B — Past time slots are shown as available on today's date:**

There is no logic to filter out time slots that have already passed when the selected date is today. If a customer opens the booking page at 18:00 on a weekday, they see `14:30`, `15:00`, `15:30`, `16:00`, `16:30`, `17:00`, `17:30` all rendered as available outlined buttons (because no one has a booking in the past). Clicking any of them will fail at the backend (the time has passed).

**Fix required:** Add a filter in the slot rendering loop:
```javascript
const now = new Date();
const isToday = format(date, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd');
const isPast = isToday && time < format(now, 'HH:mm');
const isAvailable = !isPast && (needsBothArenas ? ... : ...);
```

---

### §D.3 — Confirmed Business Logic Error: Max Players Capped at 6 (Should Be 8)

> **Reported by:** Business owner. **Status:** Confirmed via code inspection.

The public booking form (`app/buchen/page.tsx`) offers player counts up to **6**:
```jsx
<SelectItem value="5">5 Spieler (Benötigt 2 Arenen)</SelectItem>
<SelectItem value="6">6 Spieler (Benötigt 2 Arenen)</SelectItem>  ← hardcoded maximum
```

The **admin walk-in form** (`components/admin/WalkInForm.tsx`) correctly allows up to **8**:
```javascript
{[1, 2, 3, 4, 5, 6, 7, 8].map(n => (...))}
```

The actual physical capacity is **4 players per arena × 2 arenas = 8 players**. The backend has no hard cap — it would correctly process 7 or 8 players. The restriction exists only in the frontend dropdown.

**Impact:** Groups of 7 or 8 players cannot book online and must call or visit in person, causing lost revenue and a poor booking experience for the exact group sizes the two-arena setup was designed to serve.

**Fix required:**
1. Add `<SelectItem value="7">7 Spieler (Benötigt 2 Arenen)</SelectItem>` and `value="8"` to `buchen/page.tsx`
2. Add `export const MAX_PLAYERS = 8` and `export const PLAYERS_PER_ARENA = 4` to `lib/constants.ts` so both the public booking page and the walk-in form use the same source of truth

---

### Frontend Verdict

The public-facing design is genuinely polished and aesthetically appropriate for a premium VR arcade. The booking flow is functional. However, it is **not production-ready** due to the demo notice, non-functional contact form, broken placeholder images, and native alert UX patterns. Three newly identified confirmed bugs (§D.1, §D.2, §D.3) directly cause customer-facing failures in the primary booking workflow.

---

## E. Backend & Supabase Analysis

### Authentication Flow

1. Employee submits email/password on `/admin`
2. `supabase.auth.signInWithPassword()` called client-side → session cookie set by Supabase SSR
3. Admin API routes call `getAdminSession()` which:
   - Reads the cookie-based session via `createServerClient`
   - Fetches the employee profile from `employees` table
   - Returns `{ user, employee, supabase }`
4. All admin routes verify `employee` exists before proceeding
5. Manager-only routes additionally call `isManager(employee)`

> **Concern:** There is **no Next.js `middleware.ts`** to protect `/admin/dashboard` at the request level. Protection relies solely on client-side React logic. A direct unauthenticated GET to `/admin/dashboard` will render the page shell momentarily before redirect. Middleware would be more secure.

### Row-Level Security Analysis

**Schema evolution (applied in order):**

| File | Key RLS Changes |
|---|---|
| `schema.sql` | **PUBLIC READ on all bookings** (`USING (true)`), **PUBLIC INSERT on bookings** |
| `20240001_admin_setup.sql` | Employees: own-profile read, manager full access; Audit log: manager read, active employee insert |
| `20240002_bookings_admin_columns.sql` | Authenticated users can UPDATE any booking; authenticated users can INSERT bookings |
| `20240003_holidays.sql` | Anyone can read holidays; `is_manager()` guards writes |
| `fix_rls.sql` | Fixes RLS recursion in employee/audit_log policies via `SECURITY DEFINER` function |

**Critical RLS Security Issues:**

1. **⚠️ CRITICAL: All booking data is publicly readable.**  
   The policy `"Enable read access for all users" ON bookings FOR SELECT USING (true)` gives anyone with the anon key (embedded in the frontend bundle) full read access to all bookings. This includes `customer_name`, `customer_email`, `customer_phone`, `game_slug`, `start_time`, `staff_notes`, and `payment_id`. This is a **GDPR-relevant data exposure** for a German business.

2. **⚠️ HIGH: Anyone can INSERT into bookings.**  
   The public INSERT policy means anyone can create arbitrary booking records directly via the Supabase API without going through the application. This enables slot-blocking spam attacks.

3. **Medium: Any authenticated user can UPDATE any booking.**  
   The policy in migration 20240002 grants UPDATE on bookings to all `authenticated` Supabase users — not restricted to the `employees` table.

4. **Low: No DELETE policy on bookings table.**  
   Soft-delete is done via status update (`'deleted'`), relying entirely on application logic.

### API Route Protection Matrix

| Route | Auth Check | Manager Check | Notes |
|---|---|---|---|
| `GET /api/availability` | None (public) | No | Correct — public data |
| `POST /api/bookings` | None (public) | No | Correct — public booking flow |
| `GET /api/bookings/confirm` | None (public) | No | Risk: no idempotency check |
| `POST /api/webhooks/stripe` | Stripe signature | No | Correct — signature validated |
| `GET /api/admin/bookings` | Employee check | No | Correct |
| `POST /api/admin/bookings` (walk-in) | Employee check | No | Correct |
| `PATCH /api/admin/bookings/[id]` | Employee check | No | Correct |
| `DELETE /api/admin/bookings/[id]` | Employee check | **NO — BUG** | Must require `isManager` |
| `POST /api/admin/refund` | Employee check | No | Intentional (all staff) |
| `GET /api/admin/employees` | Manager check | Yes | Correct |
| `POST /api/admin/employees` | Manager check | Yes | Correct |
| `GET /api/admin/holidays` | Employee check | No | Correct |
| `POST /api/admin/holidays` | Manager check | Yes | Correct |
| `POST /api/admin/me` | Employee check | No | Correct |
| `POST /api/admin/forgot-password` | None (public) | No | Acceptable — email enumeration mitigated |
| `POST /api/admin/send-email` | Employee check | No | Correct |

### Environment Variable Security

| Variable | Exposure | Risk |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Public (frontend bundle) | Low — expected |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public (frontend bundle) | Low — expected, **but RLS must be correct** |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Public (frontend bundle) | Low — expected |
| `STRIPE_SECRET_KEY` | Server-only | Medium — currently test key, must be rotated for live |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only | **CRITICAL** — bypasses all RLS, must never be exposed |
| `RESEND_API_KEY` | Server-only | Medium — could be used to send spam |
| `STRIPE_WEBHOOK_SECRET` | Server-only | **Currently a placeholder** — webhook broken |

The `.env.local` file is correctly gitignored (`.env*` in `.gitignore`). The Stripe keys are TEST keys (`pk_test_*`, `sk_test_*`). The Supabase keys and Resend key appear to be real production credentials requiring protection.

---

## F. Stripe & Payment Audit

### Payment Flow Diagram

```
Customer → POST /api/bookings
         → Availability check (checkSlotAvailability)
         → Insert booking with status='pending_payment'
         → Create Stripe Checkout Session (client_reference_id = booking UUID)
         → Return { url: stripeCheckoutUrl }

Customer → Stripe Checkout (pays)

Path A (Webhook — PRIMARY, currently BROKEN):
         Stripe → POST /api/webhooks/stripe
              → Validate signature with STRIPE_WEBHOOK_SECRET (PLACEHOLDER!)
              → Update booking: status='confirmed', stripe_session_id, payment_id, total_amount
              → Send confirmation email via Resend

Path B (Success Page — FALLBACK, currently ONLY working path):
         Customer → GET /buchen/success?session_id=XXX
              → Frontend calls GET /api/bookings/confirm?session_id=XXX
              → Retrieve Stripe session, verify payment_status='paid'
              → Update booking: status='confirmed', payment_id
              → ⚠️ NO email sent (confirm route doesn't call sendBookingConfirmation)
```

### Payment Issues

**1. 🔴 CRITICAL: Stripe Webhook Secret is a Placeholder**

`STRIPE_WEBHOOK_SECRET=PASTE_YOUR_WEBHOOK_SECRET_HERE`

- `stripe.webhooks.constructEvent()` throws for every incoming webhook
- Webhook endpoint returns HTTP 400 for all Stripe events
- Path A is entirely non-functional
- Customers **do not receive confirmation emails** after payment
- `total_amount` and `stripe_session_id` are not stored via this path

**2. 🔴 HIGH: Confirm Endpoint Sends No Email**

`GET /api/bookings/confirm` (Path B — the only currently working path) updates the booking status but never calls `sendBookingConfirmation()`. Customers who pay successfully receive no email confirmation under any current circumstance.

**3. 🟠 HIGH: Race Condition in Booking Creation (TOCTOU)**

The booking creation performs:
1. `checkSlotAvailability()` — reads bookings, computes availability
2. *(gap — no lock)*
3. `supabase.from('bookings').insert()` — inserts the new booking

Between steps 1 and 3, another user could submit for the same slot. Both pass the check and both get inserted — a double-booking. There is no database-level constraint preventing two overlapping bookings.

**4. 🟠 HIGH: Pending Payment Bookings Accumulate Indefinitely**

When a user abandons the Stripe checkout, a `pending_payment` record is left in the database permanently. These records:
- Count against arena availability for their time window
- Never get cleaned up (no scheduled job, no TTL)
- No handler for Stripe's `checkout.session.expired` webhook event

**5. 🟡 MEDIUM: Pricing Inconsistency — Friday**

The opening hours page lists Friday as a weekday (14:00–20:00 like Mon–Thu) but the code correctly charges weekend prices on Friday (`[0, 5, 6].includes(dayOfWeek)`). This is consistent with `Pricing.md` ("Weekdays Mon–Thu / Weekends Fri–Sun") but the hours page is misleading.

**6. 🟡 MEDIUM: Top Gamer Discount is Gameable**

The loyalty discount is triggered by `customer_email` appearing in past confirmed bookings. Since booking data is publicly readable via the anon key, an attacker can:
- Find any confirmed customer's email via a Supabase query
- Use that email when booking to claim 20% off

There is no email verification before a booking is created.

**7. 🟡 MEDIUM: PayPal Listed but Likely Not Configured**

`payment_method_types: ['card', 'paypal']` is in Stripe session creation. PayPal requires separate activation in Stripe and specific country/currency configuration. If not configured, it will be silently ignored or shown as unavailable.

**8. 🟡 MEDIUM: No Amount Validation on Partial Refunds**

`POST /api/admin/refund` accepts `amount_cents` from the request body without validating it against the original `total_amount`. Stripe will reject over-refunds, but there is no server-side guard.

**9. ✅ CONFIRMED WORKING: Webhook Signature Validation Structure**

The webhook handler correctly uses `stripe.webhooks.constructEvent(body, signature, webhookSecret)`. Once the secret is configured, event authentication will work properly.

**10. ✅ CONFIRMED WORKING: Service Role for Webhook**

The webhook handler correctly uses a Supabase admin client with the service role key to update bookings, bypassing RLS. This is the correct pattern.

---

## G. Booking System Audit

### Time Slot Generation

| Day | Open Hours | First Slot | Implementation |
|---|---|---|---|
| Sunday | Closed | — | `dayOfWeek === 0` → empty array |
| Mon–Thu | 14:30–20:00 | 14:30 | `startHour=14, startMinute=30` |
| Friday | 14:30–20:00 | 14:30 | Same as weekday (weekend pricing applied separately) |
| Saturday | 10:00–20:00 | 10:00 | `dayOfWeek === 6` → `startHour=10, startMinute=0` |
| School holidays | 10:00–20:00 | 10:00 | `holidayType === 'school'` → `startHour=10` |
| Public holidays | Closed | — | `holidayType === 'public'` → empty array |

> **Issue:** The opening hours page displays **"14:00–20:00 Uhr"** for weekdays, but the first bookable slot is **14:30**. Customers arriving at 14:00 cannot book.

### Availability Logic

The `checkSlotAvailability()` function:
1. Fetches all non-`cancelled`/non-`deleted` bookings for the day
2. Iterates through 30-minute chunks of the requested duration
3. Counts overlapping `arenas_count` for each chunk
4. Returns `true` if `(maxOccupied + requiredArenas) <= TOTAL_ARENAS (2)`

The overlap detection uses correct interval arithmetic: `StartA < EndB AND StartB < EndA`.

> **Note:** `pending_payment` bookings ARE counted (correctly holds the slot during checkout). However, abandoned checkouts permanently block slots.

### Double-Booking Prevention

The current mechanism is **application-level only** (no database constraint). There is no `EXCLUSION` constraint or advisory lock preventing two concurrent requests from both inserting overlapping bookings. This is a classic TOCTOU vulnerability.

### Capacity Management

| Scenario | arenas_count | Result |
|---|---|---|
| Group ≤ 4 | 1 | Correct |
| Group 5–6 | 2 | Correct — needs both arenas |
| Two simultaneous single-arena bookings | 1 + 1 = 2 | Correct — both fit |
| One double + one single attempted | 2 + 1 = 3 > 2 | Correctly rejected |

### Timezone Handling

**Approach used:** "UTC-naive local time" — local datetime strings are constructed on the server (Vercel = UTC), producing timestamps labeled as UTC that actually represent Ingolstadt local time.

**Example:** Customer selects `14:30` on `2024-03-15`.  
Server constructs `new Date("2024-03-15T14:30:00")` → stored as `2024-03-15T14:30:00.000Z`  
Actual Ingolstadt UTC should be `13:30Z` (CET) or `12:30Z` (CEST).

**Impact:** Internally consistent but externally incorrect. Any integration that treats stored timestamps as real UTC (Google Calendar, analytics, external scheduling) will show times 1–2 hours off. Email formatting compensates by using `timeZone: 'UTC'` — correct given the approach.

**Risk:** A maintenance time bomb. DST transitions will cause display confusion in future integrations.

### Walk-In Form Issues

- `WalkInForm.tsx` generates time slots from 10:00–19:30 **regardless of day** — on Mon–Thu, times 10:00–14:00 appear as options but the venue isn't open. The server-side `checkSlotAvailability` will reject these, but the UX is confusing for employees.

### Reschedule Missing Availability Check

`PATCH /api/admin/bookings/[id]` with `action='reschedule'` does **not** call `checkSlotAvailability`. Staff can reschedule a booking into an already-booked slot, causing a double-booking.

---

## H. Database Structure Inference

### Final Inferred Schema (after all migrations)

**`bookings` table**

```sql
id                UUID        PRIMARY KEY DEFAULT gen_random_uuid()
created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
start_time        TIMESTAMPTZ NOT NULL      -- "UTC-naive local time"
end_time          TIMESTAMPTZ NOT NULL      -- "UTC-naive local time"
arena_id          TEXT        NOT NULL      -- 'arena-1' or 'arena-2' (legacy)
game_mode         TEXT        NOT NULL      -- 'shooter', 'escape', 'walk-in'
game_slug         TEXT        NOT NULL      -- game identifier
player_count      INTEGER     NOT NULL
customer_name     TEXT        NOT NULL
customer_email    TEXT        NOT NULL
status            TEXT        DEFAULT 'pending_payment'
                              -- Values: 'pending_payment' | 'confirmed' | 'cancelled' | 'deleted' | 'refunded'
payment_id        TEXT        -- Stripe Payment Intent ID
staff_notes       TEXT
payment_method    TEXT        DEFAULT 'online'  -- 'online' | 'cash' | 'card' | 'free'
walk_in           BOOLEAN     DEFAULT FALSE
-- Added in migration 20240002:
date              TEXT        -- YYYY-MM-DD (denormalized from start_time)
time              TEXT        -- HH:mm (denormalized from start_time)
game_name         TEXT        -- display name
duration_minutes  INTEGER     DEFAULT 60
arenas_count      INTEGER     DEFAULT 1
total_amount      INTEGER     DEFAULT 0       -- in cents (0 for walk-ins)
customer_phone    TEXT
stripe_session_id TEXT        -- for refunds
```

**`employees` table**

```sql
id                        UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
name                      TEXT        NOT NULL
role                      TEXT        NOT NULL CHECK (role IN ('manager', 'worker'))
is_active                 BOOLEAN     NOT NULL DEFAULT TRUE
created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
last_login                TIMESTAMPTZ
requires_password_change  BOOLEAN     DEFAULT FALSE
```

**`audit_log` table**

```sql
id            UUID        PRIMARY KEY DEFAULT gen_random_uuid()
employee_id   UUID        REFERENCES employees(id)
employee_name TEXT
action        TEXT        NOT NULL
booking_id    UUID        -- no FK constraint (intentional soft reference)
old_value     JSONB
new_value     JSONB
notes         TEXT
created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
```

**`holidays` table**

```sql
id          UUID   PRIMARY KEY DEFAULT gen_random_uuid()
name        TEXT   NOT NULL
type        TEXT   NOT NULL DEFAULT 'school' CHECK (type IN ('school', 'public'))
start_date  DATE   NOT NULL
end_date    DATE   NOT NULL
created_at  TIMESTAMPTZ DEFAULT NOW()
```

### Schema Issues and Risks

| Issue | Risk | Details |
|---|---|---|
| No UNIQUE/EXCLUSION constraint on booking overlaps | **Critical** | Enables database-level double-bookings |
| `booking_id` in `audit_log` has no FK constraint | Medium | Orphan references if bookings hard-deleted |
| Denormalized `date`/`time` alongside timestamps | Medium | Data can get out of sync; online bookings don't populate `date`/`time` columns |
| `payment_id` sometimes holds Session IDs (`cs_*`) not Payment Intent IDs (`pi_*`) | Medium | Confusing naming; refund logic works around it |
| No `customer_id` table — customers identified only by email | Medium | Email is a mutable key; no real customer history |
| `total_amount = 0` for walk-ins | Low | Makes revenue reporting impossible from the booking table |
| `arena_id` column is legacy but still `NOT NULL` | Low | Schema artifact |
| No indexes on frequently queried columns | Medium | `status`, `start_time`, `customer_email` queries slow at scale |

---

## I. Security Assessment

### Critical Security Issues

**1. Customer PII Publicly Exposed (GDPR Risk)**

The anon Supabase key is in the public JS bundle. The `bookings` RLS allows `SELECT USING (true)`. Anyone can:
```bash
curl "https://your-project.supabase.co/rest/v1/bookings?select=*" \
  -H "apikey: [extracted anon key]" \
  -H "Authorization: Bearer [extracted anon key]"
```
This returns all customer names, emails, phone numbers, booking details, and staff notes. **This is a GDPR violation in Germany/EU.**

**2. Public Write Access to Bookings**

Anyone with the anon key can create arbitrary booking records, enabling slot-blocking attacks and data pollution.

**3. DELETE Booking Missing Manager Authorization**

```typescript
// CURRENT (WRONG) — in app/api/admin/bookings/[id]/route.ts:
const { employee, user, supabase } = await getAdminSession()
if (!employee) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
// ❌ MISSING: if (!isManager(employee)) return NextResponse.json({ error: 'Manager only' }, { status: 403 })

// REQUIRED FIX:
if (!isManager(employee)) return NextResponse.json({ error: 'Manager only' }, { status: 403 })
```

The `BookingDetailPanel.tsx` also shows the delete button to all employees without checking `isManager`.

**4. No Rate Limiting on Any Endpoint**

All endpoints — including public booking creation, availability, and forgot-password — have no rate limiting. This enables brute-force login attacks, slot-spamming, and email enumeration.

**5. No CSRF Protection**

API routes do not implement CSRF tokens. While Same-Origin Policy mitigates browser-based CSRF for JSON APIs, custom request headers would provide stronger defense.

**6. No Security Headers in `next.config.ts`**

The `next.config.ts` file is essentially empty. Missing headers:
- `Content-Security-Policy`
- `X-Frame-Options`
- `X-Content-Type-Options`
- `Referrer-Policy`
- `Strict-Transport-Security`
- `Permissions-Policy`

**7. Service Role Key Instantiated in Multiple Files**

`createClient()` with the service role key is called inline in 4 different route files instead of being shared from a single server-only utility module. Increases risk of accidental exposure during code changes.

**8. Minimum Password Length: 6 Characters**

Employee password fields require only `minLength={6}`. For a system that manages Stripe refunds and customer PII, this is too weak.

**9. `/test-email` Page Publicly Accessible**

The route `/test-email` renders email template previews with hardcoded customer data. It was a development tool and should be removed or protected.

---

## J. Operational Risk Assessment

| Risk | Severity | Likelihood | Notes |
|---|---|---|---|
| Customer pays but booking not confirmed (webhook broken) | **Critical** | **Guaranteed** | Every online payment has this risk right now |
| Customer data leaked via public Supabase API | **Critical** | **Guaranteed** | Anon key is in the public bundle |
| **5 of 8 games show error page ("Erlebnis nicht gefunden")** | **High** | **Guaranteed** | Any customer clicking Space Marines, Wild West, Space Station, Alice, Horror House — see §D.1 |
| **5–6 player groups see misleading "available" slots** | **High** | **Guaranteed** | Any group ≥5 selecting a slot where only 1 arena is free sees a false green — see §D.2 |
| **Groups of 7–8 players cannot book online at all** | **Medium** | **Guaranteed** | Maximum capacity (8) is unreachable from public booking form — see §D.3 |
| **Past time slots shown as bookable on today's date** | **Medium** | **Guaranteed** | Every customer visiting after opening time on the same day — see §D.2 |
| Double-booking under concurrent load | **High** | Medium | Under popular weekend slots |
| Abandoned checkout permanently blocks slot | **High** | **High** | Every abandoned Stripe checkout |
| Non-manager employee deletes booking | **Medium** | Low | Requires malicious/careless employee |
| Contact form silently fails | **Medium** | **Guaranteed** | Every form submission goes nowhere |
| Opening hours discrepancy (14:00 shown, 14:30 is first slot) | Medium | **High** | Every weekday customer |
| "Demo Mode" text on payment button | Medium | **Guaranteed** | Shown on every booking |
| Broken placeholder images | Medium | **Guaranteed** | Every visitor to shooter/arcade/experience pages |
| Loyalty discount fraudulently claimed | Low | Low–Medium | Requires knowledge of a prior customer's email |
| Staff reschedule into occupied slot | **High** | Low | No availability check on reschedule |

---

## K. Completed Features List

| Feature | Status |
|---|---|
| Public landing page with hero, game categories, booking CTA | ✅ Complete |
| Individual experience pages (VR Shooter, Escape Room, Simulators, Arcade) | ✅ Complete |
| Individual game detail pages (`/experience/[slug]`) | ⚠️ **Partially broken** — 3 of 8 games work; 5 show "Erlebnis nicht gefunden" (see §D.1) |
| Legal pages (AGB, Datenschutz/DSGVO, Impressum, Epilepsie-Warnung) | ✅ Complete |
| Opening hours page | ✅ Complete |
| Pricing page with correct pricing table | ✅ Complete |
| Booking flow (3-step wizard) | ⚠️ **Partially broken** — slot display ignores player count; past slots shown; max capped at 6 (see §D.2, §D.3) |
| Live slot availability from database | ⚠️ **Partially broken** — available/booked distinction fails for 5+ player groups (see §D.2) |
| Weekend vs weekday pricing logic | ✅ Complete |
| Team packet pricing (groups of 4) | ✅ Complete |
| Multi-arena allocation for groups > 4 players | ✅ Complete |
| Stripe Checkout integration (redirects, handles cancellation) | ✅ Complete |
| Payment success page verification | ✅ Complete |
| Holiday management (Schulferien / Feiertage) | ✅ Complete |
| Admin login with Supabase auth | ✅ Complete |
| Admin dashboard with booking table (today + all upcoming) | ✅ Complete |
| Real-time dashboard updates via Supabase Realtime | ✅ Complete |
| Walk-in booking creation tool | ✅ Complete |
| Booking detail panel (reschedule, cancel, note, send reminder) | ✅ Complete |
| Stripe refund (full and partial) from admin | ✅ Complete |
| Audit log for all employee actions | ✅ Complete |
| Team management (create, enable/disable, reset password) for managers | ✅ Complete |
| Force password change on first login | ✅ Complete |
| Auto-logout after 1 hour inactivity | ✅ Complete |
| Booking confirmation email template (HTML, German) | ✅ Complete |
| Reschedule confirmation email (auto-sent when staff reschedules) | ✅ Complete |
| Manual reminder email from admin | ✅ Complete |
| Top Gamer loyalty discount (20% if returned within 30 days) | ✅ Complete |
| Dark mode forced (VR/cyberpunk aesthetic) | ✅ Complete |
| Responsive mobile design with hamburger menu | ✅ Complete |
| Framer Motion animations | ✅ Complete |

---

## L. Missing / Incomplete Features List

| Feature | Status | Notes |
|---|---|---|
| **Game detail pages (5 of 8)** | ❌ **Bug** | `space-marines`, `wild-west`, `space-station`, `alice-wonderland`, `horror-house` show "Erlebnis nicht gefunden" — see §D.1 |
| **Slot display for 5–6 player groups** | ❌ **Bug** | Shows false "available" slots that cannot be booked — see §D.2 |
| **Past slot filtering on today's date** | ❌ **Bug** | Expired slots appear bookable, fail on submit — see §D.2 |
| **Max players on public booking form** | ❌ **Bug** | Capped at 6; real capacity is 8 (4 per arena × 2 arenas) — see §D.3 |
| Stripe webhook configured | ❌ Broken | `STRIPE_WEBHOOK_SECRET` is a placeholder |
| Confirmation email after payment | ❌ Broken | Neither webhook path nor confirm path sends email |
| Contact form submit handler | ❌ Missing | Form renders but does nothing |
| Real images for game pages | ❌ Missing | All reference `/placeholder-*.jpg` files |
| "Demo Mode" text removed from payment button | ❌ Missing | Visible to all customers |
| Online booking for Simulators / Arcade | ❌ Not built | Walk-in or manual only |
| Customer email verification | ❌ Missing | Fraudulent discount possible |
| Customer-initiated cancellation | ❌ Missing | Must contact business |
| Admin calendar view | ❌ Missing | List view only |
| Revenue reporting in admin | ❌ Missing | Only booking count shown |
| Cleanup of abandoned pending_payment bookings | ❌ Missing | No scheduled job |
| Database constraint preventing double-bookings | ❌ Missing | Application-level only |
| Birthday party booking flow | ❌ Missing | Only phone reference in docs |
| Voucher/gift card system | ❌ Missing | Referenced in Pricing.md |
| FAQ section | ❌ Missing | Listed in task.md |
| Live Stripe keys | ❌ Not configured | Still on test mode |
| Security headers in `next.config.ts` | ❌ Missing | File is nearly empty |
| Middleware-level admin route protection | ❌ Missing | Client-side redirect only |
| Rate limiting on any endpoint | ❌ Missing | No Upstash or equivalent |
| Automated reminder emails | ❌ Missing | Manual button only |
| Timezone-correct timestamp storage | ❌ Missing | UTC-naive local time |
| Centralized game catalog | ❌ Missing | Hardcoded in multiple files |
| Walk-in form day-aware time filtering | ❌ Missing | Shows 10:00 even on weekdays |
| DELETE booking manager-only enforcement | ❌ Bug | Missing `isManager` check in API |
| `/test-email` page removed | ❌ Missing | Still publicly accessible |

---

## M. Technical Debt & Code Quality

| Category | Finding | Severity |
|---|---|---|
| Debug code in production | 8 `console.log` statements in `dashboard/page.tsx` output auth state to browser console | Medium |
| Native browser alerts | 4 `alert()` calls in booking page | Medium |
| Hardcoded game data | Game list defined in 3+ separate places | Medium |
| Denormalized schema | `date`/`time`/`game_name`/`duration_minutes` duplicated from timestamps | Medium |
| Dead code | Comment: `// Step 4 handling is redundant` with unused code path | Low |
| Test artefacts in root | `test_emails.ts`, `test_payload.js`, `schema-check.js` in project root | Low |
| Inline components | `AuditLog` and `ChangePasswordModal` at bottom of `dashboard/page.tsx` | Low |
| Inconsistent error handling | Some routes return raw Supabase errors | Low |
| No reschedule availability check | Staff can reschedule to an occupied slot | **High** |
| `getNextSlot()` uses browser local time | Fragile if used from non-German timezone | Low |
| Resend fallback key | `\|\| 're_dummy_key_for_build'` silently fails if env var missing | Low |
| Multiple service role client instantiations | `createClient` with service role key repeated in 4 files | Low |
| Confirm endpoint sends no email | Backup confirmation path is silent | **High** |
| Monolithic booking wizard | 446-line single file managing all 3 steps with inline state | Medium |
| PayPal in payment methods without verification | May cause Stripe configuration errors | Medium |

---

## N. Recommended Next Priorities

### 🔴 Critical — Before Going Live

1. **Fix "Erlebnis nicht gefunden" — add 5 missing game definitions** (see §D.1)
   Add the missing 5 entries to `gamesData` in `app/experience/[slug]/page.tsx`:
   `space-marines`, `wild-west`, `space-station`, `alice-wonderland`, `horror-house`.
   This is a single-file change that instantly unbreaks 5 of 8 game pages.

2. **Fix slot availability display for groups of 5+ players** (see §D.2 Bug A)
   Replace the static `isAvailable = status.arena1 || status.arena2` with:
   ```javascript
   const needsBothArenas = parseInt(playerCount) > 4;
   const isAvailable = needsBothArenas
     ? (status.arena1 && status.arena2)
     : (status.arena1 || status.arena2);
   ```

3. **Fix past slot visibility on today's date** (see §D.2 Bug B)
   Add a time comparison check in the slot rendering to grey out and disable any slot whose time has already passed today.

4. **Fix max players — extend public booking form from 6 to 8** (see §D.3)
   Add `SelectItem` values for 7 and 8 in `buchen/page.tsx`. Add `MAX_PLAYERS = 8` to `lib/constants.ts`.

5. **Configure the Stripe Webhook**
   - Register `/api/webhooks/stripe` in the Stripe Dashboard
   - Add the real signing secret to Vercel: `STRIPE_WEBHOOK_SECRET=whsec_...`
   - Test with `stripe trigger checkout.session.completed`

6. **Fix the DELETE booking manager-only bug**
   ```typescript
   // In app/api/admin/bookings/[id]/route.ts — DELETE handler:
   if (!isManager(employee)) {
     return NextResponse.json({ error: 'Manager only' }, { status: 403 })
   }
   ```
   Also hide the delete button in `BookingDetailPanel.tsx` when `!isManager`.

7. **Restrict Supabase RLS on bookings table**
   Replace `SELECT USING (true)` with a policy that exposes only non-PII columns (start_time, end_time, arenas_count, status) publicly, and requires employee authentication for full access.

8. **Add email to the confirm endpoint**
   Call `sendBookingConfirmation()` in `GET /api/bookings/confirm` so customers get an email via the fallback path.

9. **Remove "Demo Mode" text**
   Delete the line containing `"Zahlung derzeit nur vor Ort (Demo Mode) oder via Stripe (wenn konfiguriert)."` from `app/buchen/page.tsx`.

10. **Switch to Live Stripe Keys**
    Swap test keys for live keys in Vercel environment variables.

### 🟠 High — Within First Week

11. Fix the contact form — add a submit handler using Resend or forward to business email
12. Replace placeholder images with real photography assets
13. Add reschedule availability check to `PATCH /api/admin/bookings/[id]`
14. Add `pending_payment` booking expiry (Vercel Cron or Supabase pg_cron, run every 30 min)
15. Fix the opening hours display to show 14:30 (or change slots to start at 14:00)
16. Remove or secure the `/test-email` page

### 🟡 Medium — First Month

17. Remove `console.log` statements from admin dashboard
18. Replace `alert()` calls with Radix Toast notifications
19. Add `middleware.ts` to protect all `/admin/*` routes at the request level
20. Centralize game data into a single config file or database table
21. Add rate limiting (e.g., Upstash Ratelimit on Vercel)
22. Fix WalkInForm to filter time slots by day of week
23. Add security headers to `next.config.ts`
24. Consider proper UTC timezone storage

---

## O. Roadmap Toward Production Readiness

### Phase 1: Go-Live Blockers (1–3 days)

- [ ] **Fix "Erlebnis nicht gefunden" — add 5 missing game entries** (§D.1) — single file change
- [ ] **Fix slot availability display for 5+ player groups** (§D.2 Bug A) — one-line logic change
- [ ] **Hide past time slots on today's date** (§D.2 Bug B) — add time comparison filter
- [ ] **Extend max players to 8 on public booking form** (§D.3) — add two SelectItems + constant
- [ ] Configure Stripe webhook secret + register endpoint in Stripe Dashboard
- [ ] Fix DELETE booking manager check (4-line code change)
- [ ] Remove "Demo Mode" text from payment button
- [ ] Add `sendBookingConfirmation()` to `/api/bookings/confirm`
- [ ] Switch to live Stripe keys in Vercel

### Phase 2: Safety Hardening (3–7 days)

- [ ] Fix RLS — restrict public read on bookings to non-PII columns only
- [ ] Restrict or remove public INSERT on bookings (move to server function)
- [ ] Fix contact form — add Resend-based form submission
- [ ] Add reschedule availability check in admin API
- [ ] Implement pending_payment expiry job

### Phase 3: Polish & Cleanup (1–2 weeks)

- [ ] Replace all placeholder images with real photography
- [ ] Remove `/test-email` page
- [ ] Remove test files from project root (`test_emails.ts`, `test_payload.js`, `schema-check.js`)
- [ ] Remove `console.log` statements from admin dashboard
- [ ] Replace browser `alert()` with toast notifications
- [ ] Add security headers to `next.config.ts`
- [ ] Add `middleware.ts` for admin route protection
- [ ] Fix opening hours discrepancy (14:00 vs 14:30)

### Phase 4: Reliability & Growth (1–2 months)

- [ ] Add rate limiting on all public API endpoints
- [ ] Add customer-initiated booking cancellation flow
- [ ] Add automated reminder emails (scheduled via cron)
- [ ] Add basic revenue dashboard in admin
- [ ] Implement proper UTC timezone storage
- [ ] Add database-level double-booking constraint (EXCLUSION constraint or advisory locks)
- [ ] Centralize game catalog in database
- [ ] Enable online booking for Simulators and Arcade
- [ ] Consider Google Calendar export for bookings

---

## Top 10 Highest-Risk Issues

> ℹ️ Updated to include three confirmed customer-reported bugs (§D.1, §D.2, §D.3).

| # | Issue | Risk Type | Consequence |
|---|---|---|---|
| 1 | **Stripe webhook secret is a placeholder** | Operational | No confirmation emails ever sent; booking lifecycle unreliable |
| 2 | **Customer PII publicly readable via Supabase anon key** | Security / GDPR | Full customer name/email/phone exposed to any internet user |
| 3 | **5 of 8 game detail pages show "Erlebnis nicht gefunden"** | Customer Experience | Majority of game pages return an error — confirmed by real customers (see §D.1) |
| 4 | **Slot display ignores player count for 5+ player groups** | Booking Integrity / UX | Groups ≥5 see false "available" slots, get silently rejected on checkout (see §D.2) |
| 5 | **Public INSERT on bookings table** | Security / Operational | Slot-blocking attacks; data pollution; fake bookings |
| 6 | **Race condition in booking creation (TOCTOU)** | Data Integrity | Double-bookings under concurrent load |
| 7 | **DELETE booking endpoint not manager-only (API bug)** | Business Logic / Auth | Any employee can permanently delete bookings |
| 8 | **Contact form has no handler — all messages lost** | Business / Revenue | Customer inquiries, group bookings, party requests silently discarded |
| 9 | **Max players capped at 6 on public form — real capacity is 8** | Revenue / UX | Groups of 7–8 cannot book online; lost revenue for the largest group bookings (see §D.3) |
| 10 | **Pending payment bookings never expire** | Operational | Abandoned checkouts permanently block slots; revenue loss |

---

## Top 10 Highest-Impact Improvements

| # | Improvement | Impact |
|---|---|---|
| 1 | **Configure Stripe webhook** | Enables email delivery; completes the payment lifecycle |
| 2 | **Restrict Supabase RLS on bookings** | Eliminates GDPR liability; protects all customer data |
| 3 | **Fix contact form** | Enables customer communication; captures group/event inquiries |
| 4 | **Add email to confirm endpoint** | Ensures customers always receive confirmation |
| 5 | **Fix pending_payment expiry** | Prevents slot inventory leakage; improves revenue |
| 6 | **Add reschedule availability check** | Prevents admin-created double-bookings |
| 7 | **Replace browser alerts with toast UI** | Dramatically improves customer-facing UX |
| 8 | **Add pending_payment cleanup job** | Automatically reclaims blocked slots |
| 9 | **Centralize game catalog** | Single update point for adding/removing games |
| 10 | **Add middleware route protection** | True security boundary for all admin routes |

---

## Overall Assessment

### Is this project close to production readiness, or still fundamentally MVP-stage?

> **This project is at "Advanced MVP" — approximately 70–75% of the way to production readiness.**

It is past early MVP. The core booking engine, payment flow, admin dashboard, and email infrastructure are all present and functionally designed. The business logic (pricing, arenas, holidays, hours, loyalty discount) is correctly implemented and German-market appropriate. The UI is polished and brand-appropriate. The data model, while imperfect, supports real operations.

However, it is **not yet safe to operate with real customers at scale** because:

- The **email delivery system is broken** — customers won't receive booking confirmations
- **Customer PII is exposed** to the public internet via permissive database access — a GDPR liability for a German business
- **A known access control bug** means non-manager employees can delete bookings
- **The contact form doesn't work** — the business cannot receive customer inquiries
- **The UI has developer artefacts** (Demo Mode text, placeholder images) visible to paying customers

**With focused effort — estimated 3–5 focused days of work — this platform can reach true production readiness.** The critical items are well-defined and individually small. The architecture is sound; the gaps are closing, not structural.

> ⚠️ **Do not switch to live Stripe keys until the webhook secret is configured and the PII exposure is addressed.** Running live payments without confirmation emails would create immediate customer service failures at scale.

---

*This report was generated through a complete read-only static analysis of the Spielnova codebase. No files were modified, created, or deleted during this analysis. All findings are based on direct inspection of source code, migration files, configuration, and documentation present in the repository as of 2026-05-09.*
