-- Add shared_with_peers column to documents, seances, and evenements tables
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS shared_with_peers boolean NOT NULL DEFAULT true;
ALTER TABLE public.seances ADD COLUMN IF NOT EXISTS shared_with_peers boolean NOT NULL DEFAULT true;  
ALTER TABLE public.evenements ADD COLUMN IF NOT EXISTS shared_with_peers boolean NOT NULL DEFAULT true;

-- Update documents policies
DROP POLICY IF EXISTS "Users can view own documents only" ON public.documents;

CREATE POLICY "Visibility based on user role and sharing preferences" 
ON public.documents 
FOR SELECT 
USING (
  -- Stagiaires can see all documents from tuteurs
  (public.get_current_user_role() = 'stagiaire') OR
  -- Tuteurs can see their own documents OR shared documents from other tuteurs
  (public.get_current_user_role() = 'tuteur' AND 
   (auth.uid() = tuteur_id OR shared_with_peers = true))
);

-- Update seances policies  
DROP POLICY IF EXISTS "Users can view own seances only" ON public.seances;

CREATE POLICY "Visibility based on user role and sharing preferences" 
ON public.seances 
FOR SELECT 
USING (
  -- Stagiaires can see all seances from tuteurs
  (public.get_current_user_role() = 'stagiaire') OR
  -- Tuteurs can see their own seances OR shared seances from other tuteurs
  (public.get_current_user_role() = 'tuteur' AND 
   (auth.uid() = tuteur_id OR shared_with_peers = true))
);

-- Update evenements policies
DROP POLICY IF EXISTS "Users can view own evenements only" ON public.evenements;

CREATE POLICY "Visibility based on user role and sharing preferences" 
ON public.evenements 
FOR SELECT 
USING (
  -- Stagiaires can see all evenements from tuteurs  
  (public.get_current_user_role() = 'stagiaire') OR
  -- Tuteurs can see their own evenements OR shared evenements from other tuteurs
  (public.get_current_user_role() = 'tuteur' AND 
   (auth.uid() = tuteur_id OR shared_with_peers = true))
);