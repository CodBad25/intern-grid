-- Corriger toutes les séances existantes pour mettre shared_with_peers à false par défaut
-- Seules les vraies Tréunions (séances partagées) doivent avoir true

-- Mettre false pour toutes les séances qui ne sont PAS des Tréunions
UPDATE public.seances
SET shared_with_peers = false
WHERE (shared_with_peers IS NULL OR shared_with_peers = true)
  AND (custom_label IS NULL OR custom_label NOT ILIKE '%tréunion%');

-- Mettre true pour les séances qui sont des Tréunions
UPDATE public.seances
SET shared_with_peers = true
WHERE custom_label ILIKE '%tréunion%';

-- Définir false comme valeur par défaut pour les nouvelles séances
ALTER TABLE public.seances
ALTER COLUMN shared_with_peers SET DEFAULT false;

COMMENT ON COLUMN public.seances.shared_with_peers IS 'Indique si la séance est partagée entre les deux tuteurs (ex: Tréunion)';
