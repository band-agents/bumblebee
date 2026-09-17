import { useState, useMemo, useEffect } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, Activity, ShoppingBag, Factory, Archive, Truck, Landmark,
  Users, Heart, Store, BarChart3, BookOpen, Settings, FileText, Receipt,
  DollarSign, Package, Wrench, PenTool, MapPin, ShoppingCart, Layers, Ticket,
  Megaphone, Award, TrendingUp, GitMerge, Bell, ArrowLeftRight, Boxes, Wallet,
  Star, Sparkles, Brain, Target, Building2, UserPlus, Shield, Smartphone,
  Briefcase, CreditCard, Gift, ChevronsLeft, Search, X,
} from "lucide-react";
import { Logo } from "./Logo";
import { useLanguage } from "../context/LanguageContext";
import { useCommandBar } from "../context/CommandBarContext";
import { useAuth } from "../context/AuthContext";
import { canOpenPath, effectivePermissions } from "../lib/access";

/**
 * Two-tier navigation: a narrow icon rail of destinations, and a contextual
 * pane showing only the active one's pages.
 *
 * The old sidebar put 24 top-level entries in one 220px column, most of them
 * collapsed groups — so finding anything meant expanding something first. Here
 * the rail answers "which part of the business" and the pane answers "which
 * page", and the pane only ever shows one section's worth of links.
 */

export type Item = { id: string; label: string; labelAr: string; path: string; icon?: React.ElementType };
export type Section = {
  id: string;
  label: string;
  labelAr: string;
  icon: React.ElementType;
  /** Sections with a single destination skip the pane and navigate directly. */
  path?: string;
  groups?: { label: string; labelAr: string; items: Item[] }[];
};

