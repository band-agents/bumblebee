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
create table if not exists access_role_templates (
  role        text primary key,
  permissions jsonb not null
);
alter table access_role_templates enable row level security;
drop policy if exists "access_role_templates_read" on access_role_templates;
create policy "access_role_templates_read" on access_role_templates for select to authenticated using (true);

insert into access_role_templates (role, permissions) values
  ('sales', '{"customers":["view","create","edit","export"],"contacts":["view","create","edit","export"],"quotations":["view","create","edit","export","approve"],"orders":["view","create","edit","export"],"pos":["view","create","edit"],"products":["view"]}'),
  ('finance', '{"finance":["view","create","edit","export","delete","approve","release"],"orders":["view","approve","export"],"quotations":["view","approve"],"purchasing":["view","approve","export"],"pos":["view","export"],"customers":["view","export"],"reports":["view","export"],"analytics":["view","export"]}'),
  ('production_manager', '{"products":["view","create","edit","export"],"bom":["view","create","edit"],"production":["view","create","edit","assign","release"],"stages":["view","create","edit","assign"],"quality":["view","create","edit","approve"],"inventory":["view","export"],"purchasing":["view","create"],"delivery":["view","assign"],"orders":["view"],"reports":["view","export"]}'),
  ('warehouse', '{"inventory":["view","create","edit","export","import","approve"],"purchasing":["view","create","edit"],"products":["view"]}'),
  ('purchasing', '{"purchasing":["view","create","edit","export","approve"],"inventory":["view","export"],"contacts":["view","create","edit"]}'),
  ('qc', '{"quality":["view","create","edit","approve"],"production":["view"],"stages":["view"]}'),
  ('delivery', '{"delivery":["view","create","edit","assign"],"production":["view"]}'),
  ('viewer', '{"customers":["view"],"contacts":["view"],"quotations":["view"],"orders":["view"],"pos":["view"],"products":["view"],"bom":["view"],"production":["view"],"stages":["view"],"quality":["view"],"inventory":["view"],"purchasing":["view"],"delivery":["view"],"finance":["view"],"hr":["view"],"reports":["view"],"analytics":["view"],"settings":["view"],"users":["view"]}')
on conflict (role) do update set permissions = excluded.permissions;
-- END ROLE TEMPLATES

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
      if exists (select 1 from jsonb_array_elements_text(v_perms -> m) a where a not in ('view', 'export')) then
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
--   read            → the module is open (View or Work)
--   add / change    → Work in that module
--   delete          → Work, or owner/admin for the shared core tables
-- Tables with no module ("shared": contacts' companies, branches, tasks,
-- notes, the activity feed…) are open to every active member, because many
-- modules pick from them.

create or replace function _access_v2_expr(p_mods text, p_action text)
returns text language sql immutable as $$
  select case when p_mods is null then 'is_workspace_member(workspace_id)'
              else format('member_can(workspace_id, %s, %L)', p_mods, p_action) end;
$$;

create or replace function _access_v2_apply(p_table text, p_view text, p_work text, p_delete text, p_writes boolean)
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
    execute format('create policy "access_insert" on %I for insert with check (%s)', p_table, p_work);
    execute format('create policy "access_update" on %I for update using (%s) with check (%s)', p_table, p_work, p_work);
  end if;
  execute format('create policy "access_delete" on %I for delete using (%s)', p_table, p_delete);
end;
$$;

