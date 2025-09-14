-- Add trigger to create profiles on new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Seed demo content function
CREATE OR REPLACE FUNCTION public.seed_demo_content(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Ensure a profile exists for this user (idempotent)
  INSERT INTO public.profiles (user_id, display_name, role)
  VALUES (
    _user_id,
    COALESCE((SELECT email FROM auth.users WHERE id = _user_id), 'Utilisateur'),
    'tuteur'
  )
  ON CONFLICT (user_id) DO NOTHING;

  -- Insert demo seances
  INSERT INTO public.seances (tuteur_id, date, duree, type, horaire_mode, heure, creneau, notes, shared_with_peers)
  VALUES
    (_user_id, current_date - 7, 2, 'formation', 'ordinaire', '09:00', NULL, 'Session de formation sur la sécurité.', true),
    (_user_id, current_date - 3, 1, 'visite', 'ordinaire', '14:00', NULL, 'Visite de suivi.', true),
    (_user_id, current_date - 1, 3, 'evaluation', 'ordinaire', '10:00', NULL, 'Évaluation hebdomadaire.', true);

  -- Insert demo documents
  INSERT INTO public.documents (tuteur_id, titre, type, url, description, shared_with_peers)
  VALUES
    (_user_id, 'Guide de bonnes pratiques', 'document', NULL, 'Procédures standard PDF.', true),
    (_user_id, 'Ressource externe', 'lien', 'https://supabase.com', 'Documentation utile.', true);

  -- Insert demo commentaires
  INSERT INTO public.commentaires (tuteur_id, type, content)
  VALUES
    (_user_id, 'remarque', 'Très bon progrès cette semaine.'),
    (_user_id, 'question', 'Peut-on planifier une session sur les urgences ?');
END;
$$;

GRANT EXECUTE ON FUNCTION public.seed_demo_content(uuid) TO anon, authenticated;