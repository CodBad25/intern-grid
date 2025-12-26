-- Migration: Add sections_validees column for dual validation tracking
-- Date: 2025-12-26

-- Add sections_validees column (JSONB to track validation per tutor per section)
-- Structure: { section_name: { tutor_id: timestamp } }
-- Example: { "informations": { "uuid-tuteur1": "2025-12-26T10:00:00Z", "uuid-tuteur2": "2025-12-26T11:00:00Z" } }

ALTER TABLE public.rapports
ADD COLUMN IF NOT EXISTS sections_validees JSONB DEFAULT '{}'::jsonb;

-- Add synthese column for final report (JSONB)
ALTER TABLE public.rapports
ADD COLUMN IF NOT EXISTS synthese JSONB DEFAULT '{"contenu": ""}'::jsonb;

COMMENT ON COLUMN public.rapports.sections_validees IS 'Validation status per section per tutor: { section: { tutor_id: timestamp } }';
COMMENT ON COLUMN public.rapports.synthese IS 'Final report synthesis content';
