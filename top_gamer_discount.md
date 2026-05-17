# Top Gamer Discount — Analysis & Action Plan

**Date:** 2026-05-16  
**Status:** Pending implementation  

---

## How it works (current code)

**Rule advertised to customers:**
> Come back within 30 days and get 20% off your next booking.

**What the code actually does — step by step:**

```
Customer fills in their email → clicks Submit

Server (app/api/bookings/route.ts):
  1. Calculates the new booking's full price
  2. Queries the DB:
       SELECT id FROM bookings
       WHERE customer_email = <whatever the user typed>
         AND status = 'confirmed'
         AND start_time >= (<new booking start time> - 30 days)
         AND start_time <  (<new booking date> at midnight)
       LIMIT 1
  3. If any row found → apply 20% discount, pass discounted amount to Stripe
  4. The Stripe line item description contains "Top Gamer Rabatt"

Webhook (after payment):
  5. Reads Stripe line items, looks for "Top Gamer Rabatt" in description text
  6. If found → adds the bonus callout to the confirmation email
```

---

## Question 1 — Is it correctly implemented?

**Partially. There is one significant algorithmic bug.**

### Bug: The 30-day window is anchored to the new booking's date, not to today

```javascript
// Current code — WRONG
const thirtyDaysAgo = new Date(startTime.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
//                              ↑ startTime = the NEW booking's scheduled slot (future date)
```

`startTime` is the future date the customer is booking (e.g. a slot on July 15). The 30-day
window is computed as *July 15 minus 30 days = June 15*. The query asks:
*"Did this email have a confirmed booking between June 15 and July 14?"*
— not *"Did they visit in the last 30 days from today?"*

**Simulation results (today = 2026-05-16):**

| Scenario | Visit date | Booking for | Window starts | Discount? |
|---|---|---|---|---|
| Book next week (7 days out) | May 11 | May 23 | Apr 23 | ✅ YES |
| Book in 35 days | May 11 | Jun 20 | May 21 | ❌ NO — wrongly denied |
| Book in 70 days | May 11 | Jul 25 | Jun 25 | ❌ NO — wrongly denied |
| Book tomorrow | Apr 17 | May 17 | Apr 17 T15:00 | ❌ NO — depends on exact slot time |

A loyal customer who visited 5 days ago loses their discount simply because they tried
to book a slot 5+ weeks in advance.

**The correct formula (one-line fix):**
```javascript
// Anchor to NOW, not the future booking date
const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
```

### Secondary issue: `isTopGamer` detected via Stripe description text in the webhook

```javascript
// In webhook — fragile string matching
isTopGamer = lineItems.data.some(item => item.description?.includes('Top Gamer Rabatt'))
```

The webhook reconstructs whether the discount was applied by searching for the words
`"Top Gamer Rabatt"` inside the Stripe line item description text. If the product name
is ever changed (different wording, added emoji, translated), the email stops showing
the bonus banner with no error or warning.

**Fix:** Store `is_top_gamer` as a column in the `bookings` table (see Fix 2 below).

### What works correctly ✅

- Discount is computed server-side; the customer cannot manipulate the amount
- Only `status = 'confirmed'` bookings qualify (not pending/cancelled)
- Same-day visits don't qualify (`.lt('start_time', startOfBookingDay)`)
- The discounted amount is what Stripe charges — no mismatch between shown and charged price
- Walk-in confirmed bookings count toward qualifying a customer (correct)
- The 20% calculation (`Math.round(totalAmount * 0.80)`) is exact for all current prices

---

## Question 2 — Weaknesses & Vulnerabilities

### 🔴 Critical: Email is user-supplied and unverified — anyone can claim someone else's discount

The entire check pivots on one line:
```javascript
.eq('customer_email', customerEmail)  // ← just what the user typed in the form
```

There is no account system. There is no verification that the person submitting
the booking owns the email address they entered. The exploit:

1. Alice books and pays → her email is now `confirmed` in the DB
2. Bob knows Alice's email (from a shared receipt, social media, or a guess)
3. Bob opens `/buchen`, types Alice's email in Step 3
4. Bob gets 20% off — charged to his own card, at Alice's loyalty rate

This is completely silent: no error, no notification to Alice, no log entry.

**For a group of 8 on a weekend the discount is worth ~€49.** That is meaningful money.

### 🟠 High: No record of which bookings received the discount

There is no `is_top_gamer`, `discount_applied`, or `original_amount` column in the
`bookings` table. The only traces are:

- `total_amount` in the DB — the final amount; cannot tell if discounted
- The Stripe Dashboard (line item description) — manual inspection only

You cannot currently answer: *"How many discounts did we give out last month,
and for how much total?"* without manually exporting from Stripe.

### 🟡 Medium: Discount chains indefinitely within 30-day windows

1. Customer visits in January → qualifies
2. Returns in February (within 30 days) → gets 20% off, AND this visit qualifies them again
3. Returns in March → gets 20% off again
4. Continues forever as long as they return within 30 days each time

