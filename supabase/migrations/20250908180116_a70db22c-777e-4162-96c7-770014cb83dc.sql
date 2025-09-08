-- Add seance reactions table
CREATE TABLE public.seance_reactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  seance_id uuid NOT NULL,
  type text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.seance_reactions ENABLE ROW LEVEL SECURITY;

-- Create policies for seance reactions
CREATE POLICY "Users can view all seance reactions" 
ON public.seance_reactions 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create seance reactions" 
ON public.seance_reactions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own seance reactions" 
ON public.seance_reactions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add seance responses table
CREATE TABLE public.seance_responses (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  seance_id uuid NOT NULL,
  user_id uuid NOT NULL,
  content text NOT NULL,
  shared_with_peers boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.seance_responses ENABLE ROW LEVEL SECURITY;

-- Create policies for seance responses
CREATE POLICY "Visibility based on user role and sharing preferences for seance responses" 
ON public.seance_responses 
FOR SELECT 
USING (
  (get_current_user_role() = 'stagiaire'::text) OR 
  ((get_current_user_role() = 'tuteur'::text) AND ((auth.uid() = user_id) OR (shared_with_peers = true)))
);

CREATE POLICY "Users can create seance responses" 
ON public.seance_responses 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own seance responses" 
ON public.seance_responses 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own seance responses" 
ON public.seance_responses 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates on seance responses
CREATE TRIGGER update_seance_responses_updated_at
BEFORE UPDATE ON public.seance_responses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();