-- Create function to get current user role (security definer to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Update commentaires policies - everyone can view comments
DROP POLICY IF EXISTS "Users can view own commentaires only" ON public.commentaires;

CREATE POLICY "Everyone can view commentaires" 
ON public.commentaires 
FOR SELECT 
USING (true);

-- Update reponses policies - stagiaires see all, tuteurs see own or shared
DROP POLICY IF EXISTS "Users can view own reponses only" ON public.reponses;

CREATE POLICY "Stagiaires can view all reponses and tuteurs can view own or shared" 
ON public.reponses 
FOR SELECT 
USING (
  public.get_current_user_role() = 'stagiaire' OR 
  (public.get_current_user_role() = 'tuteur' AND 
   (auth.uid() = tuteur_id OR shared_with_peers = true))
);