There is no "only applies to second visit" or "maximum 1 discount per month" logic.
A very regular customer gets 20% off every single booking after the first.

### 🟡 Medium: Discount applies across game modes without an explicit policy

A confirmed Escape Room booking qualifies for a 20% discount on a VR Shooter booking
and vice versa. The query does not filter by `game_mode`. Whether cross-mode qualifying
is the intended business rule is not documented.

### 🟡 Medium: No discount cap

There is no maximum discount amount (e.g., "max €10 off"). For an 8-player group on
a weekend (€248), the discount is €49.60. May be intentional but was not explicitly designed.

### 🟡 Low: Price shown in Step 3 does not reflect the discount

Step 3 shows price via `calculatePrice()` — a pure client-side function that does not
check past bookings. A returning customer sees the full price in the wizard, then the
lower price only on the Stripe checkout page. Confusing ("why did the price change?").

---

## Question 3 — Is it practical to apply?

**The concept is good. The implementation is not reliable enough for real-world use.**

| Aspect | Assessment |
|---|---|
| Business value of the loyalty concept | ✅ Good — encourages return visits |
| Customer UX of "auto-applied" discount | 🟡 OK but confusing (price changes at Stripe) |
| Risk of unintended discount giveaway | 🔴 High — no email verification |
| Risk of discount fraud at scale | 🟡 Medium — requires knowing someone's email |
| Auditability | 🔴 None — cannot report on discounts from the DB |
| Correctness for advance bookings | 🔴 Broken — window uses wrong anchor date |

For a small venue where customers typically book a week or less in advance, the timing
bug will not be noticed most of the time — bookings usually fall within the correct window.
However, it silently denies legitimate discounts to customers who plan ahead.

The email vulnerability is the more serious practical concern. At a venue that builds
relationships with regulars, someone sharing their email with friends is very likely.

---

## Fixes (in priority order)

### Fix 1 — Anchor the 30-day window to today (one line, `app/api/bookings/route.ts`)

```typescript
// BEFORE — wrong, anchored to future booking date
const thirtyDaysAgo = new Date(startTime.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()

// AFTER — correct, anchored to right now
const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
```

### Fix 2 — Store the discount in the database (adds auditability, fixes webhook detection)

New migration:
```sql
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS is_top_gamer    BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS original_amount INTEGER; -- pre-discount cents
```

In `app/api/bookings/route.ts`, after the discount check, update the booking row:
```typescript
if (isTopGamer) {
    await supabase
        .from('bookings')
        .update({ is_top_gamer: true, original_amount: totalAmount })
        .eq('id', bookingId)
}
```

In the webhook, replace the fragile string search with a simple DB read:
```typescript
// Replace the lineItems.listLineItems() call with:
const isTopGamer = booking.is_top_gamer ?? false
```

### Fix 3 — Replace email matching with single-use discount codes (eliminates spoofing)

After a confirmed booking, include a one-time discount code in the confirmation email.
The booking form gets a "Rabattcode" input. The server checks the code against a
`discount_codes` table instead of email history.

New table:
```sql
CREATE TABLE public.discount_codes (
    code        TEXT PRIMARY KEY,          -- e.g. "TG-A3X9-2026"
    booking_id  UUID REFERENCES bookings(id),  -- the qualifying booking
    expires_at  TIMESTAMPTZ NOT NULL,
    used_at     TIMESTAMPTZ,
    used_by_booking_id UUID REFERENCES bookings(id)
);
```

Each code is valid once, expires 30 days after the qualifying visit, and cannot be
transferred without sharing the confirmation email. This is how every major ticketing
system implements loyalty — it cannot be exploited without access to the customer's inbox.

### Fix 4 — Show the discount in the booking wizard before Stripe (UX)

In Step 3, after the customer enters their email, do a lightweight check:

```typescript
// Lightweight endpoint: POST /api/discount-check
// Returns { isTopGamer: boolean } without creating a booking
const res = await fetch('/api/discount-check', {
    method: 'POST',
    body: JSON.stringify({ email: customerEmail })
})
const { isTopGamer } = await res.json()
```

Then show in the Step 3 summary:
```
✅ Top Gamer Rabatt wird angewendet – 20% Rabatt!
```

So the customer knows before they leave the site, and the price they see in the
wizard matches what Stripe charges.

---

## Files to change

| File | Change needed |
|---|---|
| `app/api/bookings/route.ts` | Fix 1 (anchor date) + write `is_top_gamer` + `original_amount` after discount check |
| `app/api/webhooks/stripe/route.ts` | Fix 2 (read `is_top_gamer` from DB instead of Stripe description) |
| `supabase/migrations/` | New migration: add `is_top_gamer` + `original_amount` columns |
| `app/buchen/page.tsx` | Fix 4 (show discount in Step 3 summary) |
| `app/api/discount-check/route.ts` | New lightweight endpoint for Fix 4 |
| `lib/email.ts` | Already correct — reads `isTopGamer` param passed to it |
| *(optional)* `app/api/bookings/route.ts` | Fix 3 — discount code system (larger change) |
