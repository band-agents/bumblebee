/**
 * Granular Permission System
 * نظام الصلاحيات التفصيلي
 *
 * Each module has specific permission actions.
 * Role templates auto-assign recommended permissions.
 * Custom per-user overrides stored in workspace_members.permissions JSONB.
 */

// ─── Module definitions with granular permissions ─────────

export interface ModuleDef {
  key: string;
  en: string;
  ar: string;
  /** Which pages this module opens, shown in the access picker. */
  opens: string;
  opensAr: string;
  permissions: PermissionAction[];
}

export type PermissionAction = "view" | "create" | "edit" | "delete" | "export" | "import" | "approve" | "release" | "assign" | "manage_settings";

export const PERMISSION_LABELS: Record<PermissionAction, { en: string; ar: string }> = {
  view:            { en: "View",     ar: "عرض" },
  create:          { en: "Create",   ar: "إنشاء" },
  edit:            { en: "Edit",     ar: "تعديل" },
  delete:          { en: "Delete",   ar: "حذف" },
  export:          { en: "Export",   ar: "تصدير" },
  import:          { en: "Import",   ar: "استيراد" },
  approve:         { en: "Approve",  ar: "اعتماد" },
  release:         { en: "Release",  ar: "إطلاق" },
  assign:          { en: "Assign",   ar: "تعيين" },
  manage_settings: { en: "Settings", ar: "إعدادات" },
};

export const MODULES: ModuleDef[] = [
  { key: "customers",  en: "Customers & CRM",       ar: "العملاء",              opens: "CRM, organizations, sales pipeline, loyalty", opensAr: "إدارة العملاء، المؤسسات، مسار المبيعات، الولاء", permissions: ["view", "create", "edit", "delete", "export", "import", "assign"] },
  { key: "contacts",   en: "Contacts",              ar: "جهات الاتصال",         opens: "People and contacts", opensAr: "الأشخاص وجهات الاتصال", permissions: ["view", "create", "edit", "delete", "export"] },
  { key: "quotations", en: "Quotations",            ar: "عروض الأسعار",         opens: "Quotations", opensAr: "عروض الأسعار", permissions: ["view", "create", "edit", "delete", "export", "approve"] },
  { key: "orders",     en: "Sales Orders",          ar: "أوامر البيع",          opens: "Sales orders (and what's invoiced on them)", opensAr: "أوامر البيع (والمفوتر عليها)", permissions: ["view", "create", "edit", "delete", "export", "approve", "release"] },
  { key: "pos",        en: "Point of Sale",         ar: "نقطة البيع",           opens: "The shop till and its sales", opensAr: "الكاشير ومبيعاته", permissions: ["view", "create", "edit", "export"] },
  { key: "products",   en: "Products & Designs",    ar: "المنتجات والتصميمات",  opens: "Products, designs, site visits", opensAr: "المنتجات، التصميمات، الزيارات", permissions: ["view", "create", "edit", "delete", "export", "import"] },
  { key: "bom",        en: "Materials list (BOM)",  ar: "قائمة المواد",          opens: "Bill of materials inside products", opensAr: "قائمة المواد داخل المنتجات", permissions: ["view", "create", "edit", "delete"] },
  { key: "production", en: "Production",            ar: "الإنتاج",              opens: "Production, planning & cutting, work items, operations", opensAr: "الإنتاج، التخطيط والقص، المهام، العمليات", permissions: ["view", "create", "edit", "delete", "assign", "release"] },
  { key: "stages",     en: "Manufacturing stages",  ar: "مراحل التصنيع",        opens: "Starting and finishing stages", opensAr: "بدء وإنهاء المراحل", permissions: ["view", "create", "edit", "delete", "assign"] },
  { key: "quality",    en: "Quality Control",       ar: "مراقبة الجودة",        opens: "Inspections and defects", opensAr: "الفحوصات والعيوب", permissions: ["view", "create", "edit", "approve"] },
  { key: "inventory",  en: "Inventory",             ar: "المخزن",               opens: "Stock, fabrics, materials, assets", opensAr: "المخزون، الأقمشة، الخامات، الأصول", permissions: ["view", "create", "edit", "delete", "export", "import", "approve"] },
  { key: "purchasing", en: "Purchasing",            ar: "المشتريات",            opens: "Suppliers, purchase requests and orders, goods received", opensAr: "الموردين، طلبات وأوامر الشراء، الاستلام", permissions: ["view", "create", "edit", "delete", "export", "approve", "release"] },
  { key: "delivery",   en: "Delivery",              ar: "التسليم",              opens: "Deliveries and installations", opensAr: "التسليمات والتركيبات", permissions: ["view", "create", "edit", "assign"] },
  { key: "finance",    en: "Finance",               ar: "الحسابات",             opens: "Invoices, receipts, expenses, finance pages", opensAr: "الفواتير، الإيصالات، المصروفات، صفحات المالية", permissions: ["view", "create", "edit", "delete", "export", "approve", "release"] },
  { key: "hr",         en: "HR & Employees",        ar: "الموارد البشرية",       opens: "Employees, attendance, leave, salaries", opensAr: "الموظفين، الحضور، الإجازات، الرواتب", permissions: ["view", "create", "edit", "delete", "export", "approve"] },
  { key: "reports",    en: "Reports",               ar: "التقارير",             opens: "Reports and report builder", opensAr: "التقارير ومنشئ التقارير", permissions: ["view", "export"] },
  { key: "analytics",  en: "Analytics & insights",  ar: "التحليلات",            opens: "Analytics, forecast, risk, intelligence", opensAr: "التحليلات، التوقعات، المخاطر، الذكاء", permissions: ["view", "export"] },
  { key: "settings",   en: "Workspace tools",       ar: "أدوات مساحة العمل",     opens: "Branches, data import/export, Shopify, mobile apps, studio", opensAr: "الفروع، استيراد وتصدير البيانات، شوبيفاي، التطبيقات، الاستوديو", permissions: ["view", "edit", "manage_settings"] },
  { key: "users",      en: "Users & Team",          ar: "المستخدمين والفريق",    opens: "Users & access, team", opensAr: "المستخدمين والصلاحيات، الفريق", permissions: ["view", "create", "edit", "delete", "manage_settings"] },
];

