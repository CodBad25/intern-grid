
-- Fonction admin pour supprimer une réaction par ID (bypass RLS) 
-- Restreinte aux utilisateurs ayant le rôle 'admin'
CREATE OR REPLACE FUNCTION public.delete_reaction_admin(_reaction_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $function$
BEGIN
  -- Vérifie que l'appelant est admin via le profil (utilise auth.uid())
  IF get_current_user_role() <> 'admin' THEN
    RAISE EXCEPTION 'Insufficient privileges';
  END IF;

  DELETE FROM public.reactions WHERE id = _reaction_id;
END;
$function$;
