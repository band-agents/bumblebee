-- ═══════════════════════════════════════════════════════════
-- Bumblebee — Access control v2
--
--   1. A member only reaches the modules they were given. Custom access
--      (workspace_members.permissions) REPLACES the role template; when it is
--      empty the role template in access_role_templates applies. Owners and admins
--      reach everything. The same list drives the app's sidebar
--      (src/lib/access.ts), and here it guards the data itself.
--   2. Suspended members can't read anything, are signed out of every device
--      (sessions and refresh tokens revoked) and can't sign in again until
--      re-activated.
--   3. remove_workspace_member deletes a login for good: membership gone,
--      sessions revoked, sign-in blocked forever, username freed. Records they
--      created stay, still attributed to them.
--
-- Run after documents.sql. Idempotent: safe to run again.
-- ═══════════════════════════════════════════════════════════

-- ─── 1. Role templates (mirror of ROLE_TEMPLATES in src/lib/permissions.ts) ──
-- Only the modules each role opens, with the actions it has there.
-- BEGIN ROLE TEMPLATES
-- Generated from src/lib/permissions.ts by scripts/gen-role-templates-sql.mjs — don't edit by hand.
create table if not exists access_role_templates (
  role        text primary key,
  permissions jsonb not null
);
alter table access_role_templates enable row level security;
drop policy if exists "access_role_templates_read" on access_role_templates;
create policy "access_role_templates_read" on access_role_templates for select to authenticated using (true);

