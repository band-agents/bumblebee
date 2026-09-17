/**
 * Issued documents — numbering, invoices and receipts.
 *
 * Live mode delegates every rule to the database (supabase/documents.sql):
 *   next_document_number             one gap-free sequence per workspace/type/year
 *   create_invoice_from_sales_order  never invoices more than the order
 *   record_invoice_payment           never takes more than the balance
 *   void_invoice / void_payment      issued paper is voided, never deleted
 * so two people on two computers can't produce the same number or overbill.
 *
 * Demo mode has no database: the same formats come from a local counter and
 * writes are ephemeral, like the rest of the demo.
 */

import { getSupabaseClient, isDemoMode } from "./supabase";
import { calcBreakdown, type MoneyLine } from "./money";
import { rememberDemoRow } from "./data-source";
import type { Database } from "./database.types";

export type Invoice = Database["public"]["Tables"]["invoices"]["Row"];
export type Receipt = Database["public"]["Tables"]["payments"]["Row"];

export type DocType =
  | "quotation" | "sales_order" | "purchase_request" | "purchase_order" | "goods_receipt"
  | "production_order" | "invoice" | "receipt" | "delivery_note" | "installation"
  | "pos_sale" | "qc_inspection" | "design_brief" | "site_visit";

export const DOC_PREFIX: Record<DocType, string> = {
  quotation: "QT", sales_order: "SO", purchase_request: "PR", purchase_order: "PO", goods_receipt: "GRN",
  production_order: "MO", invoice: "INV", receipt: "RCT", delivery_note: "DN", installation: "INS",
  pos_sale: "POS", qc_inspection: "QC", design_brief: "DB", site_visit: "SV",
};

export const DOC_TITLE: Record<DocType, { en: string; ar: string }> = {
  quotation: { en: "Quotation", ar: "عرض سعر" },
  sales_order: { en: "Sales Order", ar: "أمر بيع" },
  purchase_request: { en: "Purchase Request", ar: "طلب شراء" },
  purchase_order: { en: "Purchase Order", ar: "أمر شراء" },
  goods_receipt: { en: "Goods Received Note", ar: "إذن استلام بضاعة" },
  production_order: { en: "Production Order", ar: "أمر تشغيل" },
  invoice: { en: "Tax Invoice", ar: "فاتورة ضريبية" },
  receipt: { en: "Payment Receipt", ar: "إيصال استلام نقدية" },
  delivery_note: { en: "Delivery Note", ar: "إذن تسليم" },
  installation: { en: "Installation Report", ar: "تقرير تركيب" },
  pos_sale: { en: "Sales Receipt", ar: "إيصال بيع" },
  qc_inspection: { en: "Quality Inspection", ar: "تقرير فحص جودة" },
  design_brief: { en: "Design Brief", ar: "ملف تصميم" },
  site_visit: { en: "Site Visit", ar: "زيارة موقع" },
};

/** Egypt's standard VAT rate. */
export const EG_VAT_RATE = 14;

export class DocumentError extends Error {}

function demoNumber(type: DocType): string {
  const year = new Date().getFullYear();
  const key = `bumblebee_doc_seq_${type}_${year}`;
  let n = 1;
  try {
    n = (Number(localStorage.getItem(key)) || 0) + 1;
    localStorage.setItem(key, String(n));
  } catch { n = Math.floor(Date.now() / 1000) % 100000; }
  return `${DOC_PREFIX[type]}-${year}-${String(n).padStart(5, "0")}`;
}

/** Friendly message from a Postgres/PostgREST error raised by the document functions. */
function messageOf(err: { message?: string } | null | undefined): string {
  const m = err?.message ?? "Something went wrong";
  if (/duplicate key/i.test(m)) return "That number is already used by another document.";
  return m;
}

