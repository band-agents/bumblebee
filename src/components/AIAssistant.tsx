/**
 * AIAssistant — Floating chat panel with streaming AI responses.
 *
 * Sleek, minimal design: floating button → expandable chat panel.
 * Streams responses from OpenAI via Supabase Edge Function.
 * Falls back to local knowledge base when API is unavailable.
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, Sparkles, Bot, User, Loader2, ChevronDown } from "lucide-react";
import { BuzzLauncher } from "./BuzzLauncher";
import { Link, useLocation } from "wouter";
import { resolveIntent, runTool, type ToolRow } from "../lib/buzz-tools";
import { useLanguage } from "../context/LanguageContext";
import { getSupabaseClient } from "../lib/supabase";

// ─── Types ───────────────────────────────────────────────

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  /** Rows returned by a tool — rendered as links, not prose. */
  rows?: ToolRow[];
  hint?: string;
}

// ─── Local knowledge fallback ────────────────────────────

const Bumblebee_KB: Record<string, { en: string; ar: string }> = {
  "what is bumblebee": {
    en: "Bumblebee is a comprehensive business operating system named after the ancient Egyptian god of writing and accounting. It includes 34 modules covering sales, production, inventory, finance, CRM, Shopify sync, loyalty, HR, quality control, delivery, and executive analytics — all bilingual in Arabic and English.",
    ar: "بامبلبي هو نظام تشغيل أعمال شامل سُمي تيمنا بالإله المصري القديم تحوت، إله الكتابة والحساب. يحتوي على 34 وحدة تشمل المبيعات والإنتاج والمخزن والمالية و إدارة علاقات العملاء والمزامنة مع شوبيفي وبرنامج الولاء والموارد البشرية ومراقبة الجودة والتسليم والتحليلات التنفيذية — بالعربية والإنجليزية.",
  },
  "pricing": {
    en: "Bumblebee has 4 plans:\n\n• **Apprentice** — Free forever, 1 user\n• **Scribe** — 900 EGP/mo + 299 EGP/user/mo (sales, inventory, production)\n• **Temple** — 4,999 EGP/mo + 499 EGP/user/mo (everything + Shopify, loyalty, HR, priority support)\n• **Dynasty** — Custom pricing (unlimited users, dedicated engineer, on-premise option)\n\nAll plans are bilingual (AR/EN). Start free, upgrade anytime.",
    ar: "بامبلبي لديه 4 خطط:\n\n• **المتبرع** — مجاني للأبد، مستخدم واحد\n• **الكاتب** — 900 جنيه/شهر + 299 جنيه/مستخدم/شهر (مبيعات، مخزن، إنتاج)\n• **المعبد** — 4,999 جنيه/شهر + 499 جنيه/مستخدم/شهر (كل شيء + شوبيفي، ولاء، موارد بشرية، دعم أولوي)\n• **السلالة** — سعر مخصص (مستخدمون غير محدودين، مهندس مخصص)\n\nجميع الخطط ثنائية اللغة. ابدأ مجاناً وترقِ في أي وقت.",
  },
  "how to create quotation": {
    en: "To create a quotation in Bumblebee:\n\n1. Go to **Quotations** from the sidebar\n2. Click **New Quotation**\n3. Select the customer (organization)\n4. Add line items with products, dimensions, materials, and pricing\n5. Bumblebee auto-calculates totals\n6. Send the quotation directly from the system\n7. When accepted, convert it to a **Sales Order** with one click\n\nAll quotations are saved with full version history and can be exported as PDF.",
    ar: "لإنشاء عرض سعر في بامبلبي:\n\n1. اذهب إلى **عروض الأسعار** من الشريط الجانبي\n2. اضغط **عرض سعر جديد**\n3. اختر العميل (المؤسسة)\n4. أضف البنود مع المنتجات والأبعاد والخامات والتسعير\n5. بامبلبي يحسب المجاميع تلقائياً\n6. أرسل عرض السعر مباشرة من النظام\n7. عند القبول، حوّله إلى **طلب بيع** بنقرة واحدة\n\nجميع عروض الأسعار محفوظة مع سجل إصدارات كامل وقابلة للتصدير كـ PDF.",
  },
  "production stages": {
    en: "Bumblebee tracks production through 7 stages:\n\n1. **Cutting** — Cut lists from approved designs\n2. **Edge Banding** — Edge application\n3. **Drilling** — CNC and manual drilling\n4. **Assembly** — Putting pieces together\n5. **Finishing** — Surface treatment and coating\n6. **Quality Check** — 10-point bilingual checklist\n7. **Packing** — Final preparation for delivery\n\nEach stage has start/done controls, time tracking, station assignment, and priority levels. Progress is auto-calculated.",
    ar: "ثوت يتبع الإنتاج عبر 7 مراحل:\n\n1. **القص** — قوائم القص من التصاميم المعتمدة\n2. **الشريط الحدي** — تطبيق الأطراف\n3. **الثقب** — CNC والثقب اليدوي\n4. **التجميع** — تجميع القطع\n5. **التشطيب** — المعالجة السطحية والتغطية\n6. **فحص الجودة** — قائمة معايرة ثنائية اللغة من 10 نقاط\n7. **التعبئة** — التحضير النهائي للتسليم\n\nكل مرحلة لها أدوات بدء/انتهاء وتتبع الوقت وتحديد المحطة والأولويات.",
  },
  "shopify integration": {
    en: "Bumblebee offers two-way Shopify sync:\n\n• **Products** — Sync product catalog with SKUs, prices, and images\n• **Orders** — Import Shopify orders as sales orders in Bumblebee\n• **Customers** — Sync customer data and contact info\n• **Stock Levels** — Match inventory by SKU, push updates nightly\n\nYou can choose per data type: one-way import, one-way export, two-way sync, or off. Setup takes about 5 minutes with no developer needed.",
    ar: "بامبلبي يوفر مزامنة ثنائية مع شوبيفي:\n\n• **المنتجات** — مزامنة كتالوج المنتجات مع أكواد الأسعار والصور\n• **الطلبات** — استيراد طلبات شوبيفي كطلبات بيع في بامبلبي\n• **العملاء** — مزامنة بيانات العملاء ومعلومات الاتصال\n• **مستويات المخزون** — مطابقة المخزون بالرمز الشريطي، تحديث ليلي\n\nيمكنك الاختيار لكل نوع بيانات: استيراد أحادي، تصدير أحادي، مزامنة ثنائية، أو إيقاف. الإعداد يستغرق 5 دقائق.",
  },
  "inventory abc analysis": {
    en: "Bumblebee includes ABC analysis for inventory:\n\n• **A items** — High-value, low-quantity (tightest control)\n• **B items** — Medium value and quantity\n• **C items** — Low-value, high-quantity (simplest control)\n\nThis helps you focus management attention where it matters most. Combined with reorder alerts and depreciation tracking for assets.",
    ar: "بامبلبي يشمل تحليل ABC للمخزون:\n\n• **المجموعة أ** — قيمة عالية، كمية منخفضة (تحكم أشد)\n• **المجموعة ب** — قيمة وكمية متوسطة\n• **المجموعة ج** — قيمة منخفضة، كمية عالية (تحكم أبسط)\n\nهذا يساعدك على تركيز الاهتمام حيث يهم أكثر. مع تنبي إعادة الطلب وتتبع الإهلاك للأصول.",
  },
  "demo mode": {
    en: "Bumblebee runs in **Demo Mode** when no Supabase credentials are configured. This gives you sample data to explore all 34 modules without any setup. To connect real data, add your Supabase URL and anon key to `.env.local`.\n\nIn demo mode, you can test: quotations, sales orders, production tracking, inventory, finance, CRM, and all intelligence features.",
    ar: "بامبلبي يعمل في **وضع العرض التجريبي** عندما لا تكون بيانات اعتماد Supabase مكونة. هذا يمنحك بيانات نموذجية لاستكشاف جميع الوحدات الـ 34 دون إعداد. للاتصال ببيانات حقيقية، أضف رابط Supabase ومفتاح العميل إلى `.env.local`.\n\nفي الوضع التجريبي، يمكنك اختبار: عروض الأسعار، طلبات البيع، تتبع الإنتاج، المخزون، المالية، إدارة العلاقات، وجميع ميزات الذكاء.",
  },
  "custom builds": {
    en: "**Custom builds in one day** — that's our promise.\n\nTell us what your business does differently: a field, a workflow, a report, a whole module. Our engineers reshape Bumblebee around it and ship it to your workspace within one working day.\n\nTemple plans include one custom-build day every month. For anything beyond that, contact us at hello@bumblebee.app.",
    ar: "**تخصيصات في يوم واحد** — هذه وعودتنا.\n\nأخبرنا بما يختلف في عملك: حقل، سير عمل، تقرير، وحدة كاملة. مهندسونا يعيدون تشكيل بامبلبي حوله ويسلمونه في مكتبك خلال يوم عمل واحد.\n\nخطط المعبد تشمل يوم تخصيص واحد كل شهر. لأي شيء أكثر من ذلك، تواصل معنا على hello@bumblebee.app.",
  },
};