export const SECTIONS: Section[] = [
  {
    id: "home", label: "Home", labelAr: "الرئيسية", icon: LayoutDashboard,
    groups: [{
      label: "Overview", labelAr: "نظرة عامة", items: [
        { id: "dash", label: "Dashboard", labelAr: "لوحة التحكم", path: "/", icon: LayoutDashboard },
        { id: "today", label: "Today", labelAr: "اليوم", path: "/today", icon: Sparkles },
        { id: "queue", label: "Work Queue", labelAr: "قائمة العمل", path: "/queue", icon: Layers },
        { id: "activity", label: "Activity", labelAr: "النشاط", path: "/activity", icon: Activity },
      ],
    }],
  },
  {
    id: "sales", label: "Sales", labelAr: "المبيعات", icon: ShoppingBag,
    groups: [
      { label: "Pipeline", labelAr: "المسار", items: [
        { id: "sales", label: "Sales", labelAr: "المبيعات", path: "/sales", icon: ShoppingBag },
        { id: "quotations", label: "Quotations", labelAr: "عروض الأسعار", path: "/quotations", icon: FileText },
        { id: "orders", label: "Sales Orders", labelAr: "أوامر البيع", path: "/orders", icon: Receipt },
        { id: "pos", label: "Point of Sale", labelAr: "نقطة البيع", path: "/pos", icon: CreditCard },
      ]},
      { label: "Relationships", labelAr: "العلاقات", items: [
        { id: "crm", label: "CRM", labelAr: "إدارة العملاء", path: "/crm", icon: Heart },
        { id: "crm-customers", label: "Customers", labelAr: "العملاء", path: "/crm/customers", icon: Building2 },
        { id: "crm-pipeline", label: "Deal Pipeline", labelAr: "مسار الصفقات", path: "/crm/pipeline", icon: TrendingUp },
        { id: "organizations", label: "Organizations", labelAr: "المؤسسات", path: "/organizations", icon: Building2 },
        { id: "people", label: "Contacts", labelAr: "جهات الاتصال", path: "/people", icon: Users },
      ]},
    ],
  },
  {
    id: "production", label: "Production", labelAr: "الإنتاج", icon: Factory,
    groups: [
      { label: "Floor", labelAr: "الأرضية", items: [
        { id: "production", label: "Production", labelAr: "الإنتاج", path: "/production", icon: Factory },
        { id: "prod-exec", label: "Overview", labelAr: "نظرة عامة", path: "/production/exec", icon: BarChart3 },
        { id: "prod-planning", label: "Planning & Cutting", labelAr: "التخطيط والقص", path: "/production/planning", icon: Receipt },
        { id: "work", label: "Work Items", labelAr: "المهام", path: "/work", icon: Layers },
        { id: "operations", label: "Operations", labelAr: "العمليات", path: "/operations", icon: Wrench },
        { id: "quality", label: "Quality Control", labelAr: "الجودة", path: "/quality", icon: Shield },
      ]},
      { label: "Upstream", labelAr: "التحضير", items: [
        { id: "designs", label: "Designs", labelAr: "التصميمات", path: "/designs", icon: PenTool },
        { id: "products", label: "Products", labelAr: "المنتجات", path: "/products", icon: Layers },
        { id: "site-visits", label: "Site Visits", labelAr: "الزيارات", path: "/site-visits", icon: MapPin },
      ]},
    ],
  },
  {
    id: "inventory", label: "Inventory", labelAr: "المخزون", icon: Archive,
    groups: [{
      label: "Stock", labelAr: "المخزون", items: [
        { id: "inv", label: "Overview", labelAr: "نظرة عامة", path: "/inventory", icon: Archive },
        { id: "inv-fabrics", label: "Fabrics", labelAr: "الأقمشة", path: "/inventory/fabrics", icon: Layers },
        { id: "inv-materials", label: "Materials", labelAr: "المواد", path: "/inventory/materials", icon: Package },
        { id: "inv-assets", label: "Assets", labelAr: "الأصول", path: "/inventory/equipment", icon: Wrench },
        { id: "purchasing", label: "Purchasing", labelAr: "المشتريات", path: "/purchasing", icon: ShoppingCart },
      ],
    }],
  },
  {
    id: "delivery", label: "Delivery", labelAr: "التسليم", icon: Truck, path: "/delivery",
  },
  {
    id: "finance", label: "Finance", labelAr: "المالية", icon: Landmark,
    groups: [{
      label: "Books", labelAr: "الدفاتر", items: [
        { id: "fin", label: "Overview", labelAr: "نظرة عامة", path: "/finance", icon: Landmark },
        { id: "fin-dashboard", label: "Dashboard", labelAr: "لوحة المالية", path: "/finance/dashboard", icon: LayoutDashboard },
        { id: "fin-invoices", label: "Invoices", labelAr: "الفواتير", path: "/finance/invoices", icon: FileText },
        { id: "fin-expenses", label: "Expenses", labelAr: "المصروفات", path: "/finance/expenses", icon: Receipt },
        { id: "fin-arap", label: "Receivable / Payable", labelAr: "المدينة والدائنة", path: "/finance/ar-ap", icon: DollarSign },
        { id: "fin-bank", label: "Bank & Accounts", labelAr: "الحسابات البنكية", path: "/finance/bank", icon: Landmark },
        { id: "fin-reports", label: "Reports", labelAr: "التقارير", path: "/finance/reports", icon: BarChart3 },
      ],
    }],
  },
  {
    id: "people", label: "People", labelAr: "الأفراد", icon: Users,
    groups: [
      { label: "Workforce", labelAr: "القوى العاملة", items: [
        { id: "hr-dashboard", label: "HR Dashboard", labelAr: "لوحة الموارد", path: "/hr/dashboard", icon: LayoutDashboard },
        { id: "hr-employees", label: "Employees", labelAr: "الموظفين", path: "/hr/employees", icon: Users },
        { id: "hr-org", label: "Org Structure", labelAr: "هيكل المؤسسة", path: "/hr/org", icon: Building2 },
        { id: "hr-recruitment", label: "Recruitment", labelAr: "التوظيف", path: "/hr/recruitment", icon: Briefcase },
      ]},
      { label: "Rewards & Growth", labelAr: "المزايا والتطوير", items: [
        { id: "hr-payroll", label: "Payroll", labelAr: "الرواتب", path: "/hr/payroll", icon: DollarSign },
        { id: "hr-compensation", label: "Compensation", labelAr: "الرواتب والمزايا", path: "/hr/compensation", icon: CreditCard },
        { id: "hr-performance", label: "Performance", labelAr: "تقييم الأداء", path: "/hr/performance", icon: TrendingUp },
        { id: "hr-training", label: "Training", labelAr: "التدريب", path: "/hr/training", icon: Award },
      ]},
      { label: "Governance", labelAr: "الحوكمة", items: [
        { id: "hr-relations", label: "Relations", labelAr: "علاقات العمل", path: "/hr/relations", icon: Heart },
        { id: "hr-compliance", label: "Compliance", labelAr: "الامتثال", path: "/hr/compliance", icon: Shield },
        { id: "hr-analytics", label: "HR Analytics", labelAr: "تحليلات الموارد", path: "/hr/analytics", icon: BarChart3 },
        { id: "team", label: "Team", labelAr: "الفريق", path: "/team", icon: UserPlus },
        { id: "users", label: "Users & Access", labelAr: "المستخدمين", path: "/users", icon: Shield },
      ]},
    ],
  },
  {
    id: "loyalty", label: "Loyalty", labelAr: "الولاء", icon: Gift,
    groups: [
      { label: "Programme", labelAr: "البرنامج", items: [
        { id: "loyalty", label: "Overview", labelAr: "نظرة عامة", path: "/loyalty", icon: Gift },
        { id: "loyalty-lookup", label: "Staff Lookup", labelAr: "بحث العملاء", path: "/loyalty/lookup", icon: Users },
        { id: "loyalty-tx", label: "Transactions", labelAr: "المعاملات", path: "/loyalty/transactions", icon: Activity },
        { id: "loyalty-rules", label: "Rules", labelAr: "القواعد", path: "/loyalty/rules", icon: Layers },
      ]},
      { label: "Campaigns", labelAr: "الحملات", items: [
        { id: "loyalty-redemptions", label: "Redemptions", labelAr: "الاستبدال", path: "/loyalty/redemptions", icon: Ticket },
        { id: "loyalty-campaigns", label: "Campaigns", labelAr: "الحملات", path: "/loyalty/campaigns", icon: Megaphone },
        { id: "loyalty-rewards", label: "Rewards", labelAr: "المكافآت", path: "/loyalty/rewards", icon: Award },
        { id: "loyalty-notify", label: "Notifications", labelAr: "الإشعارات", path: "/loyalty/notifications", icon: Bell },
      ]},
      { label: "Data", labelAr: "البيانات", items: [
        { id: "loyalty-analytics", label: "Analytics", labelAr: "التحليلات", path: "/loyalty/analytics", icon: TrendingUp },
        { id: "loyalty-merge", label: "Merge", labelAr: "الدمج", path: "/loyalty/merge", icon: GitMerge },
        { id: "loyalty-settings", label: "Settings", labelAr: "الإعدادات", path: "/loyalty/settings", icon: Settings },
      ]},
    ],
  },
  {
    id: "channels", label: "Channels", labelAr: "القنوات", icon: Store,
    groups: [
      { label: "Shopify", labelAr: "شوبيفاي", items: [
        { id: "shopify-integration", label: "Integration", labelAr: "التكامل", path: "/shopify/integration", icon: ArrowLeftRight },
        { id: "shopify-sync-logs", label: "Sync Logs", labelAr: "سجل المزامنة", path: "/shopify/sync-logs", icon: Activity },
        { id: "shopify-kit", label: "Shopify Kit", labelAr: "عدة شوبيفاي", path: "/shopify/kit", icon: Boxes },
        { id: "shopify-wallet", label: "Wallet", labelAr: "المحفظة", path: "/shopify/kit/wallet", icon: Wallet },
        { id: "shopify-wishlist", label: "Wishlist", labelAr: "قائمة الأمنيات", path: "/shopify/kit/wishlist", icon: Heart },
        { id: "shopify-reviews", label: "Reviews", labelAr: "التقييمات", path: "/shopify/kit/reviews", icon: Star },
      ]},
      { label: "Mobile", labelAr: "المحمول", items: [
        { id: "mobile-apps", label: "Mobile Apps", labelAr: "تطبيقات محمولة", path: "/mobile-apps", icon: Smartphone },
      ]},
    ],
  },
  {
    id: "insights", label: "Insights", labelAr: "التحليلات", icon: BarChart3,
    groups: [
      { label: "Reporting", labelAr: "التقارير", items: [
        { id: "analytics", label: "Analytics", labelAr: "التحليلات", path: "/analytics", icon: BarChart3 },
        { id: "reports", label: "Reports", labelAr: "التقارير", path: "/reports", icon: FileText },
        { id: "forecast", label: "Forecast", labelAr: "التوقعات", path: "/forecast", icon: TrendingUp },
        { id: "risk", label: "Risk Radar", labelAr: "المخاطر", path: "/risk", icon: Target },
      ]},
      { label: "Intelligence", labelAr: "الذكاء", items: [
        { id: "intelligence", label: "Intelligence", labelAr: "الذكاء", path: "/intelligence", icon: Sparkles },
        { id: "memory", label: "Memory", labelAr: "الذاكرة", path: "/memory", icon: Brain },
        { id: "decisions", label: "Decisions", labelAr: "القرارات", path: "/decisions", icon: Target },
        { id: "rhythms", label: "Rhythms", labelAr: "الإيقاعات", path: "/rhythms", icon: Activity },
      ]},
    ],
  },
  {
    id: "workspace", label: "Workspace", labelAr: "مساحة العمل", icon: BookOpen,
    groups: [{
      label: "Workspace", labelAr: "مساحة العمل", items: [
        { id: "studio", label: "Studio", labelAr: "الاستوديو", path: "/studio", icon: BookOpen },
        { id: "branches", label: "Branches", labelAr: "الفروع", path: "/branches", icon: Building2 },
        { id: "tools", label: "Tools", labelAr: "الأدوات", path: "/tools", icon: Wrench },
        { id: "data", label: "Data", labelAr: "البيانات", path: "/data", icon: Package },
        { id: "settings", label: "Settings", labelAr: "الإعدادات", path: "/settings", icon: Settings },
      ],
    }],
  },
];

