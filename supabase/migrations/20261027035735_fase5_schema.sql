-- Fase 5: esquema PostgreSQL + RLS + processed_operations

create extension if not exists "pgcrypto";

create table if not exists public.trees (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at bigint not null default (extract(epoch from now()) * 1000)::bigint,
  updated_at bigint not null default (extract(epoch from now()) * 1000)::bigint,
  server_version integer not null default 0,
  deleted_at bigint
);

create table if not exists public.tree_memberships (
  id uuid primary key default gen_random_uuid(),
  tree_id uuid not null references public.trees(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner','admin','editor','viewer','commenter')),
  invited_by uuid references auth.users(id),
  accepted_at bigint,
  joined_at bigint,
  created_at bigint not null default (extract(epoch from now()) * 1000)::bigint,
  updated_at bigint not null default (extract(epoch from now()) * 1000)::bigint,
  server_version integer not null default 0,
  deleted_at bigint,
  unique (tree_id, user_id)
);

create table if not exists public.tree_invitations (
  id uuid primary key default gen_random_uuid(),
  tree_id uuid not null references public.trees(id) on delete cascade,
  email text,
  invited_email text,
  role text not null check (role in ('owner','admin','editor','viewer','commenter')),
  token_hash text not null unique,
  expires_at bigint not null,
  accepted boolean default false,
  accepted_at bigint,
  accepted_by uuid references auth.users(id),
  revoked_at bigint,
  created_at bigint not null default (extract(epoch from now()) * 1000)::bigint,
  updated_at bigint not null default (extract(epoch from now()) * 1000)::bigint,
  server_version integer not null default 0,
  deleted_at bigint
);

create table if not exists public.persons (
  id uuid primary key default gen_random_uuid(),
  tree_id uuid not null references public.trees(id) on delete cascade,
  first_name text not null,
  last_name text,
  sex text check (sex in ('male','female','other','unknown')),
  birth_date jsonb,
  death_date jsonb,
  life_status text not null check (life_status in ('alive','deceased','unknown')),
  birthplace jsonb,
  death_place jsonb,
  biography text,
  notes text,
  generation integer,
  created_at bigint not null default (extract(epoch from now()) * 1000)::bigint,
  updated_at bigint not null default (extract(epoch from now()) * 1000)::bigint,
  server_version integer not null default 0,
  deleted_at bigint
);

create table if not exists public.relationships (
  id uuid primary key default gen_random_uuid(),
  tree_id uuid not null references public.trees(id) on delete cascade,
  person_id uuid references public.persons(id) on delete set null,
  relative_id uuid references public.persons(id) on delete set null,
  person1_id uuid references public.persons(id) on delete set null,
  person2_id uuid references public.persons(id) on delete set null,
  type text not null,
  degree integer,
  start_date jsonb,
  end_date jsonb,
  created_at bigint not null default (extract(epoch from now()) * 1000)::bigint,
  updated_at bigint not null default (extract(epoch from now()) * 1000)::bigint,
  server_version integer not null default 0,
  deleted_at bigint
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  tree_id uuid not null references public.trees(id) on delete cascade,
  person_id uuid references public.persons(id) on delete set null,
  person_ids uuid[],
  type text not null,
  title text,
  date jsonb,
  place jsonb,
  description text,
  created_at bigint not null default (extract(epoch from now()) * 1000)::bigint,
  updated_at bigint not null default (extract(epoch from now()) * 1000)::bigint,
  server_version integer not null default 0,
  deleted_at bigint
);

create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  tree_id uuid not null references public.trees(id) on delete cascade,
  person_id uuid references public.persons(id) on delete set null,
  event_id uuid references public.events(id) on delete set null,
  url text,
  thumbnail_url text,
  r2_key text unique,
  kind text check (kind in ('original','optimized','thumbnail')),
  width integer,
  height integer,
  mime_type text,
  size_bytes bigint,
  size bigint,
  is_primary boolean default false,
  is_main boolean default false,
  captured_at bigint,
  uploaded_at bigint,
  description text,
  exif jsonb,
  created_at bigint not null default (extract(epoch from now()) * 1000)::bigint,
  updated_at bigint not null default (extract(epoch from now()) * 1000)::bigint,
  server_version integer not null default 0,
  deleted_at bigint
);

create table if not exists public.processed_operations (
  operation_id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  entity_type text not null,
  entity_id uuid not null,
  operation_type text not null check (operation_type in ('create','update','delete')),
  result_status text not null,
  result_server_version integer,
  processed_at bigint not null default (extract(epoch from now()) * 1000)::bigint
);

