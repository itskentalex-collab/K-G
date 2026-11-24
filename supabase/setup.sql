-- PROJECT KLIE — full cloud archive setup
-- Run in Supabase Dashboard > SQL Editor.
-- Replace the placeholder with the SAME long random owner key used on both devices.
-- Do not commit the real key into GitHub.

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.klie_private_config (
  id boolean primary key default true check (id),
  owner_key_hash text not null
);
alter table public.klie_private_config enable row level security;
revoke all on public.klie_private_config from anon, authenticated;

insert into public.klie_private_config(id,owner_key_hash)
values (true, encode(extensions.digest('REPLACE_WITH_A_LONG_RANDOM_OWNER_KEY','sha256'),'hex'))
on conflict (id) do update set owner_key_hash=excluded.owner_key_hash;

create table if not exists public.klie_shared_state (
  id boolean primary key default true check (id),
  data jsonb not null default '{}'::jsonb,
  media text[] not null default '{}',
  updated_at timestamptz not null default now()
);
alter table public.klie_shared_state enable row level security;
drop policy if exists "Anyone can read KLIE shared archive" on public.klie_shared_state;
create policy "Anyone can read KLIE shared archive" on public.klie_shared_state
  for select to anon, authenticated using (true);
revoke insert, update, delete on public.klie_shared_state from anon, authenticated;
grant select on public.klie_shared_state to anon, authenticated;

create or replace function public.klie_check_owner_key(p_owner_key text)
returns boolean language plpgsql security definer set search_path=public,extensions as $$
declare saved_hash text;
begin
  select owner_key_hash into saved_hash from public.klie_private_config where id=true;
  return saved_hash is not null and encode(extensions.digest(coalesce(p_owner_key,''),'sha256'),'hex')=saved_hash;
end; $$;

create or replace function public.klie_save_archive(p_owner_key text,p_data jsonb,p_media text[])
returns void language plpgsql security definer set search_path=public,extensions as $$
declare saved_hash text;
begin
  select owner_key_hash into saved_hash from public.klie_private_config where id=true;
  if saved_hash is null or encode(extensions.digest(coalesce(p_owner_key,''),'sha256'),'hex') <> saved_hash then
    raise exception 'Invalid owner key';
  end if;
  insert into public.klie_shared_state(id,data,media,updated_at)
  values(true,coalesce(p_data,'{}'::jsonb),coalesce(p_media,'{}'::text[]),now())
  on conflict(id) do update set data=excluded.data,media=excluded.media,updated_at=now();
end; $$;
revoke all on function public.klie_check_owner_key(text) from public;
revoke all on function public.klie_save_archive(text,jsonb,text[]) from public;
grant execute on function public.klie_check_owner_key(text) to anon,authenticated;
grant execute on function public.klie_save_archive(text,jsonb,text[]) to anon,authenticated;

do $$ begin
  alter publication supabase_realtime add table public.klie_shared_state;
exception when duplicate_object then null; when undefined_object then null; end $$;

-- Public read bucket: images are viewable by anyone who can access the website.
insert into storage.buckets(id,name,public) values('klie-media','klie-media',true)
on conflict (id) do update set public=true;
drop policy if exists "Public can view KLIE media" on storage.objects;
create policy "Public can view KLIE media" on storage.objects for select to anon,authenticated
using (bucket_id='klie-media');
