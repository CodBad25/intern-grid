
-- Créer une table pour les paramètres de présence des utilisateurs
CREATE TABLE public.user_presence_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  show_presence BOOLEAN NOT NULL DEFAULT true,
  custom_status TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS sur la table
ALTER TABLE public.user_presence_settings ENABLE ROW LEVEL SECURITY;

-- Politique pour que les utilisateurs puissent voir les paramètres des autres (pour savoir qui veut être visible)
CREATE POLICY "Users can view presence settings of others who want to be visible" 
  ON public.user_presence_settings 
  FOR SELECT 
  USING (show_presence = true OR auth.uid() = user_id);

-- Politique pour que les utilisateurs puissent créer leurs propres paramètres
CREATE POLICY "Users can create their own presence settings" 
  ON public.user_presence_settings 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Politique pour que les utilisateurs puissent modifier leurs propres paramètres
CREATE POLICY "Users can update their own presence settings" 
  ON public.user_presence_settings 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Créer un trigger pour mettre à jour updated_at
CREATE TRIGGER update_user_presence_settings_updated_at
  BEFORE UPDATE ON public.user_presence_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Activer les mises à jour en temps réel pour la présence
ALTER TABLE public.user_presence_settings REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_presence_settings;
