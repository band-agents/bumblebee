import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../context/LanguageContext";
import {
  FIN_BANK_ACCOUNTS,
  FIN_BANK_TRANSACTIONS,
  type BankAccount,
  type BankTransaction,
} from "../lib/finance-data";
import {
  Plus, Search, X, ChevronDown, ChevronUp, Check,
  Building2, Wallet, ArrowUpRight, ArrowDownRight,
  CheckCircle2, Clock, AlertTriangle, Filter,
  RefreshCw, CreditCard, DollarSign, TrendingUp,
  Eye, Calendar, Landmark, Banknote,
} from "lucide-react";

// ─── Currency ─────────────────────────────────────────────

const fmtEGP = (n: number) =>
  new Intl.NumberFormat("en-EG", { style: "currency", currency: "EGP", minimumFractionDigits: 0 }).format(n);

const fmtUSD = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(n);

const fmtCurrency = (n: number, currency: string) =>
  currency === "USD" ? fmtUSD(n) : fmtEGP(n);

// ─── Meta Maps ────────────────────────────────────────────

const STATUS_META: Record<string, { en: string; ar: string; pill: string; dot: string }> = {
  active:   { en: "Active",   ar: "نشط",   pill: "bg-emerald-100 text-emerald-600", dot: "bg-emerald-500" },
  inactive: { en: "Inactive", ar: "غير نشط", pill: "bg-slate-100 text-slate-600",  dot: "bg-slate-400" },
  frozen:   { en: "Frozen",   ar: "مجمد",   pill: "bg-blue-100 text-blue-600",    dot: "bg-blue-500" },
};

const TYPE_META: Record<string, { en: string; ar: string; color: string }> = {
  current:    { en: "Current",    ar: "جاري",     color: "text-brand-ink" },
  savings:    { en: "Savings",    ar: "توفير",    color: "text-emerald-600" },
  petty_cash: { en: "Petty Cash", ar: "نثرية",    color: "text-warning" },
};

const CATEGORY_META: Record<string, { en: string; ar: string; color: string }> = {
  customer_payment: { en: "Customer Payment", ar: "دفعة عميل", color: "text-emerald-600" },
  supplier_payment: { en: "Supplier Payment", ar: "دفعة مورد", color: "text-rose-500" },
  salary:           { en: "Salary",           ar: "رواتب",     color: "text-chart-4" },
  rent:             { en: "Rent",             ar: "إيجار",     color: "text-warning" },
  utilities:        { en: "Utilities",        ar: "مرافق",     color: "text-orange-500" },
  loan:             { en: "Loan",             ar: "قرض",       color: "text-sky-600" },
  transfer:         { en: "Transfer",         ar: "تحويل",     color: "text-indigo-600" },
  other:            { en: "Other",            ar: "أخرى",      color: "text-slate-600" },
};

const ACCOUNT_GRADIENTS: Record<string, string> = {
  ba01: "from-primary/8 via-primary/3 to-transparent",
  ba02: "from-emerald-500/8 via-emerald-500/3 to-transparent",
  ba03: "from-warning/20 via-warning/20 to-transparent",
  ba04: "from-sky-500/8 via-sky-500/3 to-transparent",
};

const ACCOUNT_ICONS: Record<string, typeof Building2> = {
  ba01: Building2,
  ba02: Landmark,
  ba03: Banknote,
  ba04: CreditCard,
};

// ─── Shared UI ────────────────────────────────────────────

const inputCls = "w-full h-9 rounded-xl border border-border/60 bg-background px-3 text-body focus:outline-none focus:ring-2 focus:ring-brand-ink/20 transition placeholder:text-muted-foreground/50";
const labelCls = "text-micro font-medium text-muted-foreground mb-1 block";

// ═══════════════════════════════════════════════════════════
// Main Page
// ═══════════════════════════════════════════════════════════

