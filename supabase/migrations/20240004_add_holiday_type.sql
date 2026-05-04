-- Since you already created the table, we just need to add the 'type' column!
ALTER TABLE public.holidays 
ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'school' CHECK (type IN ('school', 'public'));
