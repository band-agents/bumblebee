-- ═══════════════════════════════════════════════════════════
-- Bumblebee — Staff Accounts, Usernames & Role Enforcement
--
-- Lets an owner/admin create a colleague's login directly (username or
-- email + a password they choose), assign an access level, and share the
-- credentials — no email round-trip. Google sign-in and invite links keep
-- working alongside it.
--
-- Run after users-access-control.sql and invite-flow.sql.
-- Idempotent: safe to run again.
-- ═══════════════════════════════════════════════════════════

create extension if not exists pgcrypto with schema extensions;

-- ─── 1. Roles: the app has 10 role templates, the base schema allowed 4 ──

alter table workspace_members drop constraint if exists workspace_members_role_check;
alter table workspace_members add constraint workspace_members_role_check
  check (role in ('owner','admin','manager','member','sales','finance','production_manager',
                  'warehouse','purchasing','qc','delivery','viewer'));

-- ─── 2. Usernames ─────────────────────────────────────────

alter table profiles add column if not exists username text;
create unique index if not exists profiles_username_key on profiles (lower(username));

-- ─── 3. Username → email, for the sign-in form ────────────
-- Returns the login email for a username so the browser can call
-- signInWithPassword. Reveals nothing for unknown names.

create or replace function email_for_username(p_username text)
returns text
language sql security definer stable
set search_path = public
as $$
  select email from profiles where lower(username) = lower(trim(p_username)) limit 1;
$$;

grant execute on function email_for_username(text) to anon, authenticated;

-- ─── 4. Create a staff account ────────────────────────────
-- Caller must be owner/admin of the workspace. Only an owner can create
-- another owner or admin. A username-only account gets a private placeholder
-- email (<username>@<workspace-slug>.staff.bumblebee) that nobody types.

create or replace function create_staff_account(
  p_workspace_id uuid,
  p_full_name    text,
  p_password     text,
  p_role         text,
  p_username     text default null,
  p_email        text default null,
  p_department   text default null,
  p_permissions  jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql security definer
set search_path = public, extensions
as $$
declare
  v_caller_role text;
  v_slug        text;
  v_username    text := nullif(lower(trim(coalesce(p_username, ''))), '');
  v_email       text := nullif(lower(trim(coalesce(p_email, ''))), '');
  v_user_id     uuid := gen_random_uuid();
begin
  select role into v_caller_role from workspace_members
   where workspace_id = p_workspace_id and user_id = auth.uid();

  if v_caller_role is null or v_caller_role not in ('owner', 'admin') then
    raise exception 'Only a workspace owner or admin can create accounts' using errcode = '42501';
  end if;
  if p_role in ('owner', 'admin') and v_caller_role <> 'owner' then
    raise exception 'Only the owner can create another owner or admin' using errcode = '42501';
  end if;
  if length(coalesce(p_password, '')) < 8 then
    raise exception 'Password must be at least 8 characters' using errcode = '22023';
  end if;
  if v_username is null and v_email is null then
    raise exception 'Give the account a username or an email' using errcode = '22023';
  end if;
  if v_username is not null and v_username !~ '^[a-z0-9][a-z0-9._-]{2,31}$' then
    raise exception 'Usernames are 3–32 characters: letters, numbers, dot, dash, underscore' using errcode = '22023';
  end if;
  if v_username is not null and exists (select 1 from profiles where lower(username) = v_username) then
    raise exception 'That username is taken' using errcode = '23505';
  end if;

  if v_email is null then
    select slug into v_slug from workspaces where id = p_workspace_id;
    v_email := v_username || '@' || v_slug || '.staff.bumblebee';
  end if;
  if exists (select 1 from auth.users where lower(email) = v_email) then
    raise exception 'An account with that email already exists' using errcode = '23505';
  end if;

  -- GoTrue reads the token columns as strings: they must be '' rather than NULL.
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new, email_change
  ) values (
    '00000000-0000-0000-0000-000000000000', v_user_id, 'authenticated', 'authenticated',
    v_email, crypt(p_password, gen_salt('bf')), now(),
    jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email')),
    jsonb_build_object('full_name', coalesce(p_full_name, ''), 'username', v_username),
    now(), now(), '', '', '', ''
  );

  insert into auth.identities (
    id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at
  ) values (
    gen_random_uuid(), v_user_id, v_user_id::text, 'email',
    jsonb_build_object('sub', v_user_id::text, 'email', v_email, 'email_verified', true),
    now(), now(), now()
  );

  -- on_auth_user_created has inserted the profile row; stamp the username.
  update profiles set username = v_username, full_name = coalesce(p_full_name, full_name)
   where id = v_user_id;

  insert into workspace_members (workspace_id, user_id, role, department, permissions, display_name, status, invited_by, invited_at)
  values (p_workspace_id, v_user_id, p_role, p_department, coalesce(p_permissions, '{}'::jsonb),
          p_full_name, 'active', auth.uid(), now());

  return jsonb_build_object('user_id', v_user_id, 'email', v_email, 'username', v_username);
