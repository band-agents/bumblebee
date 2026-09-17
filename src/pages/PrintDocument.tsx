/**
 * PrintDocument — /print/:kind/:id
 *
 * One A4 layout for every document the business puts on paper. It reads the
 * saved record (never the form state), so what prints is exactly what the
 * system holds: the issued number, the parties, the lines, the totals from
 * lib/money.ts, and the reference chain (quotation → sales order → invoice →
 * receipt, purchase request → purchase order → goods received note).
 *
 * Bilingual labels, the client's logo, company details from workspace
 * settings, and signature blocks. Opens outside the app shell; Print button
 * and browser print both work, and the toolbar is hidden on paper.
 */

import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Printer, X, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getDataSource } from "../lib/data-source";
import { calcBreakdown, lineNet, type MoneyLine } from "../lib/money";
import { DOC_TITLE, PAYMENT_METHODS, type DocType, type PrintKind } from "../lib/documents";
import { CLIENT, BRAND } from "../lib/brand";

// ─── Normalised document model ────────────────────────────

interface Line { name: string; description?: string; qty: number; unit?: string; unitPrice?: number; discountLabel?: string; total?: number }
interface Party { title: string; titleAr: string; name: string; lines: string[] }
interface Ref { label: string; labelAr: string; value: string }
interface Totals { rows: { label: string; labelAr: string; value: number; strong?: boolean; negative?: boolean }[] }

interface PrintModel {
  type: DocType;
  number: string;
  date: string;
  status?: string;
  parties: Party[];
  refs: Ref[];
  meta: Ref[];
  lines?: Line[];
  showPrices: boolean;
  totals?: Totals;
  currency: string;
  notes?: string;
  extra?: React.ReactNode;
  signatures: { label: string; labelAr: string }[];
  stamp?: { text: string; tone: "void" | "paid" | "draft" };
}

