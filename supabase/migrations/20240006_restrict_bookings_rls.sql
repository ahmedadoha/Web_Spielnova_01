-- ============================================================
-- Migration: Restrict public read access on bookings table
-- Fixes:     Customer PII (name, email, phone) was readable by
--            anyone with the public anon key via the Supabase REST API.
-- ============================================================

-- 1. Drop the policy that allowed anyone to read all booking rows.
--    All server-side booking reads now use the service role key
--    (supabase-admin.ts) which bypasses RLS entirely, so this
--    public policy is no longer needed for any legitimate use case.
DROP POLICY IF EXISTS "Enable read access for all users" ON public.bookings;

-- 2. Allow authenticated employees to read all bookings.
--    This keeps the admin dashboard functional.
--    (The admin routes use getAdminSession which carries the employee JWT.)
CREATE POLICY "Employees can read all bookings"
    ON public.bookings
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.employees
            WHERE id = auth.uid()
            AND is_active = TRUE
        )
    );

-- 3. Allow authenticated employees to update bookings.
--    Required for: reschedule, cancel, mark-refunded operations in the admin API.
--    (The public booking creation route now uses the admin client, so it does
--    not need an RLS UPDATE policy — it bypasses RLS via the service role key.)
CREATE POLICY "Employees can update bookings"
    ON public.bookings
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.employees
            WHERE id = auth.uid()
            AND is_active = TRUE
        )
    );

-- Note: The "Enable insert access for all users" INSERT policy is intentionally
-- left in place for now. Public booking creation goes through the Next.js API
-- which now uses the admin client, but keeping the INSERT policy open does not
-- expose any existing customer data (it only allows adding new rows).
-- Restricting the INSERT policy is a separate hardening step.
