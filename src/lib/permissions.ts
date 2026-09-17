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

export interface RoleTemplate {
  id: string;
  en: string;
  ar: string;
  color: string;
  description: string;
  descriptionAr: string;
  permissions: PermissionMap;
  risk: "low" | "medium" | "high";
}

const ALL_ACTIONS: PermissionAction[] = ["view", "create", "edit", "delete", "export", "import", "approve", "release", "assign", "manage_settings"];
const READ_ONLY: PermissionAction[] = ["view"];
const CRUD: PermissionAction[] = ["view", "create", "edit"];
const CRUD_EXPORT: PermissionAction[] = ["view", "create", "edit", "export"];

function allModulesWithPerms(perms: PermissionAction[]): PermissionMap {
  const map: PermissionMap = {};
  for (const m of MODULES) {
    map[m.key] = perms.filter(p => m.permissions.includes(p));
  }
  return map;
}

/** Every action a module supports — what "Full access" means in the picker. */
export function fullActions(moduleKey: string): PermissionAction[] {
  return MODULES.find((m) => m.key === moduleKey)?.permissions ?? [];
}

export const ROLE_TEMPLATES: RoleTemplate[] = [
  {
    id: "owner", en: "Owner", ar: "مالك",
    color: "bg-warning/15 text-warning",
    description: "Full access to everything", descriptionAr: "صلاحيات كاملة لكل شيء",
    permissions: allModulesWithPerms(ALL_ACTIONS),
    risk: "high",
  },
  {
    id: "admin", en: "Admin", ar: "مسؤول النظام",
    color: "bg-chart-4/15 text-violet-600",
    description: "Full access, cannot manage the owner", descriptionAr: "صلاحيات كاملة، لا يمكنه تعديل المالك",
    permissions: allModulesWithPerms(ALL_ACTIONS),
    risk: "high",
  },
  {
    id: "sales", en: "Sales", ar: "المبيعات",
    color: "bg-cyan-100 text-cyan-700",
    description: "Customers, quotations, orders, shop till", descriptionAr: "العملاء وعروض الأسعار والطلبات والكاشير",
    permissions: {
      customers: CRUD_EXPORT, contacts: CRUD_EXPORT, quotations: [...CRUD_EXPORT, "approve"],
      orders: CRUD_EXPORT, pos: CRUD, products: ["view"],
    },
    risk: "medium",
  },
  {
    id: "finance", en: "Finance", ar: "الحسابات",
    color: "bg-emerald-100 text-emerald-700",
    description: "Invoices, payments, approvals, reports", descriptionAr: "الفواتير والمدفوعات والموافقات والتقارير",
    permissions: {
      finance: [...CRUD_EXPORT, "delete", "approve", "release"],
      orders: ["view", "approve", "export"], quotations: ["view", "approve"],
      purchasing: ["view", "approve", "export"], pos: ["view", "export"],
      customers: ["view", "export"], reports: ["view", "export"], analytics: ["view", "export"],
    },
    risk: "medium",
  },
  {
    id: "production_manager", en: "Production Manager", ar: "مدير الإنتاج",
    color: "bg-orange-100 text-orange-700",
    description: "Products, production, stages, quality", descriptionAr: "المنتجات والإنتاج والمراحل والجودة",
    permissions: {
      products: CRUD_EXPORT, bom: CRUD, production: [...CRUD, "assign", "release"],
      stages: [...CRUD, "assign"], quality: [...CRUD, "approve"],
      inventory: ["view", "export"], purchasing: ["view", "create"], delivery: ["view", "assign"],
      orders: ["view"], reports: ["view", "export"],
    },
    risk: "medium",
  },
  {
    id: "warehouse", en: "Warehouse", ar: "المخزن",
    color: "bg-teal-100 text-teal-700",
    description: "Inventory, stock, receiving goods", descriptionAr: "المخزن والخامات واستلام البضاعة",
    permissions: {
      inventory: [...CRUD_EXPORT, "import", "approve"],
      purchasing: ["view", "create", "edit"], products: ["view"],
    },
    risk: "low",
  },
  {
    id: "purchasing", en: "Purchasing", ar: "المشتريات",
    color: "bg-indigo-100 text-indigo-700",
    description: "Purchase orders, suppliers", descriptionAr: "أوامر الشراء والموردين",
    permissions: {
      purchasing: [...CRUD_EXPORT, "approve"], inventory: ["view", "export"], contacts: CRUD,
    },
    risk: "low",
  },
  {
    id: "qc", en: "Quality Control", ar: "مراقبة الجودة",
    color: "bg-green-100 text-green-700",
    description: "Quality checks, inspections", descriptionAr: "فحص الجودة والتفتيش",
    permissions: {
      quality: [...CRUD, "approve"], production: READ_ONLY, stages: READ_ONLY,
    },
    risk: "low",
  },
  {
    id: "delivery", en: "Delivery", ar: "التوصيل",
    color: "bg-blue-100 text-blue-700",
    description: "Deliveries, installations", descriptionAr: "التوصيل والتركيب",
    permissions: {
      delivery: [...CRUD, "assign"], production: READ_ONLY,
    },
    risk: "low",
  },
  {
    id: "viewer", en: "Viewer", ar: "مشاهد فقط",
    color: "bg-slate-100 text-slate-600",
    description: "Can look at everything, change nothing", descriptionAr: "عرض كل شيء بدون تعديل",
    permissions: allModulesWithPerms(["view"]),
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
