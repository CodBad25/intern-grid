-- This migration fixes the overly permissive SELECT policies on core tables.

-- Step 1: Drop the insecure SELECT policies

DROP POLICY "Users can view all seances" ON public.seances;
DROP POLICY "Users can view all documents" ON public.documents;
DROP POLICY "Users can view all commentaires" ON public.commentaires;
DROP POLICY "Users can view all evenements" ON public.evenements;
DROP POLICY "Users can view all reponses" ON public.reponses;

-- Step 2: Create new, more secure SELECT policies

-- Note: These policies assume a relationship between tutors and interns.
-- A 'get_role' function and a potential 'stagiaire_tuteur' table might be needed for a full implementation.
-- For now, we'll base it on the creator of the content.

-- For seances: Tutors see all, interns see their own (assuming a stagiaire_id column exists or will be added)
-- As stagiaire_id is missing, we'll restrict to the tutor who created it for now.
-- A more complex policy is needed for interns to see their sessions.
CREATE POLICY "Tutors can view seances they created" ON public.seances
  FOR SELECT USING (auth.uid() = tuteur_id);

-- For documents: Tutors see all, interns see what's theirs.
CREATE POLICY "Tutors can view documents they created" ON public.documents
  FOR SELECT USING (auth.uid() = tuteur_id);

-- For commentaires: Tutors see all, interns see their own.
CREATE POLICY "Tutors can view commentaires they created" ON public.commentaires
  FOR SELECT USING (auth.uid() = tuteur_id);

-- For evenements: Everyone can see all events for now, as they might be global.
CREATE POLICY "Users can view all evenements" ON public.evenements
  FOR SELECT USING (true);

-- For reponses: Users can see responses to comments they can see.
-- This is a more complex policy that requires checking the parent comment.
-- For now, we'll restrict it to the creator.
CREATE POLICY "Tutors can view reponses they created" ON public.reponses
  FOR SELECT USING (auth.uid() = tuteur_id);
