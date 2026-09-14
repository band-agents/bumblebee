/**
 * Buzz's tools.
 *
 * Buzz already received a good briefing — customer summaries, churn risk,
 * overdue totals — but could only talk about them. These are the hands: each
 * tool reads the real data layer and returns rows the user can click through
 * to, plus an optional destination.
 *
 * Everything here is read-only by design. Anything that writes belongs behind
 * an explicit confirmation step, which is a separate piece of work; a chatbot
 * that can quietly mutate an ERP is not a feature.
 *
 * The registry is deliberately independent of the model. With an API key the
 * edge function advertises TOOL_SCHEMAS to OpenAI and hands back tool_calls;
 * without one, `resolveIntent` maps common phrasings onto the same tools, so
 * Buzz is useful offline instead of showing a connection error.
 */

export interface ToolRow {
  id: string;
  label: string;
  meta?: string;
  href?: string;
}

export interface ToolResult {
  summary: string;
  rows?: ToolRow[];
  navigateTo?: string;
  /** Shown when a filter matched nothing, so Buzz doesn't claim a false zero. */
  empty?: string;
}

const money = (n: number) => `EGP ${Math.round(n).toLocaleString()}`;

// ─── Tools ────────────────────────────────────────────────

async function findCustomers(args: {
  churn_risk?: "low" | "medium" | "high";
  vip?: boolean;
  status?: "active" | "inactive";
  name?: string;
  limit?: number;
}): Promise<ToolResult> {
  const { CRM_CUSTOMERS } = await import("./crm-data");
  let list = [...CRM_CUSTOMERS];

  if (args.churn_risk) list = list.filter((c) => c.churn_risk === args.churn_risk);
  if (args.vip) list = list.filter((c) => c.vip_level && c.vip_level !== "none");
  if (args.status) list = list.filter((c) => c.status === args.status);
  if (args.name) {
    const q = args.name.toLowerCase();
    list = list.filter((c) => c.name.toLowerCase().includes(q) || (c.name_ar || "").includes(args.name!));
  }

  list.sort((a, b) => b.total_spend - a.total_spend);
  const limit = args.limit ?? 8;
  const shown = list.slice(0, limit);

  const parts = [
    args.vip ? "VIP" : null,
    args.churn_risk ? `${args.churn_risk}-churn-risk` : null,
    args.status ?? null,
  ].filter(Boolean).join(" ");

  return {
    summary: list.length
      ? `${list.length} ${parts || ""} customer${list.length === 1 ? "" : "s"}${list.length > limit ? `, showing the top ${limit} by lifetime spend` : ""}.`
      : `No ${parts || ""} customers matched.`,
    empty: list.length ? undefined : "Try widening the filter — for example drop the VIP condition.",
    rows: shown.map((c) => ({
      id: c.id,
      label: c.name,
      meta: `${money(c.total_spend)} lifetime · ${c.total_orders} orders · ${c.churn_risk} risk`,
      href: `/crm/customers`,
    })),
  };
}

async function findInvoices(args: {
  status?: "paid" | "overdue" | "sent" | "partial" | "draft";
  customer?: string;
  min_balance?: number;
  limit?: number;
}): Promise<ToolResult> {
  const { FIN_INVOICES } = await import("./finance-data");
  let list = [...FIN_INVOICES];

  if (args.status) list = list.filter((i) => i.status === args.status);
  if (args.customer) {
    const q = args.customer.toLowerCase();
    list = list.filter((i) => (i.customer_name || "").toLowerCase().includes(q));
  }
  if (typeof args.min_balance === "number") list = list.filter((i) => i.balance >= args.min_balance!);

  list.sort((a, b) => b.balance - a.balance);
  const limit = args.limit ?? 8;
  const outstanding = list.reduce((s, i) => s + i.balance, 0);

  return {
    summary: list.length
      ? `${list.length} ${args.status ?? ""} invoice${list.length === 1 ? "" : "s"}${outstanding > 0 ? `, ${money(outstanding)} outstanding` : ""}.`
      : `No ${args.status ?? ""} invoices matched.`,
    empty: list.length ? undefined : "Nothing outstanding in that slice — which is usually good news.",
    rows: list.slice(0, limit).map((i) => ({
      id: i.id,
      label: `${i.invoice_number} · ${i.customer_name}`,
      meta: i.balance > 0 ? `${money(i.balance)} due · ${i.status}` : `${money(i.total)} · ${i.status}`,
      href: "/finance/invoices",
    })),
    navigateTo: list.length ? "/finance/invoices" : undefined,
  };
}