insert into access_role_templates (role, permissions) values
  ('general_manager', '{"customers":["view","export"],"contacts":["view","export"],"quotations":["view","export","approve"],"orders":["view","export","approve","release"],"pos":["view","export"],"products":["view","export"],"bom":["view"],"production":["view","release"],"stages":["view"],"quality":["view","approve"],"inventory":["view","export","approve"],"purchasing":["view","export","approve","release"],"delivery":["view"],"finance":["view","export","approve","release"],"hr":["view","export","approve"],"reports":["view","export"],"analytics":["view","export"],"settings":["view"],"users":["view"]}'),
  ('viewer', '{"customers":["view"],"contacts":["view"],"quotations":["view"],"orders":["view"],"pos":["view"],"products":["view"],"bom":["view"],"production":["view"],"stages":["view"],"quality":["view"],"inventory":["view"],"purchasing":["view"],"delivery":["view"],"finance":["view"],"hr":["view"],"reports":["view"],"analytics":["view"],"settings":["view"],"users":["view"]}'),
  ('sales_manager', '{"customers":["view","create","edit","delete","export","import","assign"],"contacts":["view","create","edit","delete","export"],"quotations":["view","create","edit","delete","export","approve"],"orders":["view","create","edit","export","approve","release"],"pos":["view","export"],"products":["view"],"delivery":["view"],"reports":["view","export"],"analytics":["view"]}'),
  ('sales', '{"customers":["view","create","edit","export"],"contacts":["view","create","edit","export"],"quotations":["view","create","edit","export","approve"],"orders":["view","create","edit","export"],"pos":["view","create","edit"],"products":["view"]}'),
  ('store_manager', '{"pos":["view","create","edit","export"],"customers":["view","create","edit","export"],"contacts":["view","create","edit"],"orders":["view","create","edit"],"products":["view"],"inventory":["view","create","edit"],"reports":["view"]}'),
  ('cashier', '{"pos":["view","create"],"customers":["view","create"],"products":["view"]}'),
  ('ecommerce', '{"orders":["view","create","edit","export"],"products":["view","create","edit","export","import"],"customers":["view","create","edit","export"],"inventory":["view"],"delivery":["view"],"settings":["view"],"reports":["view"],"analytics":["view"]}'),
  ('customer_service', '{"customers":["view","create","edit"],"contacts":["view","create","edit"],"orders":["view"],"quotations":["view"],"delivery":["view"],"products":["view"]}'),
  ('production_manager', '{"products":["view","create","edit","export"],"bom":["view","create","edit"],"production":["view","create","edit","assign","release"],"stages":["view","create","edit","assign"],"quality":["view","create","edit","approve"],"inventory":["view","export"],"purchasing":["view","create"],"delivery":["view","assign"],"orders":["view"],"reports":["view","export"]}'),
  ('production_purchasing', '{"production":["view","create","edit","assign","release"],"stages":["view","create","edit","assign"],"bom":["view","create","edit"],"products":["view","edit"],"quality":["view"],"purchasing":["view","create","edit","export","approve","release"],"inventory":["view","export"],"contacts":["view","create","edit"],"orders":["view"],"reports":["view","export"]}'),
  ('production_planner', '{"production":["view","create","edit","assign"],"stages":["view","edit","assign"],"bom":["view"],"products":["view"],"inventory":["view"],"orders":["view"],"purchasing":["view","create"]}'),
  ('line_supervisor', '{"production":["view"],"stages":["view","edit","assign"],"quality":["view","create"]}'),
  ('cutting_master', '{"production":["view"],"stages":["view","edit"],"bom":["view"],"products":["view"],"inventory":["view"]}'),
  ('designer', '{"products":["view","create","edit","export","import"],"bom":["view","create","edit"],"production":["view"],"inventory":["view"]}'),
  ('quality_manager', '{"quality":["view","create","edit","approve"],"production":["view"],"stages":["view"],"products":["view"],"purchasing":["view"],"reports":["view","export"]}'),
  ('qc', '{"quality":["view","create","edit","approve"],"production":["view"],"stages":["view"]}'),
  ('warehouse', '{"inventory":["view","create","edit","export","import","approve"],"purchasing":["view","create","edit"],"products":["view"],"delivery":["view"],"reports":["view"]}'),
  ('storekeeper', '{"inventory":["view","create","edit"]}'),
  ('receiving_clerk', '{"purchasing":["view","edit"],"inventory":["view","create","edit"]}'),
  ('purchasing_manager', '{"purchasing":["view","create","edit","delete","export","approve","release"],"inventory":["view","export"],"contacts":["view","create","edit","export"],"production":["view"],"reports":["view","export"],"analytics":["view"]}'),
  ('purchasing', '{"purchasing":["view","create","edit","export","approve"],"inventory":["view","export"],"contacts":["view","create","edit"]}'),
  ('import_coordinator', '{"purchasing":["view","edit","export"],"inventory":["view"],"contacts":["view","create","edit"]}'),
  ('delivery', '{"delivery":["view","create","edit","assign"],"production":["view"],"orders":["view"]}'),
  ('driver', '{"delivery":["view","edit"]}'),
  ('finance', '{"finance":["view","create","edit","export","delete","approve","release"],"orders":["view","approve","export"],"quotations":["view","approve"],"purchasing":["view","approve","export"],"pos":["view","export"],"customers":["view","export"],"reports":["view","export"],"analytics":["view","export"]}'),
  ('accountant', '{"finance":["view","create","edit","export"],"orders":["view"],"pos":["view","export"],"purchasing":["view"],"customers":["view"],"reports":["view"]}'),
  ('hr_manager', '{"hr":["view","create","edit","delete","export","approve"],"users":["view"],"reports":["view","export"]}'),
  ('hr_officer', '{"hr":["view","create","edit"]}'),
  ('data_entry', '{"customers":["view","create","edit"],"contacts":["view","create","edit"],"products":["view","create","edit"],"inventory":["view","create","edit"]}')
on conflict (role) do update set permissions = excluded.permissions;

