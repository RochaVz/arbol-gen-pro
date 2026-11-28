create table if not exists public.change_log (
  id uuid primary key,
  tree_id uuid references public.trees(id) on delete set null,
  entity_type text not null,
  entity_id uuid not null,
  operation text not null check (operation in ('create','update','delete')),
  timestamp bigint not null,
  user_id uuid not null references auth.users(id) on delete restrict,
  payload jsonb,
  created_at bigint not null default (extract(epoch from now()) * 1000)::bigint
);

create index if not exists idx_change_log_tree_timestamp
  on public.change_log(tree_id, timestamp desc);
create index if not exists idx_change_log_entity
  on public.change_log(entity_type, entity_id, timestamp desc);
create index if not exists idx_change_log_user
  on public.change_log(user_id, timestamp desc);

alter table public.change_log enable row level security;

drop policy if exists "change_log_select" on public.change_log;
create policy "change_log_select" on public.change_log for select
  using (user_id = auth.uid() or public.has_tree_read(tree_id, auth.uid()));
