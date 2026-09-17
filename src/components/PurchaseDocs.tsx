/**
 * Purchase request / purchase order forms and goods receiving.
 *
 * Every document carries real item lines (name, qty, unit, unit price), gets
 * its number from the database on save, and keeps its references:
 *   purchase request  →  purchase order   (source_pr / converted_po)
 *   purchase order    →  goods received notes (receipts[], one GRN number each)
 * Receiving can never exceed what was ordered, line by line.
 */

import { useMemo, useState } from "react";
import { X, Plus, Trash2, Loader2, AlertCircle, Printer } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getDataSource } from "../lib/data-source";
import { calcBreakdown } from "../lib/money";
import { nextDocumentNumber, openPrint, EG_VAT_RATE } from "../lib/documents";
import type { Database } from "../lib/database.types";

type Org = Database["public"]["Tables"]["organizations"]["Row"];
type WorkItem = Database["public"]["Tables"]["work_items"]["Row"];

export interface PurchaseLine { id: string; name: string; qty: number; unit: string; unitPrice: number; received?: number }
export interface GoodsReceipt { number: string; received_at: string; received_by: string; supplier_ref?: string; notes?: string; lines: { name: string; qty: number; unit: string; ordered: number }[] }

const inputCls = "w-full h-10 rounded-xl border border-border/60 bg-background px-3 text-body focus:outline-none focus:ring-2 focus:ring-brand-ink/20";
const smallCls = "w-full h-9 rounded-lg border border-border/60 bg-background px-2 text-caption focus:outline-none focus:ring-1 focus:ring-brand-ink/20";
const labelCls = "text-micro font-medium text-muted-foreground mb-1 block";
const btnPrimary = "flex items-center justify-center gap-2 px-4 rounded-xl bg-foreground text-background text-body font-medium hover:opacity-90 transition-opacity disabled:opacity-50";
const fmt = (n: number) => n.toLocaleString("en", { maximumFractionDigits: 2 });
const newLine = (): PurchaseLine => ({ id: crypto.randomUUID(), name: "", qty: 1, unit: "pcs", unitPrice: 0 });

export function linesOf(w: WorkItem): PurchaseLine[] {
  const m = (w.metadata ?? {}) as { lines?: PurchaseLine[] };
  return Array.isArray(m.lines) ? m.lines : [];
}