delete from access_role_templates where role not in ('general_manager', 'viewer', 'sales_manager', 'sales', 'store_manager', 'cashier', 'ecommerce', 'customer_service', 'production_manager', 'production_purchasing', 'production_planner', 'line_supervisor', 'cutting_master', 'designer', 'quality_manager', 'qc', 'warehouse', 'storekeeper', 'receiving_clerk', 'purchasing_manager', 'purchasing', 'import_coordinator', 'delivery', 'driver', 'finance', 'accountant', 'hr_manager', 'hr_officer', 'data_entry');
-- END ROLE TEMPLATES

-- ─── 1b. Every role template is an allowed role ───────────
-- BEGIN ROLE LIST
alter table workspace_members drop constraint if exists workspace_members_role_check;
alter table workspace_members add constraint workspace_members_role_check
  check (role in ('owner', 'admin', 'manager', 'member', 'general_manager', 'viewer', 'sales_manager', 'sales', 'store_manager', 'cashier', 'ecommerce', 'customer_service', 'production_manager', 'production_purchasing', 'production_planner', 'line_supervisor', 'cutting_master', 'designer', 'quality_manager', 'qc', 'warehouse', 'storekeeper', 'receiving_clerk', 'purchasing_manager', 'purchasing', 'import_coordinator', 'delivery', 'driver', 'finance', 'accountant', 'hr_manager', 'hr_officer', 'data_entry'));
-- END ROLE LIST

-- ─── 2. Membership helpers are status-aware ───────────────
-- Every data policy goes through these, so a suspended member reads nothing.

create or replace function is_workspace_member(ws_id uuid)
returns boolean language sql security definer stable
set search_path = public
as $$
  select exists (
    select 1 from workspace_members
    where workspace_id = ws_id and user_id = auth.uid()
      and coalesce(status, 'active') = 'active'
  );
$$;

create or replace function is_workspace_admin(ws_id uuid)
returns boolean language sql security definer stable
set search_path = public
as $$
  select exists (
    select 1 from workspace_members
    where workspace_id = ws_id and user_id = auth.uid()
      and role in ('owner', 'admin')
      and coalesce(status, 'active') = 'active'
  );
$$;

-- ─── 3. Module check ──────────────────────────────────────
-- action 'view' = the module is open to them.
-- action 'work' = they can add/change things there (any action beyond view/export).
-- Any other action name ('create', 'approve'…) must be listed exactly.

create or replace function member_can(ws_id uuid, modules text[], action text default 'view')
returns boolean language plpgsql security definer stable
set search_path = public
as $$
declare
  v_role  text;
  v_perms jsonb;
  m       text;
begin
  if auth.uid() is null then
    return false;
  end if;
  select wm.role, wm.permissions into v_role, v_perms
    from workspace_members wm
   where wm.workspace_id = ws_id and wm.user_id = auth.uid()
     and coalesce(wm.status, 'active') = 'active';
  if not found then
    return false;
  end if;
  if v_role in ('owner', 'admin') then
    return true;
  end if;
  -- Custom access replaces the template when it lists any module.
  if v_perms is null or jsonb_typeof(v_perms) <> 'object'
     or not exists (select 1 from jsonb_each(v_perms) e where jsonb_typeof(e.value) = 'array' and jsonb_array_length(e.value) > 0) then
    select rt.permissions into v_perms from access_role_templates rt where rt.role = v_role;
  end if;
  if v_perms is null then
    return false;
  end if;
  foreach m in array modules loop
    if jsonb_typeof(v_perms -> m) <> 'array' then
      continue;
    end if;
    if action = 'work' then
      -- anything beyond reading
      if exists (select 1 from jsonb_array_elements_text(v_perms -> m) a where a not in ('view', 'export')) then
        return true;
      end if;
    elsif action = 'update' then
      -- changing an existing record: correcting it, approving, releasing or assigning it
      if exists (select 1 from jsonb_array_elements_text(v_perms -> m) a where a in ('edit', 'approve', 'release', 'assign')) then
        return true;
      end if;
    elsif (v_perms -> m) ? action then
      return true;
    end if;
  end loop;
  return false;
