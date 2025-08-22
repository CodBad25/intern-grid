-- This migration adds the stagiaire_id to core tables to enable more granular RLS policies.

-- Step 1: Add stagiaire_id to seances
ALTER TABLE public.seances
ADD COLUMN stagiaire_id UUID REFERENCES public.profiles(user_id);

-- Step 2: Add stagiaire_id to documents
ALTER TABLE public.documents
ADD COLUMN stagiaire_id UUID REFERENCES public.profiles(user_id);

-- Step 3: Add stagiaire_id to commentaires
ALTER TABLE public.commentaires
ADD COLUMN stagiaire_id UUID REFERENCES public.profiles(user_id);

-- Step 4: Update the RLS policies for seances to include interns
-- First, drop the temporary policy from the previous migration
DROP POLICY "Tutors can view seances they created" ON public.seances;

-- Create a new, more comprehensive policy
CREATE POLICY "Users can view seances they are involved in" ON public.seances
  FOR SELECT USING (
    auth.uid() = tuteur_id OR
    auth.uid() = stagiaire_id
  );

-- Do the same for the other tables...
DROP POLICY "Tutors can view documents they created" ON public.documents;
CREATE POLICY "Users can view documents they are involved in" ON public.documents
  FOR SELECT USING (
    auth.uid() = tuteur_id OR
    auth.uid() = stagiaire_id
  );

DROP POLICY "Tutors can view commentaires they created" ON public.commentaires;
CREATE POLICY "Users can view commentaires they are involved in" ON public.commentaires
  FOR SELECT USING (
    auth.uid() = tuteur_id OR
    auth.uid() = stagiaire_id
  );

-- Note: A full implementation would also require a stagiaire_tuteur mapping table
-- to allow tutors to see all content from their assigned interns.
-- This is a good next step after this migration.
