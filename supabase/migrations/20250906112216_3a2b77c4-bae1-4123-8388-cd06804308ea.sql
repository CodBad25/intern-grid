-- Check which function needs search_path and fix
SELECT proname, prosrc FROM pg_proc 
WHERE prosecdef = true 
AND proname IN ('clear_test_data', 'create_demo_users', 'delete_reaction_admin', 'ensure_profile_exists', 'seed_demo_content')
AND prosrc NOT LIKE '%SET search_path%';

-- Fix the remaining function that needs search_path
ALTER FUNCTION public.create_demo_users() SET search_path = 'public';