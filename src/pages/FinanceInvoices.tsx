/**
 * Finance · Invoices & Receipts
 *
 * Invoices are issued from a confirmed sales order (Sales Orders → Create
 * invoice); this page is where money comes in against them. Every payment
 * issues a numbered receipt; nothing here can be deleted — invoices and
 * receipts are voided with a reason, and the database recomputes balances
 * (supabase/documents.sql).
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import {
  FileText, Receipt as ReceiptIcon, Search, Loader2, Printer, Plus, X, AlertCircle, Ban, ChevronDown, ChevronRight, CheckCircle2, Clock,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { getDataSource } from "../lib/data-source";
import {
  PAYMENT_METHODS, recordInvoicePayment, voidInvoice, voidReceipt, openPrint,
  type Invoice, type Receipt, type PaymentMethod,
} from "../lib/documents";

const inputCls = "w-full h-10 px-3 rounded-xl border border-border/60 bg-background text-body focus:outline-none focus:ring-2 focus:ring-brand-ink/20";
const labelCls = "text-micro text-muted-foreground font-medium mb-1 block";
const btnPrimary = "inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground text-body font-medium px-4 hover:opacity-90 transition-opacity disabled:opacity-40";

const fmt = (n: number) => n.toLocaleString("en", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
const paidOf = (i: Invoice) => Number(i.amount_paid ?? (i as unknown as { paid_amount?: number }).paid_amount ?? 0);
const balanceOf = (i: Invoice) => Math.round((Number(i.amount) - paidOf(i)) * 100) / 100;
const isOverdue = (i: Invoice) => !!i.due_date && balanceOf(i) > 0 && !["void", "cancelled", "paid"].includes(i.status) && new Date(i.due_date) < new Date(new Date().toDateString());

const STATUS: Record<string, { en: string; ar: string; pill: string }> = {
  draft: { en: "Draft", ar: "مسودة", pill: "bg-slate-100 text-slate-600" },
  sent: { en: "Unpaid", ar: "غير مدفوعة", pill: "bg-blue-100 text-blue-700" },
  partially_paid: { en: "Partly paid", ar: "مدفوعة جزئياً", pill: "bg-warning/15 text-warning" },
  paid: { en: "Paid", ar: "مدفوعة", pill: "bg-emerald-100 text-emerald-700" },
  overdue: { en: "Overdue", ar: "متأخرة", pill: "bg-rose-100 text-rose-700" },
  void: { en: "Void", ar: "ملغاة", pill: "bg-muted text-muted-foreground line-through" },
  cancelled: { en: "Cancelled", ar: "ملغاة", pill: "bg-muted text-muted-foreground" },
};

export default function FinanceInvoices() {
  const { lang } = useLanguage();
  const ar = lang === "ar";
  const { workspace } = useAuth();
  const wid = workspace?.id || "demo";
  const canVoid = ["owner", "admin", "finance", "manager"].includes(workspace?.role ?? "owner");

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [tab, setTab] = useState<"invoices" | "receipts">("invoices");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "due" | "overdue" | "paid" | "void">("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [payFor, setPayFor] = useState<Invoice | null>(null);
  const [voiding, setVoiding] = useState<{ kind: "invoice" | "receipt"; id: string; number: string } | null>(null);

  const load = useCallback(async () => {
    try {
      const ds = getDataSource();
      const [inv, pay] = await Promise.all([ds.invoices.list(wid), ds.payments.list(wid)]);
      setInvoices(inv as Invoice[]);
      setReceipts(pay as Receipt[]);
      setLoadError(null);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [wid]);
  useEffect(() => { load(); }, [load]);

  const currency = String((workspace?.settings as Record<string, unknown> | undefined)?.currency ?? "EGP");

  const stats = useMemo(() => {
    const live = invoices.filter((i) => !["void", "cancelled"].includes(i.status));
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    return {
      outstanding: live.reduce((s, i) => s + Math.max(0, balanceOf(i)), 0),
      overdue: live.filter(isOverdue).reduce((s, i) => s + balanceOf(i), 0),
      overdueCount: live.filter(isOverdue).length,
      collectedMonth: receipts.filter((r) => r.status === "completed" && r.paid_at && new Date(r.paid_at) >= monthStart).reduce((s, r) => s + Number(r.amount), 0),
      invoicedMonth: live.filter((i) => new Date(i.issue_date ?? i.created_at) >= monthStart).reduce((s, i) => s + Number(i.amount), 0),
    };
  }, [invoices, receipts]);

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();
    return invoices.filter((i) => {
      const m = (i.metadata ?? {}) as Record<string, unknown>;
      const hit = !q || [i.number, i.org_name_en, String(m.sales_order_number ?? "")].some((v) => v?.toLowerCase().includes(q));
      const f = filter === "all"
        || (filter === "due" && balanceOf(i) > 0 && !["void", "cancelled"].includes(i.status))
        || (filter === "overdue" && isOverdue(i))
        || (filter === "paid" && i.status === "paid")
        || (filter === "void" && ["void", "cancelled"].includes(i.status));
      return hit && f;
    });
  }, [invoices, search, filter]);

  const shownReceipts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return receipts.filter((r) => {
      const m = (r.metadata ?? {}) as Record<string, unknown>;
      return !q || [r.receipt_number ?? "", String(m.invoice_number ?? ""), String(m.customer ?? ""), r.reference ?? ""].some((v) => v.toLowerCase().includes(q));
    });
  }, [receipts, search]);

  if (loading) return <div className="py-24 flex justify-center"><Loader2 className="animate-spin text-muted-foreground/40" /></div>;

  return (
    <div className="min-h-full">
      <div className="border-b border-border/40 px-7 md:px-10 py-7">
        <div className="max-w-[1100px]">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <h1 className="text-display font-medium leading-tight" style={{ fontFamily: "var(--app-font-serif)" }}>{ar ? "الفواتير والإيصالات" : "Invoices & Receipts"}</h1>
              <p className="text-caption text-muted-foreground mt-1">
                {ar ? "الفواتير تصدر من أمر بيع مؤكد. سجّل هنا كل دفعة ليصدر لها إيصال مرقم." : "Invoices are issued from a confirmed sales order. Record each payment here to issue a numbered receipt."}
              </p>
            </div>
            <Link href="/orders" className={btnPrimary + " h-9 shrink-0"}><Plus size={14} /> {ar ? "فاتورة من أمر بيع" : "Invoice a sales order"}</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: ar ? "مستحق التحصيل" : "Outstanding", value: stats.outstanding, tone: "text-foreground" },
              { label: ar ? `متأخر (${stats.overdueCount})` : `Overdue (${stats.overdueCount})`, value: stats.overdue, tone: stats.overdue > 0 ? "text-rose-600" : "text-emerald-600" },
              { label: ar ? "فواتير هذا الشهر" : "Invoiced this month", value: stats.invoicedMonth, tone: "text-foreground" },
              { label: ar ? "تحصيل هذا الشهر" : "Collected this month", value: stats.collectedMonth, tone: "text-emerald-600" },
            ].map((s) => (
              <div key={s.label} className="bg-background border border-border/40 rounded-xl px-4 py-3.5">
                <p className={`text-title font-medium tabular-nums ${s.tone}`} style={{ fontFamily: "var(--app-font-serif)" }}>{fmt(s.value)} <span className="text-micro text-muted-foreground">{currency}</span></p>
                <p className="text-micro text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-7 md:px-10 py-4 border-b border-border/30 sticky top-0 z-20 bg-background/95 backdrop-blur-sm">
        <div className="max-w-[1100px] flex flex-wrap items-center gap-3">
          <div className="flex p-1 rounded-lg bg-muted/60">
            {(["invoices", "receipts"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)} className={`px-3 py-1.5 rounded-md text-caption font-medium flex items-center gap-1.5 ${tab === t ? "bg-card shadow-sm" : "text-muted-foreground"}`}>
                {t === "invoices" ? <FileText size={12} /> : <ReceiptIcon size={12} />}
                {t === "invoices" ? (ar ? "الفواتير" : "Invoices") : (ar ? "الإيصالات" : "Receipts")}
              </button>
            ))}
          </div>
          <div className="relative flex-1 min-w-[200px] max-w-[320px]">
            <Search size={13} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={ar ? "رقم، عميل، أمر بيع..." : "Number, customer, sales order…"} className={inputCls + " h-9 ps-9"} />
          </div>
          {tab === "invoices" && (
            <select value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)} className="h-9 px-3 rounded-xl border border-border/60 bg-background text-caption">
              <option value="all">{ar ? "الكل" : "All"}</option>
              <option value="due">{ar ? "عليها رصيد" : "Balance due"}</option>
              <option value="overdue">{ar ? "متأخرة" : "Overdue"}</option>
              <option value="paid">{ar ? "مدفوعة" : "Paid"}</option>
              <option value="void">{ar ? "ملغاة" : "Void"}</option>
            </select>
          )}
        </div>
      </div>

      <div className="px-7 md:px-10 py-6 max-w-[1100px]">
        {loadError && <p className="mb-4 text-caption text-rose-600">{loadError}</p>}

        {tab === "invoices" && (shown.length === 0 ? (
          <div className="py-20 text-center">
            <FileText size={26} className="mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-body text-muted-foreground">{invoices.length ? (ar ? "لا نتائج" : "No matching invoices") : (ar ? "لا توجد فواتير بعد — أصدرها من صفحة أوامر البيع." : "No invoices yet — issue one from a confirmed sales order.")}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {shown.map((inv) => {
              const m = (inv.metadata ?? {}) as Record<string, unknown>;
              const bal = balanceOf(inv);
              const st = isOverdue(inv) ? STATUS.overdue : STATUS[inv.status] ?? STATUS.sent;
              const invReceipts = receipts.filter((r) => r.invoice_id === inv.id);
              const open = expanded === inv.id;
              const live = !["void", "cancelled"].includes(inv.status);
              return (
                <div key={inv.id} className="border border-border/40 rounded-xl bg-background">
                  <div className="flex flex-wrap items-center gap-3 p-4">
                    <button onClick={() => setExpanded(open ? null : inv.id)} className="text-muted-foreground" aria-label="Details">
                      {open ? <ChevronDown size={15} /> : <ChevronRight size={15} className="rtl:rotate-180" />}
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-caption font-semibold">{inv.number}</span>
                        <span className={`text-micro px-2 py-0.5 rounded-full font-medium ${st.pill}`}>{ar ? st.ar : st.en}</span>
                        {Boolean(m.sales_order_number) && <span className="text-micro text-muted-foreground font-mono">← {String(m.sales_order_number)}</span>}
                      </div>
                      <p className="text-body font-medium mt-0.5">{inv.org_name_en}</p>
                      <p className="text-micro text-muted-foreground">
                        {ar ? "صدرت" : "Issued"} {inv.issue_date ?? inv.created_at.slice(0, 10)}{inv.due_date ? ` · ${ar ? "تستحق" : "due"} ${inv.due_date}` : ""}
                      </p>
                    </div>
                    <div className="text-end">
                      <p className="text-title font-semibold tabular-nums">{fmt(Number(inv.amount))} <span className="text-micro text-muted-foreground">{inv.currency}</span></p>
                      {live && <p className={`text-micro tabular-nums ${bal > 0 ? "text-rose-600" : "text-emerald-600"}`}>{bal > 0 ? `${fmt(bal)} ${ar ? "متبقي" : "due"}` : (ar ? "مسددة" : "settled")}</p>}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {live && bal > 0 && (
                        <button onClick={() => setPayFor(inv)} className={btnPrimary + " h-8 text-caption px-3"}><Plus size={12} /> {ar ? "تسجيل دفعة" : "Record payment"}</button>
                      )}
                      <button onClick={() => openPrint("invoice", inv.id)} className="h-8 px-3 rounded-xl border border-border/60 text-caption inline-flex items-center gap-1.5 hover:bg-muted/50"><Printer size={12} /> {ar ? "طباعة" : "Print"}</button>
                    </div>
                  </div>

                  {open && (
                    <div className="border-t border-border/30 px-5 py-4 space-y-3 bg-muted/10">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-caption">
                        <div><p className="text-micro text-muted-foreground">{ar ? "قبل الضريبة" : "Before VAT"}</p><p className="tabular-nums">{fmt(Number(inv.subtotal ?? inv.amount))}</p></div>
                        <div><p className="text-micro text-muted-foreground">{ar ? "الضريبة" : "VAT"} {inv.tax_rate ? `${inv.tax_rate}%` : ""}</p><p className="tabular-nums">{fmt(Number(inv.tax_amount ?? 0))}</p></div>
                        <div><p className="text-micro text-muted-foreground">{ar ? "المدفوع" : "Paid"}</p><p className="tabular-nums text-emerald-600">{fmt(paidOf(inv))}</p></div>
                        <div><p className="text-micro text-muted-foreground">{ar ? "المتبقي" : "Balance"}</p><p className="tabular-nums">{fmt(bal)}</p></div>
                      </div>
                      {inv.status === "void" && <p className="text-caption text-rose-600">{ar ? "سبب الإلغاء" : "Void reason"}: {inv.void_reason}</p>}
                      <div>
                        <p className="text-micro font-medium text-muted-foreground mb-1.5">{ar ? "الإيصالات" : "Receipts"}</p>
                        {invReceipts.length === 0 ? <p className="text-caption text-muted-foreground">{ar ? "لا توجد دفعات" : "No payments yet"}</p> : (
                          <div className="space-y-1">
                            {invReceipts.map((r) => <ReceiptRow key={r.id} r={r} ar={ar} canVoid={canVoid} onVoid={() => setVoiding({ kind: "receipt", id: r.id, number: r.receipt_number ?? "" })} />)}
                          </div>
                        )}
                      </div>
                      {live && canVoid && (
                        <button onClick={() => setVoiding({ kind: "invoice", id: inv.id, number: inv.number })} className="text-micro text-rose-600 inline-flex items-center gap-1 hover:underline">
                          <Ban size={11} /> {ar ? "إلغاء الفاتورة" : "Void invoice"}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}

        {tab === "receipts" && (shownReceipts.length === 0 ? (
          <div className="py-20 text-center text-body text-muted-foreground">{ar ? "لا توجد إيصالات بعد" : "No receipts yet"}</div>
        ) : (
          <div className="space-y-1.5">
            {shownReceipts.map((r) => <ReceiptRow key={r.id} r={r} ar={ar} canVoid={canVoid} showInvoice onVoid={() => setVoiding({ kind: "receipt", id: r.id, number: r.receipt_number ?? "" })} />)}
          </div>
        ))}
      </div>

      {payFor && <PaymentModal ar={ar} invoice={payFor} workspaceId={workspace?.id} onClose={() => setPayFor(null)} onDone={load} />}
      {voiding && <VoidModal ar={ar} target={voiding} onClose={() => setVoiding(null)} onDone={load} />}
    </div>
  );
}

function ReceiptRow({ r, ar, canVoid, showInvoice, onVoid }: { r: Receipt; ar: boolean; canVoid: boolean; showInvoice?: boolean; onVoid: () => void }) {
  const m = (r.metadata ?? {}) as Record<string, unknown>;
  const method = PAYMENT_METHODS.find((x) => x.value === r.method);
  const isVoid = r.status === "void";
  return (
    <div className={`flex flex-wrap items-center gap-3 px-3 py-2 rounded-lg border border-border/30 bg-background ${isVoid ? "opacity-60" : ""}`}>
      {isVoid ? <Ban size={13} className="text-rose-600" /> : <CheckCircle2 size={13} className="text-emerald-600" />}
      <span className={`font-mono text-caption ${isVoid ? "line-through" : ""}`}>{r.receipt_number ?? "—"}</span>
      {showInvoice && <span className="text-micro text-muted-foreground font-mono">→ {String(m.invoice_number ?? "")}</span>}
      <span className="text-caption flex-1 min-w-[120px]">{String(m.customer ?? "")}</span>
      <span className="text-micro text-muted-foreground flex items-center gap-1"><Clock size={10} />{(r.paid_at ?? r.created_at).slice(0, 10)}</span>
      <span className="text-micro text-muted-foreground">{method ? (ar ? method.ar : method.en) : r.method}{r.reference ? ` · ${r.reference}` : ""}</span>
      <span className="text-caption font-semibold tabular-nums">{fmt(Number(r.amount))} {r.currency}</span>
      <button onClick={() => openPrint("receipt", r.id)} className="h-7 px-2 rounded-lg border border-border/60 text-micro inline-flex items-center gap-1 hover:bg-muted/50"><Printer size={11} /> {ar ? "طباعة" : "Print"}</button>
      {!isVoid && canVoid && r.receipt_number && (
        <button onClick={onVoid} className="h-7 px-2 rounded-lg text-micro text-rose-600 hover:bg-rose-50" title={ar ? "إلغاء الإيصال" : "Void receipt"}><Ban size={11} /></button>
      )}
      {isVoid && <span className="w-full text-micro text-rose-600">{ar ? "ملغي" : "Void"}: {r.void_reason}</span>}
    </div>
  );
}

function PaymentModal({ ar, invoice, workspaceId, onClose, onDone }: { ar: boolean; invoice: Invoice; workspaceId: string | undefined; onClose: () => void; onDone: () => void }) {
  const balance = balanceOf(invoice);
  const [amount, setAmount] = useState(String(balance));
  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [reference, setReference] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<Receipt | null>(null);
  const value = Math.round((parseFloat(amount) || 0) * 100) / 100;

  async function submit() {
    setBusy(true); setError(null);
    try {
      const r = await recordInvoicePayment(workspaceId, invoice, { amount: value, method, reference: reference.trim() || undefined, paidAt: new Date(`${date}T12:00:00`).toISOString() });
      setDone(r);
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative bg-background border border-border/40 rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-title font-medium" style={{ fontFamily: "var(--app-font-serif)" }}>{ar ? "تسجيل دفعة" : "Record payment"}</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted"><X size={14} /></button>
        </div>
        {done ? (
          <div className="space-y-4">
            <p className="text-body">{ar ? "تم إصدار الإيصال" : "Receipt issued"} <span className="font-mono font-semibold">{done.receipt_number}</span> — {fmt(Number(done.amount))} {done.currency}</p>
            <div className="flex gap-2">
              <button onClick={() => openPrint("receipt", done.id)} className={btnPrimary + " h-10 flex-1"}><Printer size={14} /> {ar ? "طباعة الإيصال" : "Print receipt"}</button>
              <button onClick={onClose} className="h-10 px-4 rounded-xl border border-border/60 text-body">{ar ? "تم" : "Done"}</button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl bg-muted/20 p-3 text-caption space-y-1">
              <div className="flex justify-between"><span className="text-muted-foreground">{ar ? "الفاتورة" : "Invoice"}</span><span className="font-mono">{invoice.number}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">{ar ? "العميل" : "Customer"}</span><span>{invoice.org_name_en}</span></div>
              <div className="flex justify-between font-medium"><span>{ar ? "المستحق" : "Balance due"}</span><span className="tabular-nums">{fmt(balance)} {invoice.currency}</span></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={labelCls}>{ar ? "المبلغ" : "Amount"}</label>
                <input type="number" min={0} max={balance} step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className={inputCls} /></div>
              <div><label className={labelCls}>{ar ? "التاريخ" : "Date"}</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={labelCls}>{ar ? "طريقة الدفع" : "Method"}</label>
                <select value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)} className={inputCls}>
                  {PAYMENT_METHODS.map((p) => <option key={p.value} value={p.value}>{ar ? p.ar : p.en}</option>)}
                </select></div>
              <div><label className={labelCls}>{ar ? "المرجع (اختياري)" : "Reference (optional)"}</label>
                <input value={reference} onChange={(e) => setReference(e.target.value)} className={inputCls} placeholder={ar ? "رقم التحويل / الشيك" : "Transfer / cheque no."} /></div>
            </div>
            {value > balance && <p className="text-caption text-rose-600">{ar ? "المبلغ أكبر من المستحق" : "Amount is more than the balance due."}</p>}
            {error && <p className="text-caption text-rose-600 flex items-start gap-1"><AlertCircle size={12} className="mt-0.5" />{error}</p>}
            <button onClick={submit} disabled={busy || !(value > 0) || value > balance} className={btnPrimary + " h-10 w-full"}>
              {busy && <Loader2 size={13} className="animate-spin" />} {ar ? "تسجيل وإصدار إيصال" : "Record & issue receipt"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function VoidModal({ ar, target, onClose, onDone }: { ar: boolean; target: { kind: "invoice" | "receipt"; id: string; number: string }; onClose: () => void; onDone: () => void }) {
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function submit() {
    setBusy(true); setError(null);
    try {
      if (target.kind === "invoice") await voidInvoice(target.id, reason.trim());
      else await voidReceipt(target.id, reason.trim());
      onDone(); onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally { setBusy(false); }
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative bg-background border border-border/40 rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-title font-medium">{target.kind === "invoice" ? (ar ? "إلغاء الفاتورة" : "Void invoice") : (ar ? "إلغاء الإيصال" : "Void receipt")} <span className="font-mono">{target.number}</span></h2>
        <p className="text-caption text-muted-foreground">
          {ar ? "الرقم يبقى مسجلاً ويظهر كملغي. لا يمكن التراجع." : "The number stays on record, marked void. This can't be undone."}
        </p>
        <div><label className={labelCls}>{ar ? "السبب" : "Reason"}</label>
          <input value={reason} onChange={(e) => setReason(e.target.value)} className={inputCls} autoFocus /></div>
        {error && <p className="text-caption text-rose-600">{error}</p>}
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 h-10 rounded-xl border border-border/60 text-body">{ar ? "رجوع" : "Back"}</button>
          <button onClick={submit} disabled={busy || !reason.trim()} className="flex-1 h-10 rounded-xl bg-rose-600 text-white text-body font-medium disabled:opacity-40 inline-flex items-center justify-center gap-2">
            {busy && <Loader2 size={13} className="animate-spin" />}{ar ? "إلغاء نهائي" : "Void"}
          </button>
        </div>
      </div>
    </div>
  );
}
