-- Migration: add reminder_sent flag to bookings
--
-- Prevents the daily reminder cron from sending duplicate emails if it
-- runs more than once, or if a staff member has already sent a manual
-- reminder via the admin dashboard for the same booking.
--
-- To apply: run this file in Supabase → SQL Editor.

ALTER TABLE bookings
    ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN NOT NULL DEFAULT FALSE;