end;
$$;

grant execute on function member_can(uuid, text[], text) to authenticated;

-- ─── 4. Row-level rules for every workspace table ─────────
-- Every table with a workspace_id gets the same four rules, replacing the mix
-- of older ones (several ignored suspension):
--   read    → 'view' in the module
--   add     → 'create'
--   change  → 'edit', 'approve', 'release' or 'assign'
--   delete  → 'delete' (and owner/admin only for the shared core tables)
-- Tables with no module ("shared": companies, branches, tasks, notes, the
-- activity feed…) are open to every active member, because many modules
-- pick from them.

create or replace function _access_v2_expr(p_mods text, p_action text)
returns text language sql immutable as $$
  select case when p_mods is null then 'is_workspace_member(workspace_id)'
              else format('member_can(workspace_id, %s, %L)', p_mods, p_action) end;
$$;

create or replace function _access_v2_apply(p_table text, p_view text, p_create text, p_update text, p_delete text, p_writes boolean)
returns void language plpgsql as $$
declare
  pol record;
begin
  if to_regclass('public.' || p_table) is null then
    return;
  end if;
  if not exists (select 1 from information_schema.columns
                  where table_schema = 'public' and table_name = p_table and column_name = 'workspace_id') then
    return;
  end if;
  for pol in select policyname from pg_policies where schemaname = 'public' and tablename = p_table loop
    execute format('drop policy %I on %I', pol.policyname, p_table);
  end loop;
  execute format('alter table %I enable row level security', p_table);
  execute format('create policy "access_select" on %I for select using (%s)', p_table, p_view);
  if p_writes then
    execute format('create policy "access_insert" on %I for insert with check (%s)', p_table, p_create);
    execute format('create policy "access_update" on %I for update using (%s) with check (%s)', p_table, p_update, p_update);
  end if;
  execute format('create policy "access_delete" on %I for delete using (%s)', p_table, p_delete);
end;
$$;

do $$
declare
  r record;
  v_mods text;
  v_wmods text;
  v_tpl text;
  v_wtpl text;
  v_view text;
  v_create text;
  v_update text;
  v_delete text;
  v_admin_delete text[] := array[
    'people','organizations','projects','tasks','goals','deals','expenses','resources','notes','meetings',
    'documents','activities','relationships','files','intelligence_events','audit_logs','work_items',
    'invoices','payments','pos_registers','pos_transactions','pos_transaction_items','branch_inventory',
    'crm_customers','crm_timeline_events','crm_tasks','crm_notes','crm_leads','crm_alerts','crm_activity_feed',
    'customer_relationships','customer_ai_summaries','customer_communication_logs','loyalty_accounts'];
  -- Written only through database functions (invoices, receipts): no direct add/change.
  v_function_only text[] := array['invoices','payments'];
  -- Their own rules stay: account tables, per-user tables, the numbering counter.
  v_skip text[] := array['workspaces','workspace_members','workspace_invitations','profiles','saved_reports',
    'notifications','role_templates','access_role_templates','document_sequences'];