type Json = Record<string, unknown>;
const str = (v: unknown) => (v == null ? "" : String(v));
const num = (v: unknown) => (typeof v === "number" ? v : Number(v) || 0);
const day = (v: unknown) => {
  const s = str(v);
  if (!s) return "";
  const d = new Date(s);
  return isNaN(d.getTime()) ? s : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

function itemLines(items: unknown, withPrices: boolean): Line[] {
  return ((Array.isArray(items) ? items : []) as Json[])
    .filter((i) => str(i.product_name ?? i.product ?? i.description ?? i.name).trim())
    .map((i) => {
      const ml: MoneyLine = { qty: num(i.qty), unitPrice: num(i.unitPrice ?? i.unit_price), discount: num(i.discount), discountType: (i.discountType as "pct" | "fixed") ?? "pct" };
      const variant = [i.size, i.color, i.material, i.finish].map(str).filter(Boolean).join(" · ");
      return {
        name: str(i.product_name ?? i.product ?? i.name ?? i.description),
        description: [str(i.product_name || i.product ? i.description : ""), variant, i.product_sku ? `SKU ${str(i.product_sku)}` : ""].filter(Boolean).join(" — ") || undefined,
        qty: ml.qty, unit: str(i.unit) || undefined,
        unitPrice: withPrices ? ml.unitPrice : undefined,
        discountLabel: withPrices && ml.discount ? (ml.discountType === "fixed" ? `-${ml.discount}` : `-${ml.discount}%`) : undefined,
        total: withPrices ? lineNet(ml) : undefined,
      };
    });
}

function moneyTotals(m: Json, extraRows: Totals["rows"] = []): Totals {
  const b = calcBreakdown({ items: (m.items as MoneyLine[]) || [], order_discount: num(m.order_discount), order_discount_type: m.order_discount_type as "pct" | "fixed", tax_rate: num(m.tax_rate) });
  const rows: Totals["rows"] = [{ label: "Subtotal", labelAr: "الإجمالي قبل الخصم", value: b.subtotal }];
  if (b.orderDisc > 0) rows.push({ label: `Discount${m.order_discount_type === "fixed" ? "" : ` (${num(m.order_discount)}%)`}`, labelAr: "الخصم", value: b.orderDisc, negative: true });
  if (b.tax > 0) rows.push({ label: `VAT ${num(m.tax_rate)}%`, labelAr: `ضريبة القيمة المضافة ${num(m.tax_rate)}%`, value: b.tax });
  rows.push({ label: "Total", labelAr: "الإجمالي", value: b.grand, strong: true }, ...extraRows);
  return { rows };
}

// ─── Loaders ──────────────────────────────────────────────

async function load(kind: PrintKind, id: string, ws: string, sub: string | null): Promise<PrintModel> {
  const ds = getDataSource();

  if (kind === "quotation" || kind === "sales_order" || kind === "purchase_request" || kind === "purchase_order" || kind === "goods_receipt") {
    const w = await ds.work_items.get(ws, id);
    if (!w) throw new Error("Document not found");
    const m = (w.metadata ?? {}) as Json;
    const number = str((w as { doc_number?: string }).doc_number ?? m.doc_number ?? m.quotation_number ?? m.so_number ?? m.po_number ?? m.pr_number) || "—";
    const currency = str(m.currency) || "EGP";

    if (kind === "quotation") {
      return {
        type: "quotation", number, date: day(m.quotation_date ?? w.created_at), status: w.status, currency, showPrices: true,
        parties: [{ title: "Quotation for", titleAr: "مقدم إلى", name: str(m.customer_name) || "—", lines: [str(m.contact_person) && `Attn: ${str(m.contact_person)}`].filter(Boolean) as string[] }],
        refs: m.converted_to ? [{ label: "Converted to sales order", labelAr: "تم تحويله إلى أمر بيع", value: "Yes" }] : [],
        meta: [{ label: "Valid until", labelAr: "صالح حتى", value: day(m.validity_date ?? w.due_date) }, { label: "Project", labelAr: "المشروع", value: str(m.project_name) }].filter((r) => r.value),
        lines: itemLines(m.items, true), totals: moneyTotals(m), notes: str(m.notes),
        signatures: [{ label: "Prepared by", labelAr: "إعداد" }, { label: "Customer acceptance", labelAr: "موافقة العميل" }],
        stamp: w.status === "cancelled" ? { text: "CANCELLED", tone: "void" } : w.status === "draft" ? { text: "DRAFT", tone: "draft" } : undefined,
      };
    }

    if (kind === "sales_order") {
      const invoices = (await ds.invoices.list(ws)).filter((i) => i.sales_order_id === w.id && !["void", "cancelled"].includes(i.status));
      const invoiced = invoices.reduce((s, i) => s + num(i.amount), 0);
      const paid = invoices.reduce((s, i) => s + num(i.amount_paid), 0);
      const extra: Totals["rows"] = invoices.length ? [
        { label: "Invoiced", labelAr: "المفوتر", value: invoiced },
        { label: "Paid", labelAr: "المدفوع", value: paid },
        { label: "Balance due", labelAr: "المتبقي", value: moneyTotals(m).rows.find((r) => r.strong)!.value - paid, strong: true },
      ] : [];
      return {
        type: "sales_order", number, date: day(w.created_at), status: w.status, currency, showPrices: true,
        parties: [{ title: "Customer", titleAr: "العميل", name: str(m.customer_name || m.company_name) || "—",
          lines: [str(m.contact_person), str(m.phone), [str(m.address), str(m.city)].filter(Boolean).join(", "), str(m.email)].filter(Boolean) }],
        refs: [
          m.source_quotation_number ? { label: "Quotation", labelAr: "عرض السعر", value: str(m.source_quotation_number) } : null,
          ...invoices.map((i) => ({ label: "Invoice", labelAr: "فاتورة", value: i.number })),
        ].filter(Boolean) as Ref[],
        meta: [{ label: "Delivery due", labelAr: "موعد التسليم", value: day(w.due_date) }, { label: "Project", labelAr: "المشروع", value: str(m.project_name) }].filter((r) => r.value),
        lines: itemLines(m.items, true), totals: moneyTotals(m, extra), notes: str(m.notes),
        signatures: [{ label: "Sales", labelAr: "المبيعات" }, { label: "Approved by", labelAr: "اعتماد" }, { label: "Customer", labelAr: "العميل" }],
        stamp: w.status === "cancelled" ? { text: "CANCELLED", tone: "void" } : w.status === "draft" ? { text: "DRAFT", tone: "draft" } : undefined,
      };
    }

    const vendor = { title: "Supplier", titleAr: "المورد", name: str(m.vendor_name) || "—", lines: [str(m.vendor_phone)].filter(Boolean) };
    const lines = Array.isArray(m.lines) && (m.lines as unknown[]).length
      ? itemLines(m.lines, kind !== "goods_receipt")
      : [{ name: str(m.items_description || w.title_en), qty: 1, unitPrice: kind === "goods_receipt" ? undefined : num(m.estimated_amount), total: kind === "goods_receipt" ? undefined : num(m.estimated_amount) }];
    const purchaseTotals = (): Totals => {
      if (Array.isArray(m.lines) && (m.lines as unknown[]).length) return moneyTotals({ items: m.lines, tax_rate: m.tax_rate });
      return { rows: [{ label: "Total", labelAr: "الإجمالي", value: num(m.estimated_amount), strong: true }] };
    };

    if (kind === "purchase_request") {
      return {
        type: "purchase_request", number, date: day(w.created_at), status: w.status, currency, showPrices: true,
        parties: [vendor, { title: "Requested by", titleAr: "مقدم الطلب", name: str(m.requested_by) || "—", lines: [str(m.department)].filter(Boolean) }],
        refs: m.po_number ? [{ label: "Purchase order", labelAr: "أمر الشراء", value: str(m.converted_po_number ?? m.po_number) }] : [],
        meta: [{ label: "Needed by", labelAr: "مطلوب قبل", value: day(w.due_date) }, { label: "Priority", labelAr: "الأولوية", value: str(w.priority) }].filter((r) => r.value),
        lines, totals: purchaseTotals(), notes: str(m.notes),
        signatures: [{ label: "Requested by", labelAr: "مقدم الطلب" }, { label: "Approved by", labelAr: "اعتماد" }],
        stamp: w.status === "rejected" || w.status === "cancelled" ? { text: w.status.toUpperCase(), tone: "void" } : undefined,
      };
    }

    if (kind === "purchase_order") {
      return {
        type: "purchase_order", number, date: day(w.created_at), status: w.status, currency, showPrices: true,
        parties: [vendor, { title: "Deliver to", titleAr: "التسليم إلى", name: CLIENT.name, lines: [str(m.delivery_address)].filter(Boolean) }],
        refs: [
          m.source_pr_number ? { label: "Purchase request", labelAr: "طلب الشراء", value: str(m.source_pr_number) } : null,
          ...((m.receipts as Json[] | undefined) ?? []).map((r) => ({ label: "Goods received", labelAr: "إذن استلام", value: str(r.number) })),
        ].filter(Boolean) as Ref[],
        meta: [{ label: "Delivery date", labelAr: "تاريخ التوريد", value: day(m.delivery_date ?? w.due_date) }, { label: "Payment terms", labelAr: "شروط الدفع", value: str(m.payment_terms) }].filter((r) => r.value),
        lines, totals: purchaseTotals(), notes: str(m.notes),
        signatures: [{ label: "Purchasing", labelAr: "المشتريات" }, { label: "Approved by", labelAr: "اعتماد" }, { label: "Supplier acceptance", labelAr: "موافقة المورد" }],
        stamp: w.status === "cancelled" ? { text: "CANCELLED", tone: "void" } : w.status === "draft" ? { text: "DRAFT", tone: "draft" } : undefined,
      };
    }

    // goods_receipt: a PO plus one of its receipt entries (?grn=GRN-…)
    const receipts = ((m.receipts as Json[] | undefined) ?? []);
    const rec = receipts.find((r) => str(r.number) === sub) ?? receipts[receipts.length - 1];
    if (!rec) throw new Error("No goods have been received on this purchase order yet");
    return {
      type: "goods_receipt", number: str(rec.number), date: day(rec.received_at), currency, showPrices: false,
      parties: [vendor, { title: "Received by", titleAr: "المستلم", name: str(rec.received_by) || "—", lines: [] }],
      refs: [{ label: "Purchase order", labelAr: "أمر الشراء", value: number }, ...(m.source_pr_number ? [{ label: "Purchase request", labelAr: "طلب الشراء", value: str(m.source_pr_number) }] : [])],
      meta: [{ label: "Supplier delivery note", labelAr: "إذن المورد", value: str(rec.supplier_ref) }].filter((r) => r.value),
      lines: ((rec.lines as Json[]) ?? []).map((l) => ({ name: str(l.name), qty: num(l.qty), unit: str(l.unit) || undefined, description: l.ordered != null ? `Ordered ${num(l.ordered)}` : undefined })),
      notes: str(rec.notes),
      signatures: [{ label: "Received by (warehouse)", labelAr: "المستلم (المخزن)" }, { label: "Delivered by (supplier)", labelAr: "المسلم (المورد)" }],
    };
  }

  if (kind === "production_order") {
    const po = await ds.production_orders.get(ws, id);
    if (!po) throw new Error("Production order not found");
    const [cut, logs] = await Promise.all([
      ds.cutting_list_items.list(ws, { production_order_id: id }),
      ds.production_stage_log.list(ws, { production_order_id: id }),
    ]);
    const m = (po.metadata ?? {}) as Json;
    return {
      type: "production_order", number: po.po_number, date: day(po.created_at), status: po.status, currency: "EGP", showPrices: false,
      parties: [{ title: "Product", titleAr: "المنتج", name: po.title, lines: [num(m.planned_qty) ? `${num(m.planned_qty)} pieces` : "", po.customer_name ? `For ${po.customer_name}` : ""].filter(Boolean) },
        { title: "Line / station", titleAr: "الخط / المحطة", name: po.assigned_station || "—", lines: [] }],
      refs: [m.sales_order_number ? { label: "Sales order", labelAr: "أمر البيع", value: str(m.sales_order_number) } : null].filter(Boolean) as Ref[],
      meta: [{ label: "Start", labelAr: "البدء", value: day(po.start_date) }, { label: "Due", labelAr: "التسليم", value: day(po.due_date) }, { label: "Priority", labelAr: "الأولوية", value: po.priority }].filter((r) => r.value),
      lines: [...cut].sort((a, b) => a.piece_number - b.piece_number).map((c) => ({
        name: c.part_name, qty: c.qty,
        description: [c.material, c.thickness ? `${c.thickness} plies` : "", c.width && c.length ? `marker ${c.width}×${c.length} cm` : "", c.cnc_program ? `ratio ${c.cnc_program}` : ""].filter(Boolean).join(" · "),
      })),
      notes: str(po.notes),
      extra: logs.length ? (
        <table className="doc-table mt-4">
          <thead><tr><th>Stage / المرحلة</th><th>Status</th><th>Started</th><th>Completed</th><th>By</th></tr></thead>
          <tbody>{logs.map((l) => <tr key={l.id}><td>{l.stage}</td><td>{l.status}</td><td>{day(l.started_at)}</td><td>{day(l.completed_at)}</td><td>{l.worker_name}</td></tr>)}</tbody>
        </table>
      ) : undefined,
      signatures: [{ label: "Production manager", labelAr: "مدير الإنتاج" }, { label: "Line supervisor", labelAr: "مشرف الخط" }, { label: "QC", labelAr: "الجودة" }],
    };
  }

  if (kind === "invoice") {
    const inv = await ds.invoices.get(ws, id);
    if (!inv) throw new Error("Invoice not found");
    const m = (inv.metadata ?? {}) as Json;
    const receipts = (await ds.payments.list(ws, { invoice_id: id })).filter((p) => p.status === "completed");
    const isPartial = Boolean(m.is_partial);
    // Totals always come from the invoice itself (what was issued), never
    // recomputed from the order — so the paper matches the amount due.
    const amount = num(inv.amount);
    const tax = num(inv.tax_amount);
    const subtotal = num(inv.subtotal) || Math.max(0, amount - tax);
    const itemRows = isPartial ? [] : itemLines(m.items, true);
    const lines: Line[] = isPartial
      ? [{ name: `${m.note ? str(m.note) : "Instalment"} — Sales order ${str(m.sales_order_number)}`, description: `Order total ${num(m.order_total).toLocaleString()} ${inv.currency}`, qty: 1, unitPrice: subtotal, total: subtotal }]
      : itemRows.length
        ? itemRows
        : [{ name: str(m.title) || str(m.titleEn) || str(m.note) || `Invoice ${inv.number}`, qty: 1, unitPrice: subtotal, total: subtotal }];
    const linesSum = lines.reduce((sum, l) => sum + num(l.total), 0);
    const discount = Math.round((linesSum - subtotal) * 100) / 100;
    const totals: Totals = { rows: [
      ...(discount > 0.009 ? [{ label: "Lines total", labelAr: "إجمالي البنود", value: linesSum }, { label: "Discount", labelAr: "الخصم", value: discount, negative: true }] : []),
      { label: "Amount before VAT", labelAr: "القيمة قبل الضريبة", value: subtotal },
      ...(tax ? [{ label: `VAT ${num(inv.tax_rate)}%`, labelAr: "ضريبة القيمة المضافة", value: tax }] : []),
      { label: "Invoice total", labelAr: "إجمالي الفاتورة", value: amount, strong: true },
    ] };
    totals.rows.push({ label: "Paid", labelAr: "المدفوع", value: num(inv.amount_paid) }, { label: "Balance due", labelAr: "المتبقي", value: num(inv.amount) - num(inv.amount_paid), strong: true });
    return {
      type: "invoice", number: inv.number, date: day(inv.issue_date ?? inv.created_at), status: inv.status, currency: inv.currency, showPrices: true,
      parties: [{ title: "Bill to", titleAr: "فاتورة إلى", name: inv.org_name_en, lines: [str(m.customer_phone), str(m.customer_address)].filter(Boolean) }],
      refs: [
        m.quotation_number ? { label: "Quotation", labelAr: "عرض السعر", value: str(m.quotation_number) } : null,
        m.sales_order_number ? { label: "Sales order", labelAr: "أمر البيع", value: str(m.sales_order_number) } : null,
        ...receipts.map((r) => ({ label: "Receipt", labelAr: "إيصال", value: str(r.receipt_number) })),
      ].filter(Boolean) as Ref[],
      meta: [{ label: "Due date", labelAr: "تاريخ الاستحقاق", value: day(inv.due_date) }].filter((r) => r.value),
      lines, totals, notes: inv.status === "void" ? `Voided: ${str(inv.void_reason)}` : str(m.note),
      signatures: [{ label: "Issued by", labelAr: "أصدرها" }, { label: "Received by customer", labelAr: "استلام العميل" }],
      stamp: inv.status === "void" ? { text: "VOID", tone: "void" } : inv.status === "paid" ? { text: "PAID", tone: "paid" } : undefined,
    };
  }

  if (kind === "receipt") {
    const p = await ds.payments.get(ws, id);
    if (!p) throw new Error("Receipt not found");
    const m = (p.metadata ?? {}) as Json;
    const method = PAYMENT_METHODS.find((x) => x.value === p.method);
    return {
      type: "receipt", number: str(p.receipt_number) || "—", date: day(p.paid_at ?? p.created_at), status: p.status, currency: p.currency, showPrices: true,
      parties: [{ title: "Received from", titleAr: "استلمنا من", name: str(m.customer) || "—", lines: [] },
        { title: "Received by", titleAr: "استلمها", name: str(p.received_by) || "—", lines: [] }],
      refs: [
        m.sales_order_number ? { label: "Sales order", labelAr: "أمر البيع", value: str(m.sales_order_number) } : null,
        m.invoice_number ? { label: "Invoice", labelAr: "الفاتورة", value: str(m.invoice_number) } : null,
      ].filter(Boolean) as Ref[],
      meta: [{ label: "Method", labelAr: "طريقة الدفع", value: method ? `${method.en} / ${method.ar}` : str(p.method) }, { label: "Reference", labelAr: "المرجع", value: str(p.reference) }].filter((r) => r.value),
      totals: { rows: [
        { label: "Balance before", labelAr: "الرصيد قبل", value: num(m.balance_before) },
        { label: "Amount received", labelAr: "المبلغ المستلم", value: num(p.amount), strong: true },
        { label: "Balance after", labelAr: "الرصيد بعد", value: num(m.balance_after) },
      ] },
      notes: p.status === "void" ? `Voided: ${str(p.void_reason)}` : undefined,
      signatures: [{ label: "Cashier / finance", labelAr: "الخزينة / الحسابات" }, { label: "Customer", labelAr: "العميل" }],
      stamp: p.status === "void" ? { text: "VOID", tone: "void" } : undefined,
    };
  }

  if (kind === "delivery_note") {
    const d = await ds.deliveries.get(ws, id);
    if (!d) throw new Error("Delivery not found");
    const m = (d.metadata ?? {}) as Json;
    return {
      type: "delivery_note", number: d.delivery_number, date: day(d.delivery_date ?? d.created_at), status: d.status, currency: "EGP", showPrices: false,
      parties: [{ title: "Deliver to", titleAr: "التسليم إلى", name: d.customer_name || "—", lines: [str(d.customer_phone), str(d.delivery_address)].filter(Boolean) },
        { title: "Driver", titleAr: "السائق", name: d.driver_name || "—", lines: [str(d.vehicle_info), str(d.delivery_time_slot)].filter(Boolean) }],
      refs: [m.sales_order_number ? { label: "Sales order", labelAr: "أمر البيع", value: str(m.sales_order_number) } : null,
        m.production_order_number ? { label: "Production order", labelAr: "أمر التشغيل", value: str(m.production_order_number) } : null].filter(Boolean) as Ref[],
      meta: [{ label: "Pieces", labelAr: "القطع", value: str(d.num_pieces) }, { label: "Packages", labelAr: "الطرود", value: str(d.num_packages) }].filter((r) => r.value && r.value !== "0"),
      lines: itemLines(m.items, false),
      notes: [str(d.loading_notes), str(d.delivery_notes)].filter(Boolean).join("\n"),
      signatures: [{ label: "Dispatched by", labelAr: "المرسل" }, { label: "Driver", labelAr: "السائق" }, { label: "Received by (name & signature)", labelAr: "المستلم (الاسم والتوقيع)" }],
    };
  }

  // pos_sale
  const t = await ds.pos_transactions.get(ws, id);
  if (!t) throw new Error("Sale not found");
  const items = await ds.pos_transaction_items.list(ws, { transaction_id: id });
  return {
    type: "pos_sale", number: t.transaction_number, date: day(t.created_at), status: t.status, currency: t.currency, showPrices: true,
    parties: [{ title: "Customer", titleAr: "العميل", name: t.customer_name || "Walk-in", lines: [str(t.customer_phone)].filter(Boolean) },
      { title: "Cashier", titleAr: "الكاشير", name: t.cashier_name || "—", lines: [] }],
    refs: [], meta: [{ label: "Payment", labelAr: "الدفع", value: str(t.payment_method) }],
    lines: items.map((i) => ({ name: i.product_name, description: i.sku || undefined, qty: i.quantity, unitPrice: i.unit_price, discountLabel: i.discount_amount ? `-${i.discount_amount}` : undefined, total: i.total })),
    totals: { rows: [
      { label: "Subtotal", labelAr: "الإجمالي", value: num(t.subtotal) },
      ...(num(t.discount_amount) ? [{ label: "Discount", labelAr: "الخصم", value: num(t.discount_amount), negative: true }] : []),
      { label: `VAT ${num(t.tax_rate)}%`, labelAr: "الضريبة", value: num(t.tax_amount) },
      { label: "Total", labelAr: "الإجمالي النهائي", value: num(t.total), strong: true },
    ] },
    signatures: [],
    stamp: t.status === "refunded" || t.status === "voided" ? { text: t.status.toUpperCase(), tone: "void" } : undefined,
  };
}

// ─── Page ─────────────────────────────────────────────────

const money = (n: number, c: string) => `${n.toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${c}`;

export default function PrintDocument() {
  const [location] = useLocation();
  const { workspace } = useAuth();
  const [, , kind, id] = location.split(/[?#]/)[0].split("/") as [string, string, PrintKind, string];
  const sub = new URLSearchParams(window.location.search).get("grn");
  const [doc, setDoc] = useState<PrintModel | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!workspace) return;
    load(kind, id, workspace.id, sub)
      .then((d) => { setDoc(d); document.title = `${d.number} — ${DOC_TITLE[d.type].en}`; })
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }, [kind, id, sub, workspace]);

  const company = ((workspace?.settings ?? {}) as Json).company as Json | undefined;

  if (error) return <div className="p-10 text-center text-body text-destructive">{error}</div>;
  if (!doc) return <div className="p-16 flex justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div>;
  const title = DOC_TITLE[doc.type];

  return (
    <div className="print-root min-h-screen bg-muted/40 py-8 print:bg-white print:py-0" dir="ltr">
      <style>{`
        @page { size: A4; margin: 14mm; }
        @media print { .no-print { display: none !important; } .sheet { box-shadow: none !important; margin: 0 !important; width: auto !important; min-height: 0 !important; padding: 0 !important; } body { background: #fff !important; } }
        .sheet { font-family: 'Inter', 'DM Sans', system-ui, sans-serif; color: #1f1a14; font-size: 11.5px; line-height: 1.45; }
        .doc-table { width: 100%; border-collapse: collapse; }
        .doc-table th { text-align: start; font-size: 10px; text-transform: uppercase; letter-spacing: .04em; color: #6b6154; border-bottom: 1.5px solid #1f1a14; padding: 6px 6px; }
        .doc-table td { border-bottom: 1px solid #e7e0d4; padding: 7px 6px; vertical-align: top; }
        .doc-table td.num, .doc-table th.num { text-align: end; font-variant-numeric: tabular-nums; white-space: nowrap; }
        .ar { font-family: 'Noto Kufi Arabic', 'Segoe UI', Tahoma, sans-serif; direction: rtl; }
      `}</style>

      <div className="no-print max-w-[210mm] mx-auto mb-4 flex items-center justify-between px-2">
        <p className="text-caption text-muted-foreground">{title.en} {doc.number}</p>
        <div className="flex gap-2">
          <button onClick={() => window.history.state?.fromApp ? window.history.back() : window.close()} className="h-9 px-3 rounded-lg border border-border bg-card text-caption inline-flex items-center gap-1.5"><X size={13} /> Close</button>
          <button onClick={() => window.print()} className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-caption font-semibold inline-flex items-center gap-1.5"><Printer size={14} /> Print / Save PDF</button>
        </div>
      </div>

      <div className="sheet relative bg-white mx-auto w-[210mm] min-h-[297mm] px-[14mm] py-[12mm] shadow-lg">
        {doc.stamp && (
          <div className={`absolute top-[70mm] end-[18mm] rotate-[-14deg] border-[3px] rounded-md px-4 py-1 text-[26px] font-bold tracking-widest opacity-60 ${doc.stamp.tone === "paid" ? "border-emerald-700 text-emerald-700" : doc.stamp.tone === "void" ? "border-rose-700 text-rose-700" : "border-stone-500 text-stone-500"}`}>
            {doc.stamp.text}
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between gap-6 pb-5 border-b-2 border-[#1f1a14]">
          <div className="flex items-center gap-3">
            <img src={CLIENT.logo} alt={CLIENT.name} className="w-16 h-16 object-contain" />
            <div>
              <p className="text-[17px] font-bold">{str(company?.legal_name) || workspace?.name || CLIENT.name}</p>
              {company?.legal_name_ar ? <p className="text-[13px] font-semibold" dir="rtl">{str(company.legal_name_ar)}</p> : null}
              {[str(company?.address), str(company?.phone), str(company?.email), company?.tax_number ? `Tax reg. ${str(company.tax_number)}` : "", company?.commercial_register ? `C.R. ${str(company.commercial_register)}` : ""]
                .filter(Boolean).map((l) => <p key={l} className="text-[10.5px] text-stone-600">{l}</p>)}
            </div>
          </div>
          <div className="text-end">
            <p className="text-[20px] font-bold leading-tight">{title.en}</p>
            <p className="ar text-[15px] font-semibold text-stone-700">{title.ar}</p>
            <p className="mt-2 font-mono text-[14px] font-bold">{doc.number}</p>
            <p className="text-[11px] text-stone-600">Date / التاريخ: {doc.date}</p>
          </div>
        </div>

        {/* Parties + meta */}
        <div className="grid grid-cols-3 gap-4 py-4 border-b border-stone-200">
          {doc.parties.map((p) => (
            <div key={p.title}>
              <p className="text-[9.5px] uppercase tracking-wider text-stone-500">{p.title} · <span className="ar normal-case">{p.titleAr}</span></p>
              <p className="font-semibold text-[12.5px] mt-0.5">{p.name}</p>
              {p.lines.map((l) => <p key={l} className="text-[11px] text-stone-600">{l}</p>)}
            </div>
          ))}
          {(doc.meta.length > 0 || doc.refs.length > 0) && (
            <div className="space-y-1">
              {[...doc.meta, ...doc.refs].map((r, i) => (
                <div key={i} className="flex justify-between gap-2 text-[11px]">
                  <span className="text-stone-500">{r.label} <span className="ar">/ {r.labelAr}</span></span>
                  <span className="font-medium font-mono text-end">{r.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Lines */}
        {doc.lines && doc.lines.length > 0 && (
          <table className="doc-table mt-4">
            <thead>
              <tr>
                <th style={{ width: 28 }}>#</th>
                <th>Item / الصنف</th>
                <th className="num">Qty / الكمية</th>
                {doc.showPrices && <th className="num">Unit price</th>}
                {doc.showPrices && <th className="num">Disc.</th>}
                {doc.showPrices && <th className="num">Total / الإجمالي</th>}
              </tr>
            </thead>
            <tbody>
              {doc.lines.map((l, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td><p className="font-medium">{l.name}</p>{l.description && <p className="text-[10.5px] text-stone-500">{l.description}</p>}</td>
                  <td className="num">{l.qty.toLocaleString()}{l.unit ? ` ${l.unit}` : ""}</td>
                  {doc.showPrices && <td className="num">{l.unitPrice != null ? money(l.unitPrice, "") : ""}</td>}
                  {doc.showPrices && <td className="num">{l.discountLabel ?? ""}</td>}
                  {doc.showPrices && <td className="num">{l.total != null ? money(l.total, "") : ""}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {doc.extra}

        {/* Totals */}
        {doc.totals && (
          <div className="flex justify-end mt-4">
            <table className="w-[80mm] text-[12px]">
              <tbody>
                {doc.totals.rows.map((r, i) => (
                  <tr key={i} className={r.strong ? "border-t border-[#1f1a14]" : ""}>
                    <td className={`py-1 ${r.strong ? "font-bold" : "text-stone-600"}`}>{r.label} <span className="ar text-[10.5px]">/ {r.labelAr}</span></td>
                    <td className={`py-1 text-end tabular-nums ${r.strong ? "font-bold" : ""}`}>{r.negative ? "−" : ""}{money(r.value, doc.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {doc.notes && (
          <div className="mt-5 p-3 rounded border border-stone-200 bg-stone-50">
            <p className="text-[9.5px] uppercase tracking-wider text-stone-500 mb-1">Notes · <span className="ar">ملاحظات</span></p>
            <p className="whitespace-pre-line text-[11px]">{doc.notes}</p>
          </div>
        )}

        {/* Signatures */}
        {doc.signatures.length > 0 && (
          <div className="grid gap-6 mt-14" style={{ gridTemplateColumns: `repeat(${doc.signatures.length}, 1fr)` }}>
            {doc.signatures.map((s) => (
              <div key={s.label} className="border-t border-stone-400 pt-1.5">
                <p className="text-[10.5px] text-stone-600">{s.label}</p>
                <p className="ar text-[10.5px] text-stone-600">{s.labelAr}</p>
              </div>
            ))}
          </div>
        )}

        <p className="absolute bottom-[8mm] start-[14mm] end-[14mm] text-[9px] text-stone-400 flex justify-between">
          <span>{title.en} {doc.number}{doc.status ? ` · status: ${doc.status}` : ""}</span>
          <span>Printed {new Date().toLocaleString("en-GB")} · {BRAND.name}</span>
        </p>
      </div>
    </div>
  );
}
