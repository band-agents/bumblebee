-- ═══════════════════════════════════════════════════════════
-- Bumblebee — Issued documents: numbering, references, invoices & receipts
--
-- Every document that goes on paper (quotation, sales order, purchase
-- request/order, goods receipt, production order, invoice, receipt,
-- delivery note, POS sale, QC report…) gets its number from the DATABASE,
-- one gap-free sequence per workspace, document type and year:
--     QT-2026-00001, SO-2026-00001, INV-2026-00001, RCT-2026-00001 …
-- Numbers are unique, can't be edited once issued, and issued documents
-- can't be deleted — they are cancelled/voided instead, so the paper trail
-- always matches the system.
--
-- Invoices are created FROM a confirmed sales order and can never add up to
-- more than the order; receipts are recorded AGAINST an invoice and can never
-- exceed its balance. Both rules live in this file, not in the browser.
--
-- Run after full-install.sql. Idempotent.
-- ═══════════════════════════════════════════════════════════

-- ─── 1. Sequences ─────────────────────────────────────────

create table if not exists document_sequences (
  workspace_id uuid    not null references workspaces(id) on delete cascade,
  doc_type     text    not null,
  period       integer not null,
  last_value   integer not null default 0,
  primary key (workspace_id, doc_type, period)
);
alter table document_sequences enable row level security;
-- No policies on purpose: only next_document_number() touches it.

create or replace function document_prefix(p_doc_type text)
returns text language sql immutable as $$
  select case p_doc_type
    when 'quotation'        then 'QT'
    when 'sales_order'      then 'SO'
    when 'purchase_request' then 'PR'
    when 'purchase_order'   then 'PO'
    when 'goods_receipt'    then 'GRN'
    when 'production_order' then 'MO'
    when 'invoice'          then 'INV'
    when 'receipt'          then 'RCT'
    when 'delivery_note'    then 'DN'
    when 'installation'     then 'INS'
    when 'pos_sale'         then 'POS'
    when 'qc_inspection'    then 'QC'
    when 'design_brief'     then 'DB'
    when 'site_visit'       then 'SV'
    else null
  end;
$$;

create or replace function next_document_number(p_workspace_id uuid, p_doc_type text)
returns text
language plpgsql security definer
set search_path = public
as $$
declare
  v_prefix text := document_prefix(p_doc_type);
  v_year   integer := extract(year from (now() at time zone 'Africa/Cairo'))::integer;
  v_value  integer;
begin
  if v_prefix is null then
    raise exception 'Unknown document type: %', p_doc_type using errcode = '22023';
  end if;
  if not exists (select 1 from workspace_members
                  where workspace_id = p_workspace_id and user_id = auth.uid()
                    and coalesce(status, 'active') = 'active') then
    raise exception 'Not a member of this workspace' using errcode = '42501';
  end if;

  insert into document_sequences (workspace_id, doc_type, period, last_value)
  values (p_workspace_id, p_doc_type, v_year, 1)
  on conflict (workspace_id, doc_type, period)
  do update set last_value = document_sequences.last_value + 1
  returning last_value into v_value;

  return v_prefix || '-' || v_year || '-' || lpad(v_value::text, 5, '0');
end;
$$;

revoke all on function next_document_number(uuid, text) from public, anon;
grant execute on function next_document_number(uuid, text) to authenticated;

-- ─── 2. work_items documents: one number column, unique, immutable ─────

alter table work_items add column if not exists doc_number text;

-- Carry numbers already stored in metadata into the column.
update work_items set doc_number = coalesce(
  metadata->>'doc_number', metadata->>'quotation_number', metadata->>'so_number', metadata->>'po_number', metadata->>'pr_number')
where doc_number is null
  and type in ('quotation','sales_order','purchase_request','purchase_order')
  and coalesce(metadata->>'doc_number', metadata->>'quotation_number', metadata->>'so_number', metadata->>'po_number', metadata->>'pr_number') is not null;

create unique index if not exists work_items_doc_number_key
  on work_items (workspace_id, type, doc_number) where doc_number is not null;

create or replace function guard_issued_work_item()
returns trigger language plpgsql as $$
begin
  if tg_op = 'UPDATE' then
    if old.doc_number is not null and new.doc_number is distinct from old.doc_number then
      raise exception 'Document number % can''t be changed once issued', old.doc_number using errcode = '42501';
    end if;
    return new;
  end if;
  -- DELETE
  if old.type in ('quotation','sales_order','purchase_request','purchase_order')
     and old.doc_number is not null and old.status <> 'draft' then
    raise exception '% is issued and can''t be deleted — cancel it instead', old.doc_number using errcode = '42501';
  end if;
  return old;
