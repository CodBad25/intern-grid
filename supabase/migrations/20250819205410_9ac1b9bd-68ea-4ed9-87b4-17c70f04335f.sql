
-- Rendre l'effacement compatible avec la règle "DELETE requires a WHERE clause"
-- et nettoyer aussi les paramètres de présence.
CREATE OR REPLACE FUNCTION public.clear_test_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $function$
BEGIN
  -- Supprimer d'abord les tables enfants pour éviter les problèmes de FK
  DELETE FROM public.reactions WHERE true;
  DELETE FROM public.reponses WHERE true;
  DELETE FROM public.commentaires WHERE true;
  DELETE FROM public.documents WHERE true;
  DELETE FROM public.seances WHERE true;
  DELETE FROM public.evenements WHERE true;

  -- Nettoyer aussi les paramètres de présence (on garde les profiles)
  DELETE FROM public.user_presence_settings WHERE true;
END;
$function$;
