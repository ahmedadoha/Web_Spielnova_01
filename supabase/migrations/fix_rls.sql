-- 1. Create a secure function to check if the current user is an active manager
-- This runs with SECURITY DEFINER to bypass RLS and prevent infinite recursion.
CREATE OR REPLACE FUNCTION is_manager()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.employees 
    WHERE id = auth.uid() AND role = 'manager' AND is_active = TRUE
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- 2. Drop the recursive policies
DROP POLICY IF EXISTS "Managers can view all employees" ON public.employees;
DROP POLICY IF EXISTS "Managers can manage employees" ON public.employees;
DROP POLICY IF EXISTS "Managers can view audit log" ON public.audit_log;

-- 3. Recreate them using the new non-recursive function
CREATE POLICY "Managers can view all employees" ON public.employees
    FOR SELECT USING (is_manager());

CREATE POLICY "Managers can manage employees" ON public.employees
    FOR ALL USING (is_manager());

CREATE POLICY "Managers can view audit log" ON public.audit_log
    FOR SELECT USING (is_manager());