/** The pages every signed-in member can open whatever their access: home, today, activity, their own settings. */
export const ALWAYS_OPEN_PATHS = ["/", "/today", "/activity", "/settings"];

// ─── Permission map type ──────────────────────────────────

export type PermissionMap = Record<string, PermissionAction[]>;

// ─── Role templates ───────────────────────────────────────
// A template lists ONLY the modules that role opens. A module that isn't
// listed is hidden and its data is blocked by the database
// (supabase/access-control-v2.sql mirrors these in access_role_templates — keep them
// in sync; src/lib/permissions.test.ts fails if they drift).

export type RoleGroup = "leadership" | "sales" | "production" | "stock" | "delivery" | "finance" | "people" | "general";

export const ROLE_GROUPS: { id: RoleGroup; en: string; ar: string }[] = [
  { id: "leadership", en: "Leadership", ar: "الإدارة" },
  { id: "sales",      en: "Sales & retail", ar: "المبيعات والمحلات" },
  { id: "production", en: "Design & production", ar: "التصميم والإنتاج" },
  { id: "stock",      en: "Warehouse & purchasing", ar: "المخزن والمشتريات" },
  { id: "delivery",   en: "Delivery", ar: "التوصيل" },
  { id: "finance",    en: "Finance", ar: "الحسابات" },
  { id: "people",     en: "HR", ar: "الموارد البشرية" },
  { id: "general",    en: "General", ar: "عام" },
];

export interface RoleTemplate {
  id: string;
  en: string;
  ar: string;
  group: RoleGroup;
  color: string;
  description: string;
  descriptionAr: string;
  permissions: PermissionMap;
  risk: "low" | "medium" | "high";
}

const ALL_ACTIONS: PermissionAction[] = ["view", "create", "edit", "delete", "export", "import", "approve", "release", "assign", "manage_settings"];
const V: PermissionAction[] = ["view"];
const VX: PermissionAction[] = ["view", "export"];
/** Add and correct records, nothing more. */
const ADD: PermissionAction[] = ["view", "create", "edit"];
const ADDX: PermissionAction[] = ["view", "create", "edit", "export"];

