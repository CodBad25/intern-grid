-- Insert demo users directly into profiles table
INSERT INTO public.profiles (user_id, display_name, role)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Badri Belhaj', 'tuteur'),
  ('22222222-2222-2222-2222-222222222222', 'Laurence Mauny', 'tuteur'),
  ('33333333-3333-3333-3333-333333333333', 'Barbara Viot', 'stagiaire')
ON CONFLICT (user_id) DO UPDATE SET 
  display_name = EXCLUDED.display_name,
  role = EXCLUDED.role;

-- Update the create_demo_users function to be more robust
CREATE OR REPLACE FUNCTION public.create_demo_users()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Insert demo profiles if they don't exist
  INSERT INTO public.profiles (user_id, display_name, role)
  VALUES 
    ('11111111-1111-1111-1111-111111111111', 'Badri Belhaj', 'tuteur'),
    ('22222222-2222-2222-2222-222222222222', 'Laurence Mauny', 'tuteur'),
    ('33333333-3333-3333-3333-333333333333', 'Barbara Viot', 'stagiaire')
  ON CONFLICT (user_id) DO UPDATE SET 
    display_name = EXCLUDED.display_name,
    role = EXCLUDED.role;
    
  RETURN 'Demo users created successfully';
END;
$function$;

-- Update clear_test_data to return confirmation
CREATE OR REPLACE FUNCTION public.clear_test_data()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  DELETE FROM public.reactions;
  DELETE FROM public.reponses;
  DELETE FROM public.commentaires;
  DELETE FROM public.documents;
  DELETE FROM public.seances;
  DELETE FROM public.evenements;
  
  RETURN 'Test data cleared successfully';
END;
$function$;