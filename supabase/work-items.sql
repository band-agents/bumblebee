-- ============================================================
-- Bumblebee — work_items
--
-- The generic work table (tasks, quotations, sales/purchase orders,
-- maintenance, stock movements…). It lived in schema-clean-install.sql but
-- was missing from schema.sql, so a fresh install broke at
-- users-access-control.sql, which extends it. Run right after schema.sql.
--
-- The checks match the unions in src/lib/database.types.ts — the app writes
-- all of these values, and the clean-install checks rejected most of them.
-- Idempotent.
-- ============================================================

create table if not exists work_items (
  id              uuid        primary key default uuid_generate_v4(),
  workspace_id    uuid        not null references workspaces(id) on delete cascade,
  title_en        text        not null,
  title_ar        text,
  type            text        not null default 'task'
                              check (type in ('task','project','milestone','action','initiative','ticket','request',
                                              'purchase_request','purchase_order','production_order','stock_movement',
                                              'maintenance','quotation','sales_order')),
  status          text        not null default 'todo'
                              check (status in ('backlog','planned','todo','in_progress','review','done','blocked','cancelled',
                                                'draft','submitted','approved','rejected','ordered','sent',
                                                'partially_received','received','expired','converted')),
  priority        text        not null default 'medium'
                              check (priority in ('critical','urgent','high','medium','low')),
  assignee_id     uuid                 references people(id) on delete set null,
  parent_id       uuid                 references work_items(id) on delete cascade,
  organization_id uuid                 references organizations(id) on delete set null,
  due_date        date,
  progress        integer     not null default 0 check (progress between 0 and 100),
  total_amount    numeric,
  tags            text[]      not null default '{}',
  metadata        jsonb       not null default '{}',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists work_items_workspace_idx on work_items(workspace_id);
create index if not exists work_items_status_idx    on work_items(workspace_id, status);
create index if not exists work_items_type_idx      on work_items(workspace_id, type);
create index if not exists work_items_assignee_idx  on work_items(assignee_id);
create index if not exists work_items_parent_idx    on work_items(parent_id);

alter table work_items enable row level security;

drop policy if exists "workspace_select" on work_items;
drop policy if exists "workspace_insert" on work_items;
drop policy if exists "workspace_update" on work_items;
drop policy if exists "workspace_delete" on work_items;

create policy "workspace_select" on work_items for select using (is_workspace_member(workspace_id));
create policy "workspace_insert" on work_items for insert with check (is_workspace_member(workspace_id));
create policy "workspace_update" on work_items for update using (is_workspace_member(workspace_id));
create policy "workspace_delete" on work_items for delete using (is_workspace_admin(workspace_id));

drop trigger if exists set_updated_at on work_items;
create trigger set_updated_at before update on work_items
  for each row execute function update_updated_at();

grant select, insert, update, delete on work_items to authenticated;