begin
  for r in
    select t.table_name as tbl, m.mods, m.write_mods
      from information_schema.tables t
      left join (values
        ('invoices',                    '{finance,orders}', null),
        ('payments',                    '{finance,orders}', null),
        ('expenses',                    '{finance}', null),
        ('pos_transactions',            '{pos,finance}', '{pos}'),
        ('pos_transaction_items',       '{pos,finance}', '{pos}'),
        ('deals',                       '{customers}', null),
        ('crm_customers',               '{customers}', null),
        ('crm_timeline_events',         '{customers}', null),
        ('crm_tasks',                   '{customers}', null),
        ('crm_notes',                   '{customers}', null),
        ('crm_leads',                   '{customers}', null),
        ('crm_alerts',                  '{customers}', null),
        ('crm_activity_feed',           '{customers}', null),
        ('customer_relationships',      '{customers}', null),
        ('customer_ai_summaries',       '{customers}', null),
        ('customer_communication_logs', '{customers}', null),
        ('loyalty_accounts',            '{customers,pos}', null),
        ('loyalty_members',             '{customers,pos}', null),
        ('loyalty_programs',            '{customers}', null),
        ('loyalty_redemptions',         '{customers,pos}', null),
        ('loyalty_rewards',             '{customers,pos}', null),
        ('loyalty_rules',               '{customers}', null),
        ('loyalty_tiers',               '{customers,pos}', null),
        ('loyalty_transactions',        '{customers,pos}', null),
        ('quotations',                  '{quotations}', null),
        ('quotation_items',             '{quotations}', null),
        ('sales_orders',                '{orders}', null),
        ('sales_order_items',           '{orders}', null),
        ('sales_order_payments',        '{orders,finance}', '{orders}'),
        ('products',                    '{products,orders,quotations,pos,production,inventory}', '{products}'),
        ('product_bom',                 '{products,bom,production}', '{products,bom}'),
        ('product_stages',              '{products,production}', '{products,production}'),
        ('production_orders',           '{production,stages,quality,delivery,orders}', '{production,stages}'),
        ('production_stage_log',        '{production,stages,quality}', '{production,stages}'),
        ('cutting_list_items',          '{production,stages}', '{production,stages}'),
        ('cost_entries',                '{production,finance}', null),
        ('material_requirements',       '{production,inventory,purchasing}', '{production,purchasing}'),
        ('qc_inspections',              '{quality,production}', '{quality}'),
        ('qc_defects',                  '{quality,production}', '{quality}'),
        ('deliveries',                  '{delivery,production}', '{delivery}'),
        ('installations',               '{delivery}', null),
        ('design_briefs',               '{products,production}', '{products}'),
        ('design_files',                '{products,production}', '{products}'),
        ('design_comments',             '{products,production}', '{products}'),
        ('site_visits',                 '{products}', null),
        ('measurements',                '{products}', null),
        ('measurement_attachments',     '{products}', null),
        ('stock_movements',             '{inventory,purchasing,production}', '{inventory}'),
        ('employees',                   '{hr}', null),
        ('attendance',                  '{hr}', null),
        ('leave_requests',              '{hr}', null),
        ('shopify_connections',         '{settings}', null),
        ('shopify_entity_map',          '{settings}', null),
        ('shopify_orders',              '{settings,orders}', '{settings}'),
        ('shopify_sync_log',            '{settings}', null),
        ('shopify_sync_runs',           '{settings}', null)
      ) as m(tbl, mods, write_mods) on m.tbl = t.table_name
     where t.table_schema = 'public' and t.table_type = 'BASE TABLE'
       and t.table_name <> all (v_skip)
  loop
    v_mods := case when r.mods is null then null else quote_literal(r.mods) || '::text[]' end;
    -- Reading can come from several modules; adding, changing and deleting only from the module that owns the records.
    v_wmods := case when coalesce(r.write_mods, r.mods) is null then null else quote_literal(coalesce(r.write_mods, r.mods)) || '::text[]' end;
    v_tpl := null;
    v_wtpl := null;

    if r.tbl = 'work_items' then
      v_tpl := $e$(CASE type
        WHEN 'quotation'        THEN member_can(workspace_id, '{quotations,orders}'::text[], '%1$s')
        WHEN 'sales_order'      THEN member_can(workspace_id, '{orders,quotations,finance,production,delivery}'::text[], '%1$s')
        WHEN 'purchase_request' THEN member_can(workspace_id, '{purchasing}'::text[], '%1$s')
        WHEN 'purchase_order'   THEN member_can(workspace_id, '{purchasing}'::text[], '%1$s')
        WHEN 'stock_movement'   THEN member_can(workspace_id, '{inventory,purchasing,production}'::text[], '%1$s')
        WHEN 'maintenance'      THEN member_can(workspace_id, '{inventory}'::text[], '%1$s')
        WHEN 'production_order' THEN member_can(workspace_id, '{production}'::text[], '%1$s')
        ELSE is_workspace_member(workspace_id) END)$e$;
      v_wtpl := $e$(CASE type
        WHEN 'quotation'        THEN member_can(workspace_id, '{quotations}'::text[], '%1$s')
        WHEN 'sales_order'      THEN member_can(workspace_id, '{orders}'::text[], '%1$s')
        WHEN 'purchase_request' THEN member_can(workspace_id, '{purchasing}'::text[], '%1$s')
        WHEN 'purchase_order'   THEN member_can(workspace_id, '{purchasing}'::text[], '%1$s')
        WHEN 'stock_movement'   THEN member_can(workspace_id, '{inventory}'::text[], '%1$s')
        WHEN 'maintenance'      THEN member_can(workspace_id, '{inventory}'::text[], '%1$s')
        WHEN 'production_order' THEN member_can(workspace_id, '{production}'::text[], '%1$s')
        ELSE is_workspace_member(workspace_id) END)$e$;
    elsif r.tbl = 'resources' then
      v_tpl := $e$(CASE WHEN type = 'product'
        THEN member_can(workspace_id, '{products,orders,quotations,pos,production,inventory}'::text[], '%1$s')
        ELSE member_can(workspace_id, '{inventory,purchasing,production,products}'::text[], '%1$s') END)$e$;
      v_wtpl := $e$(CASE WHEN type = 'product'
        THEN member_can(workspace_id, '{products}'::text[], '%1$s')
        ELSE member_can(workspace_id, '{inventory}'::text[], '%1$s') END)$e$;
    end if;

    if v_tpl is not null then
      v_view := format(v_tpl, 'view');
      v_create := format(v_wtpl, 'create');
      v_update := format(v_wtpl, 'update');
      v_delete := format(v_wtpl, 'delete');
    else
      v_view := _access_v2_expr(v_mods, 'view');
      v_create := _access_v2_expr(v_wmods, 'create');
      v_update := _access_v2_expr(v_wmods, 'update');
      v_delete := _access_v2_expr(v_wmods, 'delete');
    end if;

    perform _access_v2_apply(
      r.tbl, v_view, v_create, v_update,
      case when r.tbl = any (v_admin_delete) then 'is_workspace_admin(workspace_id)' else v_delete end,
      not (r.tbl = any (v_function_only))
    );
  end loop;
