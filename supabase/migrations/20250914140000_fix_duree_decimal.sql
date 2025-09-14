-- Fix duree field to accept decimal values (like 1.5 hours)
-- Change from INTEGER to NUMERIC(4,2) to allow values like 1.5, 2.75, etc.

ALTER TABLE public.seances 
ALTER COLUMN duree TYPE NUMERIC(4,2);

-- Add a comment for clarity
COMMENT ON COLUMN public.seances.duree IS 'Duration in hours, supports decimal values (e.g., 1.5 for 1 hour 30 minutes)';
