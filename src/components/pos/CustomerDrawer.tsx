import { useState, useEffect, useMemo } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { getDataSource } from "../../lib/data-source";
import type { Database } from "../../lib/database.types";
import {
  X, User, Phone, Mail, Star, ShoppingBag, CreditCard, Calendar,
  Tag, TrendingUp, Award, Search, ChevronRight, Gift, Clock,
} from "lucide-react";

type Person = Database["public"]["Tables"]["people"]["Row"];
type Txn = Database["public"]["Tables"]["pos_transactions"]["Row"];

function formatEGP(n: number) {
  return new Intl.NumberFormat("en-EG", { style: "currency", currency: "EGP", minimumFractionDigits: 2 }).format(n);
}

export function CustomerDrawer({ customerId, phone, onClose }: { customerId?: string | null; phone?: string | null; onClose: () => void }) {
  const { lang } = useLanguage();
  const ds = useMemo(() => getDataSource(), []);
  const [customer, setCustomer] = useState<Person | null>(null);
  const [txns, setTxns] = useState<Txn[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(phone || "");
  const [allPeople, setAllPeople] = useState<Person[]>([]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const people = await ds.people.list("demo");
      setAllPeople(people as Person[]);
      if (customerId) {
        const found = people.find((p) => p.id === customerId) as Person | undefined;
        setCustomer(found || null);
        if (found) {
          const allTxns = await ds.pos_transactions.list("demo");
          setTxns((allTxns as Txn[]).filter((t) => t.customer_name === found.name_en));
        }
      } else if (phone) {
        const found = people.find((p) => p.phone === phone) as Person | undefined;
        setCustomer(found || null);
      }
      setLoading(false);
    }
    load();
  }, [customerId, phone, ds]);

  const searchResults = useMemo(() => {
    if (!searchQuery || customer) return [];
    const q = searchQuery.toLowerCase();
    return allPeople.filter((p) =>
      p.name_en?.toLowerCase().includes(q) || p.phone?.includes(q) || p.email?.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [searchQuery, allPeople, customer]);

  const stats = useMemo(() => {
    if (!txns.length) return { totalSpent: 0, avgOrder: 0, visitCount: 0, lastVisit: null };
    const completed = txns.filter((t) => t.status === "completed");
    return {
      totalSpent: completed.reduce((s, t) => s + t.total, 0),
      avgOrder: completed.length ? completed.reduce((s, t) => s + t.total, 0) / completed.length : 0,
      visitCount: completed.length,
      lastVisit: completed.length ? completed[0].created_at : null,
    };
  }, [txns]);

  const loyaltyPoints = txns.reduce((s, t) => s + (t.loyalty_points_earned || 0) - (t.loyalty_points_redeemed || 0), 0);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex justify-end">
        <div className="absolute inset-0 bg-black/30" onClick={onClose} />
        <div className="relative w-[420px] bg-background border-l border-border shadow-2xl flex items-center justify-center">
          <div className="animate-pulse text-body text-muted-foreground">{lang === "ar" ? "جاري التحميل..." : "Loading..."}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-[420px] bg-background border-l border-border shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="shrink-0 px-5 py-4 border-b border-border/40 flex items-center justify-between">
          <h3 className="text-body-lg font-semibold" style={{ fontFamily: "var(--app-font-serif)" }}>
            {lang === "ar" ? "ملف العميل" : "Customer Profile"}
          </h3>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted transition-colors">
            <X size={14} />
          </button>
        </div>

        {!customer ? (
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === "ar" ? "بحث بالاسم أو الهاتف أو الإيميل..." : "Search by name, phone, or email..."}
                className="w-full h-10 pl-9 pr-3 rounded-xl border border-border bg-background text-body placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-brand-ink/30"
                autoFocus
              />
            </div>
            {searchResults.map((p) => (
              <button
                key={p.id}
                onClick={() => setCustomer(p)}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-border/40 hover:bg-muted/40 transition-colors text-left"
              >
                <div className="w-9 h-9 rounded-full bg-primary/10 text-brand-ink flex items-center justify-center text-micro font-semibold shrink-0">
                  {p.name_en?.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-body font-medium text-foreground truncate">{p.name_en}</p>
                  <p className="text-micro text-muted-foreground">{p.phone || p.email || "—"}</p>
                </div>
                <ChevronRight size={14} className="text-muted-foreground/30 shrink-0" />
              </button>
            ))}
            {searchQuery && searchResults.length === 0 && (
              <div className="text-center py-8">
                <User size={24} className="mx-auto text-muted-foreground/20 mb-2" />
                <p className="text-caption text-muted-foreground">{lang === "ar" ? "لم يتم العثور على نتائج" : "No customers found"}</p>
                <button className="mt-3 text-caption text-brand-ink hover:underline">{lang === "ar" ? "إضافة عميل جديد" : "Add new customer"}</button>
              </div>
            )}
            {!searchQuery && (
              <div className="text-center py-8">
                <User size={24} className="mx-auto text-muted-foreground/20 mb-2" />
                <p className="text-caption text-muted-foreground">{lang === "ar" ? "ابحث عن عميل" : "Search for a customer"}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {/* Profile */}
            <div className="p-5 border-b border-border/40">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-brand-ink flex items-center justify-center text-body-lg font-bold">
                  {customer.name_en?.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-body-lg font-semibold text-foreground" style={{ fontFamily: "var(--app-font-serif)" }}>{customer.name_en}</p>
                  {customer.name_ar && <p className="text-caption text-muted-foreground" dir="rtl">{customer.name_ar}</p>}
                </div>
                <button onClick={() => setCustomer(null)} className="text-micro text-brand-ink hover:underline">{lang === "ar" ? "تغيير" : "Change"}</button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {customer.phone && (
                  <div className="flex items-center gap-2 text-caption text-muted-foreground">
                    <Phone size={12} /> {customer.phone}
                  </div>
                )}
                {customer.email && (
                  <div className="flex items-center gap-2 text-caption text-muted-foreground">
                    <Mail size={12} /> {customer.email}
                  </div>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="p-5 border-b border-border/40 grid grid-cols-4 gap-2">
              <div className="text-center p-2 rounded-lg bg-muted/30">
                <p className="text-body-lg font-bold text-foreground" style={{ fontFamily: "var(--app-font-serif)" }}>{stats.visitCount}</p>
                <p className="text-micro text-muted-foreground mt-0.5">{lang === "ar" ? "الزيارات" : "Visits"}</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-muted/30">
                <p className="text-body-lg font-bold text-foreground" style={{ fontFamily: "var(--app-font-serif)" }}>{formatEGP(stats.totalSpent)}</p>
                <p className="text-micro text-muted-foreground mt-0.5">{lang === "ar" ? "إجمالي" : "Total"}</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-muted/30">
                <p className="text-body-lg font-bold text-foreground" style={{ fontFamily: "var(--app-font-serif)" }}>{formatEGP(stats.avgOrder)}</p>
                <p className="text-micro text-muted-foreground mt-0.5">{lang === "ar" ? "متوسط" : "Avg"}</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-primary/5">
                <div className="flex items-center justify-center gap-0.5">
                  <Star size={10} className="text-brand-ink fill-primary" />
                  <p className="text-body-lg font-bold text-brand-ink" style={{ fontFamily: "var(--app-font-serif)" }}>{loyaltyPoints}</p>
                </div>
                <p className="text-micro text-muted-foreground mt-0.5">{lang === "ar" ? "نقاط" : "Points"}</p>
              </div>
            </div>

            {/* Tags */}
            <div className="px-5 py-3 border-b border-border/40">
              <div className="flex flex-wrap gap-1.5">
                {customer.tags?.map((tag, i) => (
                  <span key={i} className="text-micro px-2 py-0.5 rounded-full bg-primary/10 text-brand-ink">{tag}</span>
                ))}
                {loyaltyPoints > 500 && (
                  <span className="text-micro px-2 py-0.5 rounded-full bg-warning/15 text-warning flex items-center gap-1">
                    <Award size={9} /> VIP
                  </span>
                )}
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="p-5">
              <h4 className="text-caption font-medium text-foreground mb-3 flex items-center gap-1.5">
                <ShoppingBag size={12} />
                {lang === "ar" ? "الtransactions الأخيرة" : "Recent Transactions"}
              </h4>
              {txns.length > 0 ? (
                <div className="space-y-2">
                  {txns.slice(0, 5).map((txn) => (
                    <div key={txn.id} className="p-3 rounded-xl border border-border/40 bg-muted/20">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-micro font-mono text-muted-foreground">{txn.transaction_number}</span>
                        <span className={`text-micro px-1.5 py-0.5 rounded-full ${txn.status === "completed" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-600"}`}>
                          {txn.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-body font-semibold text-foreground">{formatEGP(txn.total)}</span>
                        <span className="text-micro text-muted-foreground">{new Date(txn.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-micro text-muted-foreground flex items-center gap-1">
                          <CreditCard size={9} /> {txn.payment_method}
                        </span>
                        {txn.loyalty_points_earned > 0 && (
                          <span className="text-micro text-brand-ink flex items-center gap-0.5">
                            <Star size={8} /> +{txn.loyalty_points_earned}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Clock size={18} className="mx-auto text-muted-foreground/20 mb-2" />
                  <p className="text-micro text-muted-foreground">{lang === "ar" ? "لا توجد transactions" : "No transactions yet"}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
