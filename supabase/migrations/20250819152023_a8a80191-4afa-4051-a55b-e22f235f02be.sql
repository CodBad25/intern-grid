
-- 1) Fonction pour garantir la présence d’un profil pour un utilisateur donné
create or replace function public.ensure_profile_exists(_user_id uuid)
returns void
language plpgsql
security definer
set search_path to 'public','auth'
as $$
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

-- 2) Backfill: créer des profils manquants pour les utilisateurs existants
insert into public.profiles (user_id, display_name, role)
select 
  u.id,
  coalesce(u.raw_user_meta_data->>'display_name', u.email) as display_name,
  coalesce(u.raw_user_meta_data->>'role', 'stagiaire') as role
from auth.users u
left join public.profiles p on p.user_id = u.id
where p.user_id is null;
