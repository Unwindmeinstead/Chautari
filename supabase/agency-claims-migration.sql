-- Agency claim + invite flow for invite-only agency onboarding

create table if not exists public.agency_claims (
  id uuid primary key default gen_random_uuid(),
  contact_name text not null,
  email text not null,
  phone text,
  agency_name text not null,
  notes text,
  status text not null default 'submitted' check (status in ('submitted','reviewing','invited','rejected','approved')),
  agency_id uuid references public.agencies(id) on delete set null,
  invited_role text check (invited_role in ('owner','admin','staff')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists agency_claims_status_idx on public.agency_claims(status, created_at desc);
create index if not exists agency_claims_email_idx on public.agency_claims(email);

create table if not exists public.agency_invites (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  claim_id uuid references public.agency_claims(id) on delete set null,
  email text not null,
  role text not null check (role in ('owner','admin','staff')),
  invited_by uuid references auth.users(id) on delete set null,
  status text not null default 'sent' check (status in ('sent','accepted','expired','revoked')),
  sent_at timestamptz not null default now(),
  accepted_at timestamptz,
  accepted_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists agency_invites_unique_open_invite
  on public.agency_invites(agency_id, email, role, status)
  where status = 'sent';

create index if not exists agency_invites_email_idx on public.agency_invites(email, created_at desc);

alter table public.agency_claims enable row level security;
alter table public.agency_invites enable row level security;

-- Public users can submit claims (no login required)
drop policy if exists "public_submit_claims" on public.agency_claims;
create policy "public_submit_claims"
  on public.agency_claims
  for insert
  to anon, authenticated
  with check (true);

-- Admins can view/update claims + invites
-- relies on public.is_chautari_admin() existing in your consolidated migrations
drop policy if exists "admins_manage_claims" on public.agency_claims;
create policy "admins_manage_claims"
  on public.agency_claims
  for all
  to authenticated
  using (public.is_chautari_admin())
  with check (public.is_chautari_admin());

drop policy if exists "admins_manage_invites" on public.agency_invites;
create policy "admins_manage_invites"
  on public.agency_invites
  for all
  to authenticated
  using (public.is_chautari_admin())
  with check (public.is_chautari_admin());

create or replace function public.set_updated_at_timestamp()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists agency_claims_set_updated_at on public.agency_claims;
create trigger agency_claims_set_updated_at
before update on public.agency_claims
for each row execute function public.set_updated_at_timestamp();

drop trigger if exists agency_invites_set_updated_at on public.agency_invites;
create trigger agency_invites_set_updated_at
before update on public.agency_invites
for each row execute function public.set_updated_at_timestamp();
