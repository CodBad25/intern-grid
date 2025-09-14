-- Activer le temps réel pour toutes les tables importantes
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER TABLE public.seances REPLICA IDENTITY FULL;
ALTER TABLE public.commentaires REPLICA IDENTITY FULL;
ALTER TABLE public.reponses REPLICA IDENTITY FULL;
ALTER TABLE public.documents REPLICA IDENTITY FULL;
ALTER TABLE public.evenements REPLICA IDENTITY FULL;
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER TABLE public.reactions REPLICA IDENTITY FULL;

-- Ajouter les tables à la publication realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.seances;
ALTER PUBLICATION supabase_realtime ADD TABLE public.commentaires;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reponses;
ALTER PUBLICATION supabase_realtime ADD TABLE public.documents;
ALTER PUBLICATION supabase_realtime ADD TABLE public.evenements;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reactions;