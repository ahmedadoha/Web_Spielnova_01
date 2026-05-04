-- =============================================
-- Migration: Add admin-required columns to bookings table
-- Run this in Supabase SQL Editor after 20240001_admin_setup.sql
-- =============================================

-- Flat date/time columns (used by admin dashboard UI)
-- The public booking system uses start_time/end_time timestamps.
-- The admin API normalizes between them, but also stores these for walk-in bookings.
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS date TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS time TEXT;

-- Game display name (admin UI shows this instead of game_slug)
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS game_name TEXT;

-- Duration in minutes (derived from end_time - start_time, but explicit for walk-ins)
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 60;

-- Number of arenas used (1 or 2, for groups > 4 players)
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS arenas_count INTEGER DEFAULT 1;

-- Total amount paid in cents (0 for walk-ins, actual amount for online bookings)
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS total_amount INTEGER DEFAULT 0;

-- Walk-in flag (true = created by staff, false = online booking)
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS walk_in BOOLEAN DEFAULT FALSE;

-- Staff notes (internal only, not visible to customer)
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS staff_notes TEXT;

-- Payment method (online = Stripe, cash = cash, card = card terminal, free = complimentary)
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'online';

-- Customer phone (optional, for walk-in contact)
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS customer_phone TEXT;

-- Stripe checkout session ID (for refunds — needed by /api/admin/refund)
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS stripe_session_id TEXT;

-- =============================================
-- Backfill existing bookings: populate date, time, game_name
-- from existing start_time and game_slug columns
-- =============================================
UPDATE public.bookings
SET
    date = TO_CHAR(start_time AT TIME ZONE 'UTC', 'YYYY-MM-DD'),
    time = TO_CHAR(start_time AT TIME ZONE 'UTC', 'HH24:MI'),
    game_name = COALESCE(game_slug, game_mode, '—'),
    duration_minutes = EXTRACT(EPOCH FROM (end_time - start_time)) / 60,
    payment_method = 'online'
WHERE date IS NULL AND start_time IS NOT NULL;

-- =============================================
-- Update RLS: Allow authenticated employees (via admin API with service role)
-- to update bookings. The admin API uses the anon key + session, which means
-- RLS applies. We need to allow employees to update confirmed/cancelled/deleted statuses.
-- Note: DROP POLICY IF EXISTS + CREATE is used because CREATE POLICY IF NOT EXISTS
-- is not supported in all PostgreSQL versions.
-- =============================================

-- Allow any authenticated user to update bookings
DROP POLICY IF EXISTS "Authenticated users can update bookings" ON public.bookings;
CREATE POLICY "Authenticated users can update bookings"
ON public.bookings FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow any authenticated user to insert bookings (for walk-ins)
DROP POLICY IF EXISTS "Authenticated users can insert bookings" ON public.bookings;
CREATE POLICY "Authenticated users can insert bookings"
ON public.bookings FOR INSERT
TO authenticated
WITH CHECK (true);

-- =============================================
-- Update stripe_session_id from existing payment_id column (if it holds session IDs)
-- =============================================
UPDATE public.bookings
SET stripe_session_id = payment_id
WHERE stripe_session_id IS NULL AND payment_id IS NOT NULL AND payment_id LIKE 'cs_%';
