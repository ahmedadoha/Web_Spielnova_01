-- =============================================
-- Migration: Add requires_password_change column
-- =============================================

ALTER TABLE public.employees 
ADD COLUMN IF NOT EXISTS requires_password_change BOOLEAN DEFAULT FALSE;
