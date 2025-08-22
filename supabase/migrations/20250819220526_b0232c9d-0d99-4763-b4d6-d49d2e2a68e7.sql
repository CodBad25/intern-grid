
-- Add the missing color column to profiles table
ALTER TABLE public.profiles ADD COLUMN color TEXT DEFAULT 'hsl(220, 90%, 56%)';
