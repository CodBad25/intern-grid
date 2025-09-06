-- Corriger les problèmes de sécurité des fonctions de base de données
-- Ajouter SET search_path pour toutes les fonctions SECURITY DEFINER

CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.delete_reaction_admin(_reaction_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Vérifie que l'appelant est admin via le profil (utilise auth.uid())
  IF get_current_user_role() <> 'admin' THEN
    RAISE EXCEPTION 'Insufficient privileges';
  END IF;

  DELETE FROM public.reactions WHERE id = _reaction_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.clear_test_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
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
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, role)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email), 
    COALESCE(NEW.raw_user_meta_data->>'role', 'stagiaire')
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.ensure_profile_exists(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
declare
  _email text;
  _display_name text;
  _role text;
begin
  select 
    u.email,
    coalesce(u.raw_user_meta_data->>'display_name', u.email),
    coalesce(u.raw_user_meta_data->>'role', 'stagiaire')
  into _email, _display_name, _role
  from auth.users u
  where u.id = _user_id;

  if not exists (select 1 from public.profiles p where p.user_id = _user_id) then
    insert into public.profiles (user_id, display_name, role)
    values (_user_id, _display_name, _role)
    on conflict (user_id) do nothing;
  end if;
end;
$$;