end $$;

drop function _access_v2_apply(text, text, text, text, text, boolean);
drop function _access_v2_expr(text, text);

-- ─── 5. Money writes need Finance ─────────────────────────
-- Invoices and receipts are issued through SECURITY DEFINER functions, which
-- skip RLS; this trigger still sees who is calling.

create or replace function guard_finance_write()
returns trigger language plpgsql security definer
set search_path = public
as $$
begin
  if auth.uid() is not null and not member_can(new.workspace_id, array['finance'], 'create') then
    raise exception 'Your access doesn''t include Finance, so you can''t issue invoices or receipts' using errcode = '42501';
  end if;
  return new;
end;
$$;

drop trigger if exists guard_finance_write on invoices;
create trigger guard_finance_write before insert on invoices for each row execute function guard_finance_write();
drop trigger if exists guard_finance_write on payments;
create trigger guard_finance_write before insert on payments for each row execute function guard_finance_write();

-- ─── 6. Sign a user out everywhere ────────────────────────

create or replace function _revoke_sessions(p_user_id uuid)
returns void language plpgsql security definer
set search_path = public
as $$
begin
  if to_regclass('auth.refresh_tokens') is not null then
    execute 'delete from auth.refresh_tokens where user_id = $1' using p_user_id::text;
  end if;
  if to_regclass('auth.sessions') is not null then
    execute 'delete from auth.sessions where user_id = $1' using p_user_id;
  end if;
