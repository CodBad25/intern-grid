-- Ajouter la colonne custom_label à la table seances
-- Cette colonne permet de personnaliser l'affichage des visites et suivis
-- Exemple: "Tréunion" pour une réunion à trois

ALTER TABLE public.seances
ADD COLUMN IF NOT EXISTS custom_label TEXT;

COMMENT ON COLUMN public.seances.custom_label IS 'Label personnalisé pour affiner le type de séance (ex: Tréunion, Entretien, Bilan)';