end;
$$;

drop trigger if exists guard_issued_work_item on work_items;
create trigger guard_issued_work_item before update or delete on work_items
  for each row execute function guard_issued_work_item();

-- ─── 3. Other numbered tables: unique numbers ─────────────

create unique index if not exists production_orders_number_key on production_orders (workspace_id, po_number);
create unique index if not exists pos_transactions_number_key on pos_transactions (workspace_id, transaction_number);
do $$ begin
  if to_regclass('deliveries') is not null then
    execute 'create unique index if not exists deliveries_number_key on deliveries (workspace_id, delivery_number)';
  end if;
end $$;

-- ─── 4. Invoices ──────────────────────────────────────────

alter table invoices add column if not exists sales_order_id uuid references work_items(id) on delete restrict;
alter table invoices add column if not exists issue_date     date    not null default current_date;
alter table invoices add column if not exists subtotal       numeric not null default 0;
alter table invoices add column if not exists discount_amount numeric not null default 0;
alter table invoices add column if not exists tax_rate       numeric not null default 0;
alter table invoices add column if not exists tax_amount     numeric not null default 0;
alter table invoices add column if not exists amount_paid    numeric not null default 0;
alter table invoices add column if not exists void_reason    text;
alter table invoices alter column currency set default 'EGP';

alter table invoices drop constraint if exists invoices_status_check;
alter table invoices add constraint invoices_status_check
  check (status in ('draft','sent','partially_paid','paid','overdue','cancelled','void'));

create unique index if not exists invoices_number_key on invoices (workspace_id, number);
create index if not exists invoices_sales_order_idx on invoices (sales_order_id);

-- ─── 5. Payments = receipts ───────────────────────────────

alter table payments add column if not exists receipt_number text;
alter table payments add column if not exists sales_order_id uuid references work_items(id) on delete restrict;
alter table payments add column if not exists reference      text;
alter table payments add column if not exists received_by    text;
alter table payments add column if not exists void_reason    text;
alter table payments alter column currency set default 'EGP';

alter table payments drop constraint if exists payments_status_check;
alter table payments add constraint payments_status_check
  check (status in ('pending','completed','failed','refunded','void'));

create unique index if not exists payments_receipt_number_key on payments (workspace_id, receipt_number) where receipt_number is not null;