end;
$$;

revoke all on function _revoke_sessions(uuid) from public, anon, authenticated;

-- ─── 7. Change role / status / access (owner, admin) ──────

create or replace function update_workspace_member(
  p_workspace_id uuid, p_user_id uuid, p_role text default null, p_status text default null,
  p_department text default null, p_permissions jsonb default null
)
returns void
language plpgsql security definer
set search_path = public
as $$
declare
  v_caller_role text;
  v_target_role text;
begin
  select role into v_caller_role from workspace_members
   where workspace_id = p_workspace_id and user_id = auth.uid() and coalesce(status, 'active') = 'active';
  select role into v_target_role from workspace_members where workspace_id = p_workspace_id and user_id = p_user_id;
  if coalesce(v_caller_role, '') not in ('owner', 'admin') or v_target_role is null then
    raise exception 'Not allowed' using errcode = '42501';
  end if;
  if p_user_id = auth.uid() and (p_status is not null or p_role is not null or p_permissions is not null) then
    raise exception 'You can''t change your own access' using errcode = '42501';
  end if;
  if v_target_role = 'owner' then
    raise exception 'The owner can''t be changed' using errcode = '42501';
  end if;
  if (coalesce(p_role, '') in ('owner', 'admin') or v_target_role = 'admin') and v_caller_role <> 'owner' then
    raise exception 'Only the owner can grant or change admin access' using errcode = '42501';
  end if;
  if p_status is not null and p_status not in ('active', 'suspended') then
    raise exception 'Unknown status %', p_status using errcode = '22023';
  end if;
  if p_permissions is not null and jsonb_typeof(p_permissions) <> 'object' then
    raise exception 'Access must be a list of modules' using errcode = '22023';
  end if;

  update workspace_members set
    role        = coalesce(p_role, role),
    status      = coalesce(p_status, status),
    department  = coalesce(p_department, department),
    permissions = coalesce(p_permissions, permissions),
    updated_at  = now()
  where workspace_id = p_workspace_id and user_id = p_user_id;

  if p_status = 'suspended' then
    perform _revoke_sessions(p_user_id);
    -- Block sign-in unless they're active somewhere else.
    if not exists (select 1 from workspace_members where user_id = p_user_id and coalesce(status, 'active') = 'active') then
      update auth.users set banned_until = 'infinity', updated_at = now() where id = p_user_id;
    end if;
  elsif p_status = 'active' then
    update auth.users set banned_until = null, updated_at = now() where id = p_user_id;
  end if;
end;
$$;

grant execute on function update_workspace_member(uuid, uuid, text, text, text, jsonb) to authenticated;

-- ─── 8. Remove a login for good ───────────────────────────

create or replace function remove_workspace_member(p_workspace_id uuid, p_user_id uuid)
returns void
language plpgsql security definer
set search_path = public
as $$
declare
  v_caller_role text;
  v_target_role text;
begin
  select role into v_caller_role from workspace_members
   where workspace_id = p_workspace_id and user_id = auth.uid() and coalesce(status, 'active') = 'active';
  select role into v_target_role from workspace_members where workspace_id = p_workspace_id and user_id = p_user_id;
  if coalesce(v_caller_role, '') not in ('owner', 'admin') or v_target_role is null then
    raise exception 'Not allowed' using errcode = '42501';
  end if;
  if p_user_id = auth.uid() then
    raise exception 'You can''t remove yourself' using errcode = '42501';
  end if;
  if v_target_role = 'owner' then
    raise exception 'The owner can''t be removed' using errcode = '42501';
  end if;
  if v_target_role = 'admin' and v_caller_role <> 'owner' then
    raise exception 'Only the owner can remove an admin' using errcode = '42501';
  end if;

  delete from workspace_members where workspace_id = p_workspace_id and user_id = p_user_id;
  perform _revoke_sessions(p_user_id);

  -- Not in any other workspace: close the login itself. The auth row stays so
  -- everything they created keeps its author; the username and email are freed.
  if not exists (select 1 from workspace_members where user_id = p_user_id) then
    update profiles set username = null where id = p_user_id;
    update auth.users
       set banned_until = 'infinity',
           email = 'removed-' || replace(p_user_id::text, '-', '') || '@removed.bumblebee',
           encrypted_password = '',
           raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('removed_at', now(), 'removed_by', auth.uid()),
           updated_at = now()
     where id = p_user_id;
    update auth.identities
       set identity_data = coalesce(identity_data, '{}'::jsonb) || jsonb_build_object('email', 'removed-' || replace(p_user_id::text, '-', '') || '@removed.bumblebee'),
           updated_at = now()
     where user_id = p_user_id;
  end if;