async function findEmployees(args: {
  department?: string;
  status?: string;
  name?: string;
  limit?: number;
}): Promise<ToolResult> {
  const { HR_EMPLOYEES } = await import("./hr-data");
  let list = [...HR_EMPLOYEES];

  if (args.department) {
    const q = args.department.toLowerCase();
    list = list.filter((e) => (e.department || "").toLowerCase().includes(q));
  }
  if (args.status) list = list.filter((e) => e.status === args.status);
  if (args.name) {
    const q = args.name.toLowerCase();
    list = list.filter((e) => (e.full_name || "").toLowerCase().includes(q));
  }

  const limit = args.limit ?? 8;
  return {
    summary: list.length
      ? `${list.length} employee${list.length === 1 ? "" : "s"}${args.department ? ` in ${args.department}` : ""}.`
      : `No employees matched${args.department ? ` in ${args.department}` : ""}.`,
    rows: list.slice(0, limit).map((e) => ({
      id: e.id,
      label: e.full_name,
      meta: [e.job_title, e.department].filter(Boolean).join(" · "),
      href: "/hr/employees",
    })),
  };
}

async function moduleSummary(args: { module: "finance" | "crm" | "hr" | "production" }): Promise<ToolResult> {
  switch (args.module) {
    case "finance": {
      const { FIN_INVOICES, FIN_EXPENSES } = await import("./finance-data");
      const paid = FIN_INVOICES.filter((i) => i.status === "paid").reduce((s, i) => s + i.total, 0);
      const overdue = FIN_INVOICES.filter((i) => i.status === "overdue");
      const overdueAmt = overdue.reduce((s, i) => s + i.balance, 0);
      const spend = FIN_EXPENSES.reduce((s, e) => s + e.amount, 0);
      return {
        summary: `Collected ${money(paid)}. ${overdue.length} invoices overdue worth ${money(overdueAmt)}. Expenses ${money(spend)}.`,
        rows: [
          { id: "rev", label: "Revenue collected", meta: money(paid), href: "/finance/reports" },
          { id: "od", label: `Overdue (${overdue.length})`, meta: money(overdueAmt), href: "/finance/invoices" },
          { id: "exp", label: "Expenses", meta: money(spend), href: "/finance/expenses" },
        ],
      };
    }
    case "crm": {
      const { CRM_CUSTOMERS, CRM_ALERTS } = await import("./crm-data");
      const active = CRM_CUSTOMERS.filter((c) => c.status === "active").length;
      const vip = CRM_CUSTOMERS.filter((c) => c.vip_level && c.vip_level !== "none").length;
      const risk = CRM_CUSTOMERS.filter((c) => c.churn_risk === "high").length;
      const alerts = CRM_ALERTS.filter((a) => !a.dismissed).length;
      return {
        summary: `${CRM_CUSTOMERS.length} customers, ${active} active, ${vip} VIP. ${risk} at high churn risk, ${alerts} open alerts.`,
        rows: [
          { id: "vip", label: `VIP customers (${vip})`, href: "/crm/customers" },
          { id: "risk", label: `High churn risk (${risk})`, href: "/crm/customers" },
          { id: "al", label: `Open alerts (${alerts})`, href: "/crm" },
        ],
      };
    }
    case "hr": {
      const { HR_EMPLOYEES } = await import("./hr-data");
      const active = HR_EMPLOYEES.filter((e) => e.status === "active").length;
      const depts = [...new Set(HR_EMPLOYEES.map((e) => e.department).filter(Boolean))];
      return {
        summary: `${active} active employees across ${depts.length} departments.`,
        rows: depts.slice(0, 8).map((d) => ({
          id: String(d),
          label: String(d),
          meta: `${HR_EMPLOYEES.filter((e) => e.department === d).length} people`,
          href: "/hr/employees",
        })),
      };
    }
    case "production": {
      const { getProductionStats, getProductionAlerts } = await import("./production-data");
      const stats = getProductionStats?.() ?? {};
      const alerts = getProductionAlerts?.() ?? [];
      return {
        summary: `Production: ${Object.entries(stats).slice(0, 3).map(([k, v]) => `${k} ${v}`).join(", ") || "no stats available"}. ${alerts.length} alerts.`,
        rows: [{ id: "prod", label: "Open production", href: "/production" }],
      };
    }
  }
}

async function navigateTo(args: { query: string }): Promise<ToolResult> {
  const { ALL_ITEMS } = await import("../components/ShellNav");
  const q = args.query.toLowerCase().trim();
  const hit =
    ALL_ITEMS.find((i) => i.label.toLowerCase() === q) ??
    ALL_ITEMS.find((i) => i.label.toLowerCase().includes(q)) ??
    ALL_ITEMS.find((i) => i.path.toLowerCase().includes(q));

  if (!hit) {
    return { summary: `I couldn't find a page called "${args.query}".`, empty: "Try the page name as it appears in the sidebar." };
  }
  return { summary: `Opening ${hit.label}.`, navigateTo: hit.path, rows: [{ id: hit.id, label: hit.label, href: hit.path }] };
}

