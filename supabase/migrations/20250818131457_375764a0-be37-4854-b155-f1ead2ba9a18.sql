-- Create seances table
CREATE TABLE public.seances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  duree INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('visite', 'formation', 'evaluation', 'suivi', 'autre')),
  horaire_mode TEXT DEFAULT 'ordinaire' CHECK (horaire_mode IN ('ordinaire', 'creneau')),
  heure TEXT,
  creneau TEXT CHECK (creneau IN ('M1', 'M2', 'M3', 'M4', 'S1', 'S2', 'S3', 'S4')),
  notes TEXT NOT NULL DEFAULT '',
  tuteur_id UUID NOT NULL REFERENCES public.profiles(user_id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create documents table
CREATE TABLE public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titre TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('document', 'lien')),
  url TEXT,
  description TEXT NOT NULL DEFAULT '',
  tuteur_id UUID NOT NULL REFERENCES public.profiles(user_id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create commentaires table  
CREATE TABLE public.commentaires (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('remarque', 'question')),
  content TEXT NOT NULL,
  tuteur_id UUID NOT NULL REFERENCES public.profiles(user_id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create evenements table
CREATE TABLE public.evenements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titre TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  date DATE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('reunion', 'formation', 'evaluation', 'autre')),
  tuteur_id UUID NOT NULL REFERENCES public.profiles(user_id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reponses table
CREATE TABLE public.reponses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  commentaire_id UUID NOT NULL REFERENCES public.commentaires(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  tuteur_id UUID NOT NULL REFERENCES public.profiles(user_id),
  shared_with_peers BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reactions table
CREATE TABLE public.reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('heart', 'thumbs_up', 'thumbs_down', 'smile', 'laugh', 'frown')),
  user_id UUID NOT NULL REFERENCES public.profiles(user_id),
  target_id UUID NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('comment', 'response')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, target_id, target_type)
);

-- Enable RLS on all tables
ALTER TABLE public.seances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commentaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evenements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reponses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for seances
CREATE POLICY "Users can view all seances" ON public.seances FOR SELECT USING (true);
CREATE POLICY "Users can create seances" ON public.seances FOR INSERT WITH CHECK (auth.uid() = tuteur_id);
CREATE POLICY "Users can update their own seances" ON public.seances FOR UPDATE USING (auth.uid() = tuteur_id);
CREATE POLICY "Users can delete their own seances" ON public.seances FOR DELETE USING (auth.uid() = tuteur_id);

-- RLS Policies for documents
CREATE POLICY "Users can view all documents" ON public.documents FOR SELECT USING (true);
CREATE POLICY "Users can create documents" ON public.documents FOR INSERT WITH CHECK (auth.uid() = tuteur_id);
CREATE POLICY "Users can update their own documents" ON public.documents FOR UPDATE USING (auth.uid() = tuteur_id);
CREATE POLICY "Users can delete their own documents" ON public.documents FOR DELETE USING (auth.uid() = tuteur_id);

-- RLS Policies for commentaires
CREATE POLICY "Users can view all commentaires" ON public.commentaires FOR SELECT USING (true);
CREATE POLICY "Users can create commentaires" ON public.commentaires FOR INSERT WITH CHECK (auth.uid() = tuteur_id);
CREATE POLICY "Users can update their own commentaires" ON public.commentaires FOR UPDATE USING (auth.uid() = tuteur_id);
CREATE POLICY "Users can delete their own commentaires" ON public.commentaires FOR DELETE USING (auth.uid() = tuteur_id);

-- RLS Policies for evenements
CREATE POLICY "Users can view all evenements" ON public.evenements FOR SELECT USING (true);
CREATE POLICY "Users can create evenements" ON public.evenements FOR INSERT WITH CHECK (auth.uid() = tuteur_id);
CREATE POLICY "Users can update their own evenements" ON public.evenements FOR UPDATE USING (auth.uid() = tuteur_id);
CREATE POLICY "Users can delete their own evenements" ON public.evenements FOR DELETE USING (auth.uid() = tuteur_id);

-- RLS Policies for reponses
CREATE POLICY "Users can view all reponses" ON public.reponses FOR SELECT USING (true);
CREATE POLICY "Users can create reponses" ON public.reponses FOR INSERT WITH CHECK (auth.uid() = tuteur_id);
CREATE POLICY "Users can update their own reponses" ON public.reponses FOR UPDATE USING (auth.uid() = tuteur_id);
CREATE POLICY "Users can delete their own reponses" ON public.reponses FOR DELETE USING (auth.uid() = tuteur_id);

-- RLS Policies for reactions
CREATE POLICY "Users can view all reactions" ON public.reactions FOR SELECT USING (true);
CREATE POLICY "Users can create reactions" ON public.reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own reactions" ON public.reactions FOR DELETE USING (auth.uid() = user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_seances_updated_at
  BEFORE UPDATE ON public.seances
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add test data clearing function
CREATE OR REPLACE FUNCTION public.clear_test_data()
RETURNS void AS $$
BEGIN
  DELETE FROM public.reactions;
  DELETE FROM public.reponses;
  DELETE FROM public.commentaires;
  DELETE FROM public.documents;
  DELETE FROM public.seances;
  DELETE FROM public.evenements;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add demo users creation function
CREATE OR REPLACE FUNCTION public.create_demo_users()
RETURNS void AS $$
BEGIN
  -- Insert demo profiles if they don't exist
  INSERT INTO public.profiles (user_id, display_name, role)
  VALUES 
    ('11111111-1111-1111-1111-111111111111', 'Badri Belhaj', 'tuteur'),
    ('22222222-2222-2222-2222-222222222222', 'Laurence Mauny', 'tuteur'),
    ('33333333-3333-3333-3333-333333333333', 'Barbara Viot', 'stagiaire')
  ON CONFLICT (user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;