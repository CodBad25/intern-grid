-- Ensure profiles are created for new auth users and backfill existing ones
-- 1) Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2) Backfill profiles for existing users without a profile
INSERT INTO public.profiles (user_id, display_name, role)
SELECT u.id,
       COALESCE(u.raw_user_meta_data->>'display_name', u.email),
       COALESCE(u.raw_user_meta_data->>'role', 'stagiaire')
FROM auth.users u
LEFT JOIN public.profiles p ON p.user_id = u.id
WHERE p.user_id IS NULL;

-- 3) Ensure the tuteur role for Mohamed Belhaj account
UPDATE public.profiles p
SET role = 'tuteur', display_name = COALESCE(p.display_name, 'Mohamed Belhaj')
FROM auth.users u
WHERE p.user_id = u.id AND u.email = 'mohamed.belhaj@ac-nantes.fr';