function allModulesWithPerms(perms: PermissionAction[]): PermissionMap {
  const map: PermissionMap = {};
  for (const m of MODULES) {
    map[m.key] = perms.filter(p => m.permissions.includes(p));
  }
  return map;
}

/** Every action a module supports — "Full" in the access picker. */
export function fullActions(moduleKey: string): PermissionAction[] {
  return MODULES.find((m) => m.key === moduleKey)?.permissions ?? [];
}
const FULL = (moduleKey: string) => fullActions(moduleKey);
/** Full, minus delete. */
const MANAGE = (moduleKey: string) => fullActions(moduleKey).filter((a) => a !== "delete" && a !== "manage_settings");

const C = {
  amber: "bg-warning/15 text-warning", violet: "bg-chart-4/15 text-violet-600", cyan: "bg-cyan-100 text-cyan-700",
  emerald: "bg-emerald-100 text-emerald-700", orange: "bg-orange-100 text-orange-700", teal: "bg-teal-100 text-teal-700",
  indigo: "bg-indigo-100 text-indigo-700", green: "bg-green-100 text-green-700", blue: "bg-blue-100 text-blue-700",
  slate: "bg-slate-100 text-slate-600", pink: "bg-pink-100 text-pink-700", sky: "bg-sky-100 text-sky-700",
  lime: "bg-lime-100 text-lime-700", rose: "bg-rose-100 text-rose-700", stone: "bg-stone-100 text-stone-700",
};