create index if not exists idx_person_tree_id on public.persons(tree_id);
create index if not exists idx_relationship_tree on public.relationships(tree_id);
create index if not exists idx_event_tree on public.events(tree_id);
create index if not exists idx_photo_tree on public.photos(tree_id);
create index if not exists idx_photo_person on public.photos(person_id);
create index if not exists idx_tree_membership_tree on public.tree_memberships(tree_id);
create index if not exists idx_tree_membership_user on public.tree_memberships(user_id);
create index if not exists idx_tree_invitation_tree on public.tree_invitations(tree_id);
create index if not exists idx_tree_invitation_token_hash on public.tree_invitations(token_hash);
create index if not exists idx_processed_ops_user on public.processed_operations(user_id);
create index if not exists idx_processed_ops_entity on public.processed_operations(entity_type, entity_id);

alter table public.trees enable row level security;
alter table public.tree_memberships enable row level security;
alter table public.tree_invitations enable row level security;
alter table public.persons enable row level security;
alter table public.relationships enable row level security;
alter table public.events enable row level security;
alter table public.photos enable row level security;
alter table public.processed_operations enable row level security;

create or replace function public.has_tree_write(p_tree_id uuid, p_user_id uuid)
returns boolean language sql stable as $$
  select exists (
    select 1 from public.tree_memberships m
    where m.tree_id = p_tree_id and m.user_id = p_user_id
      and m.deleted_at is null
      and m.role in ('owner','admin','editor')
  );
$$;

create or replace function public.has_tree_read(p_tree_id uuid, p_user_id uuid)
returns boolean language sql stable as $$
  select exists (
    select 1 from public.tree_memberships m
    where m.tree_id = p_tree_id and m.user_id = p_user_id
      and m.deleted_at is null
  );
$$;

create policy "trees_select" on public.trees for select
  using (public.has_tree_read(id, auth.uid()) or owner_id = auth.uid());
create policy "trees_insert" on public.trees for insert
  with check (owner_id = auth.uid());
create policy "trees_update" on public.trees for update
  using (public.has_tree_write(id, auth.uid()));
create policy "trees_delete" on public.trees for delete
  using (owner_id = auth.uid());

create policy "tm_select" on public.tree_memberships for select
  using (user_id = auth.uid() or public.has_tree_read(tree_id, auth.uid()));
create policy "tm_insert" on public.tree_memberships for insert
  with check (public.has_tree_write(tree_id, auth.uid()) or not exists (select 1 from public.tree_memberships m where m.tree_id = tree_id));
create policy "tm_update" on public.tree_memberships for update
  using (public.has_tree_write(tree_id, auth.uid()));
create policy "tm_delete" on public.tree_memberships for delete
  using (public.has_tree_write(tree_id, auth.uid()));

create policy "ti_select" on public.tree_invitations for select
  using (public.has_tree_read(tree_id, auth.uid()));
create policy "ti_insert" on public.tree_invitations for insert
  with check (public.has_tree_write(tree_id, auth.uid()));
create policy "ti_update" on public.tree_invitations for update
  using (public.has_tree_write(tree_id, auth.uid()));
create policy "ti_delete" on public.tree_invitations for delete
  using (public.has_tree_write(tree_id, auth.uid()));

create policy "persons_select" on public.persons for select
  using (public.has_tree_read(tree_id, auth.uid()));
create policy "persons_insert" on public.persons for insert
  with check (public.has_tree_write(tree_id, auth.uid()));
create policy "persons_update" on public.persons for update
  using (public.has_tree_write(tree_id, auth.uid()));
create policy "persons_delete" on public.persons for delete
  using (public.has_tree_write(tree_id, auth.uid()));

create policy "rels_select" on public.relationships for select
  using (public.has_tree_read(tree_id, auth.uid()));
create policy "rels_insert" on public.relationships for insert
  with check (public.has_tree_write(tree_id, auth.uid()));
create policy "rels_update" on public.relationships for update
  using (public.has_tree_write(tree_id, auth.uid()));
create policy "rels_delete" on public.relationships for delete
  using (public.has_tree_write(tree_id, auth.uid()));

create policy "events_select" on public.events for select
  using (public.has_tree_read(tree_id, auth.uid()));
create policy "events_insert" on public.events for insert
  with check (public.has_tree_write(tree_id, auth.uid()));
create policy "events_update" on public.events for update
  using (public.has_tree_write(tree_id, auth.uid()));
create policy "events_delete" on public.events for delete
  using (public.has_tree_write(tree_id, auth.uid()));

create policy "photos_select" on public.photos for select
  using (public.has_tree_read(tree_id, auth.uid()));
create policy "photos_insert" on public.photos for insert
  with check (public.has_tree_write(tree_id, auth.uid()));
create policy "photos_update" on public.photos for update
  using (public.has_tree_write(tree_id, auth.uid()));
create policy "photos_delete" on public.photos for delete
  using (public.has_tree_write(tree_id, auth.uid()));

create policy "po_no_access" on public.processed_operations for all
  using (false) with check (false);