-- Keeps an invoice's paid amount and status in step with its receipts.
create or replace function refresh_invoice_balance(p_invoice_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_paid numeric;
  v_inv  invoices%rowtype;
begin
  select * into v_inv from invoices where id = p_invoice_id;
  if not found or v_inv.status in ('void','cancelled') then return; end if;
  select coalesce(sum(amount), 0) into v_paid from payments
   where invoice_id = p_invoice_id and status = 'completed';
  update invoices set
    amount_paid = v_paid,
    status = case
      when v_paid >= amount and amount > 0 then 'paid'
      when v_paid > 0 then 'partially_paid'
      when due_date is not null and due_date < current_date then 'overdue'
      else 'sent' end,
    paid_date = case when v_paid >= amount and amount > 0 then current_date else null end,
    updated_at = now()
  where id = p_invoice_id;
end;
$$;

-- Issued money documents are voided, never deleted.
create or replace function guard_money_delete()
returns trigger language plpgsql as $$
begin
  if tg_table_name = 'invoices' and old.status <> 'draft' then
    raise exception 'Invoice % is issued and can''t be deleted — void it instead', old.number using errcode = '42501';
  end if;
  if tg_table_name = 'payments' and old.receipt_number is not null then
    raise exception 'Receipt % can''t be deleted — void it instead', old.receipt_number using errcode = '42501';
  end if;
  return old;
end;
$$;

drop trigger if exists guard_invoice_delete on invoices;
create trigger guard_invoice_delete before delete on invoices for each row execute function guard_money_delete();
drop trigger if exists guard_payment_delete on payments;
create trigger guard_payment_delete before delete on payments for each row execute function guard_money_delete();

-- ─── 6. Sales order money helpers ─────────────────────────

-- Grand total of a sales order as the app computes it (lib/money.ts):
-- line nets → order discount → tax. total_amount on the row wins when set.
create or replace function sales_order_total(p_so work_items)
returns numeric language plpgsql stable as $$
declare
  v_sub  numeric := 0;
  v_line jsonb;
  v_gross numeric;
  v_disc numeric;
  v_od   numeric := coalesce((p_so.metadata->>'order_discount')::numeric, 0);
  v_after numeric;
begin
  if p_so.total_amount is not null and p_so.total_amount > 0 then
    return p_so.total_amount;
  end if;
  for v_line in select * from jsonb_array_elements(coalesce(p_so.metadata->'items', '[]'::jsonb)) loop
    v_gross := coalesce((v_line->>'qty')::numeric, 0) * coalesce((v_line->>'unitPrice')::numeric, 0);
    v_disc := coalesce((v_line->>'discount')::numeric, 0);
    if v_disc > 0 then
      if v_line->>'discountType' = 'fixed' then v_gross := greatest(0, v_gross - v_disc);
      else v_gross := v_gross * (1 - least(v_disc, 100) / 100); end if;
    end if;
    v_sub := v_sub + v_gross;
  end loop;
  if v_od > 0 then
    if p_so.metadata->>'order_discount_type' = 'fixed' then v_after := v_sub - least(v_od, v_sub);
    else v_after := v_sub * (1 - least(v_od, 100) / 100); end if;
  else v_after := v_sub; end if;
  return round(v_after * (1 + coalesce((p_so.metadata->>'tax_rate')::numeric, 0) / 100), 2);
end;
$$;

-- ─── 7. Create an invoice from a sales order ──────────────
-- Full balance by default, or a part (deposit/instalment). Refuses drafts,
-- cancelled orders, and anything that would invoice more than the order.

create or replace function create_invoice_from_sales_order(
  p_sales_order_id uuid,
  p_amount   numeric default null,
  p_due_date date    default null,
  p_note     text    default null
)
returns invoices
language plpgsql security definer
set search_path = public
as $$
declare
  v_so        work_items%rowtype;
  v_total     numeric;
  v_invoiced  numeric;
  v_remaining numeric;
  v_amount    numeric;
  v_rate      numeric;
  v_number    text;
  v_inv       invoices%rowtype;
begin
  select * into v_so from work_items where id = p_sales_order_id and type = 'sales_order' for update;
  if not found then raise exception 'Sales order not found' using errcode = 'P0002'; end if;
  if not is_active_member(v_so.workspace_id) then raise exception 'Not allowed' using errcode = '42501'; end if;
  if v_so.status in ('draft', 'cancelled') then
    raise exception 'Confirm the sales order before invoicing it' using errcode = '22023';
  end if;

  v_total := sales_order_total(v_so);
  select coalesce(sum(amount), 0) into v_invoiced from invoices
   where sales_order_id = v_so.id and status not in ('void', 'cancelled');
  v_remaining := round(v_total - v_invoiced, 2);
  v_amount := round(coalesce(p_amount, v_remaining), 2);

  if v_remaining <= 0 then raise exception 'This order is already fully invoiced' using errcode = '22023'; end if;
  if v_amount <= 0 then raise exception 'Invoice amount must be more than zero' using errcode = '22023'; end if;
  if v_amount > v_remaining then
    raise exception 'Only % is left to invoice on this order', v_remaining using errcode = '22023';
  end if;

  v_rate := coalesce((v_so.metadata->>'tax_rate')::numeric, 0);
  v_number := next_document_number(v_so.workspace_id, 'invoice');

  insert into invoices (workspace_id, number, org_name_en, organization_id, sales_order_id, amount, currency,
                        status, issue_date, due_date, subtotal, tax_rate, tax_amount, metadata)
  values (
    v_so.workspace_id, v_number,
    coalesce(v_so.metadata->>'customer_name', v_so.metadata->>'company_name', v_so.title_en),
    v_so.organization_id, v_so.id, v_amount,
    coalesce(v_so.metadata->>'currency', 'EGP'),
    'sent', current_date, p_due_date,
    round(v_amount / (1 + v_rate / 100), 2), v_rate, round(v_amount - v_amount / (1 + v_rate / 100), 2),
    jsonb_build_object(
      'sales_order_number', v_so.doc_number,
      'quotation_number', v_so.metadata->>'source_quotation_number',
      'order_total', v_total,
      'is_partial', v_amount < v_remaining or v_invoiced > 0,
      'items', coalesce(v_so.metadata->'items', '[]'::jsonb),
      'order_discount', v_so.metadata->'order_discount',
      'order_discount_type', v_so.metadata->'order_discount_type',
      'customer_phone', v_so.metadata->>'phone',
      'customer_address', concat_ws(', ', v_so.metadata->>'address', v_so.metadata->>'city'),
      'note', p_note,
      'issued_by', auth.uid()
    )
  )
  returning * into v_inv;

  return v_inv;
end;
$$;

revoke all on function create_invoice_from_sales_order(uuid, numeric, date, text) from public, anon;
grant execute on function create_invoice_from_sales_order(uuid, numeric, date, text) to authenticated;

-- ─── 8. Record a receipt against an invoice ───────────────

create or replace function record_invoice_payment(
  p_invoice_id uuid,
  p_amount     numeric,
  p_method     text default 'cash',
  p_reference  text default null,
  p_paid_at    timestamptz default now()
)
returns payments
language plpgsql security definer
set search_path = public
as $$
declare
  v_inv     invoices%rowtype;
  v_balance numeric;
  v_number  text;
  v_pay     payments%rowtype;
  v_name    text;
begin
  select * into v_inv from invoices where id = p_invoice_id for update;
  if not found then raise exception 'Invoice not found' using errcode = 'P0002'; end if;
  if not is_active_member(v_inv.workspace_id) then raise exception 'Not allowed' using errcode = '42501'; end if;
  if v_inv.status in ('void', 'cancelled', 'draft') then
    raise exception 'Invoice % is %, payments can''t be recorded', v_inv.number, v_inv.status using errcode = '22023';
  end if;
  if p_method not in ('cash', 'bank_transfer', 'card', 'cheque', 'mobile_wallet', 'instapay') then
    raise exception 'Unknown payment method %', p_method using errcode = '22023';
  end if;

  v_balance := round(v_inv.amount - v_inv.amount_paid, 2);
  if p_amount is null or p_amount <= 0 then raise exception 'Payment must be more than zero' using errcode = '22023'; end if;
  if round(p_amount, 2) > v_balance then
    raise exception 'Only % is due on invoice %', v_balance, v_inv.number using errcode = '22023';
  end if;

  select coalesce(nullif(display_name, ''), p.full_name, p.username) into v_name
    from workspace_members m join profiles p on p.id = m.user_id
   where m.workspace_id = v_inv.workspace_id and m.user_id = auth.uid();

  v_number := next_document_number(v_inv.workspace_id, 'receipt');
  insert into payments (workspace_id, invoice_id, sales_order_id, receipt_number, amount, currency, method,
                        status, paid_at, reference, received_by, metadata)
  values (v_inv.workspace_id, v_inv.id, v_inv.sales_order_id, v_number, round(p_amount, 2), v_inv.currency, p_method,
          'completed', coalesce(p_paid_at, now()), p_reference, v_name,
          jsonb_build_object('invoice_number', v_inv.number,
                             'sales_order_number', v_inv.metadata->>'sales_order_number',
                             'customer', v_inv.org_name_en,
                             'balance_before', v_balance,
                             'balance_after', v_balance - round(p_amount, 2)))
  returning * into v_pay;

  perform refresh_invoice_balance(v_inv.id);
  return v_pay;
end;
$$;

revoke all on function record_invoice_payment(uuid, numeric, text, text, timestamptz) from public, anon;
grant execute on function record_invoice_payment(uuid, numeric, text, text, timestamptz) to authenticated;

-- ─── 9. Void (never delete) ───────────────────────────────

create or replace function void_invoice(p_invoice_id uuid, p_reason text)
returns void language plpgsql security definer set search_path = public as $$
declare v_inv invoices%rowtype;
begin
  select * into v_inv from invoices where id = p_invoice_id for update;
  if not found then raise exception 'Invoice not found' using errcode = 'P0002'; end if;
  if not exists (select 1 from workspace_members where workspace_id = v_inv.workspace_id and user_id = auth.uid()
                  and role in ('owner','admin','finance','manager') and coalesce(status,'active') = 'active') then
    raise exception 'Only owners, admins, managers or finance can void invoices' using errcode = '42501';
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
  if not exists (select 1 from workspace_members where workspace_id = v_pay.workspace_id and user_id = auth.uid()
                  and role in ('owner','admin','finance','manager') and coalesce(status,'active') = 'active') then
    raise exception 'Only owners, admins, managers or finance can void receipts' using errcode = '42501';
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

-- Invoices and receipts are only written through the functions above.
-- Members can still read them (workspace policies from schema.sql).
drop policy if exists "workspace_insert" on invoices;
drop policy if exists "workspace_update" on invoices;
drop policy if exists "workspace_insert" on payments;
drop policy if exists "workspace_update" on payments;

-- Company details for printed documents live in workspaces.settings.company.
-- Admins (not just the owner) may edit workspace settings.
drop policy if exists "workspaces_update" on workspaces;
create policy "workspaces_update" on workspaces
  for update using (
    owner_id = auth.uid()
    or exists (select 1 from workspace_members m
               where m.workspace_id = workspaces.id and m.user_id = auth.uid()
                 and m.role in ('owner','admin') and coalesce(m.status,'active') = 'active')
  );
