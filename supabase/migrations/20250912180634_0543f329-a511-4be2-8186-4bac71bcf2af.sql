-- Create a table for storing extracted links
CREATE TABLE public.liens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  source_type TEXT NOT NULL, -- 'seance', 'commentaire', 'document', etc.
  source_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.liens ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all liens" 
ON public.liens 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create liens" 
ON public.liens 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own liens" 
ON public.liens 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own liens" 
ON public.liens 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for timestamp updates
CREATE TRIGGER update_liens_updated_at
BEFORE UPDATE ON public.liens
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();