/** All items flattened, longest path first, so /finance/invoices beats /finance. */
export const ALL_ITEMS = SECTIONS.flatMap((s) =>
  (s.groups ?? []).flatMap((g) => g.items.map((i) => ({ ...i, sectionId: s.id })))
).concat(
  SECTIONS.filter((s) => s.path).map((s) => ({
    id: s.id, label: s.label, labelAr: s.labelAr, path: s.path!, sectionId: s.id,
  }))
).sort((a, b) => b.path.length - a.path.length);

/** The single best match for a location — longest path wins, so
 *  /finance/invoices lights Invoices and not Overview. */
export function activeItemPath(path: string): string | null {
  if (path === "/") return "/";
  const hit = ALL_ITEMS.find((i) => i.path !== "/" && (path === i.path || path.startsWith(i.path + "/")));
  return hit?.path ?? null;
}

export function sectionForPath(path: string): string {
  if (path === "/") return "home";
  const hit = ALL_ITEMS.find((i) => i.path !== "/" && (path === i.path || path.startsWith(i.path + "/")));
  return hit?.sectionId ?? "home";
}

// ─── Rail ─────────────────────────────────────────────────

function RailButton({
  section, active, ar, onSelect,
}: { section: Section; active: boolean; ar: boolean; onSelect: () => void }) {
  const Icon = section.icon;
  const label = ar ? section.labelAr : section.label;
  const body = (
    <>
      <span
        aria-hidden
        className={`absolute start-0 top-1/2 -translate-y-1/2 w-[3px] rounded-e-full transition-all duration-200
          ${active ? "h-7 bg-brand-ink" : "h-0 bg-transparent"}`}
      />
      <span
        className={`flex items-center justify-center w-10 h-10 rounded-xl transition-colors duration-150
          ${active
            ? "bg-brand-wash text-brand-ink"
            : "text-muted-foreground group-hover:bg-sidebar-accent group-hover:text-foreground"}`}
      >
        <Icon size={19} strokeWidth={active ? 2.2 : 1.8} />
      </span>
      <span className={`text-micro tracking-tight transition-colors duration-150
        ${active ? "text-brand-ink font-semibold" : "text-muted-foreground group-hover:text-foreground"}`}>
        {label}
      </span>
    </>
  );

  const cls = "group relative w-full flex flex-col items-center gap-1 py-2 cursor-pointer";
  return section.path ? (
    <Link href={section.path} className={cls} title={label}>{body}</Link>
  ) : (
    <button type="button" onClick={onSelect} className={cls} title={label}>{body}</button>
  );
}