/** Issue the next number for a document type. Call it at save time, never when a form opens. */
export async function nextDocumentNumber(workspaceId: string | undefined, type: DocType): Promise<string> {
  const sb = getSupabaseClient();
  if (isDemoMode || !sb || !workspaceId) return demoNumber(type);
  const { data, error } = await sb.rpc("next_document_number" as never, { p_workspace_id: workspaceId, p_doc_type: type } as never);
  if (error || !data) throw new DocumentError(messageOf(error));
  return data as unknown as string;
}

// ─── Invoices ─────────────────────────────────────────────

export interface SalesOrderLike {
  id: string;
  status: string;
  doc_number?: string | null;
  organization_id?: string | null;
  total_amount?: number | null;
  metadata: unknown;
}

export function salesOrderTotal(so: SalesOrderLike): number {
  const m = (so.metadata ?? {}) as { items?: MoneyLine[]; order_discount?: number; order_discount_type?: "pct" | "fixed"; tax_rate?: number; total_amount?: number };
  if (typeof so.total_amount === "number" && so.total_amount > 0) return so.total_amount;
  if (typeof m.total_amount === "number" && m.total_amount > 0) return m.total_amount;
  return Math.round(calcBreakdown({ items: m.items || [], order_discount: m.order_discount, order_discount_type: m.order_discount_type, tax_rate: m.tax_rate }).grand * 100) / 100;
}

export async function createInvoiceFromSalesOrder(
  workspaceId: string | undefined,
  so: SalesOrderLike,
  opts: { amount?: number; dueDate?: string; note?: string; alreadyInvoiced?: number } = {},
): Promise<Invoice> {
  const sb = getSupabaseClient();
  if (isDemoMode || !sb || !workspaceId) {
    if (so.status === "draft" || so.status === "cancelled") throw new DocumentError("Confirm the sales order before invoicing it");
    const total = salesOrderTotal(so);
    const remaining = Math.round((total - (opts.alreadyInvoiced ?? 0)) * 100) / 100;
    const amount = opts.amount ?? remaining;
    if (remaining <= 0) throw new DocumentError("This order is already fully invoiced");
    if (amount <= 0) throw new DocumentError("Invoice amount must be more than zero");
    if (amount > remaining) throw new DocumentError(`Only ${remaining} is left to invoice on this order`);
    const m = (so.metadata ?? {}) as Record<string, unknown>;
    const rate = Number(m.tax_rate) || 0;
    const now = new Date().toISOString();
    const inv = {
      id: `demo-inv-${Date.now()}`, workspace_id: "demo", number: demoNumber("invoice"),
      org_name_en: String(m.customer_name ?? m.company_name ?? "Customer"), org_name_ar: null,
      organization_id: so.organization_id ?? null, deal_id: null, sales_order_id: so.id,
      amount, currency: String(m.currency ?? "EGP"), status: "sent", issue_date: now.slice(0, 10),
      due_date: opts.dueDate ?? null, paid_date: null,
      subtotal: Math.round((amount / (1 + rate / 100)) * 100) / 100, discount_amount: 0, tax_rate: rate,
      tax_amount: Math.round((amount - amount / (1 + rate / 100)) * 100) / 100, amount_paid: 0, void_reason: null,
      metadata: { sales_order_number: so.doc_number, items: m.items ?? [], order_total: total, note: opts.note ?? null },
      created_at: now, updated_at: now,
    };
    rememberDemoRow("invoices", inv);
    return inv as unknown as Invoice;
  }
  const { data, error } = await sb.rpc("create_invoice_from_sales_order" as never, {
    p_sales_order_id: so.id, p_amount: opts.amount ?? null, p_due_date: opts.dueDate || null, p_note: opts.note || null,
  } as never);
  if (error || !data) throw new DocumentError(messageOf(error));
  return data as unknown as Invoice;
}

export type PaymentMethod = "cash" | "bank_transfer" | "card" | "cheque" | "mobile_wallet" | "instapay";

