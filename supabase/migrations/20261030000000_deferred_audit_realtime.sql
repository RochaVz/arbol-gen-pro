-- Fase diferida D6: auditoria de cambios (local + servidor).
-- Tabla de auditoria con RLS: solo lectura para miembros del arbol.

create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  tree_id uuid references public.trees(id) on delete cascade,
  entity_type text not null,
  entity_id uuid,
  action text not null check (action in ('create','update','delete','share','role_change','invite','revoke')),
  actor_id uuid references auth.users(id) on delete set null,
  payload jsonb,
  created_at bigint not null default (extract(epoch from now()) * 1000)::bigint
);

alter table public.audit_log enable row level security;

create policy "audit_select" on public.audit_log for select
  using (tree_id is null or public.has_tree_read(tree_id, auth.uid()));
create policy "audit_insert" on public.audit_log for insert
  with check (actor_id = auth.uid());

-- Realtime (Fase diferida D4): publicar cambios de entidades y auditoria.
alter publication supabase_realtime add table public.persons;
alter publication supabase_realtime add table public.relationships;
alter publication supabase_realtime add table public.events;
alter publication supabase_realtime add table public.photos;
alter publication supabase_realtime add table public.trees;
alter publication supabase_realtime add table public.audit_log;
