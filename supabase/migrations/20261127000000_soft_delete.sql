alter table public.trees add column if not exists deleted_by uuid references auth.users(id) on delete set null;
alter table public.tree_memberships add column if not exists deleted_by uuid references auth.users(id) on delete set null;
alter table public.tree_invitations add column if not exists deleted_by uuid references auth.users(id) on delete set null;
alter table public.persons add column if not exists deleted_by uuid references auth.users(id) on delete set null;
alter table public.relationships add column if not exists deleted_by uuid references auth.users(id) on delete set null;
alter table public.events add column if not exists deleted_by uuid references auth.users(id) on delete set null;
alter table public.photos add column if not exists deleted_by uuid references auth.users(id) on delete set null;
alter table public.audit_log add column if not exists deleted_at bigint;
alter table public.audit_log add column if not exists deleted_by uuid references auth.users(id) on delete set null;

create or replace function public.enforce_soft_delete_actor()
returns trigger
language plpgsql
as $$
begin
  if new.deleted_at is null then
    new.deleted_by := null;
  elsif new.deleted_by is null then
    raise exception 'deleted_by is required when deleted_at is set';
  end if;
  return new;
end;
$$;

create or replace function public.has_tree_write(p_tree_id uuid, p_user_id uuid)
returns boolean language sql stable as $$
  select exists (
    select 1
    from public.tree_memberships m
    join public.trees t on t.id = m.tree_id
    where m.tree_id = p_tree_id
      and m.user_id = p_user_id
      and m.deleted_at is null
      and t.deleted_at is null
      and m.role in ('owner','admin','editor')
  );
$$;

create or replace function public.has_tree_read(p_tree_id uuid, p_user_id uuid)
returns boolean language sql stable as $$
  select exists (
    select 1
    from public.tree_memberships m
    join public.trees t on t.id = m.tree_id
    where m.tree_id = p_tree_id
      and m.user_id = p_user_id
      and m.deleted_at is null
      and t.deleted_at is null
  );
$$;

create trigger trees_soft_delete_actor
  before insert or update on public.trees
  for each row execute function public.enforce_soft_delete_actor();
create trigger memberships_soft_delete_actor
  before insert or update on public.tree_memberships
  for each row execute function public.enforce_soft_delete_actor();
create trigger invitations_soft_delete_actor
  before insert or update on public.tree_invitations
  for each row execute function public.enforce_soft_delete_actor();
create trigger persons_soft_delete_actor
  before insert or update on public.persons
  for each row execute function public.enforce_soft_delete_actor();
create trigger relationships_soft_delete_actor
  before insert or update on public.relationships
  for each row execute function public.enforce_soft_delete_actor();
create trigger events_soft_delete_actor
  before insert or update on public.events
  for each row execute function public.enforce_soft_delete_actor();
create trigger photos_soft_delete_actor
  before insert or update on public.photos
  for each row execute function public.enforce_soft_delete_actor();
create trigger audit_log_soft_delete_actor
  before insert or update on public.audit_log
  for each row execute function public.enforce_soft_delete_actor();

drop policy if exists "trees_delete" on public.trees;
drop policy if exists "tm_delete" on public.tree_memberships;
drop policy if exists "ti_delete" on public.tree_invitations;
drop policy if exists "persons_delete" on public.persons;
drop policy if exists "rels_delete" on public.relationships;
drop policy if exists "events_delete" on public.events;
drop policy if exists "photos_delete" on public.photos;

create policy "trees_delete_denied" on public.trees for delete using (false);
create policy "tm_delete_denied" on public.tree_memberships for delete using (false);
create policy "ti_delete_denied" on public.tree_invitations for delete using (false);
create policy "persons_delete_denied" on public.persons for delete using (false);
create policy "rels_delete_denied" on public.relationships for delete using (false);
create policy "events_delete_denied" on public.events for delete using (false);
create policy "photos_delete_denied" on public.photos for delete using (false);

drop policy if exists "trees_select" on public.trees;
create policy "trees_select" on public.trees for select
  using (deleted_at is null and (public.has_tree_read(id, auth.uid()) or owner_id = auth.uid()));
