-- 1. Dans objectives : supprimer l'ancien session_id (bigint)
ALTER TABLE public.objectives 
DROP COLUMN IF EXISTS session_id;

-- 2. Renommer seance_id en session_id dans objectives
ALTER TABLE public.objectives 
RENAME COLUMN seance_id TO session_id;

-- 3. Ajouter la contrainte de clé étrangère sur objectives
ALTER TABLE public.objectives 
ADD CONSTRAINT objectives_session_id_fkey 
FOREIGN KEY (session_id) REFERENCES public.seances(id) ON DELETE SET NULL;

-- 4. Ajouter session_id à observations avec clé étrangère
ALTER TABLE public.observations 
ADD COLUMN session_id UUID REFERENCES public.seances(id) ON DELETE CASCADE;

-- 5. Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_objectives_session_id ON public.objectives(session_id);
CREATE INDEX IF NOT EXISTS idx_observations_session_id ON public.observations(session_id);