export const PAYMENT_METHODS: { value: PaymentMethod; en: string; ar: string }[] = [
  { value: "cash", en: "Cash", ar: "نقدي" },
  { value: "instapay", en: "InstaPay", ar: "إنستاباي" },
  { value: "bank_transfer", en: "Bank transfer", ar: "تحويل بنكي" },
  { value: "card", en: "Card", ar: "بطاقة" },
  { value: "mobile_wallet", en: "Mobile wallet", ar: "محفظة موبايل" },
  { value: "cheque", en: "Cheque", ar: "شيك" },
];

export async function recordInvoicePayment(
  workspaceId: string | undefined,
  invoice: Invoice,
  payment: { amount: number; method: PaymentMethod; reference?: string; paidAt?: string },
): Promise<Receipt> {
  const sb = getSupabaseClient();
  const balance = Math.round((invoice.amount - (invoice.amount_paid ?? 0)) * 100) / 100;
  if (isDemoMode || !sb || !workspaceId) {
    if (["void", "cancelled", "draft"].includes(invoice.status)) throw new DocumentError(`Invoice ${invoice.number} is ${invoice.status}`);
    if (!(payment.amount > 0)) throw new DocumentError("Payment must be more than zero");
    if (payment.amount > balance) throw new DocumentError(`Only ${balance} is due on invoice ${invoice.number}`);
    const now = new Date().toISOString();
    const paid = (Number(invoice.amount_paid) || 0) + payment.amount;
    rememberDemoRow("invoices", { ...invoice, amount_paid: paid, status: paid >= Number(invoice.amount) ? "paid" : "partially_paid" } as Record<string, unknown>);
    const rct = {
      id: `demo-rct-${Date.now()}`, workspace_id: "demo", invoice_id: invoice.id, sales_order_id: invoice.sales_order_id ?? null,
      receipt_number: demoNumber("receipt"), amount: payment.amount, currency: invoice.currency, method: payment.method,
      status: "completed", paid_at: payment.paidAt ?? now, reference: payment.reference ?? null, received_by: "Demo User", void_reason: null,
      metadata: { invoice_number: invoice.number, customer: invoice.org_name_en, balance_before: balance, balance_after: balance - payment.amount },
      created_at: now, updated_at: now,
    };
    rememberDemoRow("payments", rct);
    return rct as unknown as Receipt;
  }
  const { data, error } = await sb.rpc("record_invoice_payment" as never, {
    p_invoice_id: invoice.id, p_amount: payment.amount, p_method: payment.method,
    p_reference: payment.reference || null, p_paid_at: payment.paidAt || null,
  } as never);
  if (error || !data) throw new DocumentError(messageOf(error));
  return data as unknown as Receipt;
}

export async function voidInvoice(invoiceId: string, reason: string): Promise<void> {
  const sb = getSupabaseClient();
  if (isDemoMode || !sb) return;
  const { error } = await sb.rpc("void_invoice" as never, { p_invoice_id: invoiceId, p_reason: reason } as never);
  if (error) throw new DocumentError(messageOf(error));
}

export async function voidReceipt(paymentId: string, reason: string): Promise<void> {
  const sb = getSupabaseClient();
  if (isDemoMode || !sb) return;
  const { error } = await sb.rpc("void_payment" as never, { p_payment_id: paymentId, p_reason: reason } as never);
  if (error) throw new DocumentError(messageOf(error));
}

/** Opens the printable A4 view of a document in a new tab. */
/** Opens the printable A4 page. Live: a new tab. Demo: the same tab, because
 *  demo data lives in memory and a fresh tab would not see new documents. */
export function openPrint(kind: PrintKind, id: string, query?: Record<string, string>) {
  const qs = query ? "?" + new URLSearchParams(query).toString() : "";
  const url = `/print/${kind}/${id}${qs}`;
  if (isDemoMode) {
    window.history.pushState({ fromApp: true }, "", url);
    window.dispatchEvent(new PopStateEvent("popstate"));
    return;
  }
  window.open(url, "_blank", "noopener");
}

export type PrintKind =
  | "quotation" | "sales_order" | "purchase_request" | "purchase_order" | "goods_receipt"
  | "production_order" | "invoice" | "receipt" | "delivery_note" | "pos_sale";