function Shell({ title, onClose, children, wide }: { title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/20 backdrop-blur-[3px]" onClick={onClose} />
      <div className={`relative bg-background border border-border/60 rounded-2xl shadow-xl w-full ${wide ? "max-w-[760px]" : "max-w-[520px]"} max-h-[90vh] overflow-auto`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/40 sticky top-0 bg-background z-10">
          <h2 className="text-title font-medium" style={{ fontFamily: "var(--app-font-serif)" }}>{title}</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted"><X size={14} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Lines editor ─────────────────────────────────────────

function LinesEditor({ lines, setLines, ar, currency, showPrices }: {
  lines: PurchaseLine[]; setLines: (l: PurchaseLine[]) => void; ar: boolean; currency: string; showPrices: boolean;
}) {
  const update = (i: number, patch: Partial<PurchaseLine>) => setLines(lines.map((l, j) => (j === i ? { ...l, ...patch } : l)));
  return (
    <div className="space-y-2">
      <div className={`grid gap-2 text-micro text-muted-foreground ${showPrices ? "grid-cols-[1fr_70px_70px_100px_90px_28px]" : "grid-cols-[1fr_80px_80px_28px]"}`}>
        <span>{ar ? "الصنف" : "Item"}</span><span>{ar ? "الكمية" : "Qty"}</span><span>{ar ? "الوحدة" : "Unit"}</span>
        {showPrices && <><span>{ar ? "سعر الوحدة" : "Unit price"}</span><span className="text-end">{ar ? "الإجمالي" : "Total"}</span></>}
        <span />
      </div>
      {lines.map((l, i) => (
        <div key={l.id} className={`grid gap-2 items-center ${showPrices ? "grid-cols-[1fr_70px_70px_100px_90px_28px]" : "grid-cols-[1fr_80px_80px_28px]"}`}>
          <input value={l.name} onChange={(e) => update(i, { name: e.target.value })} className={smallCls} placeholder={ar ? "مثال: قماش فرنش تيري" : "e.g. French terry 320gsm"} />
          <input type="number" min={0} step="any" value={l.qty} onChange={(e) => update(i, { qty: parseFloat(e.target.value) || 0 })} className={smallCls} />
          <input value={l.unit} onChange={(e) => update(i, { unit: e.target.value })} className={smallCls} />
          {showPrices && <input type="number" min={0} step="any" value={l.unitPrice} onChange={(e) => update(i, { unitPrice: parseFloat(e.target.value) || 0 })} className={smallCls} />}
          {showPrices && <span className="text-caption tabular-nums text-end">{fmt(l.qty * l.unitPrice)}</span>}
          <button type="button" onClick={() => setLines(lines.filter((_, j) => j !== i))} disabled={lines.length === 1} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-rose-600 disabled:opacity-30"><Trash2 size={12} /></button>
        </div>
      ))}
      <button type="button" onClick={() => setLines([...lines, newLine()])} className="text-micro text-brand-ink font-medium flex items-center gap-1"><Plus size={12} /> {ar ? "إضافة صنف" : "Add line"}</button>
    </div>
  );
}

// ─── Create PR / PO ───────────────────────────────────────

export function PurchaseDocModal({ kind, source, vendors, ar, currency, onClose, onSaved }: {
  kind: "purchase_request" | "purchase_order";
  /** An approved purchase request to turn into a purchase order. */
  source?: WorkItem | null;
  vendors: Org[]; ar: boolean; currency: string;
  onClose: () => void;
  onSaved: (created: WorkItem, updatedSource?: WorkItem) => void;
}) {
  const { workspace, user } = useAuth();
  const sm = (source?.metadata ?? {}) as Record<string, unknown>;
  const [title, setTitle] = useState(source?.title_en ?? "");
  const [vendor, setVendor] = useState(String(sm.vendor_id ?? source?.organization_id ?? ""));
  const [date, setDate] = useState(source?.due_date?.slice(0, 10) ?? "");
  const [department, setDepartment] = useState(String(sm.department ?? ""));
  const [priority, setPriority] = useState(source?.priority ?? "medium");
  const [terms, setTerms] = useState("");
  const [taxRate, setTaxRate] = useState(kind === "purchase_order" ? String(EG_VAT_RATE) : "0");
  const [notes, setNotes] = useState(String(sm.notes ?? ""));
  const [lines, setLines] = useState<PurchaseLine[]>(() => {
    const src = source ? linesOf(source) : [];
    if (src.length) return src.map((l) => ({ ...l, id: crypto.randomUUID(), received: 0 }));
    if (source && sm.items_description) return [{ ...newLine(), name: String(sm.items_description), unitPrice: Number(sm.estimated_amount) || 0 }];
    return [newLine()];
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cleanLines = lines.filter((l) => l.name.trim() && l.qty > 0);
  const totals = useMemo(() => calcBreakdown({ items: cleanLines, tax_rate: parseFloat(taxRate) || 0 }), [cleanLines, taxRate]);
  const isPO = kind === "purchase_order";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!workspace) return;
    if (!title.trim()) return setError(ar ? "اكتب وصفاً" : "Add a description.");
    if (!cleanLines.length) return setError(ar ? "أضف صنفاً واحداً على الأقل بكمية" : "Add at least one item with a quantity.");
    if (isPO && !vendor) return setError(ar ? "اختر المورد" : "Choose the supplier.");
    setBusy(true); setError(null);
    try {
      const ds = getDataSource();
      const number = await nextDocumentNumber(workspace.id, kind);
      const v = vendors.find((x) => x.id === vendor);
      const meta: Record<string, unknown> = {
        [isPO ? "po_number" : "pr_number"]: number,
        doc_number: number,
        vendor_id: vendor || null, vendor_name: v?.name_en ?? null, vendor_phone: v?.phone ?? null,
        lines: cleanLines.map((l) => ({ ...l, received: 0 })),
        tax_rate: parseFloat(taxRate) || 0,
        estimated_amount: Math.round(totals.grand * 100) / 100,
        currency, notes: notes.trim() || null,
        ...(isPO
          ? { delivery_date: date || null, payment_terms: terms.trim() || null, receipts: [], source_pr: source?.id ?? null, source_pr_number: (sm.pr_number as string) ?? source?.doc_number ?? null }
          : { department: department || null, requested_by: user?.user_metadata?.full_name ?? user?.user_metadata?.username ?? null }),
      };
      const created = await ds.work_items.create(workspace.id, {
        title_en: title.trim(), title_ar: title.trim(),
        type: kind as WorkItem["type"], status: "draft" as WorkItem["status"],
        priority: priority as WorkItem["priority"], due_date: date || null,
        organization_id: vendor || null, progress: 0, tags: ["purchasing"],
        doc_number: number, metadata: meta as never,
      } as never);
      if (!created) throw new Error(ar ? "فشل الحفظ" : "Failed to save.");
      let updatedSource: WorkItem | undefined;
      if (isPO && source) {
        const srcMeta = { ...sm, converted_po: (created as WorkItem).id, converted_po_number: number };
        await ds.work_items.update(workspace.id, source.id, { status: "ordered", metadata: srcMeta } as never);
        updatedSource = { ...source, status: "ordered" as WorkItem["status"], metadata: srcMeta as never };
      }
      onSaved(created as WorkItem, updatedSource);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  const title_ = isPO
    ? (source ? (ar ? "تحويل طلب الشراء إلى أمر شراء" : "Purchase order from request") : (ar ? "أمر شراء جديد" : "New purchase order"))
    : (ar ? "طلب شراء جديد" : "New purchase request");

  return (
    <Shell title={title_} onClose={onClose} wide>
      <form onSubmit={submit} className="p-6 space-y-4">
        <p className="text-micro text-muted-foreground">
          {ar ? "الرقم يصدر تلقائياً عند الحفظ" : "The number is issued automatically when you save"}
          {source ? ` · ${ar ? "من" : "from"} ${String(sm.pr_number ?? source.doc_number ?? "")}` : ""}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2"><label className={labelCls}>{ar ? "الوصف" : "Description"} *</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} placeholder={ar ? "مثال: أقمشة موسم الشتاء" : "e.g. Winter season fabrics"} /></div>
          <div><label className={labelCls}>{ar ? "المورد" : "Supplier"}{isPO ? " *" : ""}</label>
            <select value={vendor} onChange={(e) => setVendor(e.target.value)} className={inputCls}>
              <option value="">{ar ? "اختر..." : "Select…"}</option>
              {vendors.map((v) => <option key={v.id} value={v.id}>{v.name_en}</option>)}
            </select></div>
          <div><label className={labelCls}>{isPO ? (ar ? "تاريخ التوريد" : "Delivery date") : (ar ? "مطلوب قبل" : "Needed by")}</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} /></div>
          {isPO ? (
            <>
              <div><label className={labelCls}>{ar ? "شروط الدفع" : "Payment terms"}</label>
                <input value={terms} onChange={(e) => setTerms(e.target.value)} className={inputCls} placeholder={ar ? "مثال: 30 يوم" : "e.g. 30 days"} /></div>
              <div><label className={labelCls}>{ar ? "الضريبة %" : "VAT %"}</label>
                <input type="number" min={0} value={taxRate} onChange={(e) => setTaxRate(e.target.value)} className={inputCls} /></div>
            </>
          ) : (
            <>
              <div><label className={labelCls}>{ar ? "القسم" : "Department"}</label>
                <input value={department} onChange={(e) => setDepartment(e.target.value)} className={inputCls} /></div>
              <div><label className={labelCls}>{ar ? "الأولوية" : "Priority"}</label>
                <select value={priority} onChange={(e) => setPriority(e.target.value as WorkItem["priority"])} className={inputCls}>
                  {["low", "medium", "high", "urgent", "critical"].map((p) => <option key={p} value={p}>{p}</option>)}
                </select></div>
            </>
          )}
        </div>

        <LinesEditor lines={lines} setLines={setLines} ar={ar} currency={currency} showPrices />

        <div className="flex justify-end">
          <div className="w-60 text-caption space-y-1">
            <div className="flex justify-between"><span className="text-muted-foreground">{ar ? "الإجمالي الفرعي" : "Subtotal"}</span><span className="tabular-nums">{fmt(totals.subtotal)}</span></div>
            {totals.tax > 0 && <div className="flex justify-between"><span className="text-muted-foreground">{ar ? "الضريبة" : "VAT"}</span><span className="tabular-nums">{fmt(totals.tax)}</span></div>}
            <div className="flex justify-between font-semibold border-t border-border/40 pt-1"><span>{ar ? "الإجمالي" : "Total"}</span><span className="tabular-nums">{fmt(totals.grand)} {currency}</span></div>
          </div>
        </div>

        <div><label className={labelCls}>{ar ? "ملاحظات" : "Notes"}</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className={inputCls + " h-16 py-2 resize-none"} /></div>

        {error && <p className="text-caption text-rose-600 flex items-center gap-1"><AlertCircle size={12} />{error}</p>}
        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 h-10 rounded-xl border border-border/60 text-body">{ar ? "إلغاء" : "Cancel"}</button>
          <button type="submit" disabled={busy} className={btnPrimary + " flex-1 h-10"}>{busy && <Loader2 size={13} className="animate-spin" />}{ar ? "حفظ وإصدار رقم" : "Save & issue number"}</button>
        </div>
      </form>
    </Shell>
  );
}

// ─── Receive goods against a PO ───────────────────────────

export function ReceiveGoodsModal({ po, ar, onClose, onSaved }: { po: WorkItem; ar: boolean; onClose: () => void; onSaved: (updated: WorkItem, grn: GoodsReceipt) => void }) {
  const { workspace, user } = useAuth();
  const m = (po.metadata ?? {}) as Record<string, unknown>;
  const lines = linesOf(po);
  const [qty, setQty] = useState<number[]>(() => lines.map((l) => Math.max(0, l.qty - (l.received ?? 0))));
  const [supplierRef, setSupplierRef] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<GoodsReceipt | null>(null);

  const over = lines.some((l, i) => qty[i] > l.qty - (l.received ?? 0) + 1e-9);
  const any = qty.some((q) => q > 0);

  async function submit() {
    if (!workspace) return;
    if (over) return setError(ar ? "لا يمكن استلام أكثر من المطلوب" : "You can't receive more than was ordered.");
    if (!any) return setError(ar ? "أدخل كمية مستلمة" : "Enter a received quantity.");
    setBusy(true); setError(null);
    try {
      const number = await nextDocumentNumber(workspace.id, "goods_receipt");
      const grn: GoodsReceipt = {
        number, received_at: new Date().toISOString(),
        received_by: String(user?.user_metadata?.full_name ?? user?.user_metadata?.username ?? "—"),
        supplier_ref: supplierRef.trim() || undefined, notes: notes.trim() || undefined,
        lines: lines.map((l, i) => ({ name: l.name, qty: qty[i], unit: l.unit, ordered: l.qty })).filter((l) => l.qty > 0),
      };
      const newLines = lines.map((l, i) => ({ ...l, received: (l.received ?? 0) + (qty[i] || 0) }));
      const complete = newLines.every((l) => (l.received ?? 0) >= l.qty - 1e-9);
      const meta = { ...m, lines: newLines, receipts: [...((m.receipts as GoodsReceipt[]) ?? []), grn] };
      const status = complete ? "received" : "partially_received";
      await getDataSource().work_items.update(workspace.id, po.id, { status, metadata: meta } as never);
      onSaved({ ...po, status: status as WorkItem["status"], metadata: meta as never }, grn);
      setDone(grn);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Shell title={`${ar ? "استلام بضاعة" : "Receive goods"} — ${String(m.po_number ?? po.doc_number ?? "")}`} onClose={onClose}>
      <div className="p-6 space-y-4">
        {done ? (
          <>
            <p className="text-body">{ar ? "تم إصدار إذن الاستلام" : "Goods received note issued"} <span className="font-mono font-semibold">{done.number}</span></p>
            <div className="flex gap-2">
              <button onClick={() => openPrint("goods_receipt", po.id, { grn: done.number })} className={btnPrimary + " h-10 flex-1"}><Printer size={14} /> {ar ? "طباعة الإذن" : "Print GRN"}</button>
              <button onClick={onClose} className="h-10 px-4 rounded-xl border border-border/60 text-body">{ar ? "تم" : "Done"}</button>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <div className="grid grid-cols-[1fr_70px_70px_90px] gap-2 text-micro text-muted-foreground">
                <span>{ar ? "الصنف" : "Item"}</span><span className="text-end">{ar ? "مطلوب" : "Ordered"}</span><span className="text-end">{ar ? "مستلم" : "Received"}</span><span>{ar ? "الآن" : "Now"}</span>
              </div>
              {lines.map((l, i) => (
                <div key={l.id} className="grid grid-cols-[1fr_70px_70px_90px] gap-2 items-center text-caption">
                  <span className="truncate">{l.name}</span>
                  <span className="text-end tabular-nums">{fmt(l.qty)} {l.unit}</span>
                  <span className="text-end tabular-nums">{fmt(l.received ?? 0)}</span>
                  <input type="number" min={0} max={l.qty - (l.received ?? 0)} step="any" value={qty[i]}
                    onChange={(e) => setQty(qty.map((q, j) => (j === i ? parseFloat(e.target.value) || 0 : q)))}
                    className={`${smallCls} ${qty[i] > l.qty - (l.received ?? 0) + 1e-9 ? "border-rose-400" : ""}`} />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={labelCls}>{ar ? "رقم إذن المورد" : "Supplier delivery note no."}</label>
                <input value={supplierRef} onChange={(e) => setSupplierRef(e.target.value)} className={inputCls} /></div>
              <div><label className={labelCls}>{ar ? "ملاحظات" : "Notes"}</label>
                <input value={notes} onChange={(e) => setNotes(e.target.value)} className={inputCls} /></div>
            </div>
            {error && <p className="text-caption text-rose-600 flex items-center gap-1"><AlertCircle size={12} />{error}</p>}
            <button onClick={submit} disabled={busy || over || !any} className={btnPrimary + " h-10 w-full"}>{busy && <Loader2 size={13} className="animate-spin" />}{ar ? "تأكيد الاستلام" : "Confirm receipt"}</button>
          </>
        )}
      </div>
    </Shell>
  );
}

export { openPrint };