end;
$$;

revoke all on function remove_workspace_member(uuid, uuid) from public, anon;
grant execute on function remove_workspace_member(uuid, uuid) to authenticated;

-- ─── 9. "Am I still allowed in?" — the app asks this every few seconds ──
-- Works even when the member can no longer read workspace_members.

-- With no workspace given, it answers for the member's first workspace.
create or replace function my_access(p_workspace_id uuid default null)
returns jsonb
language sql security definer stable
set search_path = public
as $$
  select coalesce(
    (select jsonb_build_object('workspace_id', workspace_id, 'status', coalesce(status, 'active'),
                               'role', role, 'permissions', coalesce(permissions, '{}'::jsonb))
       from workspace_members
      where user_id = auth.uid() and (p_workspace_id is null or workspace_id = p_workspace_id)
      order by joined_at
      limit 1),
    jsonb_build_object('status', 'removed')
  );
$$;

grant execute on function my_access(uuid) to authenticated;

-- ─── 10. Voiding money documents needs Finance approval ───

create or replace function void_invoice(p_invoice_id uuid, p_reason text)
returns void language plpgsql security definer set search_path = public as $$
declare v_inv invoices%rowtype;
begin
  select * into v_inv from invoices where id = p_invoice_id for update;
  if not found then raise exception 'Invoice not found' using errcode = 'P0002'; end if;
  if not member_can(v_inv.workspace_id, array['finance'], 'approve') then
    raise exception 'Voiding needs Finance approval access' using errcode = '42501';
  end if;
  if coalesce(trim(p_reason), '') = '' then raise exception 'Give a reason for voiding' using errcode = '22023'; end if;
  if exists (select 1 from payments where invoice_id = p_invoice_id and status = 'completed') then
    raise exception 'Void the receipts on % first', v_inv.number using errcode = '22023';
  end if;
  update invoices set status = 'void', void_reason = p_reason, updated_at = now() where id = p_invoice_id;
end;
$$;

create or replace function void_payment(p_payment_id uuid, p_reason text)
returns void language plpgsql security definer set search_path = public as $$
declare v_pay payments%rowtype;
begin
  select * into v_pay from payments where id = p_payment_id for update;
  if not found then raise exception 'Receipt not found' using errcode = 'P0002'; end if;
  if not member_can(v_pay.workspace_id, array['finance'], 'approve') then
    raise exception 'Voiding needs Finance approval access' using errcode = '42501';
  end if;
  if coalesce(trim(p_reason), '') = '' then raise exception 'Give a reason for voiding' using errcode = '22023'; end if;
  update payments set status = 'void', void_reason = p_reason, updated_at = now() where id = p_payment_id;
  if v_pay.invoice_id is not null then perform refresh_invoice_balance(v_pay.invoice_id); end if;
end;
$$;

revoke all on function void_invoice(uuid, text) from public, anon;
revoke all on function void_payment(uuid, text) from public, anon;
grant execute on function void_invoice(uuid, text) to authenticated;
grant execute on function void_payment(uuid, text) to authenticated;