export const ROLE_TEMPLATES: RoleTemplate[] = [
  // ── Leadership ──
  {
    id: "owner", en: "Owner", ar: "مالك", group: "leadership", color: C.amber,
    description: "Full access to everything", descriptionAr: "صلاحيات كاملة لكل شيء",
    permissions: allModulesWithPerms(ALL_ACTIONS), risk: "high",
  },
  {
    id: "admin", en: "Admin", ar: "مسؤول النظام", group: "leadership", color: C.violet,
    description: "Full access, creates logins; can't manage the owner", descriptionAr: "صلاحيات كاملة وينشئ الحسابات، لا يعدل المالك",
    permissions: allModulesWithPerms(ALL_ACTIONS), risk: "high",
  },
  {
    id: "general_manager", en: "General Manager", ar: "مدير عام", group: "leadership", color: C.amber,
    description: "Sees every module and approves; deletes nothing, no logins", descriptionAr: "يرى كل الأقسام ويعتمد، بدون حذف أو إدارة حسابات",
    permissions: {
      customers: VX, contacts: VX, quotations: ["view", "export", "approve"], orders: ["view", "export", "approve", "release"],
      pos: VX, products: VX, bom: V, production: ["view", "release"], stages: V, quality: ["view", "approve"],
      inventory: ["view", "export", "approve"], purchasing: ["view", "export", "approve", "release"], delivery: V,
      finance: ["view", "export", "approve", "release"], hr: ["view", "export", "approve"],
      reports: VX, analytics: VX, settings: V, users: V,
    },
    risk: "medium",
  },
  {
    id: "viewer", en: "Viewer / Auditor", ar: "مشاهد / مراجع", group: "leadership", color: C.slate,
    description: "Can look at every module, change nothing", descriptionAr: "يرى كل الأقسام بدون أي تعديل",
    permissions: allModulesWithPerms(["view"]), risk: "low",
  },

  // ── Sales & retail ──
  {
    id: "sales_manager", en: "Sales Manager", ar: "مدير المبيعات", group: "sales", color: C.cyan,
    description: "Customers, quotations and orders in full; sales reports", descriptionAr: "العملاء وعروض الأسعار والطلبات بالكامل وتقارير المبيعات",
    permissions: {
      customers: FULL("customers"), contacts: FULL("contacts"), quotations: FULL("quotations"), orders: MANAGE("orders"),
      pos: VX, products: V, delivery: V, reports: VX, analytics: V,
    },
    risk: "medium",
  },
  {
    id: "sales", en: "Sales Executive", ar: "مسؤول مبيعات", group: "sales", color: C.cyan,
    description: "Customers, quotations, sales orders, shop till", descriptionAr: "العملاء وعروض الأسعار والطلبات والكاشير",
    permissions: {
      customers: ADDX, contacts: ADDX, quotations: [...ADDX, "approve"], orders: ADDX, pos: ADD, products: V,
    },
    risk: "medium",
  },
  {
    id: "store_manager", en: "Store Manager", ar: "مدير فرع", group: "sales", color: C.pink,
    description: "Runs a shop: till, customers, shop stock, walk-in orders", descriptionAr: "إدارة المحل: الكاشير والعملاء ومخزون الفرع",
    permissions: {
      pos: MANAGE("pos"), customers: ADDX, contacts: ADD, orders: ADD, products: V, inventory: ADD, reports: V,
    },
    risk: "medium",
  },
  {
    id: "cashier", en: "Cashier", ar: "كاشير", group: "sales", color: C.pink,
    description: "Rings up sales at the till and adds walk-in customers — nothing else", descriptionAr: "البيع على الكاشير وإضافة العملاء فقط",
    permissions: { pos: ["view", "create"], customers: ["view", "create"], products: V },
    risk: "low",
  },
  {
    id: "ecommerce", en: "E-commerce Manager", ar: "مدير المتجر الإلكتروني", group: "sales", color: C.sky,
    description: "Online orders, product listings, online customers", descriptionAr: "طلبات الأونلاين وبيانات المنتجات وعملاء المتجر",
    permissions: {
      orders: ADDX, products: [...ADDX, "import"], customers: ADDX, inventory: V, delivery: V, settings: V, reports: V, analytics: V,
    },
    risk: "medium",
  },
  {
    id: "customer_service", en: "Customer Service", ar: "خدمة العملاء", group: "sales", color: C.sky,
    description: "Answers customers: order and delivery status, updates contact details", descriptionAr: "متابعة حالة الطلبات والتوصيل وتحديث بيانات العملاء",
    permissions: { customers: ADD, contacts: ADD, orders: V, quotations: V, delivery: V, products: V },
    risk: "low",
  },

  // ── Design & production ──
  {
    id: "production_manager", en: "Production Manager", ar: "مدير الإنتاج", group: "production", color: C.orange,
    description: "Products, production, stages and quality in full", descriptionAr: "المنتجات والإنتاج والمراحل والجودة بالكامل",
    permissions: {
      products: ADDX, bom: ADD, production: MANAGE("production"), stages: MANAGE("stages"), quality: MANAGE("quality"),
      inventory: VX, purchasing: ["view", "create"], delivery: ["view", "assign"], orders: V, reports: VX,
    },
    risk: "medium",
  },
  {
    id: "production_purchasing", en: "Production & Purchasing Lead", ar: "مسؤول الإنتاج والمشتريات", group: "production", color: C.orange,
    description: "Runs production orders and raises, approves and follows purchase orders", descriptionAr: "يدير أوامر الإنتاج ويصدر ويعتمد أوامر الشراء",
    permissions: {
      production: MANAGE("production"), stages: MANAGE("stages"), bom: ADD, products: ["view", "edit"], quality: V,
      purchasing: MANAGE("purchasing"), inventory: VX, contacts: ADD, orders: V, reports: VX,
    },
    risk: "medium",
  },
  {
    id: "production_planner", en: "Production Planner", ar: "مخطط إنتاج", group: "production", color: C.orange,
    description: "Plans production orders, cutting lists and schedules; raises purchase requests", descriptionAr: "تخطيط أوامر الإنتاج وقوائم القص وطلبات الشراء",
    permissions: {
      production: [...ADD, "assign"], stages: ["view", "edit", "assign"], bom: V, products: V, inventory: V, orders: V,
      purchasing: ["view", "create"],
    },
    risk: "low",
  },
  {
    id: "line_supervisor", en: "Line Supervisor", ar: "مشرف خط إنتاج", group: "production", color: C.lime,
    description: "Starts and finishes stages on the floor, logs QC checks", descriptionAr: "بدء وإنهاء مراحل الإنتاج وتسجيل الفحص",
    permissions: { production: V, stages: ["view", "edit", "assign"], quality: ["view", "create"] },
    risk: "low",
  },
  {
    id: "cutting_master", en: "Pattern & Cutting Master", ar: "مسؤول الباترون والقص", group: "production", color: C.lime,
    description: "Cutting lists, markers and cutting stages", descriptionAr: "قوائم القص والماركر ومراحل القص",
    permissions: { production: V, stages: ["view", "edit"], bom: V, products: V, inventory: V },
    risk: "low",
  },
  {
    id: "designer", en: "Designer / Product Developer", ar: "مصمم / تطوير منتجات", group: "production", color: C.pink,
    description: "Design briefs, product listings, sizes, materials list and costing", descriptionAr: "ملفات التصميم والمنتجات والمقاسات وقائمة المواد والتكلفة",
    permissions: { products: [...ADDX, "import"], bom: ADD, production: V, inventory: V },
    risk: "low",
  },
  {
    id: "quality_manager", en: "Quality Manager", ar: "مدير الجودة", group: "production", color: C.green,
    description: "All inspections and defects, approves rework and release", descriptionAr: "كل الفحوصات والعيوب واعتماد الإصلاح",
    permissions: { quality: FULL("quality"), production: V, stages: V, products: V, purchasing: V, reports: VX },
    risk: "low",
  },
  {
    id: "qc", en: "QC Inspector", ar: "مفتش جودة", group: "production", color: C.green,
    description: "Runs inspections and logs defects", descriptionAr: "إجراء الفحوصات وتسجيل العيوب",
    permissions: { quality: [...ADD, "approve"], production: V, stages: V },
    risk: "low",
  },

  // ── Warehouse & purchasing ──
  {
    id: "warehouse", en: "Warehouse Manager", ar: "مدير المخزن", group: "stock", color: C.teal,
    description: "All stock, fabrics, trims and assets; receives goods", descriptionAr: "كل المخزون والأقمشة والخامات والأصول واستلام البضاعة",
    permissions: {
      inventory: MANAGE("inventory"), purchasing: ADD, products: V, delivery: V, reports: V,
    },
    risk: "low",
  },
  {
    id: "storekeeper", en: "Storekeeper (data entry)", ar: "أمين مخزن (إدخال بيانات)", group: "stock", color: C.teal,
    description: "Records stock in, stock out and counts — no deleting, no approving, no other modules", descriptionAr: "تسجيل الوارد والمنصرف والجرد فقط — بدون حذف أو اعتماد",
    permissions: { inventory: ADD },
    risk: "low",
  },
  {
    id: "receiving_clerk", en: "Receiving Clerk", ar: "مسؤول استلام", group: "stock", color: C.teal,
    description: "Receives deliveries against purchase orders and books the stock", descriptionAr: "استلام الشحنات على أوامر الشراء وتسجيل المخزون",
    permissions: { purchasing: ["view", "edit"], inventory: ADD },
    risk: "low",
  },
  {
    id: "purchasing_manager", en: "Purchasing Manager", ar: "مدير المشتريات", group: "stock", color: C.indigo,
    description: "Suppliers, purchase requests and orders in full, approvals", descriptionAr: "الموردين وطلبات وأوامر الشراء بالكامل والاعتماد",
    permissions: {
      purchasing: FULL("purchasing"), inventory: VX, contacts: ADDX, production: V, reports: VX, analytics: V,
    },
    risk: "medium",
  },
  {
    id: "purchasing", en: "Buyer", ar: "مشتري", group: "stock", color: C.indigo,
    description: "Raises purchase orders with suppliers", descriptionAr: "إصدار أوامر الشراء مع الموردين",
    permissions: { purchasing: [...ADDX, "approve"], inventory: VX, contacts: ADD },
    risk: "low",
  },
  {
    id: "import_coordinator", en: "Import Coordinator", ar: "مسؤول الاستيراد", group: "stock", color: C.indigo,
    description: "Follows imported fabric and trims: supplier orders, shipping updates, receiving", descriptionAr: "متابعة الأقمشة والإكسسوار المستورد وشحناتها",
    permissions: { purchasing: ["view", "edit", "export"], inventory: V, contacts: ADD },
    risk: "low",
  },

  // ── Delivery ──
  {
    id: "delivery", en: "Dispatcher", ar: "مسؤول التوزيع", group: "delivery", color: C.blue,
    description: "Schedules deliveries and set-ups, assigns drivers", descriptionAr: "جدولة التوصيل والتركيب وتوزيع السائقين",
    permissions: { delivery: [...ADD, "assign"], production: V, orders: V },
    risk: "low",
  },
  {
    id: "driver", en: "Driver", ar: "سائق", group: "delivery", color: C.blue,
    description: "Sees their deliveries and marks them loaded, on the way, delivered", descriptionAr: "يرى تسليماته ويحدث حالتها",
    permissions: { delivery: ["view", "edit"] },
    risk: "low",
  },

  // ── Finance ──
  {
    id: "finance", en: "Finance Manager", ar: "المدير المالي", group: "finance", color: C.emerald,
    description: "Invoices, receipts, voids, approvals and finance reports", descriptionAr: "الفواتير والإيصالات والإلغاء والاعتمادات والتقارير",
    permissions: {
      finance: [...ADDX, "delete", "approve", "release"], orders: ["view", "approve", "export"], quotations: ["view", "approve"],
      purchasing: ["view", "approve", "export"], pos: VX, customers: VX, reports: VX, analytics: VX,
    },
    risk: "medium",
  },
  {
    id: "accountant", en: "Accountant", ar: "محاسب", group: "finance", color: C.emerald,
    description: "Issues invoices and records payments; can't void or approve", descriptionAr: "إصدار الفواتير وتسجيل المدفوعات بدون إلغاء أو اعتماد",
    permissions: { finance: ADDX, orders: V, pos: VX, purchasing: V, customers: V, reports: V },
    risk: "low",
  },

  // ── HR ──
  {
    id: "hr_manager", en: "HR Manager", ar: "مدير الموارد البشرية", group: "people", color: C.rose,
    description: "Employees, attendance, leave approvals and salaries", descriptionAr: "الموظفين والحضور واعتماد الإجازات والرواتب",
    permissions: { hr: FULL("hr"), users: V, reports: VX },
    risk: "medium",
  },
  {
    id: "hr_officer", en: "HR Officer", ar: "مسؤول موارد بشرية", group: "people", color: C.rose,
    description: "Records attendance and leave requests, updates employee files", descriptionAr: "تسجيل الحضور وطلبات الإجازات وتحديث ملفات الموظفين",
    permissions: { hr: ADD },
    risk: "low",
  },

  // ── General ──
  {
    id: "data_entry", en: "Data Entry Clerk", ar: "مدخل بيانات", group: "general", color: C.stone,
    description: "Adds and corrects customers, contacts, products and stock — no deleting, approving or exporting", descriptionAr: "إضافة وتصحيح العملاء والمنتجات والمخزون فقط",
    permissions: { customers: ADD, contacts: ADD, products: ADD, inventory: ADD },
    risk: "low",
  },
];

// ─── Permission checking helpers ──────────────────────────

export function hasPermission(
  permissions: PermissionMap | undefined,
  module: string,
  action: PermissionAction,
): boolean {
  if (!permissions) return false;
  const modulePerms = permissions[module];
  if (!modulePerms) return false;
  return modulePerms.includes(action);
}

export function countPermissions(permissions: PermissionMap): number {
  return Object.values(permissions).reduce((sum, acts) => sum + acts.length, 0);
}

export function countDangerousPermissions(permissions: PermissionMap): number {
  const dangerous: PermissionAction[] = ["delete", "manage_settings", "release", "approve"];
  return Object.values(permissions).reduce(
    (sum, acts) => sum + acts.filter(a => dangerous.includes(a)).length,
    0,
  );
}

export function getTemplateById(id: string): RoleTemplate | undefined {
  return ROLE_TEMPLATES.find(t => t.id === id);
}