export default function FinanceBank() {
  const { lang } = useLanguage();
  const ar = lang === "ar";

  const [selectedAccountId, setSelectedAccountId] = useState<string>(FIN_BANK_ACCOUNTS[0]?.id ?? "");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedTxIds, setSelectedTxIds] = useState<Set<string>>(new Set());
  const [showAddAccount, setShowAddAccount] = useState(false);

  const selectedAccount = FIN_BANK_ACCOUNTS.find((a) => a.id === selectedAccountId) ?? FIN_BANK_ACCOUNTS[0];

  // ── Derived Data ──
  const accountTransactions = useMemo(
    () => FIN_BANK_TRANSACTIONS.filter((t) => t.account_id === selectedAccountId),
    [selectedAccountId],
  );

  const filteredTransactions = useMemo(() => {
    const q = search.toLowerCase().trim();
    return accountTransactions.filter((t) => {
      const matchSearch = !q ||
        t.description.toLowerCase().includes(q) ||
        t.description_ar.includes(q) ||
        t.reference.toLowerCase().includes(q);
      const matchCategory = categoryFilter === "all" || t.category === categoryFilter;
      const matchDateFrom = !dateFrom || t.date >= dateFrom;
      const matchDateTo = !dateTo || t.date <= dateTo;
      return matchSearch && matchCategory && matchDateFrom && matchDateTo;
    });
  }, [accountTransactions, search, categoryFilter, dateFrom, dateTo]);

  const totalBankBalance = useMemo(
    () => FIN_BANK_ACCOUNTS.filter((a) => a.type !== "petty_cash" && a.currency === "EGP").reduce((s, a) => s + a.balance, 0),
    [],
  );

  const totalPettyCash = useMemo(
    () => FIN_BANK_ACCOUNTS.filter((a) => a.type === "petty_cash").reduce((s, a) => s + a.balance, 0),
    [],
  );

  const totalAllAccounts = useMemo(
    () => FIN_BANK_ACCOUNTS.filter((a) => a.currency === "EGP").reduce((s, a) => s + a.balance, 0),
    [],
  );

  const unreconciledTx = useMemo(
    () => accountTransactions.filter((t) => !t.reconciled),
    [accountTransactions],
  );

  const unreconciledTotal = useMemo(
    () => unreconciledTx.reduce((s, t) => s + t.credit - t.debit, 0),
    [unreconciledTx],
  );

  // ── Handlers ──
  const toggleTxSelection = (id: string) => {
    setSelectedTxIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllUnreconciled = () => {
    setSelectedTxIds(new Set(unreconciledTx.map((t) => t.id)));
  };

  const reconcileSelected = () => {
    setSelectedTxIds(new Set());
  };

  // ── Summary Cards ──
  const summaryCards = [
    { label: ar ? "إجمالي الحسابات البنكية" : "Total Bank Balance", value: fmtEGP(totalBankBalance), icon: Building2, color: "text-brand-ink", bg: "bg-primary/8" },
    { label: ar ? "المصروفات النثرية" : "Petty Cash", value: fmtEGP(totalPettyCash), icon: Banknote, color: "text-warning", bg: "bg-warning/10" },
    { label: ar ? "إجمالي جميع الحسابات" : "Total All Accounts", value: fmtEGP(totalAllAccounts), icon: Wallet, color: "text-emerald-600", bg: "bg-emerald-50", trend: "+12%", up: true },
  ];

  // ── Balance color ──
  const balanceColor = (balance: number) =>
    balance >= 0 ? "text-emerald-600" : "text-rose-500";

  return (
    <div className="min-h-full">
      {/* ── Header ── */}
      <div className="border-b border-border/40 px-8 md:px-10 py-8"
        style={{ background: "linear-gradient(160deg, hsl(var(--muted)/0.3) 0%, hsl(var(--background)) 60%)" }}>
        <div className="max-w-[1400px]">
          <p className="text-micro text-muted-foreground/60 tracking-[0.08em] uppercase mb-2">
            {ar ? "المالية" : "Finance"}
          </p>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-display font-medium text-foreground leading-tight"
              style={{ fontFamily: "var(--app-font-serif)", letterSpacing: "-0.025em" }}>
              {ar ? "الحسابات البنكية" : "Bank & Accounts"}
            </h1>
            <button onClick={() => setShowAddAccount(true)}
              className="flex items-center gap-2 h-9 px-4 rounded-xl bg-foreground text-background text-caption font-medium hover:opacity-90 transition-opacity">
              <Plus size={13} strokeWidth={2} />
              {ar ? "إضافة حساب" : "Add Account"}
            </button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {summaryCards.map((m, i) => (
              <div key={i} className="bg-background border border-border/40 rounded-xl px-4 py-3.5">
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-7 h-7 rounded-lg ${m.bg} flex items-center justify-center`}>
                    <m.icon size={14} strokeWidth={1.75} className={m.color} />
                  </div>
                  {m.trend && (
                    <span className={`text-micro font-medium ${m.up ? "text-emerald-600" : "text-rose-500"}`}>
                      {m.trend}
                    </span>
                  )}
                </div>
                <p className="text-title font-medium text-foreground leading-none tabular-nums mb-1"
                  style={{ fontFamily: "var(--app-font-serif)", letterSpacing: "-0.02em" }}>
                  {m.value}
                </p>
                <p className="text-micro text-muted-foreground">{m.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-8 md:px-10 py-6 max-w-[1400px]">
        {/* ── Account Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {FIN_BANK_ACCOUNTS.map((acc) => {
            const s = STATUS_META[acc.status] ?? STATUS_META.active;
            const t = TYPE_META[acc.type] ?? TYPE_META.current;
            const IconComp = ACCOUNT_ICONS[acc.id] ?? Building2;
            const gradient = ACCOUNT_GRADIENTS[acc.id] ?? "from-primary/8 via-primary/3 to-transparent";
            const isSelected = acc.id === selectedAccountId;

            return (
              <motion.button
                key={acc.id}
                onClick={() => setSelectedAccountId(acc.id)}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.15 }}
                className={`text-start rounded-2xl border transition-all ${
                  isSelected
                    ? "border-primary/40 shadow-lg shadow-primary/5"
                    : "border-border/40 hover:border-border"
                } bg-gradient-to-br ${gradient} p-5`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl bg-background/80 flex items-center justify-center`}>
                    <IconComp size={18} strokeWidth={1.75} className={t.color} />
                  </div>
                  <span className={`text-micro font-medium px-2 py-0.5 rounded-full ${s.pill}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${s.dot} inline-block me-1`} />
                    {ar ? s.ar : s.en}
                  </span>
                </div>
                <h3 className="text-body-lg font-semibold text-foreground mb-0.5" style={{ fontFamily: "var(--app-font-serif)" }}>
                  {ar ? acc.name_ar : acc.name}
                </h3>
                <p className="text-micro text-muted-foreground mb-3">{ar ? acc.bank_name_ar : acc.bank_name}</p>
                <p className="font-mono text-micro text-muted-foreground/70 mb-3">{acc.account_number}</p>
                <div className="border-t border-border/30 pt-3">
                  <p className={`text-heading font-semibold leading-none tabular-nums ${balanceColor(acc.balance)}`}
                    style={{ fontFamily: "var(--app-font-serif)", letterSpacing: "-0.02em" }}>
                    {fmtCurrency(acc.balance, acc.currency)}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-micro text-muted-foreground">
                      {ar ? "آخر تسوية:" : "Reconciled:"} {acc.last_reconciled}
                    </span>
                    <span className={`text-micro font-medium ${t.color}`}>
                      {ar ? t.ar : t.en}
                    </span>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* ── Reconciliation Bar ── */}
        {unreconciledTx.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-warning/10 border border-warning/30 rounded-xl px-5 py-4 flex flex-wrap items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-warning/15 flex items-center justify-center">
                <AlertTriangle size={16} strokeWidth={1.75} className="text-warning" />
              </div>
              <div>
                <p className="text-body font-medium text-warning">
                  {ar
                    ? `${unreconciledTx.length} معاملة غير مسوّاة`
                    : `${unreconciledTx.length} unreconciled transaction${unreconciledTx.length !== 1 ? "s" : ""}`}
                </p>
                <p className="text-micro text-warning/80">
                  {ar ? "إجمالي:" : "Total:"} {fmtCurrency(Math.abs(unreconciledTotal), selectedAccount?.currency ?? "EGP")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {selectedTxIds.size > 0 && (
                <button onClick={reconcileSelected}
                  className="flex items-center gap-1.5 h-8 px-3.5 rounded-xl bg-emerald-600 text-white text-caption font-medium hover:bg-emerald-700 transition-colors">
                  <Check size={13} strokeWidth={2} />
                  {ar ? `تسوية (${selectedTxIds.size})` : `Reconcile (${selectedTxIds.size})`}
                </button>
              )}
              <button onClick={selectAllUnreconciled}
                className="flex items-center gap-1.5 h-8 px-3 rounded-xl border border-warning/30 text-warning text-caption font-medium hover:bg-warning/15 transition-colors">
                <CheckCircle2 size={12} strokeWidth={1.75} />
                {ar ? "تحديد الكل" : "Select All"}
              </button>
            </div>
          </motion.div>
        )}

        {/* ── Filters ── */}
        <div className="flex flex-wrap items-center gap-2.5 mb-5">
          <div className="relative min-w-[200px] flex-1 max-w-[280px]">
            <Search size={13} strokeWidth={1.75} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input type="search" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder={ar ? "بحث بالوصف أو المرجع…" : "Search by description or reference…"}
              className="w-full h-9 ps-8 pe-4 rounded-xl border border-border/80 bg-card text-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 transition-colors" />
          </div>

          <div className="h-5 w-px bg-border/60 hidden sm:block" />

          <div className="relative">
            <Calendar size={11} strokeWidth={1.75} className="absolute start-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
              className="h-9 ps-7 pe-3 rounded-xl border border-border/80 bg-card text-caption text-foreground focus:outline-none focus:border-primary/40 transition-colors" />
          </div>
          <span className="text-micro text-muted-foreground">{ar ? "إلى" : "to"}</span>
          <div className="relative">
            <Calendar size={11} strokeWidth={1.75} className="absolute start-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
              className="h-9 ps-7 pe-3 rounded-xl border border-border/80 bg-card text-caption text-foreground focus:outline-none focus:border-primary/40 transition-colors" />
          </div>

          <div className="h-5 w-px bg-border/60 hidden sm:block" />

          <div className="flex items-center gap-1.5 flex-wrap">
            <button onClick={() => setCategoryFilter("all")}
              className={`h-7 px-3 rounded-lg text-caption font-medium border transition-all ${categoryFilter === "all" ? "bg-primary/8 text-brand-ink border-primary/25" : "bg-card border-border text-muted-foreground hover:text-foreground"}`}>
              {ar ? "الكل" : "All"}
            </button>
            {Object.entries(CATEGORY_META).map(([key, meta]) => (
              <button key={key} onClick={() => setCategoryFilter(key)}
                className={`h-7 px-3 rounded-lg text-caption font-medium border transition-all ${categoryFilter === key ? "bg-primary/8 text-brand-ink border-primary/25" : "bg-card border-border text-muted-foreground hover:text-foreground"}`}>
                {ar ? meta.ar : meta.en}
              </button>
            ))}
          </div>

          {(search || dateFrom || dateTo || categoryFilter !== "all") && (
            <button onClick={() => { setSearch(""); setDateFrom(""); setDateTo(""); setCategoryFilter("all"); }}
              className="flex items-center gap-1 h-7 px-2.5 rounded-lg text-caption text-muted-foreground hover:text-foreground hover:bg-accent border border-transparent hover:border-border transition-all">
              <X size={11} strokeWidth={2} />{ar ? "مسح" : "Clear"}
            </button>
          )}
        </div>

        {/* ── Transaction Table ── */}
        <div className="mb-3 flex items-center justify-between">
          <p className="text-caption text-muted-foreground">
            {ar
              ? `${filteredTransactions.length} معاملة`
              : `${filteredTransactions.length} transaction${filteredTransactions.length !== 1 ? "s" : ""}`}
          </p>
          {selectedAccount && (
            <p className="text-caption text-muted-foreground">
              {ar ? "الرصيد:" : "Balance:"}{" "}
              <span className={`font-medium tabular-nums ${balanceColor(selectedAccount.balance)}`}
                style={{ fontFamily: "var(--app-font-serif)" }}>
                {fmtCurrency(selectedAccount.balance, selectedAccount.currency)}
              </span>
            </p>
          )}
        </div>

        <div className="border border-border/40 rounded-xl overflow-hidden bg-background">
          <div className="overflow-x-auto">
            <table className="w-full text-caption">
              <thead>
                <tr className="bg-muted/30 border-b border-border/30">
                  <th className="w-10 px-3 py-3">
                    <div className="w-4 h-4 rounded border border-border/60" />
                  </th>
                  <th className="text-start px-4 py-3 font-medium text-muted-foreground whitespace-nowrap">
                    {ar ? "التاريخ" : "Date"}
                  </th>
                  <th className="text-start px-4 py-3 font-medium text-muted-foreground whitespace-nowrap">
                    {ar ? "الوصف" : "Description"}
                  </th>
                  <th className="text-end px-4 py-3 font-medium text-muted-foreground whitespace-nowrap">
                    {ar ? "المدين" : "Debit"}
                  </th>
                  <th className="text-end px-4 py-3 font-medium text-muted-foreground whitespace-nowrap">
                    {ar ? "الدائن" : "Credit"}
                  </th>
                  <th className="text-end px-4 py-3 font-medium text-muted-foreground whitespace-nowrap">
                    {ar ? "الرصيد" : "Balance"}
                  </th>
                  <th className="text-start px-4 py-3 font-medium text-muted-foreground whitespace-nowrap">
                    {ar ? "الفئة" : "Category"}
                  </th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground whitespace-nowrap">
                    {ar ? "التسوية" : "Reconciled"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {filteredTransactions.map((tx, idx) => {
                  const cat = CATEGORY_META[tx.category] ?? CATEGORY_META.other;
                  const isUnreconciled = !tx.reconciled;
                  const isSelected = selectedTxIds.has(tx.id);

                  return (
                    <tr key={tx.id}
                      className={`transition-colors ${
                        isSelected
                          ? "bg-primary/5"
                          : idx % 2 === 0
                            ? "bg-background"
                            : "bg-muted/10"
                      } ${isUnreconciled ? "hover:bg-warning/10" : "hover:bg-muted/15"}`}>
                      <td className="px-3 py-3.5 text-center">
                        {isUnreconciled && (
                          <button onClick={() => toggleTxSelection(tx.id)}
                            className={`w-4 h-4 rounded border transition-all flex items-center justify-center ${
                              isSelected
                                ? "bg-primary border-primary text-primary-foreground"
                                : "border-border/60 hover:border-primary/50"
                            }`}>
                            {isSelected && <Check size={10} strokeWidth={2.5} />}
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground tabular-nums whitespace-nowrap">
                        {tx.date}
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-caption text-foreground truncate max-w-[220px]">
                          {ar ? tx.description_ar : tx.description}
                        </p>
                        <p className="text-micro text-muted-foreground/60 font-mono">{tx.reference}</p>
                      </td>
                      <td className="px-4 py-3.5 text-end tabular-nums whitespace-nowrap">
                        {tx.debit > 0 ? (
                          <span className="text-rose-500 font-medium">
                            {fmtCurrency(tx.debit, selectedAccount?.currency ?? "EGP")}
                          </span>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-3.5 text-end tabular-nums whitespace-nowrap">
                        {tx.credit > 0 ? (
                          <span className="text-emerald-600 font-medium">
                            {fmtCurrency(tx.credit, selectedAccount?.currency ?? "EGP")}
                          </span>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-3.5 text-end font-medium text-foreground tabular-nums whitespace-nowrap"
                        style={{ fontFamily: "var(--app-font-serif)" }}>
                        {fmtCurrency(tx.balance, selectedAccount?.currency ?? "EGP")}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className={`text-micro font-medium ${cat.color}`}>
                          {ar ? cat.ar : cat.en}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        {tx.reconciled ? (
                          <span className="inline-flex items-center gap-1 text-micro font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                            <CheckCircle2 size={10} strokeWidth={2} />
                            {ar ? "مسوّى" : "Yes"}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-micro font-medium text-warning bg-warning/10 px-2 py-0.5 rounded-full">
                            <Clock size={10} strokeWidth={2} />
                            {ar ? "بانتظار" : "Pending"}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filteredTransactions.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-14 text-center">
                      <p className="text-body text-muted-foreground/60">
                        {ar ? "لا توجد معاملات" : "No transactions found"}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Add Account Modal ── */}
      <AnimatePresence>
        {showAddAccount && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={() => setShowAddAccount(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="bg-background border border-border/40 rounded-2xl shadow-2xl w-full max-w-[500px] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-border/40">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/8 flex items-center justify-center">
                    <Plus size={16} strokeWidth={1.75} className="text-brand-ink" />
                  </div>
                  <h2 className="text-title font-semibold text-foreground" style={{ fontFamily: "var(--app-font-serif)" }}>
                    {ar ? "إضافة حساب بنكي جديد" : "Add New Bank Account"}
                  </h2>
                </div>
                <button onClick={() => setShowAddAccount(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors">
                  <X size={16} strokeWidth={1.75} className="text-muted-foreground" />
                </button>
              </div>
              <div className="px-6 py-5 space-y-4">
                <div>
                  <label className={labelCls}>{ar ? "اسم الحساب" : "Account Name"}</label>
                  <input placeholder={ar ? "اسم الحساب" : "e.g. Main Business Account"} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>{ar ? "البنك" : "Bank"}</label>
                  <input placeholder={ar ? "اسم البنك" : "e.g. Commercial International Bank"} className={inputCls} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>{ar ? "رقم الحساب" : "Account Number"}</label>
                    <input placeholder="****0000" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>{ar ? "كود السويفت" : "SWIFT Code"}</label>
                    <input placeholder="CIBCEGCX" className={inputCls} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>{ar ? "العملة" : "Currency"}</label>
                    <select className={inputCls}>
                      <option value="EGP">EGP</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="SAR">SAR</option>
                      <option value="AED">AED</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>{ar ? "نوع الحساب" : "Account Type"}</label>
                    <select className={inputCls}>
                      <option value="current">{ar ? "جاري" : "Current"}</option>
                      <option value="savings">{ar ? "توفير" : "Savings"}</option>
                      <option value="petty_cash">{ar ? "نثرية" : "Petty Cash"}</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className={labelCls}>{ar ? "الرصيد الافتتاحي" : "Opening Balance"}</label>
                  <input type="number" min="0" placeholder="0" className={inputCls} />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border/40">
                <button onClick={() => setShowAddAccount(false)}
                  className="px-4 py-2 rounded-xl text-body font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                  {ar ? "إلغاء" : "Cancel"}
                </button>
                <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-foreground text-background text-body font-medium hover:opacity-90 transition-opacity">
                  {ar ? "إضافة الحساب" : "Add Account"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
