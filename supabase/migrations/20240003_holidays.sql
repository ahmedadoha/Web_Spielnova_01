-- Create holidays table
CREATE TABLE IF NOT EXISTS public.holidays (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'school' CHECK (type IN ('school', 'public')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up Row Level Security
ALTER TABLE public.holidays ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read holidays (for public booking availability)
CREATE POLICY "Public read access to holidays" ON public.holidays
    FOR SELECT USING (true);

-- Allow only managers to insert/update/delete holidays
CREATE POLICY "Managers can manage holidays" ON public.holidays
    FOR ALL
    USING (public.is_manager());
