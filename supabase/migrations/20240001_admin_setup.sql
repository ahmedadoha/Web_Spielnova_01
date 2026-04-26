-- =============================================
-- Admin Setup: employees + audit_log tables
-- =============================================

-- 1. Employees profile table (linked to Supabase Auth users)
CREATE TABLE IF NOT EXISTS public.employees (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('manager', 'worker')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login TIMESTAMPTZ
);

ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- Employees can only read their own profile; managers can read all
CREATE POLICY "Employees can view own profile" ON public.employees
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Managers can view all employees" ON public.employees
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.employees e
            WHERE e.id = auth.uid() AND e.role = 'manager' AND e.is_active = TRUE
        )
    );

CREATE POLICY "Managers can manage employees" ON public.employees
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.employees e
            WHERE e.id = auth.uid() AND e.role = 'manager' AND e.is_active = TRUE
        )
    );

-- 2. Audit log table
CREATE TABLE IF NOT EXISTS public.audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES public.employees(id),
    employee_name TEXT,
    action TEXT NOT NULL,
    booking_id UUID,
    old_value JSONB,
    new_value JSONB,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Only managers can see the audit log
CREATE POLICY "Managers can view audit log" ON public.audit_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.employees e
            WHERE e.id = auth.uid() AND e.role = 'manager' AND e.is_active = TRUE
        )
    );

-- Any active employee can insert into audit log (system writes on their behalf)
CREATE POLICY "Active employees can insert audit log" ON public.audit_log
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.employees e
            WHERE e.id = auth.uid() AND e.is_active = TRUE
        )
    );

-- 3. Add staff_notes column to bookings table if not exists
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS staff_notes TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'online';
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS walk_in BOOLEAN DEFAULT FALSE;
