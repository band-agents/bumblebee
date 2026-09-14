-- ============================================================
-- Bumblebee — turn on RLS for the CRM tables
--
-- schema.sql creates the workspace_select/insert/update/delete policies for
-- these tables, but never runs ENABLE ROW LEVEL SECURITY on them — so the
-- policies were inert and, after fix-grants.sql, anyone holding the public
-- anon key could read every customer, lead, note and communication log.
--
-- Enabling RLS here makes the existing policies apply. Any table that somehow
-- lacks them gets the same workspace pattern, so nothing is left locked out
-- or wide open. Idempotent.
-- ============================================================

do $$
declare
  t text;
begin
  foreach t in array array[
    'crm_customers', 'crm_timeline_events', 'crm_tasks', 'crm_notes', 'crm_leads', 'crm_alerts',
    'crm_activity_feed', 'customer_ai_summaries', 'customer_communication_logs',
    'customer_relationships', 'loyalty_accounts'
  ] loop
    if to_regclass(t) is null then
      continue;
    end if;

    execute format('alter table %I enable row level security', t);

    if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = t and policyname = 'workspace_select') then
      execute format('create policy "workspace_select" on %I for select using (is_workspace_member(workspace_id))', t);
    end if;
    if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = t and policyname = 'workspace_insert') then
      execute format('create policy "workspace_insert" on %I for insert with check (is_workspace_member(workspace_id))', t);
    end if;
    if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = t and policyname = 'workspace_update') then
      execute format('create policy "workspace_update" on %I for update using (is_workspace_member(workspace_id))', t);
    end if;
    if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = t and policyname = 'workspace_delete') then
      execute format('create policy "workspace_delete" on %I for delete using (is_workspace_admin(workspace_id))', t);
    end if;
  end loop;
end $$;
