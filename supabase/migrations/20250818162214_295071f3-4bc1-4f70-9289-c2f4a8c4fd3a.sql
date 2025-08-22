-- Fix RLS policies to restrict data access to user's own content
-- Drop all existing public read policies and create secure ones

-- Seances table - secure access
DROP POLICY IF EXISTS "Users can view all seances" ON public.seances;
DROP POLICY IF EXISTS "Users can view their own seances" ON public.seances;
CREATE POLICY "Users can view own seances only" 
ON public.seances 
FOR SELECT 
USING (auth.uid() = tuteur_id);

-- Documents table - secure access
DROP POLICY IF EXISTS "Users can view all documents" ON public.documents;
DROP POLICY IF EXISTS "Users can view their own documents" ON public.documents;
CREATE POLICY "Users can view own documents only" 
ON public.documents 
FOR SELECT 
USING (auth.uid() = tuteur_id);

-- Commentaires table - secure access
DROP POLICY IF EXISTS "Users can view all commentaires" ON public.commentaires;
DROP POLICY IF EXISTS "Users can view their own commentaires" ON public.commentaires;
CREATE POLICY "Users can view own commentaires only" 
ON public.commentaires 
FOR SELECT 
USING (auth.uid() = tuteur_id);

-- Evenements table - secure access
DROP POLICY IF EXISTS "Users can view all evenements" ON public.evenements;
DROP POLICY IF EXISTS "Users can view their own evenements" ON public.evenements;
CREATE POLICY "Users can view own evenements only" 
ON public.evenements 
FOR SELECT 
USING (auth.uid() = tuteur_id);

-- Reponses table - secure access
DROP POLICY IF EXISTS "Users can view all reponses" ON public.reponses;
DROP POLICY IF EXISTS "Users can view their own reponses" ON public.reponses;
CREATE POLICY "Users can view own reponses only" 
ON public.reponses 
FOR SELECT 
USING (auth.uid() = tuteur_id);