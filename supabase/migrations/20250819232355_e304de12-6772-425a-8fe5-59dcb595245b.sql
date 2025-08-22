
-- Créer la table notifications
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error')),
  target_user_id UUID REFERENCES auth.users,
  action_url TEXT,
  metadata JSONB,
  created_by UUID REFERENCES auth.users NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Politique pour voir ses propres notifications ou les notifications globales
CREATE POLICY "Users can view their notifications" 
  ON public.notifications 
  FOR SELECT 
  USING (target_user_id IS NULL OR target_user_id = auth.uid());

-- Politique pour créer des notifications (seulement les utilisateurs authentifiés)
CREATE POLICY "Authenticated users can create notifications" 
  ON public.notifications 
  FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

-- Politique pour mettre à jour ses propres notifications (marquer comme lu)
CREATE POLICY "Users can update their notifications" 
  ON public.notifications 
  FOR UPDATE 
  USING (target_user_id IS NULL OR target_user_id = auth.uid());

-- Politique pour supprimer ses propres notifications
CREATE POLICY "Users can delete their notifications" 
  ON public.notifications 
  FOR DELETE 
  USING (target_user_id IS NULL OR target_user_id = auth.uid());

-- Trigger pour updated_at
CREATE TRIGGER update_notifications_updated_at 
  BEFORE UPDATE ON public.notifications 
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();

-- Index pour les performances
CREATE INDEX idx_notifications_target_user_id ON public.notifications(target_user_id);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX idx_notifications_read ON public.notifications(read);