function getLocalResponse(msg: string, lang: string): string | null {
  const lower = msg.toLowerCase().trim();
  for (const [key, val] of Object.entries(Bumblebee_KB)) {
    if (lower.includes(key) || lower.includes(key.replace(/\s+/g, ""))) {
      return lang === "ar" ? val.ar : val.en;
    }
  }
  return null;
}

// ─── Message Bubble ──────────────────────────────────────

function MessageBubble({ msg, isLatest }: { msg: Message; isLatest: boolean }) {
  const isUser = msg.role === "user";
  return (
    <motion.div
      className={`flex gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
    >
      {!isUser && (
        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
          <Bot size={14} className="text-brand-ink" />
        </div>
      )}
      <div className={`max-w-[82%] rounded-2xl px-4 py-3 text-body leading-relaxed ${
        isUser
          ? "bg-primary text-primary-foreground rounded-br-md"
          : "bg-muted/50 text-foreground border border-border/40 rounded-bl-md"
      }`}>
        <div className="whitespace-pre-wrap break-words" dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.content) }} />
        {msg.rows && msg.rows.length > 0 && (
          <div className="mt-2.5 flex flex-col gap-1 border-t border-border/40 pt-2.5">
            {msg.rows.map((r) =>
              r.href ? (
                <Link key={r.id} href={r.href}
                  className="group flex items-baseline justify-between gap-3 rounded-lg px-2 py-1.5 -mx-1
                             hover:bg-brand-wash transition-colors">
                  <span className="text-body font-medium text-foreground group-hover:text-brand-ink truncate">{r.label}</span>
                  {r.meta && <span className="text-micro text-muted-foreground shrink-0 tabular-nums">{r.meta}</span>}
                </Link>
              ) : (
                <div key={r.id} className="flex items-baseline justify-between gap-3 px-2 py-1.5 -mx-1">
                  <span className="text-body font-medium text-foreground truncate">{r.label}</span>
                  {r.meta && <span className="text-micro text-muted-foreground shrink-0 tabular-nums">{r.meta}</span>}
                </div>
              )
            )}
          </div>
        )}
        {msg.hint && <p className="mt-2 text-micro text-muted-foreground">{msg.hint}</p>}
      </div>
      {isUser && (
        <div className="w-7 h-7 rounded-lg bg-foreground/10 flex items-center justify-center shrink-0 mt-0.5">
          <User size={14} className="text-foreground/60" />
        </div>
      )}
    </motion.div>
  );
}

function formatMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code class="text-caption bg-muted/60 px-1.5 py-0.5 rounded">$1</code>')
    .replace(/^### (.+)$/gm, '<span class="block text-body-lg font-semibold mt-3 mb-1">$1</span>')
    .replace(/^## (.+)$/gm, '<span class="block text-body-lg font-semibold mt-4 mb-1.5">$1</span>')
    .replace(/^- (.+)$/gm, '<span class="block pl-3 before:content-[\"•\"] before:mr-1.5 before:text-brand-ink/60">$1</span>')
    .replace(/^(\d+)\. (.+)$/gm, '<span class="block pl-3"><span class="text-brand-ink font-medium mr-1.5">$1.</span>$2</span>');
}

// ─── Typing Indicator ────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex gap-2.5">
      <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <Bot size={14} className="text-brand-ink" />
      </div>
      <div className="bg-muted/50 border border-border/40 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-primary/40"
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────

export default function AIAssistant() {
  const [, navigate] = useLocation();
  const { lang } = useLanguage();
  const ar = lang === "ar";
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, isLoading, scrollToBottom]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        role: "assistant",
        content: ar
          ? "أنا باز، مساعدك الذكي في بامبلبي. اسألني عن أي شيء — الميزات، التسعير، كيفية استخدام النظام، أو تحليل بيانات أعمالك. كيف أقدر أساعدك؟"
          : "I'm Buzz, your intelligent assistant in Bumblebee. Ask me anything — features, pricing, how to use the system, or analyze your business data. How can I help you?",
        timestamp: Date.now(),
      }]);
    }
  }, [isOpen, messages.length, ar]);

  async function handleSend() {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: Message = { role: "user", content: text, timestamp: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    // ── Tools first ────────────────────────────────────────
    // Lookups are answered from the live data layer before any model is
    // consulted: instant, free, offline-capable, and — the reason that
    // matters most in an ERP — the numbers cannot be hallucinated.
    const intent = resolveIntent(text);
    if (intent) {
      const result = await runTool(intent.name, intent.args);
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: result.summary,
        rows: result.rows,
        hint: result.empty,
        timestamp: Date.now(),
      }]);
      setIsLoading(false);
      if (result.navigateTo && intent.name === "navigate_to") {
        setTimeout(() => navigate(result.navigateTo!), 350);
      }
      return;
    }

    // Try local knowledge first
    const localResponse = getLocalResponse(text, lang);
    if (localResponse) {
      setTimeout(() => {
        setMessages((prev) => [...prev, {
          role: "assistant",
          content: localResponse,
          timestamp: Date.now(),
        }]);
        setIsLoading(false);
      }, 600 + Math.random() * 400);
      return;
    }

    // Try OpenAI via Edge Function
    const sb = getSupabaseClient();
    if (!sb) {
      // No model configured. Buzz still works for anything the tools cover.
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: ar
          ? "لا يوجد نموذج لغوي مُهيأ، لكن يمكنني الإجابة من بياناتك مباشرة. جرّب: الفواتير المتأخرة، العملاء المعرضون للمغادرة، ملخص المالية، أو افتح الرواتب."
          : "No language model is configured, but I can still answer straight from your data. Try: **overdue invoices**, **customers at risk**, **finance summary**, **how many employees**, or **open payroll**.",
        timestamp: Date.now(),
      }]);
      setIsLoading(false);
      return;
    }

    try {
      abortRef.current = new AbortController();

      // Build context from demo data
      const contextLines: string[] = [];

      // Inject CRM context
      try {
        const { CRM_CUSTOMERS, CRM_ALERTS } = await import("../lib/crm-data");
        const vipCustomers = CRM_CUSTOMERS.filter(c => c.vip_level !== "none").map(c => `${c.name} (${c.vip_level} VIP, ${c.total_spend.toLocaleString()} EGP spent, ${c.total_orders} orders)`).join(", ");
        const highRiskCustomers = CRM_CUSTOMERS.filter(c => c.churn_risk === "high").map(c => `${c.name} (churn risk: ${c.churn_risk}, last activity: ${c.last_activity})`).join(", ");
        const activeAlerts = CRM_ALERTS.filter(a => !a.dismissed).map(a => `${a.title} - ${a.description}`).join("; ");
        contextLines.push(`CRM Summary: ${CRM_CUSTOMERS.length} customers total, ${CRM_CUSTOMERS.filter(c => c.status === "active").length} active. VIP customers: ${vipCustomers || "none"}. High churn risk: ${highRiskCustomers || "none"}. Active alerts: ${activeAlerts || "none"}.`);
      } catch {}

      // Inject HR context
      try {
        const { HR_EMPLOYEES, HR_ALERTS } = await import("../lib/hr-data");
        const activeEmployees = HR_EMPLOYEES.filter(e => e.status === "active").length;
        const departments = [...new Set(HR_EMPLOYEES.map(e => e.department))].join(", ");
        const criticalAlerts = HR_ALERTS.filter(a => a.severity === "critical" && !a.dismissed).map(a => a.title).join("; ");
        contextLines.push(`HR Summary: ${activeEmployees} active employees across departments: ${departments}. Critical alerts: ${criticalAlerts || "none"}.`);
      } catch {}

      // Inject Finance context
      try {
        const { FIN_INVOICES, FIN_EXPENSES } = await import("../lib/finance-data");
        const totalRevenue = FIN_INVOICES.filter(i => i.status === "paid").reduce((s, i) => s + i.total, 0);
        const overdueAmount = FIN_INVOICES.filter(i => i.status === "overdue").reduce((s, i) => s + i.balance, 0);
        const totalExpenses = FIN_EXPENSES.reduce((s, e) => s + e.amount, 0);
        contextLines.push(`Finance Summary: Total revenue: ${totalRevenue.toLocaleString()} EGP. Overdue: ${overdueAmount.toLocaleString()} EGP. Total expenses: ${totalExpenses.toLocaleString()} EGP.`);
      } catch {}

      const { data: { session } } = await sb.auth.getSession();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl) {
        throw new Error("Supabase URL not configured");
      }

      const response = await fetch(
        `${supabaseUrl}/functions/v1/ai-chat`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            messages: messages.concat(userMsg).map((m) => ({
              role: m.role,
              content: m.content,
            })),
            context: contextLines.join("\n") || undefined,
          }),
          signal: abortRef.current.signal,
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      setMessages((prev) => [...prev, {
        role: "assistant",
        content: "",
        timestamp: Date.now(),
      }]);

      if (reader) {
        let buffer = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") continue;
              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  assistantContent += parsed.content;
                  setMessages((prev) => {
                    const updated = [...prev];
                    updated[updated.length - 1] = {
                      ...updated[updated.length - 1],
                      content: assistantContent,
                    };
                    return updated;
                  });
                }
              } catch { /* skip */ }
            }
          }
        }
      }

      if (!assistantContent) {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            content: ar
              ? "لم أتمكن من الرد. تأكد من تكوين مفتاح OPENAI_API_KEY في Supabase Edge Functions."
              : "I couldn't generate a response. Make sure OPENAI_API_KEY is configured in Supabase Edge Functions.",
          };
          return updated;
        });
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: ar
          ? "حدث خطأ في الاتصال. تأكد من تكوين Supabase و OPENAI_API_KEY."
          : "Connection error. Please ensure Supabase and OPENAI_API_KEY are configured.",
        timestamp: Date.now(),
      }]);
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const suggestedQuestions = ar ? [
    "كيف أنشئ عرض سعر؟",
    "ما هي خطط التسعير؟",
    "كيف يعمل تحليل ABC؟",
    "مراحل الإنتاج是什么？",
  ] : [
    "How do I create a quotation?",
    "What are the pricing plans?",
    "How does ABC analysis work?",
    "Tell me about Shopify sync",
  ];

  return (
    <>
      {/* ── Floating Button: Buzz ─────────────────────── */}
      <BuzzLauncher isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} ar={ar} />

      {/* ── Chat Panel ─────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-[88px] right-6 z-50 w-[400px] max-w-[calc(100vw-48px)] h-[560px] max-h-[calc(100vh-120px)] bg-background border border-border/60 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Header */}
            <div className="border-b border-border/40 px-5 py-3.5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Sparkles size={15} className="text-brand-ink" />
                </div>
                <div>
                  <p className="text-body font-medium text-foreground leading-none">Buzz</p>
                  <p className="text-micro text-muted-foreground/60 mt-0.5">{ar ? "مساعد ذكي" : "Intelligent assistant"}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-micro text-emerald-600">{ar ? "متصل" : "Online"}</span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {messages.map((msg, i) => (
                <MessageBubble key={i} msg={msg} isLatest={i === messages.length - 1} />
              ))}
              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <TypingIndicator />
              )}
              <div ref={messagesEndRef} />

              {/* Suggested questions (show when few messages) */}
              {messages.length <= 1 && !isLoading && (
                <motion.div
                  className="space-y-2 pt-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <p className="text-micro text-muted-foreground/50 text-center">{ar ? "اقتراحات" : "Suggested"}</p>
                  {suggestedQuestions.map((q) => (
                    <button
                      key={q}
                      onClick={() => { setInput(q); }}
                      className="w-full text-left text-caption text-muted-foreground px-3 py-2 rounded-lg border border-border/40 hover:bg-muted/30 hover:text-foreground transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-border/40 px-4 py-3 shrink-0">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={ar ? "اسأل باز…" : "Ask Buzz…"}
                  className="flex-1 h-10 rounded-xl bg-muted/30 border border-border/40 px-4 text-body focus:outline-none focus:ring-2 focus:ring-brand-ink/20 transition placeholder:text-muted-foreground/40"
                  disabled={isLoading}
                />
                <motion.button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 disabled:opacity-30 transition-opacity"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                </motion.button>
              </div>
              <p className="text-micro text-muted-foreground/40 text-center mt-2">
                {ar ? "مدعوم oleh Bumblebee · بياناتك آمنة" : "Powered by Bumblebee · Your data stays private"}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