// ─── Contextual pane ──────────────────────────────────────

function PaneLink({ item, active, ar, onNavigate }: { item: Item; active: boolean; ar: boolean; onNavigate?: () => void }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.path}
      onClick={onNavigate}
      className={`group flex items-center gap-2.5 h-9 px-3 rounded-xl transition-colors duration-150
        ${active
          ? "bg-brand-wash text-brand-ink font-semibold"
          : "text-foreground/75 hover:bg-sidebar-accent hover:text-foreground"}`}
    >
      {Icon && (
        <Icon size={15} strokeWidth={active ? 2.2 : 1.8}
          className={active ? "text-brand-ink" : "text-muted-foreground group-hover:text-foreground"} />
      )}
      <span className="text-body truncate">{ar ? item.labelAr : item.label}</span>
    </Link>
  );
}

// ─── Shell navigation ─────────────────────────────────────

export function ShellNav({ mobileOpen, setMobileOpen }: { mobileOpen: boolean; setMobileOpen: (o: boolean) => void }) {
  const [location] = useLocation();
  const { lang } = useLanguage();
  const ar = lang === "ar";
  const { openBar } = useCommandBar();
  const { workspace, isDemo } = useAuth();

  // Only the modules this member can open. A section with nothing left in it
  // disappears from the rail entirely rather than showing an empty pane.
  const visibleSections = useMemo(() => {
    if (isDemo || !workspace) return SECTIONS;
    const perms = effectivePermissions(workspace.role, workspace.permissions, workspace.extra_roles);
    const allowed = (p: string) => canOpenPath(workspace.role, perms, p);
    return SECTIONS.flatMap((s): Section[] => {
      if (s.path) return allowed(s.path) ? [s] : [];
      const groups = (s.groups ?? [])
        .map((g) => ({ ...g, items: g.items.filter((i) => allowed(i.path)) }))
        .filter((g) => g.items.length > 0);
      return groups.length ? [{ ...s, groups }] : [];
    });
  }, [isDemo, workspace]);

  const routeSection = useMemo(() => sectionForPath(location), [location]);
  const activePath = useMemo(() => activeItemPath(location), [location]);
  const [openSection, setOpenSection] = useState(routeSection);
  const [paneCollapsed, setPaneCollapsed] = useState(false);

  // Following a link elsewhere in the app should move the pane with it.
  useEffect(() => { setOpenSection(routeSection); }, [routeSection]);

  const section = visibleSections.find((s) => s.id === openSection) ?? visibleSections[0] ?? SECTIONS[0];
  const showPane = !!section.groups && !paneCollapsed;

  const rail = (
    <nav
      aria-label="Sections"
      className="w-[76px] shrink-0 h-full flex flex-col bg-sidebar border-e border-sidebar-border/60"
    >
      <div className="h-16 flex items-center justify-center shrink-0">
        <Link href="/" aria-label="Bumblebee home"><Logo variant="mark" size={26} /></Link>
      </div>
      <button
        type="button"
        onClick={openBar}
        title={ar ? "بحث" : "Search"}
        className="mx-auto mb-2 w-10 h-10 rounded-xl flex items-center justify-center
                   text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors"
      >
        <Search size={18} strokeWidth={1.8} />
      </button>
      <div className="flex-1 overflow-y-auto px-1.5 pb-3 flex flex-col gap-0.5">
        {visibleSections.map((s) => (
          <RailButton
            key={s.id}
            section={s}
            ar={ar}
            active={openSection === s.id}
            onSelect={() => {
              setPaneCollapsed(false);
              setOpenSection(s.id);
            }}
          />
        ))}
      </div>
    </nav>
  );

  const pane = showPane && (
    <div className="w-[236px] shrink-0 h-full flex flex-col bg-sidebar/50 border-e border-sidebar-border/60">
      <div className="h-16 shrink-0 flex items-center justify-between px-4">
        <span className="text-title font-semibold" style={{ fontFamily: "var(--app-font-serif)" }}>
          {ar ? section.labelAr : section.label}
        </span>
        <button
          type="button"
          onClick={() => setPaneCollapsed(true)}
          aria-label={ar ? "طي" : "Collapse"}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground
                     hover:bg-sidebar-accent hover:text-foreground transition-colors rtl:rotate-180"
        >
          <ChevronsLeft size={15} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-2.5 pb-4 flex flex-col gap-4">
        {section.groups!.map((g) => (
          <div key={g.label} className="flex flex-col gap-0.5">
            {section.groups!.length > 1 && (
              <div className="text-micro uppercase tracking-[0.09em] text-muted-foreground/70 px-3 pt-1 pb-1.5 font-semibold">
                {ar ? g.labelAr : g.label}
              </div>
            )}
            {g.items.map((i) => (
              <PaneLink
                key={i.id}
                item={i}
                ar={ar}
                active={i.path === activePath}
                onNavigate={() => setMobileOpen(false)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:flex h-full shrink-0">
        {rail}
        {pane}
      </div>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-40 bg-foreground/25 backdrop-blur-[2px] md:hidden transition-opacity duration-200
          ${mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={() => setMobileOpen(false)}
        aria-hidden
      />
      <div
        className={`fixed top-0 start-0 bottom-0 z-50 flex md:hidden transition-transform duration-300 ease-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full rtl:translate-x-full"}`}
      >
        {rail}
        {section.groups && (
          <div className="w-[236px] shrink-0 h-full flex flex-col bg-sidebar border-e border-sidebar-border/60">
            <div className="h-16 shrink-0 flex items-center justify-between px-4">
              <span className="text-title font-semibold" style={{ fontFamily: "var(--app-font-serif)" }}>
                {ar ? section.labelAr : section.label}
              </span>
              <button
                type="button" onClick={() => setMobileOpen(false)} aria-label="Close"
                className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground
                           hover:bg-sidebar-accent hover:text-foreground transition-colors"
              >
                <X size={15} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-2.5 pb-4 flex flex-col gap-4">
              {section.groups.map((g) => (
                <div key={g.label} className="flex flex-col gap-0.5">
                  {section.groups!.length > 1 && (
                    <div className="text-micro uppercase tracking-[0.09em] text-muted-foreground/70 px-3 pt-1 pb-1.5 font-semibold">
                      {ar ? g.labelAr : g.label}
                    </div>
                  )}
                  {g.items.map((i) => (
                    <PaneLink key={i.id} item={i} ar={ar}
                      active={i.path === activePath}
                      onNavigate={() => setMobileOpen(false)} />
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