end;
$$;

revoke all on function create_staff_account(uuid, text, text, text, text, text, text, jsonb) from public, anon;
grant execute on function create_staff_account(uuid, text, text, text, text, text, text, jsonb) to authenticated;

-- ─── 5. Reset a staff member's password ───────────────────

create or replace function reset_staff_password(p_workspace_id uuid, p_user_id uuid, p_password text)
returns void
language plpgsql security definer
set search_path = public, extensions
as $$
declare
  v_caller_role text;
  v_target_role text;
begin
  select role into v_caller_role from workspace_members where workspace_id = p_workspace_id and user_id = auth.uid();
  select role into v_target_role from workspace_members where workspace_id = p_workspace_id and user_id = p_user_id;
  if v_caller_role not in ('owner', 'admin') or v_target_role is null then
    raise exception 'Not allowed' using errcode = '42501';
  end if;
  if v_target_role in ('owner', 'admin') and v_caller_role <> 'owner' then
    raise exception 'Only the owner can reset an owner or admin password' using errcode = '42501';
  end if;
  if length(coalesce(p_password, '')) < 8 then
    raise exception 'Password must be at least 8 characters' using errcode = '22023';
  end if;
  update auth.users set encrypted_password = crypt(p_password, gen_salt('bf')), updated_at = now()
   where id = p_user_id;
end;
$$;

revoke all on function reset_staff_password(uuid, uuid, text) from public, anon;
grant execute on function reset_staff_password(uuid, uuid, text) to authenticated;

-- ─── 6. Members list for the Users & Access page ──────────
-- workspace_members has no email; profiles does. One read, member-only.

create or replace function list_workspace_members(p_workspace_id uuid)
returns table (
  id uuid, user_id uuid, role text, department text, display_name text, status text,
  permissions jsonb, joined_at timestamptz, email text, username text, avatar_url text,
  last_sign_in_at timestamptz, provider text
)
language sql security definer stable
set search_path = public
as $$
  select m.id, m.user_id, m.role, m.department, coalesce(m.display_name, p.full_name), m.status,
         m.permissions, m.joined_at,
         case when u.email like '%.staff.bumblebee' then null else u.email end,
         p.username, p.avatar_url, u.last_sign_in_at,
         coalesce(u.raw_app_meta_data->>'provider', 'email')
    from workspace_members m
    join profiles p on p.id = m.user_id
    join auth.users u on u.id = m.user_id
   where m.workspace_id = p_workspace_id
     and exists (select 1 from workspace_members me
                  where me.workspace_id = p_workspace_id and me.user_id = auth.uid())
   order by m.joined_at;
$$;

grant execute on function list_workspace_members(uuid) to authenticated;

-- ─── 7. Change role / status (owner/admin) ────────────────

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
  select role into v_caller_role from workspace_members where workspace_id = p_workspace_id and user_id = auth.uid();
  select role into v_target_role from workspace_members where workspace_id = p_workspace_id and user_id = p_user_id;
  if v_caller_role not in ('owner', 'admin') or v_target_role is null then
    raise exception 'Not allowed' using errcode = '42501';
  end if;
  if v_target_role = 'owner' and p_user_id <> auth.uid() then
    raise exception 'The owner cannot be changed by someone else' using errcode = '42501';
  end if;
  if (coalesce(p_role, '') in ('owner', 'admin') or v_target_role = 'admin') and v_caller_role <> 'owner' then
    raise exception 'Only the owner can grant or change admin access' using errcode = '42501';
  end if;
  update workspace_members set
    role        = coalesce(p_role, role),
    status      = coalesce(p_status, status),
    department  = coalesce(p_department, department),
    permissions = coalesce(p_permissions, permissions),
    updated_at  = now()
  where workspace_id = p_workspace_id and user_id = p_user_id;
end;
$$;

grant execute on function update_workspace_member(uuid, uuid, text, text, text, jsonb) to authenticated;

-- ─── 8. Suspended members cannot read the workspace ───────
-- The app hides a suspended user's workspace; this makes the database agree.

create or replace function is_active_member(ws_id uuid)
returns boolean language sql security definer stable
set search_path = public
as $$
  select exists (select 1 from workspace_members
                  where workspace_id = ws_id and user_id = auth.uid()
                    and coalesce(status, 'active') = 'active');
$$;

grant execute on function is_active_member(uuid) to authenticated;
