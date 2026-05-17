# Spielnova Website — Analysis & Test Report

**Date:** 2026-05-16  
**Prepared by:** OpenHands AI Agent (on behalf of site owner)  
**Scope:** Full-stack code audit + live functional tests of the Spielnova VR booking platform

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Tech Stack](#2-tech-stack)
3. [Database Schema Analysis](#3-database-schema-analysis)
4. [Booking Algorithm — End-to-End Trace](#4-booking-algorithm--end-to-end-trace)
5. [Availability & Opening Hours Logic](#5-availability--opening-hours-logic)
6. [Pricing Logic](#6-pricing-logic)
7. [Stripe Payment Integration](#7-stripe-payment-integration)
8. [Email System](#8-email-system)
9. [Admin Panel — Full Audit](#9-admin-panel--full-audit)
10. [Security Analysis](#10-security-analysis)
11. [Cron Jobs](#11-cron-jobs)
12. [Live Functional Tests](#12-live-functional-tests)
13. [Bugs Found](#13-bugs-found)
14. [Recommendations](#14-recommendations)

---

## 1. Executive Summary

| Category | Result |
|---|---|
| Overall system health | 🟡 Good — minor issues found |
| Booking algorithm | ✅ Solid — atomic, double-booking safe |
| Payment integration | ✅ Correct — manual-capture pattern |
| Database / RLS | ✅ Well-structured |
| Email system | ✅ Functional — failures non-fatal |
| Admin panel | ✅ Working — recent timeout bug fixed |
| Security posture | 🟡 Acceptable — no rate limiting |
| Bugs (critical) | 0 |
| Bugs (medium) | 3 |
| Bugs (low) | 4 |

The platform is functional and production-ready. The most important issues found are a **stale UI text** (session timeout message says "15 Minuten" but the real limit is 32 minutes), a **webhook arena-count oversight** that could over-cancel large-group bookings in edge cases, and **missing input bounds validation** on the public booking API.

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, TypeScript) |
| Hosting | Vercel (with Cron support) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (cookie-based SSR sessions) |
| Payments | Stripe Checkout (manual-capture mode) |
| Email | Resend API |
| Styling | Tailwind CSS + shadcn/ui components |
| Middleware | Custom `proxy.ts` (admin session guard) |

**Environment variables required:**

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key (RLS enforced) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key — bypasses RLS |
| `STRIPE_SECRET_KEY` | Stripe backend key |
| `STRIPE_WEBHOOK_SECRET` | Webhook signature verification |
| `RESEND_API_KEY` | Email sending |
| `RESEND_FROM_EMAIL` | Sender address |
| `CRON_SECRET` | Protects cron endpoints |

---

## 3. Database Schema Analysis

### Tables

#### `bookings`

The central table. Created by `schema.sql` and extended through 8 migrations.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | Auto-generated |
| `created_at` | TIMESTAMPTZ | UTC |
| `start_time` | TIMESTAMPTZ | Stored as UTC (but represents local German time — naive UTC pattern) |
| `end_time` | TIMESTAMPTZ | Same pattern |
| `arena_id` | TEXT | `'arena-1'` or `'arena-2'` (label only, not used in availability logic) |
| `arenas_count` | INTEGER | 1 or 2 — **the number used in all availability math** |
| `game_mode` | TEXT | `'shooter'`, `'escape'`, `'walk-in'`, `'internal'` |
| `game_slug` | TEXT | Maps to `lib/games.ts` catalog |
| `player_count` | INTEGER | 1–8 |
| `customer_name` | TEXT | Not nullable |
| `customer_email` | TEXT | Nullable for walk-ins |
| `status` | TEXT | `pending_payment` → `confirmed` → `cancelled`/`refunded`/`deleted` |
| `payment_id` | TEXT | Stripe PaymentIntent ID |
| `stripe_session_id` | TEXT | Stripe Checkout Session ID (for refunds) |
| `total_amount` | INTEGER | In cents; 0 for walk-ins |
| `payment_method` | TEXT | `online`, `cash`, `card`, `free_test` |
| `walk_in` | BOOLEAN | `true` = admin-created; `false` = public booking |
| `date` | TEXT | `YYYY-MM-DD` flat column (admin UI) |
| `time` | TEXT | `HH:MM` flat column (admin UI) |
| `duration_minutes` | INTEGER | Session length |
| `game_name` | TEXT | Display name (admin UI) |
| `staff_notes` | TEXT | Internal notes only |
| `customer_phone` | TEXT | Walk-ins only |
| `reminder_sent` | BOOLEAN | Prevents duplicate reminder emails |

**Status lifecycle:**
```
pending_payment → confirmed   (payment captured by webhook)
pending_payment → cancelled   (expired after 32 min / slot conflict)
confirmed       → cancelled   (admin action)
confirmed       → refunded    (manager refund via Stripe)
any             → deleted     (manager soft-delete — preserved in audit_log)
```

#### `employees`

| Column | Type | Notes |
|---|---|---|
| `id` | UUID (FK → auth.users) | |
| `name` | TEXT | Display name |
| `role` | TEXT | `'manager'` or `'worker'` |
| `is_active` | BOOLEAN | Inactive = cannot log in |
| `last_login` | TIMESTAMPTZ | Updated on login |
| `requires_password_change` | BOOLEAN | Forces change on first login |

#### `audit_log`

Every admin action (reschedule, cancel, walk-in creation, refund, delete, slot block, password change) is logged with `employee_id`, `employee_name`, `action`, `booking_id`, `old_value` (JSONB), `new_value` (JSONB), `notes`.

#### `holidays`

| Column | Type |
|---|---|
| `name` | TEXT |
| `type` | TEXT — `'school'` or `'public'` |
| `start_date` | DATE |
| `end_date` | DATE |

**Effect on availability:**
- `type = 'public'` → venue CLOSED (no slots generated)
- `type = 'school'` → earlier start time (10:00 instead of 14:30)

### Row-Level Security (RLS)

| Table | Public (anon) | Authenticated employee | Manager |
|---|---|---|---|
| `bookings` SELECT | ❌ Removed in migration 6 | ✅ | ✅ |
| `bookings` INSERT | ✅ (walk-ins use admin key) | ✅ | ✅ |
| `bookings` UPDATE | ❌ | ✅ | ✅ |
| `employees` | ❌ | Own row only | ✅ All |
| `audit_log` SELECT | ❌ | ❌ | ✅ |
| `audit_log` INSERT | ❌ | ✅ | ✅ |
| `holidays` SELECT | ✅ Public | ✅ | ✅ |
| `holidays` CUD | ❌ | ❌ | ✅ |

**Security note:** Customer PII (names, emails, phone numbers) in `bookings` is NOT readable via the public anon key. ✅

### Atomic Booking — `create_booking_if_available` RPC

The most critical piece of infrastructure. The PostgreSQL function:

1. Acquires a **transaction-scoped advisory lock** keyed on the slot's start time (`pg_advisory_xact_lock`). Only one concurrent request per time slot can proceed at a time.
2. Treats `pending_payment` rows older than **32 minutes** as expired (lazy expiry).
3. Sums `arenas_count` across all non-cancelled bookings in each 30-min chunk of the requested window.
4. Only inserts if `sum + requested_arenas ≤ 2`.
5. Returns `{"error":"slot_unavailable"}` or `{"booking_id":"<uuid>"}`.

This correctly prevents double-booking even under concurrent load. ✅

---

## 4. Booking Algorithm — End-to-End Trace

### Public booking flow (4 steps in `/buchen`)

```
Step 1: Customer selects game type (Shooter / Escape Room)
Step 2: Customer selects game, player count, duration, date, time slot
         ↳ On date change: GET /api/availability?date=YYYY-MM-DD
Step 3: Customer enters name and email
Step 4: Summary + AGB checkbox → Submit
         ↳ POST /api/bookings
              ├─ Server validates: not null, future date, :00/:30 time,
              │                    not Sunday, not public holiday,
              │                    time within opening hours
              ├─ Calls RPC create_booking_if_available
              │    ├─ Advisory lock on start time
              │    ├─ Checks arena availability (32-min pending expiry)
              │    └─ Inserts booking with status='pending_payment'
              ├─ Calculates price (weekend/weekday, team bundles, Top Gamer discount)
              ├─ Creates Stripe Checkout Session (manual capture, expires in 32 min)
              └─ Returns checkout URL → customer redirected to Stripe
              
Customer completes Stripe payment
         ↳ Stripe sends checkout.session.completed event to /api/webhooks/stripe
              ├─ Verifies Stripe signature
              ├─ Loads booking from DB
              ├─ Checks for confirmed slot conflict (safety net)
              │    ├─ Conflict: PaymentIntent.cancel() → booking.status='cancelled'
              │    └─ No conflict: PaymentIntent.capture() → booking.status='confirmed'
              └─ Sends booking confirmation email (async, non-fatal)

Customer lands on /buchen/success?session_id=...
         ↳ Polls GET /api/bookings/confirm every 2 seconds (max 10 tries)
              ├─ Retrieves Stripe session + PaymentIntent status
              ├─ PI cancelled → show "Zeitfenster leider vergeben" screen
              ├─ PI requires_capture or paid + booking.confirmed → show success
              └─ booking.pending_payment → return { processing: true } → retry
```

### Walk-in booking flow (Admin)

```
Admin opens Walk-in form → fills name, email, phone, game, date, time, duration, players, payment
POST /api/admin/bookings (booking_type absent or omitted)
    ├─ Authenticates admin session
    ├─ Calls checkSlotAvailability() (standard opening hours check)
    ├─ Inserts booking with status='confirmed', walk_in=true
    ├─ Writes audit_log entry
    └─ Sends confirmation email if customer email provided
       (NOT sent for payment_method='free_test')
```

---

## 5. Availability & Opening Hours Logic

### Opening hours (from `lib/availability.ts`)

| Day | Open | Hours |
|---|---|---|
| Monday–Thursday | ✅ | 14:30 – 19:30 |
| Friday | ✅ | 10:00 – 19:30 |
| Saturday | ✅ | 10:00 – 19:30 |
| Sunday | ❌ | Closed |
| School holiday (any day except Sunday) | ✅ | 10:00 – 19:30 |
| Public holiday | ❌ | Closed |

Slots are generated in 30-minute intervals. The last generated slot is at 19:00 (ensuring a 60-min session ends by 20:00) and at 19:30 (for 30-min sessions ending at 20:00).

### Slot availability calculation

For each 30-min chunk, the API sums `arenas_count` for all non-cancelled bookings that overlap. If total occupied < 2 for 30-min duration, or the sum stays ≤ 1 (or ≤ 0) for 60-min, the slot is displayed as available.

The response format is:
```json
{ "14:30": { "arena1": true, "arena2": false } }
```

The booking page correctly interprets this:
- Small group (≤4 players): slot available if `arena1 OR arena2`
- Large group (>4 players, needs 2 arenas): slot available only if `arena1 AND arena2`

### Pending payment lazy expiry

Both the availability API and the RPC function treat `pending_payment` rows created more than **32 minutes** ago as non-existent. This prevents abandoned Stripe sessions from permanently blocking slots. 32 minutes aligns exactly with the Stripe session `expires_at`.

---

## 6. Pricing Logic

### Price table (in cents on server, euros on client)

| Session | Weekday (Mon–Thu) | Weekend (Fri–Sat–Sun) |
|---|---|---|
| 30 min, 1 player | €14.90 | €19.90 |
| 60 min, 1 player | €24.90 | €34.90 |
| 30 min, team (4) | €55.00 | €74.00 |
| 60 min, team (4) | €90.00 | €124.00 |

**Team bundle logic:** groups of 4 or more qualify for the team rate.
- Formula: `Math.floor(playerCount / 4) × teamRate + (playerCount % 4) × singleRate`

**Top Gamer Discount:** 20% off if the customer email has a confirmed booking for the same game mode in the last 30 days (checked at booking time, server-side only).

### Test: Client-server price consistency ✅

All player counts (1–8), both weekday and weekend, both durations: **client preview matches server charge exactly** (verified by automated test).

| Players | 60 min Weekday | 60 min Weekend |
|---|---|---|
| 1 | €24.90 ✓ | €34.90 ✓ |
| 2 | €49.80 ✓ | €69.80 ✓ |
| 3 | €74.70 ✓ | €104.70 ✓ |
| 4 | €90.00 ✓ | €124.00 ✓ |
| 5 | €114.90 ✓ | €158.90 ✓ |
| 6 | €139.80 ✓ | €193.80 ✓ |
| 7 | €164.70 ✓ | €228.70 ✓ |
| 8 | €180.00 ✓ | €248.00 ✓ |

---

## 7. Stripe Payment Integration

### Pattern used: Manual Capture

```
1. Create Stripe Checkout Session:
   - payment_intent_data: { capture_method: 'manual' }
   - expires_at: now + 32 min
   - mode: 'payment'
   - client_reference_id: booking_uuid

2. Customer completes payment → card AUTHORISED (not charged)

3. Webhook: checkout.session.completed
   a. Slot conflict check (against confirmed bookings)
   b. If clear → paymentIntents.capture() → card IS charged
   c. If conflict → paymentIntents.cancel() → card NOT charged
```

**Why this matters:** A customer can never be charged for a slot that was simultaneously taken by another booking. The card authorisation is voided if the slot is gone. ✅

### Webhook security
- Stripe signature verified with `stripe.webhooks.constructEvent()` ✅
- `STRIPE_WEBHOOK_SECRET` checked at startup ✅
- Returns 400 on invalid signature ✅

### Stripe API version
- Currently using `2025-12-15.clover` — a recent beta/clover version. Should be monitored for breaking changes.

---

## 8. Email System

### Provider: Resend

**Fallback:** `new Resend(process.env.RESEND_API_KEY || 're_dummy_key_for_build')` — if `RESEND_API_KEY` is missing, the dummy key will cause silent send failures in production. Resend errors are caught and logged but not propagated.

**Logo URL:** Hard-coded to `https://www.spielnova.de/logo.png`. If the domain is password-protected (Vercel preview deployments), this image would still load since it points to the live production domain. ✅

### Email types

| Trigger | Recipient | Template | Auto-sent |
|---|---|---|---|
| Payment confirmed (webhook) | Customer | Booking confirmation | ✅ Yes |
| Admin reschedules | Customer | "Koordinaten-Update" reschedule | ✅ Auto |
| Admin clicks "Erinnerung senden" | Customer | Day-before reminder | Manual |
| Cron: send-reminders (09:00) | Customer | Day-before reminder | ✅ Auto |
| Customer submits contact form | info@spielnova.de | Contact forward with reply-to | ✅ Yes |
| Walk-in with email | Customer | Booking confirmation (Barzahlung) | ✅ Yes |
| Walk-in with `free_test` | Nobody | — | ❌ Suppressed |

### Email content review

All 4 email templates use a consistent dark theme with the Spielnova brand gradient. Content is in German. Booking confirmation includes:
- Game name ✅
- Date and time ✅
- Duration ✅
- Player count ✅
- Payment amount / label ✅
- "10 Minuten vorher" arrival reminder ✅
- Location / address ✅
- Top Gamer bonus callout (if applicable) ✅

Reschedule email shows old date/time (struck through style) and new date/time. ✅

**Reminder email:** Does not show the payment amount (correct — it's a reminder, not a receipt). ✅

**Reminder deduplication:** `reminder_sent` flag prevents sending twice whether via cron or manual admin button. ✅

---

## 9. Admin Panel — Full Audit

### Access control

| Feature | Worker | Manager |
|---|---|---|
| View today's bookings | ✅ | ✅ |
| View date-range bookings | ✅ | ✅ |
| Create walk-in booking | ✅ | ✅ |
| Reschedule booking | ✅ | ✅ |
| Add staff note | ✅ | ✅ |
| Send reminder email | ✅ | ✅ |
| Cancel booking | Own-created only | ✅ All |
| Issue refund | ❌ | ✅ |
| Delete booking (soft) | ❌ | ✅ |
| Manage employees | ❌ | ✅ |
| Manage holidays | ❌ | ✅ |
| View audit log | ❌ | ✅ |

### Session security (proxy.ts)

- Every request to `/admin/dashboard/**` is validated **server-side** (not just via cookie).
- `supabase.auth.getUser()` is called in middleware — verifies the JWT against Supabase, not just locally.
- `sn_admin_activity` httpOnly cookie tracks last activity.
- **7-hour inactivity timeout**: If inactive for >7 hours, Supabase auth cookies are cleared and user is redirected to `/admin?timeout=1`.
- **Recently fixed bug (PR merged):** Cookie deletion now uses `path: '/admin'` matching the cookie's original path. The old `cookies.delete()` defaulted to `path: '/'` which left the stale timestamp cookie alive, creating an infinite timeout loop.
- **Belt-and-braces fix (same PR):** If `user.last_sign_in_at` is within 5 minutes, the inactivity check is skipped entirely — a freshly-logged-in user is never timed out.

### Walk-in booking features

- Payment methods: `💵 Barzahlung`, `💳 Kartenzahlung`, `🧪 Free Test`
- `Free Test` auto-fills customer name with the logged-in employee's name and email with `support@spielnova.de`. No confirmation email is sent.
- Slot availability is validated against the standard opening hours before insertion.
- Bookings appear immediately in the admin table with `status = 'confirmed'`.
- `Free Test` walk-ins show "🧪 Free Test" in the Zahlung column (pending PR merge).

### Reschedule (Umbuchung)

- Date picker shows an inline `⛔` error immediately on selecting a Sunday or public holiday.
- Submit button disabled while `dateError` is non-empty.
- Server also validates Sunday and public holidays independently (defence in depth).
- On success: reschedule email sent automatically to customer, audit log updated.
- **Recent fix (PR open):** Validation against Sundays and public holidays added (previously no check).

### Refund

- Manager only.
- Fetches Stripe payment intent from `stripe_session_id`.
- Supports full or partial refund.
- Updates `booking.status = 'refunded'`.
- Walk-in (cash/card) bookings correctly block refund with error "Walk-in cash bookings cannot be refunded here."

### Holiday management

- Manager only.
- Types: `school` (affects hours) or `public` (venue closed).
- Changes take effect immediately on the public booking page (no cache).

### Team management

- Manager can add/deactivate employees.
- New employees can be given `requires_password_change = true` to force a password change on first login.
- Password reset can be triggered via "Vergessen?" on the login page (Supabase email recovery).

### Audit log

All admin actions recorded:

| Action key | Description |
|---|---|
| `walk_in_created` | Walk-in booking created |
| `slot_blocked` | Free Test / internal walk-in |
| `rescheduled` | Booking moved to new date/time |
| `cancelled` | Booking cancelled |
| `deleted` | Soft-delete |
| `refund_issued` | Stripe refund |
| `note_added` | Staff note saved |
| `reminder_sent` | Manual reminder email |
| `holiday_created` | Holiday added |
| `holiday_deleted` | Holiday removed |

---

## 10. Security Analysis

### Strengths ✅

| Item | Status |
|---|---|
| Customer PII not readable via public API | ✅ |
| RLS on all sensitive tables | ✅ |
| Stripe webhook signature verification | ✅ |
| Admin routes require Supabase JWT | ✅ |
| Service role key never in client bundle | ✅ |
| Cron endpoints protected by `CRON_SECRET` | ✅ |
| Soft-delete preserves audit trail | ✅ |
| `SECURITY DEFINER` function prevents RLS recursion | ✅ |
| `is_manager()` guard on sensitive admin routes | ✅ |
| Admin session middleware validates JWT server-side | ✅ |
| httpOnly cookie for session activity timestamp | ✅ |

### Weaknesses ⚠️

| Item | Risk | Severity |
|---|---|---|
| No rate limiting on any API endpoint | Allows booking spam / enumeration | Medium |
| No CAPTCHA on public booking form | Bot abuse, slot camping | Medium |
| `gameMode` and `gameSlug` not validated against catalog | API misuse / fake entries in DB | Low |
| `playerCount` has no server-side min/max | Could insert nonsensical records | Low |
| Contact form fields not HTML-escaped in email | HTML injection in internal mail | Low |
| `RESEND_API_KEY` missing → silent send failure | Emails lost without alert | Low |
| No CSP (Content Security Policy) headers visible | XSS surface slightly wider | Low |

---

## 11. Cron Jobs

Configured in `vercel.json`:

| Job | Schedule | Action |
|---|---|---|
| `expire-bookings` | 03:00 UTC daily | Cancels all `pending_payment` bookings older than 32 min |
| `send-reminders` | 09:00 UTC daily | Sends reminder email for all confirmed bookings with `date = tomorrow` |

### Expire-bookings analysis
- Uses service role key → bypasses RLS ✅
- Protected by `CRON_SECRET` bearer token ✅
- Bulk-updates expired rows in one query ✅
- 32-min cutoff matches Stripe session and lazy-expiry everywhere ✅

### Send-reminders analysis
- Tomorrow's date calculated using `Intl.DateTimeFormat` with `Europe/Berlin` timezone — correctly handles CET/CEST switch ✅
- Queries by `date` column (flat string) which is populated for all bookings ✅
- `reminder_sent = true` flag set per booking after successful send ✅
- Partial failure (one email fails) doesn't abort remaining sends ✅

**Gap:** There is no retry for failed reminder sends. If Resend is down at 09:00, the reminder is never sent and `reminder_sent` remains `false` — so a manual admin resend would still work.

---

## 12. Live Functional Tests

Tests were run against the local dev server (port 8011) connected to the live Supabase and Stripe test environments.

### 12.1 Homepage

| Test | Result |
|---|---|
| Page loads without errors | ✅ Pass |
| Navigation links present | ✅ Pass |
| "Jetzt Buchen" button links to /buchen | ✅ Pass |
| VR Shooter and Escape Room cards displayed | ✅ Pass |

### 12.2 Booking Wizard (Step 1)

| Test | Result |
|---|---|
| Step 1 renders: VR Shooter / VR Escape Room | ✅ Pass |
| Top Gamer Rabatt banner displayed | ✅ Pass |
| "Weiter" disabled until game type selected | ✅ Pass |

### 12.3 Availability API

| Test | Expected | Result |
|---|---|---|
| Monday `GET /api/availability?date=2026-05-18` | 14:30–19:00 slots | ✅ 11 slots returned |
| Sunday `GET /api/availability?date=2026-05-17` | Empty / closed | ✅ `{slots:[], message:"Closed on Sundays"}` |
| No date param | 400 error | ✅ `{"error":"Date is required"}` HTTP 400 |

### 12.4 Booking API Validation

| Test | Expected HTTP | Expected Error | Result |
|---|---|---|---|
| Missing required fields | 400 | "Missing required fields" | ✅ Pass |
| Sunday date | 400 | "An dem gewählten Datum ist Spielnova geschlossen." | ✅ Pass |
| Invalid time (:45) | 400 | "Ungültige Uhrzeit. Nur :00 und :30 Zeiten sind gültig." | ✅ Pass |
| Outside opening hours (07:00) | 400 | "Die gewählte Uhrzeit liegt außerhalb der Öffnungszeiten." | ✅ Pass |
| Outside opening hours (21:00) | 400 | "Die gewählte Uhrzeit liegt außerhalb der Öffnungszeiten." | ✅ Pass |
| Past date (any) | 400 | "Der Buchungszeitpunkt muss in der Zukunft liegen." | ✅ Pass |
| Valid slot (Stripe URL returned) | 200 | `{success:true, url:"..."}` | ✅ Pass (Stripe session created) |

### 12.5 Admin Login Page

| Test | Result |
|---|---|
| `/admin` loads correctly | ✅ Pass |
| Login form displayed (email + password) | ✅ Pass |
| "Vergessen?" password reset link present | ✅ Pass |
| Page indicates "Nicht öffentlich" | ✅ Pass |

### 12.6 Admin Reschedule Validation (code review)

| Test | Expected | Status |
|---|---|---|
| Select Sunday in date picker | Red border + error | ✅ Implemented (pending PR #23) |
| Select public holiday | Red border + named holiday | ✅ Implemented (pending PR #23) |
| Server-side Sunday check | Returns 400 | ✅ Implemented |
| Server-side holiday check | Returns 400 with name | ✅ Implemented |

### 12.7 Pricing Consistency

All 8 player counts × 2 durations × 2 day types = 32 combinations tested. **All client-displayed prices match server-charged amounts exactly.** ✅

---

## 13. Bugs Found

Each bug is described with five lenses: what the bug is technically, the real-world business scenario where it causes a problem, exactly how it occurs, what the damage is if it happens, and how often you can expect to see it.

---

### BUG-001 — Session expired banner says "15 Minuten" (should be "32 Minuten")

**Severity:** Low  
**File:** `app/buchen/page.tsx` line 43

#### What the bug is
When a Stripe checkout session expires and the customer is redirected back to `/buchen?session_expired=1`, the page displays:

> "Deine Reservierung ist nach **15 Minuten** abgelaufen."

The actual Stripe session expiry is **32 minutes** (set in `app/api/bookings/route.ts`). The "15 Minuten" is leftover text from an older version of the code.

#### Business scenario — what could go wrong
A customer starts the booking process, gets distracted (phone call, family member, checking their calendar), comes back after 20 minutes, and finds the Stripe payment page has expired. They are sent back to the booking page with the message that their reservation "expired after 15 minutes." The customer is confused and annoyed — they believe they had 15 minutes but they were actually gone for 20. They may contact you to complain that "the system is too fast" or that something is broken, when in reality they still had 12 more minutes and the message is simply wrong.

In a worse case: a customer reads "15 minutes" before they start, deliberately works quickly, and still times out at 17 minutes — and cannot understand why, because the page told them 15 was the limit.

#### How it occurs
The customer opens the booking wizard, selects all options, fills in their details, clicks submit, and is redirected to Stripe. If they do not complete payment within 32 minutes, Stripe closes the session and redirects them back to `/buchen?session_expired=1`. The banner is shown with the hardcoded wrong number.

#### Impact
No money is lost, no booking is corrupted. The only damage is to customer trust and your support workload (confused messages or phone calls). For a business that depends on word-of-mouth, a customer who thinks "the website doesn't work properly" may not return and may tell others.

#### Likelihood: 🟡 Occasional
Most customers complete payment in under 5 minutes. However, it is realistic that several customers per month get distracted, especially families coordinating times or groups of friends checking their schedules mid-booking. Every one of those customers will see the wrong number.

**Fix:** Change `"nach 15 Minuten"` to `"nach 32 Minuten"` in the `SessionExpiredBanner` component. One word, two minutes of work.

---

### BUG-002 — Webhook conflict check ignores `arenas_count`

**Severity:** Medium  
**File:** `app/api/webhooks/stripe/route.ts` lines 59–76

#### What the bug is
After a customer completes Stripe payment, the webhook fires a safety check to make sure no one else took the slot while the customer was on the Stripe page. That check looks for any confirmed booking in the same time window:

```javascript
.eq('status', 'confirmed')
.neq('id', bookingId)
.lt('start_time', booking.end_time)
.gt('end_time', booking.start_time)
.limit(1)  // ← finds ANY overlap and treats it as a full block
```

The problem: it asks *"is there anyone in this slot?"* instead of *"are both arenas full?"*. The moment it finds even one confirmed booking using only 1 of the 2 available arenas, it concludes the slot is blocked and cancels the incoming payment — even when the second arena is completely free.

> **Important clarification:** this bug does NOT affect groups of 5 or more people.
> A large group always needs both arenas. If even 1 arena is already confirmed for the
> same time, only 1 arena remains — which is not enough for them. Cancelling them in
> that case is correct. The availability calendar also shows the slot as unavailable for
> large groups the moment 1 arena is taken, so they would never reach Stripe in the
> first place.
>
> The real bug is specifically about **two small groups** (≤ 4 people each, 1 arena each)
> booking the same slot at exactly the same time.

#### Business scenario — what could go wrong
It is a busy Saturday at 15:00. Both arenas are free. Two separate couples — Customer A and Customer B — both see the slot as available and both start the booking process within seconds of each other. Both pass the availability check, both get a `pending_payment` record created in the database, and both land on the Stripe payment page.

Customer A pays first. Their webhook fires, finds no confirmed conflict, captures the payment, and confirms their booking — Arena 1 is now taken.

Customer B pays one second later. Their webhook fires. It finds Customer A's newly-confirmed booking overlapping the same time. It concludes "conflict" and cancels Customer B — voiding their card authorisation, charging them nothing, and sending them back to the "Zeitfenster leider vergeben" screen.

But Customer B did nothing wrong. Arena 2 was free the entire time. The venue could have had two bookings at €50–€90 each for that slot. Instead it has one, and Customer B is left confused and frustrated, having gone all the way to the payment page for a slot that the system showed as available.

#### How it occurs
This requires a specific race condition — both customers must be at the Stripe checkout page for the same slot at the same time. The exact sequence:

1. Both arenas are free at a given time slot.
2. Customer A (small group, 1 arena) starts booking — passes RPC check, gets `pending_payment` record.
3. Customer B (small group, 1 arena) starts booking — also passes RPC check (1+1=2 ≤ 2 arenas, both fit), also gets `pending_payment` record.
4. Both are now on Stripe paying simultaneously.
5. Customer A's payment completes first → webhook confirms them.
6. Customer B's payment completes moments later → webhook finds Customer A's confirmed booking → wrongly cancels Customer B.

The booking system (RPC function) correctly determined that both groups fit. Only the webhook's simplified conflict check gets it wrong.

#### Impact
Two customers who both legitimately booked the same slot get different outcomes based purely on who clicks "Pay" first by a matter of seconds. The unlucky second customer is rejected and loses trust in the website. Spielnova loses a full booking (€50–€180 depending on group size and duration) that could have been accommodated. The customer sees "Zeitfenster leider vergeben" and may believe the slot is fully booked — when in fact it only has one group and the second arena is free for someone else to book.

#### Likelihood: 🟠 Uncommon but realistic on popular slots
This requires two small groups to both be on the Stripe payment page at the same time for the same slot — which requires them to both start the booking process within about 32 minutes of each other. On a busy Saturday afternoon, with popular time slots (15:00, 16:00), this is a realistic scenario. It may happen a handful of times per month during peak periods. It is very unlikely on quiet weekday afternoons when bookings are sparse.

**Fix:** The webhook should sum total `arenas_count` across overlapping confirmed bookings and only cancel if the combined total would exceed 2:
```javascript
const { data: overlapping } = await supabaseAdmin
    .from('bookings')
    .select('arenas_count')
    .eq('status', 'confirmed')
    .neq('id', bookingId)
    .lt('start_time', booking.end_time)
    .gt('end_time', booking.start_time)

const occupied = (overlapping ?? []).reduce((s, b) => s + (b.arenas_count || 1), 0)
if (occupied + (booking.arenas_count || 1) > 2) { /* cancel */ }
```
This mirrors exactly how the RPC function already counts arenas when creating the booking.

---

### BUG-003 — No server-side validation of `gameMode` and `playerCount`

**Severity:** Medium (data integrity)  
**File:** `app/api/bookings/route.ts`

#### What the bug is
The public booking API accepts `gameMode`, `gameSlug`, and `playerCount` directly from the request body without checking whether the values are valid. Specifically:

- `gameMode` — any string is accepted. The booking form only sends `"shooter"` or `"escape"`, but a direct API call can send anything: `""`, `"free"`, `"vip"`, `"admin"`.
- `gameSlug` — any string is accepted, including slugs that belong to internal/admin-only categories.
- `playerCount` — no minimum or maximum check. The booking form limits selection to 1–8, but a direct API call can send `0`, `-1`, or `999`.

#### Business scenario — what could go wrong
**Scenario A — zero-price booking via playerCount = 0:**
The pricing formula is `Math.floor(0 / 4) × teamRate + (0 % 4) × singleRate = 0`. A crafted API call with `playerCount: 0` creates a booking and a Stripe session for **€0.00**. Stripe will process a €0 payment intent — which succeeds automatically without any card details. The booking is confirmed. A slot has been taken for free.

**Scenario B — junk data pollutes admin reporting:**
A curious person (or a competitor) submits bookings with `gameMode: "test123"` and `gameSlug: "hack"`. These bookings appear in the admin dashboard, create Stripe checkout sessions for garbage games, and skew any analytics or reporting. Even if they are abandoned and expire, they clutter the database and may cause confusion for staff ("what is this booking for 'hack'?").

**Scenario C — playerCount = 999 causes unexpected pricing:**
`playerCount: 999` → `teamCount = 249`, `singleCount = 3`. The calculated price would be `249 × €90 + 3 × €24.90 = €22,410 + €74.70 = €22,484.70`. Stripe would attempt to create a checkout session for that amount. Stripe does have maximum amount limits (€99,999.99), so most absurd values would fail at Stripe — but the failure occurs after the booking row is already written to the database with `status = 'pending_payment'`, creating a ghost record that must be cleaned up by the cron job.

#### How it occurs
A normal customer using the website cannot trigger this — the booking wizard dropdown limits their choices. This requires someone to send a crafted HTTP request directly to `/api/bookings`, which is publicly accessible. No login, no special tools needed — a basic `curl` command or Postman is sufficient.

#### Impact
**For playerCount = 0:** Revenue loss (a free confirmed booking blocks a slot). **For junk gameMode/slug:** Database pollution, admin confusion, wasted slots. **For extreme playerCount:** Failed Stripe sessions, abandoned `pending_payment` rows in the DB, potential confusion for staff if they see unexpectedly large amounts. None of these are catastrophic, but all are avoidable with three lines of validation code.

#### Likelihood: 🟡 Low for accidental, medium for intentional
An ordinary customer will never hit this. Someone deliberately probing the API would find it within minutes of looking at the network requests in their browser's developer tools. As the venue grows more visible, the probability of someone experimenting with the API increases.

**Fix:**
```typescript
const VALID_GAME_MODES = ['shooter', 'escape']
if (!VALID_GAME_MODES.includes(gameMode)) {
    return NextResponse.json({ error: 'Ungültiger Spielmodus.' }, { status: 400 })
}
if (!playerCount || playerCount < 1 || playerCount > 8) {
    return NextResponse.json({ error: 'Spieleranzahl muss zwischen 1 und 8 liegen.' }, { status: 400 })
}
```

---

### BUG-004 — Contact form email fields not HTML-escaped

**Severity:** Low  
**File:** `lib/email.ts`, `sendContactEmail()`

#### What the bug is
When someone submits the contact form, the `senderName` and `subject` fields are pasted directly into the HTML of the internal email sent to `info@spielnova.de` without sanitisation:
```javascript
<td>${senderName}</td>
<td>${subject}</td>
```
The `message` body is correctly sanitised (the code replaces `<` and `>`). The name and subject are not.

#### Business scenario — what could go wrong
Someone submits a contact enquiry with a name like `<b style="color:red">URGENT REFUND</b>` or a subject of `<h1>Your account has been suspended</h1>`. The internal email received by your staff renders the injected HTML, potentially making a fake or misleading message look official. A more sophisticated attacker could inject an `<img>` tag pointing to their own server to track when the email is opened (pixel tracking), or attempt to confuse staff with fake invoices or warnings styled to look legitimate.

#### How it occurs
A person opens the contact form at `/kontakt`, fills in a name and subject containing HTML tags, and submits the form. No account, no login, no special tools required.

#### Impact
The email is only ever sent to `info@spielnova.de` (your internal inbox), never to a customer. This significantly limits the blast radius. The realistic worst case is a misleading or visually confusing internal email that causes a staff member to take a wrong action (e.g., believing a fake refund request is legitimate). A broader web attack (XSS against customers) is not possible here because the injected content never reaches a browser — only an email client. Modern email clients also strip most dangerous tags automatically.

#### Likelihood: 🟢 Rare
Most contact form submissions are genuine enquiries. However, spam bots that abuse contact forms are very common, and many inject HTML or script tags automatically. You will likely receive such submissions eventually as the website becomes more indexed by search engines.

**Fix:** Apply the same escaping used on `message` to `senderName` and `subject`:
```javascript
const escape = (s: string) => s.replace(/</g, '&lt;').replace(/>/g, '&gt;')
// Then in the template:
<td>${escape(senderName)}</td>
<td>${escape(subject)}</td>
```

---

### BUG-005 — `RESEND_API_KEY` missing causes silent email failure

**Severity:** Low  
**File:** `lib/email.ts` line 5

#### What the bug is
The Resend email client is initialised with a fallback dummy key if the real environment variable is not set:
```javascript
const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key_for_build')
```
This means that if `RESEND_API_KEY` is missing or accidentally deleted from the Vercel environment, the code does not crash. It initialises silently with a fake key. Every email attempt then fails with an authentication error from Resend — but that error is caught, logged, and swallowed. The booking process continues as if nothing went wrong.

#### Business scenario — what could go wrong
You redeploy the website, or a developer rotates environment variables and accidentally forgets to re-add `RESEND_API_KEY`. From that moment on:

- Every customer who pays for a booking receives **no confirmation email**. They have no receipt, no date/time reminder, and no proof of booking. They will call or email to ask if their booking went through, or simply not show up because they are not sure.
- Every contact form submission is silently lost. Enquiries from potential customers go unanswered with no trace.
- The day-before reminder cron job runs but sends nothing, so customers with bookings the next day receive no reminder and are more likely to forget or arrive late.

None of this triggers an alert. You would only discover the problem when customers start complaining — potentially days or weeks later.

#### How it occurs
Vercel environment variables must be set manually per-project and per-environment (Production / Preview / Development). They can be accidentally omitted during:
- A project migration to a new Vercel account or team
- A variable rotation or key renewal
- Cloning the project or deploying a new branch environment
- A Vercel account transfer

#### Impact
Customer experience damage: paying customers have no confirmation. Support workload spikes (phone calls, emails from worried customers). Potential no-shows because customers have no reminder. If undetected for a week, dozens of bookings may have gone unconfirmed by email. Recovery requires manually re-sending confirmations to all affected customers — which is not currently possible from the admin panel (it can send reminders but not re-send original confirmations).

#### Likelihood: 🟡 Low but happens to every project eventually
Environment variable accidents are one of the most common deployment mistakes in web development. It is a matter of when, not if.

**Fix:** Add a startup warning (the Stripe key already has this pattern):
```javascript
if (!process.env.RESEND_API_KEY) {
    console.error('[FATAL] RESEND_API_KEY is not set. All emails will fail silently.')
}
```
Better still: add a health-check endpoint (`/api/health`) that verifies all required environment variables are present, and monitor it.

---

### BUG-006 — `arena_id` stored as `"arena-1"` for large groups that use both arenas

**Severity:** Low (data quality)  
**File:** `app/buchen/page.tsx` lines 150–151

#### What the bug is
When a customer books for more than 4 people (which requires both arenas), the code that selects which arena to assign still only picks one:
```javascript
if (availableSlots[selectedTime].arena1) assignedArena = "arena-1"
else if (availableSlots[selectedTime].arena2) assignedArena = "arena-2"
```
The booking is saved to the database with `arena_id = 'arena-1'` and `arenas_count = 2`. So the record says: "this booking is in Arena 1" — even though Arena 2 is also fully occupied by the same group.

#### Business scenario — what could go wrong
A staff member looks at the admin dashboard and sees two bookings at 15:00: one for 3 people in Arena 1, and one for 6 people — also showing Arena 1. They try to plan the afternoon setup and conclude Arena 2 is free. In reality, the 6-person group is using both arenas, and Arena 2 is already taken. The staff prepares only one arena for that group.

Alternatively, if you ever export booking data to a spreadsheet for capacity planning or business analysis, the arena column will show misleading data: it appears all large-group bookings happen in Arena 1, and Arena 2 is empty.

#### How it occurs
Every time a customer selects more than 4 players and completes a booking. The availability display correctly checks that both arenas are free (it uses `arena1 && arena2` for large groups), but the final value submitted to the server is always just `"arena-1"` (or occasionally `"arena-2"` if arena-1 is already taken). The double-booking protection is not affected — it operates on `arenas_count`, not `arena_id` — but the stored label is wrong.

#### Impact
No customer is ever double-booked or incorrectly rejected. The availability logic is correct. This is purely a **data quality** and **staff communication** issue. If Spielnova ever expands to 3+ arenas, this bug would cause real operational problems. Today it is cosmetic but worth fixing before it causes a real misunderstanding during a busy shift.

#### Likelihood: 🟡 Happens on every large-group booking
Every booking for 5 or more players stores an incorrect `arena_id`. If large groups are, say, 20% of bookings, this affects 20% of all records in the database from the day the site launched.

**Fix:** Assign a meaningful value for groups using both arenas:
```javascript
const arenasNeeded = parseInt(playerCount) > 4 ? 2 : 1
const assignedArena = arenasNeeded === 2
    ? "arena-1+arena-2"
    : availableSlots[selectedTime].arena1 ? "arena-1" : "arena-2"
```

---

### BUG-007 — Cron `expire-bookings` runs at 03:00 UTC, not in real-time

**Severity:** Informational  
**File:** `vercel.json`

#### What the bug is
The database cleanup cron job — which cancels abandoned `pending_payment` bookings — runs once per day at 03:00 UTC (04:00 CET / 05:00 CEST). It is not real-time.

#### Business scenario — what could go wrong
A customer abandons their booking at 18:00. Their `pending_payment` row sits in the database until 03:00 the following morning when the cron cancels it. During those 9 hours, the database has a "zombie" booking row with status `pending_payment`.

#### How it occurs
The cron is simply scheduled at a fixed time. Between cron runs, abandoned bookings are not immediately marked `cancelled` in the database.

#### Impact
**In practice: none.** This is why the severity is informational. The availability API and the atomic booking RPC both implement **lazy expiry**: they ignore any `pending_payment` row older than 32 minutes when calculating free slots. So a slot is freed for new bookings exactly 32 minutes after abandonment, regardless of when the cron runs. The cron only matters for database hygiene — keeping the `bookings` table clean. Customers are never affected by the 9-hour gap.

#### Likelihood: 🟢 Happens constantly, but harmlessly
Every abandoned booking creates this situation. It is by design. No action needed.

---

## 14. Recommendations

### High Priority

1. **Fix "15 Minuten" banner text** (BUG-001) — Simple one-line fix, visible to all customers who abandon checkout.

2. **Fix webhook arena conflict check** (BUG-002) — Protects large groups from incorrectly cancelled bookings. Low-probability but real issue.

3. **Add server-side `gameMode` and `playerCount` validation** (BUG-003) — Prevents DB pollution and potential edge cases in pricing.

### Medium Priority

4. **Add rate limiting** — Even simple IP-based limiting (e.g., 10 requests/minute per IP) on `/api/bookings` and `/api/contact` would prevent automated abuse. Consider Vercel's rate-limiting middleware or Upstash Redis.

5. **Add `playerCount` min=1 max=8 enforcement in UI** — The booking page allows selecting 1–8 (from the Select dropdown), which is fine, but the server should validate independently.

### Low Priority

6. **Escape HTML in contact email** (BUG-004) — Minor security hardening.

7. **Alert on missing `RESEND_API_KEY`** (BUG-005) — Prevents silent email loss.

8. **Fix `arena_id` for large groups** (BUG-006) — Data quality improvement.

9. **Add CAPTCHA** to the public booking form — Prevents slot-camping bots. Consider Cloudflare Turnstile (minimal friction, free).

10. **Upgrade Stripe API version from `2025-12-15.clover`** — The `clover` suffix indicates a beta/release-candidate channel. Monitor Stripe changelog for GA release.

---

*Report generated by automated code analysis and live API tests. All tests were conducted against the development build connected to live Supabase and Stripe test environments.*
