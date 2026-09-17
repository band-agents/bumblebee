// ─── Core types ───────────────────────────────────────────

export type DealStage = "lead" | "qualified" | "proposal" | "negotiation" | "won" | "lost";
export type DealPriority = "high" | "medium" | "low";

export interface Deal {
  id: string;
  titleEn: string;
  titleAr: string;
  descEn: string;
  descAr: string;
  stage: DealStage;
  priority: DealPriority;
  value: number;
  currency: string;
  probability: number;
  ownerEn: string;
  ownerAr: string;
  contactNameEn: string;
  contactNameAr: string;
  contactRole?: string;
  orgId?: string;
  orgNameEn?: string;
  orgNameAr?: string;
  expectedCloseDateEn: string;
  expectedCloseDateAr: string;
  expectedCloseDateISO?: string;
  createdEn: string;
  createdAr: string;
  // For linking
  relatedWorkIds?: string[];
}

// ─── Stage order ──────────────────────────────────────────

export const STAGE_ORDER: DealStage[] = ["lead", "qualified", "proposal", "negotiation", "won", "lost"];
export const PIPELINE_STAGES: DealStage[] = ["lead", "qualified", "proposal", "negotiation"];

// ─── Label maps ───────────────────────────────────────────

export const STAGE_META: Record<DealStage, { en: string; ar: string; dot: string; pill: string }> = {
  lead:        { en: "Lead",        ar: "عميل محتمل",  dot: "bg-stone-400",    pill: "bg-stone-100 text-stone-600 border border-stone-200" },
  qualified:   { en: "Qualified",   ar: "مؤهل",       dot: "bg-primary",      pill: "bg-primary/8 text-brand-ink border border-primary/20" },
  proposal:    { en: "Proposal",    ar: "عرض سعر",    dot: "bg-warning",    pill: "bg-warning/10 text-warning border border-warning/30" },
  negotiation: { en: "Negotiation", ar: "تفاوض",      dot: "bg-chart-4",   pill: "bg-chart-4/10 text-violet-600 border border-chart-4/30" },
  won:         { en: "Won",         ar: "فاز",        dot: "bg-emerald-500",  pill: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  lost:        { en: "Lost",        ar: "خسر",        dot: "bg-rose-500",     pill: "bg-rose-50 text-rose-600 border border-rose-200" },
};

export const DEAL_PRIORITY_META: Record<DealPriority, { en: string; ar: string; dot: string; pill: string }> = {
  high:   { en: "High",   ar: "مرتفع",  dot: "bg-warning",  pill: "bg-warning/10 text-warning border border-warning/30" },
  medium: { en: "Medium", ar: "متوسط",  dot: "bg-primary",    pill: "bg-primary/8 text-brand-ink border border-primary/20" },
  low:    { en: "Low",    ar: "منخفض",  dot: "bg-muted-foreground/40", pill: "bg-muted text-muted-foreground border border-border" },
};

// ─── Helpers ──────────────────────────────────────────────

export function formatCurrency(value: number, currency: string = "EGP"): string {
  return new Intl.NumberFormat("en-EG", { style: "currency", currency, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
}

export function formatCurrencyAr(value: number, currency: string = "EGP"): string {
  return new Intl.NumberFormat("ar-EG", { style: "currency", currency, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
}

// ─── Default data ─────────────────────────────────────────

const DEFAULT_DEALS: Deal[] = [
  {
    id: "d-001",
    titleEn: "Kids Corner Stores — Autumn wholesale",
    titleAr: "كيدز كورنر — طلبية الخريف",
    descEn: "Hoodies and joggers for 14 stores, sizes 2Y–12Y, split into two drops.",
    descAr: "تجهيز كامل بالأثاث المكتبي للمقر الجديد لكيدز كورنر في الرياض. ٣ طوابق، ١٢٠ محطة عمل، جناح تنفيذي، غرف اجتماعات، ومنطقة استقبال. يفضل العميل التصميم الإيطالي مع التصنيع المحلي.",
    stage: "negotiation",
    priority: "high",
    value: 2400000,
    currency: "EGP",
    probability: 75,
    ownerEn: "Khalid Al-Mansouri",
    ownerAr: "خالد المنصوري",
    contactNameEn: "Omar Al-Rashidi",
    contactNameAr: "عمر الراشدي",
    contactRole: "Procurement Director",
    orgId: "org-1",
    orgNameEn: "Kids Corner Stores",
    orgNameAr: "كيدز كورنر",
    expectedCloseDateEn: "Sep 15, 2025",
    expectedCloseDateAr: "١٥ سبتمبر ٢٠٢٥",
    expectedCloseDateISO: "2025-09-15",
    createdEn: "Jul 10, 2025",
    createdAr: "١٠ يوليو ٢٠٢٥",
    relatedWorkIds: ["w-001"],
  },
  {
    id: "d-002",
    titleEn: "Little Steps — Pyjama restock",
    titleAr: "ليتل ستبس — إعادة تخزين البيجامات",
    descEn: "Bear-print pyjama sets and windbreakers for the boutique's winter window.",
    descAr: "نظام أرفف ورفوف صناعية لمستودع ليتل ستبس الموسع. أرفف بالتات ثقيلة، رفوف انتقائية، ومنصة ميزانين. يشمل التركيب.",
    stage: "proposal",
    priority: "medium",
    value: 850000,
    currency: "EGP",
    probability: 60,
    ownerEn: "Sara Mahmoud",
    ownerAr: "سارة محمود",
    contactNameEn: "Fahad Al-Otaibi",
    contactNameAr: "فهد العتيبي",
    contactRole: "Operations Manager",
    orgId: "org-2",
    orgNameEn: "Little Steps Boutique",
    orgNameAr: "ليتل ستبس",
    expectedCloseDateEn: "Aug 28, 2025",
    expectedCloseDateAr: "٢٨ أغسطس ٢٠٢٥",
    expectedCloseDateISO: "2025-08-28",
    createdEn: "Jul 22, 2025",
    createdAr: "٢٢ يوليو ٢٠٢٥",
    relatedWorkIds: ["w-002", "w-009"],
  },
  {
    id: "d-003",
    titleEn: "San Stefano — Franchise opening stock",
    titleAr: "سان ستيفانو — بضاعة الافتتاح",
    descEn: "Full opening range for a new franchise corner: tees, joggers, hoodies and accessories.",
    descAr: "تجهيز كامل لـ ٣ بيوت نموذجية في مجمع البيت السكني الجديد. أثاث عصري، مفروشات ناعمة، لوحات، وإكسسوارات. خيار إيجار ٦ أشهر مع بند شراء.",
    stage: "qualified",
    priority: "medium",
    value: 420000,
    currency: "EGP",
    probability: 45,
    ownerEn: "Nora Al-Farsi",
    ownerAr: "نورة الفارسي",
    contactNameEn: "Layla Hassan",
    contactNameAr: "ليلى حسن",
    contactRole: "Marketing Director",
    orgNameEn: "San Stefano Franchise",
    orgNameAr: "فرانشايز سان ستيفانو",
    expectedCloseDateEn: "Sep 5, 2025",
    expectedCloseDateAr: "٥ سبتمبر ٢٠٢٥",
    expectedCloseDateISO: "2025-09-05",
    createdEn: "Aug 1, 2025",
    createdAr: "١ أغسطس ٢٠٢٥",
  },
  {
    id: "d-004",
    titleEn: "Nile Schools — Uniform tender",
    titleAr: "مدارس النيل — مناقصة الزي",
    descEn: "Polos, trousers and PE kits for 15 schools. Embroidered crest, sizes 4Y–16Y.",
    descAr: "مناقصة حكومية لمقاعد ومكاتب وأماكن المعلمين في ١٥ مدرسة بالمنطقة الشرقية. مواصفات قياسية مع ضمان ٣ سنوات.",
    stage: "lead",
    priority: "high",
    value: 3200000,
    currency: "EGP",
    probability: 25,
    ownerEn: "Khalid Al-Mansouri",
    ownerAr: "خالد المنصوري",
    contactNameEn: "Ahmed Khalil",
    contactNameAr: "أحمد خليل",
    contactRole: "Procurement Officer",
    orgNameEn: "Nile Schools Group",
    orgNameAr: "مجموعة مدارس النيل",
    expectedCloseDateEn: "Nov 1, 2025",
    expectedCloseDateAr: "١ نوفمبر ٢٠٢٥",
    expectedCloseDateISO: "2025-11-01",
    createdEn: "Aug 3, 2025",
    createdAr: "٣ أغسطس ٢٠٢٥",
    relatedWorkIds: ["w-008"],
  },
  {
    id: "d-005",
    titleEn: "Cairo Language School — PE kits",
    titleAr: "مدرسة القاهرة للغات — ملابس رياضة",
    descEn: "PE t-shirts and shorts in house colours for 1,200 students.",
    descAr: "استبدال أثاث اللوبي الفاخر لمدرسة القاهرة للغات. أرائك مصممة خصيصاً، طاولات قهوة، مكتب استقبال، وأثاث إضاءة. يشمل صالة كبار الشخصيات.",
    stage: "negotiation",
    priority: "high",
    value: 1800000,
    currency: "EGP",
    probability: 80,
    ownerEn: "Sara Mahmoud",
    ownerAr: "سارة محمود",
    contactNameEn: "Fatima Al-Zahra",
    contactNameAr: "فاطمة الزهراء",
    contactRole: "General Manager",
    orgNameEn: "Cairo Language School",
    orgNameAr: "مدرسة القاهرة للغات",
    expectedCloseDateEn: "Aug 20, 2025",
    expectedCloseDateAr: "٢٠ أغسطس ٢٠٢٥",
    expectedCloseDateISO: "2025-08-20",
    createdEn: "Jul 15, 2025",
    createdAr: "١٥ يوليو ٢٠٢٥",
  },
  {
    id: "d-006",
    titleEn: "Mini Me Online — Winter capsule",
    titleAr: "ميني مي — كبسولة الشتاء",
    descEn: "Puffer vests and beanies as an online-exclusive winter capsule.",
    descAr: "أثاث جديد لغرفة الاستراحة في مصنع أطلس. طاولات كافيتيريا، كراسي قابلة للتكديس، مقاعد صالة، وأثاث فناء خارجي لأكثر من ٢٠٠ موظف.",
    stage: "won",
    priority: "medium",
    value: 280000,
    currency: "EGP",
    probability: 100,
    ownerEn: "Fahad Al-Otaibi",
    ownerAr: "فهد العتيبي",
    contactNameEn: "Omar Al-Rashidi",
    contactNameAr: "عمر الراشدي",
    contactRole: "Facilities Director",
    orgId: "org-3",
    orgNameEn: "Mini Me Online",
    orgNameAr: "ميني مي",
    expectedCloseDateEn: "Jul 30, 2025",
    expectedCloseDateAr: "٣٠ يوليو ٢٠٢٥",
    expectedCloseDateISO: "2025-07-30",
    createdEn: "Jun 20, 2025",
    createdAr: "٢٠ يونيو ٢٠٢٥",
    relatedWorkIds: ["w-004"],
  },
  {
    id: "d-007",
    titleEn: "Toy Town — Kiosk basics",
    titleAr: "توي تاون — أساسيات الأكشاك",
    descEn: "Tee 3-packs and socks for 20 mall kiosks. Recycled packaging preferred.",
    descAr: "أثاث عصري لمساحة عمل مشتركة في مركز التقنية الجديد. مكاتب مشتركة، أكشاك هاتفية، مناطق تعاون، ومساحة فعاليات. يُفضل المواد المستدامة.",
    stage: "lead",
    priority: "medium",
    value: 950000,
    currency: "EGP",
    probability: 20,
    ownerEn: "Nora Al-Farsi",
    ownerAr: "نورة الفارسي",
    contactNameEn: "Layla Hassan",
    contactNameAr: "ليلى حسن",
    contactRole: "Founder",
    orgNameEn: "Toy Town Kiosks",
    orgNameAr: "توي تاون",
    expectedCloseDateEn: "Oct 15, 2025",
    expectedCloseDateAr: "١٥ أكتوبر ٢٠٢٥",
    expectedCloseDateISO: "2025-10-15",
    createdEn: "Aug 5, 2025",
    createdAr: "٥ أغسطس ٢٠٢٥",
  },
  {
    id: "d-008",
    titleEn: "Children's Hospital — Patient pyjamas",
    titleAr: "مستشفى الأطفال — بيجامات المرضى",
    descEn: "Soft cotton pyjamas with snap shoulders for the paediatric ward, 600 sets.",
    descAr: "أثاث طبي لـ ٥٠ غرفة مريض في الجناح الجديد. طاولات سرير قابلة للتعديل، كراسي زوار، خزائن بجانب السرير، ومكاتب محطة التمريض.",
    stage: "qualified",
    priority: "high",
    value: 1500000,
    currency: "EGP",
    probability: 40,
    ownerEn: "Khalid Al-Mansouri",
    ownerAr: "خالد المنصوري",
    contactNameEn: "Ahmed Khalil",
    contactNameAr: "أحمد خليل",
    contactRole: "Chief Operating Officer",
    orgNameEn: "Children's Hospital Cairo",
    orgNameAr: "مستشفى الأطفال",
    expectedCloseDateEn: "Oct 1, 2025",
    expectedCloseDateAr: "١ أكتوبر ٢٠٢٥",
    expectedCloseDateISO: "2025-10-01",
    createdEn: "Jul 28, 2025",
    createdAr: "٢٨ يوليو ٢٠٢٥",
  },
  {
    id: "d-009",
    titleEn: "Baby Bloom — Newborn range (Lost)",
    titleAr: "بيبي بلوم — مواليد (خسر)",
    descEn: "Newborn bodysuits. Lost to an importer with lower pricing.",
    descAr: "أثاث مكتبي لبرنامج مسرعة أعمال. خُسرت لصالح منافس بسعر أقل. اختار العميل أثاثاً مستورداً جاهزاً بدلاً من عرضنا المخصص.",
    stage: "lost",
    priority: "low",
    value: 180000,
    currency: "EGP",
    probability: 0,
    ownerEn: "Fahad Al-Otaibi",
    ownerAr: "فهد العتيبي",
    contactNameEn: "Fatima Al-Zahra",
    contactNameAr: "فاطمة الزهراء",
    contactRole: "Program Manager",
    orgNameEn: "Baby Bloom",
    orgNameAr: "بيبي بلوم",
    expectedCloseDateEn: "Jul 15, 2025",
    expectedCloseDateAr: "١٥ يوليو ٢٠٢٥",
    expectedCloseDateISO: "2025-07-15",
    createdEn: "Jun 10, 2025",
    createdAr: "١٠ يونيو ٢٠٢٥",
  },
  {
    id: "d-010",
    titleEn: "Toy Town — Holiday gift sets",
    titleAr: "توي تاون — هدايا الأعياد",
    descEn: "Boxed hoodie + beanie gift sets for the holiday season, 900 boxes.",
    descAr: "أثاث فاخر مخصص لـ ٥ وحدات بنتهاوس. أرائك جلد إيطالي، طاولات طعام رخامية، خزائن مخصصة، وقطع تصميمية. توصيل وتركيب مميز.",
    stage: "proposal",
    priority: "high",
    value: 4500000,
    currency: "EGP",
    probability: 55,
    ownerEn: "Sara Mahmoud",
    ownerAr: "سارة محمود",
    contactNameEn: "Omar Al-Rashidi",
    contactNameAr: "عمر الراشدي",
    contactRole: "Developer",
    orgNameEn: "Toy Town Kiosks",
    orgNameAr: "توي تاون",
    expectedCloseDateEn: "Sep 30, 2025",
    expectedCloseDateAr: "٣٠ سبتمبر ٢٠٢٥",
    expectedCloseDateISO: "2025-09-30",
    createdEn: "Jul 18, 2025",
    createdAr: "١٨ يوليو ٢٠٢٥",
  },
];

// ─── localStorage persistence ─────────────────────────────

import { getLiveDeals } from "../lib/dashboard-bridge";

const STORAGE_KEY = "bumblebee_deals";

export function loadDeals(): Deal[] {
  // Live data bridge (production Supabase data)
  const live = getLiveDeals();
  if (live) return live;
  // Demo mode: localStorage / defaults
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (_) {}
  return DEFAULT_DEALS;
}

export function saveDeals(deals: Deal[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(deals));
  } catch (_) {}
}
