-- Fix RLS policies to restrict data access to user's own content
-- This ensures users can only see their own seances, documents, comments, etc.

-- Update seances table policies
DROP POLICY IF EXISTS "Users can view all seances" ON public.seances;
CREATE POLICY "Users can view their own seances" 
ON public.seances 
FOR SELECT 
USING (auth.uid() = tuteur_id);

-- Update documents table policies
DROP POLICY IF EXISTS "Users can view all documents" ON public.documents;
CREATE POLICY "Users can view their own documents" 
ON public.documents 
FOR SELECT 
USING (auth.uid() = tuteur_id);

-- Update commentaires table policies
DROP POLICY IF EXISTS "Users can view all commentaires" ON public.commentaires;
CREATE POLICY "Users can view their own commentaires" 
ON public.commentaires 
FOR SELECT 
USING (auth.uid() = tuteur_id);

-- Update evenements table policies
DROP POLICY IF EXISTS "Users can view all evenements" ON public.evenements;
CREATE POLICY "Users can view their own evenements" 
ON public.evenements 
FOR SELECT 
USING (auth.uid() = tuteur_id);

-- Update reponses table policies
DROP POLICY IF EXISTS "Users can view all reponses" ON public.reponses;
CREATE POLICY "Users can view their own reponses" 
ON public.reponses 
FOR SELECT 
USING (auth.uid() = tuteur_id);