do $$
declare
  r record;
  v_mods text;
  v_view text;
  v_work text;
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
    select t.table_name as tbl, m.mods
      from information_schema.tables t
      left join (values
        ('invoices',                    '{finance,orders}'),
        ('payments',                    '{finance,orders}'),
        ('expenses',                    '{finance}'),
        ('pos_transactions',            '{pos,finance}'),
        ('pos_transaction_items',       '{pos,finance}'),
        ('deals',                       '{customers}'),
        ('crm_customers',               '{customers}'),
        ('crm_timeline_events',         '{customers}'),
        ('crm_tasks',                   '{customers}'),
        ('crm_notes',                   '{customers}'),
        ('crm_leads',                   '{customers}'),
        ('crm_alerts',                  '{customers}'),
        ('crm_activity_feed',           '{customers}'),
        ('customer_relationships',      '{customers}'),
        ('customer_ai_summaries',       '{customers}'),
        ('customer_communication_logs', '{customers}'),
        ('loyalty_accounts',            '{customers,pos}'),
        ('loyalty_members',             '{customers,pos}'),
        ('loyalty_programs',            '{customers}'),
        ('loyalty_redemptions',         '{customers,pos}'),
        ('loyalty_rewards',             '{customers,pos}'),
        ('loyalty_rules',               '{customers}'),
        ('loyalty_tiers',               '{customers,pos}'),
        ('loyalty_transactions',        '{customers,pos}'),
        ('quotations',                  '{quotations}'),
        ('quotation_items',             '{quotations}'),
        ('sales_orders',                '{orders}'),
        ('sales_order_items',           '{orders}'),
        ('sales_order_payments',        '{orders,finance}'),
        ('products',                    '{products,orders,quotations,pos,production,inventory}'),
        ('product_bom',                 '{products,bom,production}'),
        ('product_stages',              '{products,production}'),
        ('production_orders',           '{production,quality,delivery,orders}'),
        ('production_stage_log',        '{production,stages,quality}'),
        ('cutting_list_items',          '{production}'),
        ('cost_entries',                '{production,finance}'),
        ('material_requirements',       '{production,inventory,purchasing}'),
        ('qc_inspections',              '{quality,production}'),
        ('qc_defects',                  '{quality,production}'),
        ('deliveries',                  '{delivery,production}'),
        ('installations',               '{delivery}'),
        ('design_briefs',               '{products,production}'),
        ('design_files',                '{products,production}'),
        ('design_comments',             '{products,production}'),
        ('site_visits',                 '{products}'),
        ('measurements',                '{products}'),
        ('measurement_attachments',     '{products}'),
        ('stock_movements',             '{inventory,purchasing,production}'),
        ('employees',                   '{hr}'),
        ('attendance',                  '{hr}'),
        ('leave_requests',              '{hr}'),
        ('shopify_connections',         '{settings}'),
        ('shopify_entity_map',          '{settings}'),
        ('shopify_orders',              '{settings,orders}'),
        ('shopify_sync_log',            '{settings}'),
        ('shopify_sync_runs',           '{settings}')
      ) as m(tbl, mods) on m.tbl = t.table_name
     where t.table_schema = 'public' and t.table_type = 'BASE TABLE'
       and t.table_name <> all (v_skip)
  loop
    v_mods := case when r.mods is null then null else quote_literal(r.mods) || '::text[]' end;

    if r.tbl = 'work_items' then
      v_view := $e$(CASE type
        WHEN 'quotation'        THEN member_can(workspace_id, '{quotations,orders}'::text[], '%1$s')
        WHEN 'sales_order'      THEN member_can(workspace_id, '{orders,quotations,finance,production,delivery}'::text[], '%1$s')
        WHEN 'purchase_request' THEN member_can(workspace_id, '{purchasing,inventory}'::text[], '%1$s')
        WHEN 'purchase_order'   THEN member_can(workspace_id, '{purchasing,inventory}'::text[], '%1$s')
        WHEN 'stock_movement'   THEN member_can(workspace_id, '{inventory,purchasing,production}'::text[], '%1$s')
        WHEN 'maintenance'      THEN member_can(workspace_id, '{inventory}'::text[], '%1$s')
        WHEN 'production_order' THEN member_can(workspace_id, '{production}'::text[], '%1$s')
        ELSE is_workspace_member(workspace_id) END)$e$;
      v_work := format(v_view, 'work');
      v_view := format(v_view, 'view');
    elsif r.tbl = 'resources' then
      v_view := $e$(CASE WHEN type = 'product'
        THEN member_can(workspace_id, '{products,orders,quotations,pos,production,inventory}'::text[], '%1$s')
        ELSE member_can(workspace_id, '{inventory,purchasing,production,products}'::text[], '%1$s') END)$e$;
      v_work := format(v_view, 'work');
      v_view := format(v_view, 'view');
    else
      v_view := _access_v2_expr(v_mods, 'view');
      v_work := _access_v2_expr(v_mods, 'work');
    end if;

    perform _access_v2_apply(
      r.tbl, v_view, v_work,
      case when r.tbl = any (v_admin_delete) then format('is_workspace_admin(workspace_id) AND %s', v_work) else v_work end,
      not (r.tbl = any (v_function_only))
    );
  end loop;
end $$;

drop function _access_v2_apply(text, text, text, text, boolean);
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