// ─── Registry ─────────────────────────────────────────────

type Handler = (args: Record<string, unknown>) => Promise<ToolResult>;

export const TOOLS: Record<string, Handler> = {
  find_customers: findCustomers as Handler,
  find_invoices: findInvoices as Handler,
  find_employees: findEmployees as Handler,
  module_summary: moduleSummary as Handler,
  navigate_to: navigateTo as Handler,
};

/** OpenAI function-calling schemas, advertised by the ai-chat edge function. */
export const TOOL_SCHEMAS = [
  {
    type: "function",
    function: {
      name: "find_customers",
      description: "Search customers by churn risk, VIP status, active status, or name. Use for questions about who is at risk, who the best customers are, or looking someone up.",
      parameters: {
        type: "object",
        properties: {
          churn_risk: { type: "string", enum: ["low", "medium", "high"] },
          vip: { type: "boolean", description: "Only customers with a VIP tier" },
          status: { type: "string", enum: ["active", "inactive"] },
          name: { type: "string", description: "Partial name match" },
          limit: { type: "number" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "find_invoices",
      description: "Search invoices by status, customer, or minimum outstanding balance. Use for questions about money owed, overdue accounts, or a customer's billing.",
      parameters: {
        type: "object",
        properties: {
          status: { type: "string", enum: ["paid", "overdue", "sent", "partial", "draft"] },
          customer: { type: "string" },
          min_balance: { type: "number" },
          limit: { type: "number" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "find_employees",
      description: "Search employees by department, status, or name.",
      parameters: {
        type: "object",
        properties: {
          department: { type: "string" },
          status: { type: "string" },
          name: { type: "string" },
          limit: { type: "number" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "module_summary",
      description: "Get a live snapshot of one area of the business with real figures.",
      parameters: {
        type: "object",
        properties: { module: { type: "string", enum: ["finance", "crm", "hr", "production"] } },
        required: ["module"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "navigate_to",
      description: "Open a page in the app by name, e.g. 'invoices', 'payroll', 'quality control'.",
      parameters: {
        type: "object",
        properties: { query: { type: "string" } },
        required: ["query"],
      },
    },
  },
] as const;

export async function runTool(name: string, args: Record<string, unknown>): Promise<ToolResult> {
  const fn = TOOLS[name];
  if (!fn) return { summary: `I don't have a tool called ${name}.` };
  try {
    return await fn(args ?? {});
  } catch (e) {
    console.error("[Bumblebee] Tool failed:", name, e);
    return { summary: `That lookup failed while reading ${name.replace("_", " ")}. The data may not be loaded yet.` };
  }
}

// ─── Offline intent resolution ────────────────────────────

/**
 * Maps common phrasings onto tools without a model. This is what keeps Buzz
 * useful in demo mode and when the API key is missing — deterministic, instant,
 * and free. It is intentionally conservative: no match returns null so the
 * caller can fall back to explaining what Buzz can do, rather than guessing.
 */
export function resolveIntent(input: string): { name: string; args: Record<string, unknown> } | null {
  const q = input.toLowerCase();
  const has = (...w: string[]) => w.some((x) => q.includes(x));

  if (has("overdue", "past due", "late invoice", "owed", "owe us", "unpaid"))
    return { name: "find_invoices", args: { status: "overdue" } };
  if (has("invoice", "billing", "receivable"))
    return { name: "find_invoices", args: has("paid") ? { status: "paid" } : {} };

  if (has("churn", "at risk", "losing", "leaving"))
    return { name: "find_customers", args: { churn_risk: "high" } };
  if (has("vip", "best customer", "top customer", "biggest customer"))
    return { name: "find_customers", args: { vip: true } };
  if (has("customer", "client"))
    return { name: "find_customers", args: {} };

  if (has("employee", "staff", "headcount", "team member", "who works"))
    return { name: "find_employees", args: {} };

  if (has("finance", "revenue", "cash", "money", "profit", "expense"))
    return { name: "module_summary", args: { module: "finance" } };
  if (has("hr", "workforce", "human resource"))
    return { name: "module_summary", args: { module: "hr" } };
  if (has("production", "factory", "floor", "manufacturing"))
    return { name: "module_summary", args: { module: "production" } };
  if (has("crm", "pipeline", "relationship"))
    return { name: "module_summary", args: { module: "crm" } };

  const nav = q.match(/\b(?:open|go to|show me|take me to|navigate to)\s+(?:the\s+)?([a-z /&-]{3,30})/);
  if (nav) return { name: "navigate_to", args: { query: nav[1].trim() } };

  return null;
}
