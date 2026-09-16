/**
 * Production Module — Data Layer (Garment Manufacturing)
 * Complete production tracking: orders, stages, rate, QC, materials, costs, alerts
 *
 * Built for an in-house apparel maker: pattern → cut → sew → finish → QC → pack,
 * with imported fabric and trims tracked as raw material.
 */

import { useCallback, useEffect, useState } from "react";
import { isDemoMode } from "./supabase";
import { getDataSource } from "./data-source";
import type { Database } from "./database.types";

type Tables = Database["public"]["Tables"];

// ─── Types ────────────────────────────────────────────────

export type StageStatus = "not_started" | "waiting" | "in_progress" | "paused" | "blocked" | "completed" | "failed_qc" | "rework_required";
export type ProductionStatus = "planned" | "in_progress" | "delayed" | "on_hold" | "completed" | "cancelled";
export type Priority = "critical" | "urgent" | "high" | "medium" | "low";

export interface ProductionStage {
  id: string;
  order_id: string;
  stage_key: string;
  stage_name_en: string;
  stage_name_ar: string;
  status: StageStatus;
  started_at: string | null;
  finished_at: string | null;
  planned_duration_hours: number;
  actual_duration_hours: number | null;
  completed_qty: number;
  remaining_qty: number;
  rejected_qty: number;
  rework_qty: number;
  assigned_team: string;
  assigned_operator: string;
  notes: string;
  sequence: number;
}

export interface ProductionOrder {
  id: string;
  order_number: string;
  product_name: string;
  product_sku: string;
  sales_order_ref: string;
  customer_name: string;
  priority: Priority;
  status: ProductionStatus;
  current_stage: string;
  current_stage_en: string;
  current_stage_ar: string;
  planned_qty: number;
  completed_qty: number;
  remaining_qty: number;
  rejected_qty: number;
  rework_qty: number;
  waste_qty: number;
  passed_qty: number;
  progress_pct: number;
  production_rate_per_hour: number;
  production_rate_per_day: number;
  efficiency_pct: number;
  planned_rate_per_hour: number;
  start_date: string;
  due_date: string;
  estimated_completion: string;
  is_delayed: boolean;
  delay_days: number;
  delay_reason: string;
  assigned_team: string;
  assigned_lead: string;
  workstation: string;
  material_status: "available" | "partial" | "shortage";
  qc_status: "pending" | "in_progress" | "passed" | "failed" | "conditional";
  estimated_cost: number;
  actual_cost: number;
  material_cost: number;
  labor_cost: number;
  notes: string;
  created_at: string;
  updated_at: string;
  stages: ProductionStage[];
  materials: ProductionMaterial[];
  qc_checks: QCCheck[];
  activity_log: ActivityLogEntry[];
}

export interface ProductionMaterial {
  id: string;
  name: string;
  required_qty: number;
  reserved_qty: number;
  used_qty: number;
  remaining_qty: number;
  unit: string;
  status: "available" | "reserved" | "partial" | "shortage";
  supplier: string;
  warehouse_location: string;
}

export interface QCCheck {
  id: string;
  stage: string;
  inspector: string;
  status: "pending" | "passed" | "failed" | "conditional";
  passed_qty: number;
  failed_qty: number;
  defect_type: string;
  defect_pct: number;
  notes: string;
  checked_at: string;
}

export interface ActivityLogEntry {
  id: string;
  action: string;
  description_en: string;
  description_ar: string;
  user: string;
  timestamp: string;
  type: "stage_change" | "quantity_update" | "qc" | "material" | "comment" | "file" | "delay" | "completion" | "status_change";
}

export interface ProductionAlert {
  id: string;
  order_id: string;
  order_number: string;
  type: "rate_low" | "deadline_risk" | "material_shortage" | "qc_failure" | "stage_stuck" | "rework_risk" | "machine_down" | "quantity_mismatch";
  severity: "info" | "warning" | "critical";
  message_en: string;
  message_ar: string;
  created_at: string;
  dismissed: boolean;
}

export interface WorkstationInfo {
  id: string;
  name: string;
  status: "active" | "idle" | "maintenance" | "down";
  current_order: string | null;
  operator: string;
  capacity: number;
  queue_count: number;
  last_maintenance: string;
}

// ─── Default Stage Template (Garment Manufacturing) ───────

export const DEFAULT_STAGES = [
  { key: "order_created",       en: "Order Created",        ar: "إنشاء الأمر",        sequence: 0 },
  { key: "materials_reserved",  en: "Fabric & Trims",       ar: "القماش والإكسسوار",  sequence: 1 },
  { key: "pattern",             en: "Pattern & Marker",     ar: "الباترون والماركر",  sequence: 2 },
  { key: "cutting",             en: "Cutting",              ar: "القص",               sequence: 3 },
  { key: "sewing",              en: "Sewing",               ar: "الخياطة",            sequence: 4 },
  { key: "finishing",           en: "Finishing & Pressing", ar: "التشطيب والكي",      sequence: 5 },
  { key: "quality_control",     en: "Quality Control",      ar: "مراقبة الجودة",      sequence: 6 },
  { key: "packaging",           en: "Packing & Labels",     ar: "التغليف والتيكيت",   sequence: 7 },
  { key: "ready_dispatch",      en: "Ready for Dispatch",   ar: "جاهز للتسليم",       sequence: 8 },
  { key: "completed",           en: "Completed",            ar: "مكتمل",              sequence: 9 },
] as const;

type StageKey = (typeof DEFAULT_STAGES)[number]["key"];

// ─── Demo Data ────────────────────────────────────────────

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function tsAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(10 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 60));
  return d.toISOString();
}

/** One stage row. Names come from DEFAULT_STAGES so labels never drift from the template. */
function stage(
  order: string, key: StageKey, status: StageStatus, qty: number,
  opts: { start?: number; end?: number; planned?: number; actual?: number; done?: number; rejected?: number; rework?: number; team?: string; operator?: string; notes?: string } = {},
): ProductionStage {
  const def = DEFAULT_STAGES.find(s => s.key === key)!;
  const done = opts.done ?? (status === "completed" ? qty : 0);
  return {
    id: `${order}-${key}`, order_id: order, stage_key: key,
    stage_name_en: def.en, stage_name_ar: def.ar, status,
    started_at: opts.start != null ? daysAgo(opts.start) : null,
    finished_at: opts.end != null ? daysAgo(opts.end) : null,
    planned_duration_hours: opts.planned ?? 8,
    actual_duration_hours: opts.actual ?? null,
    completed_qty: done, remaining_qty: Math.max(0, qty - done),
    rejected_qty: opts.rejected ?? 0, rework_qty: opts.rework ?? 0,
    assigned_team: opts.team ?? "", assigned_operator: opts.operator ?? "",
    notes: opts.notes ?? "", sequence: def.sequence,
  };
}

const DEMO_STAGES: ProductionStage[] = [
  // PO-01: Explorer Zip Hoodie — 600 pcs, at packing
  stage("po-01", "order_created", "completed", 600, { start: 24, end: 24, planned: 1, actual: 0.5, team: "Planning", operator: "System" }),
  stage("po-01", "materials_reserved", "completed", 600, { start: 24, end: 22, planned: 8, actual: 10, team: "Fabric Store", operator: "Tarek Hassan", notes: "Imported 320gsm French terry (Turkey) + YKK zips issued" }),
  stage("po-01", "pattern", "completed", 600, { start: 22, end: 21, planned: 10, actual: 9, team: "Pattern Room", operator: "Mona Adel", notes: "Graded 2Y–12Y, marker efficiency 86%" }),
  stage("po-01", "cutting", "completed", 600, { start: 21, end: 19, planned: 16, actual: 18, rejected: 6, team: "Cutting Table 1", operator: "Ahmed Khalil", notes: "6 panels recut — shade variation on roll 14" }),
  stage("po-01", "sewing", "completed", 600, { start: 19, end: 11, planned: 96, actual: 104, rework: 14, team: "Sewing Line A", operator: "Hoda Saeed", notes: "Zip insertion was the slow operation" }),
  stage("po-01", "finishing", "completed", 600, { start: 11, end: 8, planned: 24, actual: 22, team: "Finishing", operator: "Khaled Mansour", notes: "Thread trimming, pressing, CUBS woven label check" }),
  stage("po-01", "quality_control", "completed", 600, { start: 8, end: 6, planned: 12, actual: 11, rejected: 9, team: "QC", operator: "Laila Qasim", notes: "AQL 2.5 passed — 9 pcs to seconds" }),
  stage("po-01", "packaging", "in_progress", 600, { start: 6, done: 420, planned: 12, team: "Packing", operator: "Omar Hassan", notes: "Polybag + hang tag + size sticker" }),

  // PO-02: Adventure Jogger Set — 800 sets, sewing
  stage("po-02", "order_created", "completed", 800, { start: 18, end: 18, planned: 1, actual: 0.5, team: "Planning", operator: "System" }),
  stage("po-02", "materials_reserved", "completed", 800, { start: 18, end: 15, planned: 8, actual: 16, team: "Fabric Store", operator: "Tarek Hassan", notes: "Local cotton fleece in; imported rib trim arrived 2 days late" }),
  stage("po-02", "pattern", "completed", 800, { start: 15, end: 14, planned: 8, actual: 8, team: "Pattern Room", operator: "Mona Adel" }),
  stage("po-02", "cutting", "completed", 800, { start: 14, end: 12, planned: 20, actual: 19, team: "Cutting Table 2", operator: "Ahmed Khalil" }),
  stage("po-02", "sewing", "in_progress", 800, { start: 12, done: 460, planned: 120, rework: 22, team: "Sewing Line B", operator: "Samah Fathy", notes: "Waistband elastic running low — 2nd lot ordered" }),

  // PO-03: Little Cub Pyjama Set — 1,200 sets, cutting, delayed
  stage("po-03", "order_created", "completed", 1200, { start: 10, end: 10, planned: 1, actual: 0.5, team: "Planning", operator: "System" }),
  stage("po-03", "materials_reserved", "completed", 1200, { start: 10, end: 6, planned: 8, actual: 30, team: "Fabric Store", operator: "Tarek Hassan", notes: "Printed interlock held at customs 3 days" }),
  stage("po-03", "pattern", "completed", 1200, { start: 6, end: 5, planned: 10, actual: 12, team: "Pattern Room", operator: "Mona Adel", notes: "Print direction locked on marker" }),
  stage("po-03", "cutting", "in_progress", 1200, { start: 5, done: 540, planned: 28, team: "Cutting Table 1", operator: "Ahmed Khalil", notes: "Pattern matching on print slows spreading" }),

  // PO-04: Trail Windbreaker — 400 pcs, planned
  stage("po-04", "order_created", "completed", 400, { start: 3, end: 3, planned: 1, actual: 0.5, team: "Planning", operator: "System" }),
  stage("po-04", "materials_reserved", "waiting", 400, { planned: 6, team: "Fabric Store", notes: "Imported ripstop nylon on the water — ETA 9 days" }),

  // PO-05: Everyday Tee 3-Pack — 1,500 packs, completed
  stage("po-05", "order_created", "completed", 1500, { start: 40, end: 40, planned: 1, actual: 0.5, team: "Planning", operator: "System" }),
  stage("po-05", "materials_reserved", "completed", 1500, { start: 40, end: 39, planned: 6, actual: 5, team: "Fabric Store", operator: "Tarek Hassan" }),
  stage("po-05", "pattern", "completed", 1500, { start: 39, end: 38, planned: 6, actual: 6, team: "Pattern Room", operator: "Mona Adel" }),
  stage("po-05", "cutting", "completed", 1500, { start: 38, end: 36, planned: 20, actual: 18, team: "Cutting Table 2", operator: "Ahmed Khalil" }),
  stage("po-05", "sewing", "completed", 1500, { start: 36, end: 26, planned: 110, actual: 102, rework: 18, team: "Sewing Line A", operator: "Hoda Saeed" }),
  stage("po-05", "finishing", "completed", 1500, { start: 26, end: 23, planned: 24, actual: 22, team: "Finishing", operator: "Khaled Mansour" }),
  stage("po-05", "quality_control", "completed", 1500, { start: 23, end: 21, planned: 14, actual: 12, rejected: 21, team: "QC", operator: "Laila Qasim" }),
  stage("po-05", "packaging", "completed", 1500, { start: 21, end: 19, planned: 14, actual: 13, team: "Packing", operator: "Omar Hassan", notes: "Packed 3-per-box, 50 boxes per carton" }),
  stage("po-05", "ready_dispatch", "completed", 1500, { start: 19, end: 19, planned: 1, actual: 0.5, team: "Warehouse", operator: "Omar Hassan" }),
];

const DEMO_ORDERS: ProductionOrder[] = [
  {
    id: "po-01", order_number: "PO-2026-041", product_name: "Explorer Zip Hoodie — Sage", product_sku: "CUB-HOOD-EXP-SAG",
    sales_order_ref: "SO-2026-212", customer_name: "CUBS Online Store", priority: "high", status: "in_progress",
    current_stage: "packaging", current_stage_en: "Packing & Labels", current_stage_ar: "التغليف والتيكيت",
    planned_qty: 600, completed_qty: 420, remaining_qty: 180, rejected_qty: 15, rework_qty: 14, waste_qty: 6,
    passed_qty: 591, progress_pct: 90, production_rate_per_hour: 6.8, production_rate_per_day: 54,
    efficiency_pct: 91, planned_rate_per_hour: 7.5, start_date: daysAgo(24), due_date: daysFromNow(3),
    estimated_completion: daysFromNow(2), is_delayed: false, delay_days: 0, delay_reason: "",
    assigned_team: "Sewing Line A", assigned_lead: "Hoda Saeed", workstation: "Packing Bay",
    material_status: "available", qc_status: "passed", estimated_cost: 186000, actual_cost: 179400,
    material_cost: 121800, labor_cost: 57600, notes: "Size run 2Y–12Y. Ships to online store + City Stars branch.",
    created_at: tsAgo(24), updated_at: tsAgo(1),
    stages: DEMO_STAGES.filter(s => s.order_id === "po-01"),
    materials: [
      { id: "m1-1", name: "French Terry 320gsm — Sage (imported, Turkey)", required_qty: 540, reserved_qty: 540, used_qty: 528, remaining_qty: 12, unit: "m", status: "available", supplier: "Bursa Tekstil", warehouse_location: "F-02" },
      { id: "m1-2", name: "YKK Metal Zip 35cm (imported)", required_qty: 600, reserved_qty: 600, used_qty: 600, remaining_qty: 0, unit: "pcs", status: "available", supplier: "YKK Middle East", warehouse_location: "T-01" },
      { id: "m1-3", name: "Rib 1x1 Cuff — Sage", required_qty: 90, reserved_qty: 90, used_qty: 86, remaining_qty: 4, unit: "m", status: "available", supplier: "Nile Knit", warehouse_location: "F-05" },
      { id: "m1-4", name: "CUBS Woven Neck Label", required_qty: 600, reserved_qty: 600, used_qty: 600, remaining_qty: 0, unit: "pcs", status: "available", supplier: "Label House Cairo", warehouse_location: "T-04" },
      { id: "m1-5", name: "Hang Tag + Polybag", required_qty: 600, reserved_qty: 600, used_qty: 420, remaining_qty: 180, unit: "sets", status: "available", supplier: "PackRight", warehouse_location: "P-01" },
    ],
    qc_checks: [
      { id: "qc1-1", stage: "quality_control", inspector: "Laila Qasim", status: "passed", passed_qty: 591, failed_qty: 9, defect_type: "Open seam at zip end", defect_pct: 1.5, notes: "AQL 2.5 passed — 9 pcs to seconds", checked_at: tsAgo(6) },
    ],
    activity_log: [
      { id: "a1-1", action: "created", description_en: "Production order PO-2026-041 created for 600 Explorer hoodies", description_ar: "تم إنشاء أمر التشغيل PO-2026-041 لـ 600 هودي إكسبلورر", user: "System", timestamp: tsAgo(24), type: "status_change" },
      { id: "a1-2", action: "materials_reserved", description_en: "Imported French terry and YKK zips issued to cutting", description_ar: "تم صرف قماش الفرنش تيري المستورد وسوست YKK للقص", user: "Tarek Hassan", timestamp: tsAgo(22), type: "material" },
      { id: "a1-3", action: "stage_completed", description_en: "Cutting done — 6 panels recut for shade variation", description_ar: "اكتمل القص — إعادة قص 6 قطع بسبب اختلاف درجة اللون", user: "Ahmed Khalil", timestamp: tsAgo(19), type: "stage_change" },
      { id: "a1-4", action: "stage_completed", description_en: "Sewing done on Line A — 14 pcs reworked", description_ar: "اكتملت الخياطة على الخط A — إعادة تشغيل 14 قطعة", user: "Hoda Saeed", timestamp: tsAgo(11), type: "stage_change" },
      { id: "a1-5", action: "qc_check", description_en: "QC passed at AQL 2.5 — 9 pcs to seconds", description_ar: "اجتاز فحص الجودة AQL 2.5 — 9 قطع درجة ثانية", user: "Laila Qasim", timestamp: tsAgo(6), type: "qc" },
    ],
  },
  {
    id: "po-02", order_number: "PO-2026-043", product_name: "Adventure Jogger Set — Navy", product_sku: "CUB-SET-ADV-NVY",
    sales_order_ref: "SO-2026-219", customer_name: "CUBS Retail Branches", priority: "medium", status: "in_progress",
    current_stage: "sewing", current_stage_en: "Sewing", current_stage_ar: "الخياطة",
    planned_qty: 800, completed_qty: 0, remaining_qty: 800, rejected_qty: 0, rework_qty: 22, waste_qty: 0,
    passed_qty: 0, progress_pct: 52, production_rate_per_hour: 5.2, production_rate_per_day: 42,
    efficiency_pct: 84, planned_rate_per_hour: 6.2, start_date: daysAgo(18), due_date: daysFromNow(9),
    estimated_completion: daysFromNow(10), is_delayed: false, delay_days: 0, delay_reason: "",
    assigned_team: "Sewing Line B", assigned_lead: "Samah Fathy", workstation: "Sewing Line B",
    material_status: "partial", qc_status: "pending", estimated_cost: 212000, actual_cost: 118500,
    material_cost: 96000, labor_cost: 22500, notes: "Back-to-school drop. Elastic 2nd lot must land before day 6.",
    created_at: tsAgo(18), updated_at: tsAgo(0),
    stages: DEMO_STAGES.filter(s => s.order_id === "po-02"),
    materials: [
      { id: "m2-1", name: "Cotton Fleece 280gsm — Navy", required_qty: 960, reserved_qty: 960, used_qty: 940, remaining_qty: 20, unit: "m", status: "available", supplier: "Misr Spinning", warehouse_location: "F-01" },
      { id: "m2-2", name: "Waistband Elastic 30mm", required_qty: 560, reserved_qty: 320, used_qty: 300, remaining_qty: 260, unit: "m", status: "partial", supplier: "Delta Trims", warehouse_location: "T-02" },
      { id: "m2-3", name: "Rib Trim (imported, China)", required_qty: 120, reserved_qty: 120, used_qty: 70, remaining_qty: 50, unit: "m", status: "available", supplier: "Shaoxing Rib Co.", warehouse_location: "F-05" },
    ],
    qc_checks: [],
    activity_log: [
      { id: "a2-1", action: "created", description_en: "Production order PO-2026-043 created", description_ar: "تم إنشاء أمر التشغيل PO-2026-043", user: "System", timestamp: tsAgo(18), type: "status_change" },
      { id: "a2-2", action: "delay_detected", description_en: "Imported rib trim arrived 2 days late", description_ar: "وصل الريب المستورد متأخراً يومين", user: "Tarek Hassan", timestamp: tsAgo(15), type: "delay" },
      { id: "a2-3", action: "quantity_update", description_en: "Sewing Line B: 460 of 800 sets complete", description_ar: "خط الخياطة B: اكتمل 460 من 800 طقم", user: "Samah Fathy", timestamp: tsAgo(0), type: "quantity_update" },
    ],
  },
  {
    id: "po-03", order_number: "PO-2026-045", product_name: "Little Cub Pyjama Set — Bear Print", product_sku: "CUB-PJ-LCB-PRT",
    sales_order_ref: "SO-2026-224", customer_name: "CUBS Online Store", priority: "urgent", status: "in_progress",
    current_stage: "cutting", current_stage_en: "Cutting", current_stage_ar: "القص",
    planned_qty: 1200, completed_qty: 0, remaining_qty: 1200, rejected_qty: 0, rework_qty: 0, waste_qty: 0,
    passed_qty: 0, progress_pct: 28, production_rate_per_hour: 19, production_rate_per_day: 150,
    efficiency_pct: 76, planned_rate_per_hour: 25, start_date: daysAgo(10), due_date: daysFromNow(12),
    estimated_completion: daysFromNow(15), is_delayed: true, delay_days: 3, delay_reason: "Imported printed interlock held at customs for 3 days",
    assigned_team: "Cutting Table 1", assigned_lead: "Ahmed Khalil", workstation: "Cutting Table 1",
    material_status: "available", qc_status: "pending", estimated_cost: 264000, actual_cost: 98000,
    material_cost: 92000, labor_cost: 6000, notes: "Winter campaign hero product. Print must match across front panels.",
    created_at: tsAgo(10), updated_at: tsAgo(0),
    stages: DEMO_STAGES.filter(s => s.order_id === "po-03"),
    materials: [
      { id: "m3-1", name: "Printed Interlock 200gsm — Bear (imported, Portugal)", required_qty: 1380, reserved_qty: 1380, used_qty: 620, remaining_qty: 760, unit: "m", status: "available", supplier: "Lisboa Prints", warehouse_location: "F-03" },
      { id: "m3-2", name: "Snap Buttons 12mm", required_qty: 4800, reserved_qty: 4800, used_qty: 0, remaining_qty: 4800, unit: "pcs", status: "available", supplier: "Delta Trims", warehouse_location: "T-03" },
      { id: "m3-3", name: "Care Label (EN/AR)", required_qty: 1200, reserved_qty: 1200, used_qty: 0, remaining_qty: 1200, unit: "pcs", status: "available", supplier: "Label House Cairo", warehouse_location: "T-04" },
    ],
    qc_checks: [],
    activity_log: [
      { id: "a3-1", action: "created", description_en: "Production order PO-2026-045 created — URGENT", description_ar: "تم إنشاء أمر التشغيل PO-2026-045 — عاجل", user: "System", timestamp: tsAgo(10), type: "status_change" },
      { id: "a3-2", action: "delay_detected", description_en: "Printed interlock held at customs 3 days", description_ar: "القماش المطبوع محجوز في الجمارك 3 أيام", user: "System", timestamp: tsAgo(7), type: "delay" },
      { id: "a3-3", action: "stage_started", description_en: "Cutting started — print-matched spreading", description_ar: "بدأ القص — فرد القماش مع مطابقة الطباعة", user: "Ahmed Khalil", timestamp: tsAgo(5), type: "stage_change" },
    ],
  },
  {
    id: "po-04", order_number: "PO-2026-047", product_name: "Trail Windbreaker — Mustard", product_sku: "CUB-JKT-TRL-MUS",
    sales_order_ref: "SO-2026-230", customer_name: "CUBS Retail Branches", priority: "low", status: "planned",
    current_stage: "materials_reserved", current_stage_en: "Fabric & Trims", current_stage_ar: "القماش والإكسسوار",
    planned_qty: 400, completed_qty: 0, remaining_qty: 400, rejected_qty: 0, rework_qty: 0, waste_qty: 0,
    passed_qty: 0, progress_pct: 0, production_rate_per_hour: 0, production_rate_per_day: 0,
    efficiency_pct: 0, planned_rate_per_hour: 4, start_date: daysFromNow(9), due_date: daysFromNow(30),
    estimated_completion: daysFromNow(30), is_delayed: false, delay_days: 0, delay_reason: "",
    assigned_team: "", assigned_lead: "", workstation: "",
    material_status: "shortage", qc_status: "pending", estimated_cost: 148000, actual_cost: 0,
    material_cost: 0, labor_cost: 0, notes: "Imported ripstop on the water. Starts when fabric clears customs.",
    created_at: tsAgo(3), updated_at: tsAgo(3),
    stages: DEMO_STAGES.filter(s => s.order_id === "po-04"),
    materials: [
      { id: "m4-1", name: "Ripstop Nylon — Mustard (imported, China)", required_qty: 520, reserved_qty: 0, used_qty: 0, remaining_qty: 520, unit: "m", status: "shortage", supplier: "Jiangsu Outdoor Fabrics", warehouse_location: "" },
      { id: "m4-2", name: "Mesh Lining", required_qty: 400, reserved_qty: 0, used_qty: 0, remaining_qty: 400, unit: "m", status: "shortage", supplier: "Nile Knit", warehouse_location: "" },
    ],
    qc_checks: [],
    activity_log: [
      { id: "a4-1", action: "created", description_en: "Production order PO-2026-047 planned — waiting for imported fabric", description_ar: "تم تخطيط أمر التشغيل PO-2026-047 — في انتظار القماش المستورد", user: "System", timestamp: tsAgo(3), type: "status_change" },
    ],
  },
  {
    id: "po-05", order_number: "PO-2026-032", product_name: "Everyday Tee 3-Pack — Multicolour", product_sku: "CUB-TEE-EVD-3PK",
    sales_order_ref: "SO-2026-188", customer_name: "CUBS Online Store", priority: "high", status: "completed",
    current_stage: "ready_dispatch", current_stage_en: "Ready for Dispatch", current_stage_ar: "جاهز للتسليم",
    planned_qty: 1500, completed_qty: 1479, remaining_qty: 0, rejected_qty: 21, rework_qty: 18, waste_qty: 0,
    passed_qty: 1479, progress_pct: 100, production_rate_per_hour: 14, production_rate_per_day: 112,
    efficiency_pct: 94, planned_rate_per_hour: 13.5, start_date: daysAgo(40), due_date: daysAgo(17),
    estimated_completion: daysAgo(19), is_delayed: false, delay_days: 0, delay_reason: "",
    assigned_team: "Sewing Line A", assigned_lead: "Hoda Saeed", workstation: "Warehouse",
    material_status: "available", qc_status: "passed", estimated_cost: 255000, actual_cost: 243600,
    material_cost: 168000, labor_cost: 75600, notes: "Delivered 2 days early.",
    created_at: tsAgo(40), updated_at: tsAgo(19),
    stages: DEMO_STAGES.filter(s => s.order_id === "po-05"),
    materials: [
      { id: "m5-1", name: "Combed Cotton Jersey 180gsm", required_qty: 2700, reserved_qty: 2700, used_qty: 2660, remaining_qty: 40, unit: "m", status: "available", supplier: "Misr Spinning", warehouse_location: "F-01" },
      { id: "m5-2", name: "CUBS Printed Neck Label", required_qty: 4500, reserved_qty: 4500, used_qty: 4500, remaining_qty: 0, unit: "pcs", status: "available", supplier: "Label House Cairo", warehouse_location: "T-04" },
    ],
    qc_checks: [
      { id: "qc5-1", stage: "quality_control", inspector: "Laila Qasim", status: "passed", passed_qty: 1479, failed_qty: 21, defect_type: "Neck rib twist", defect_pct: 1.4, notes: "AQL 2.5 passed", checked_at: tsAgo(21) },
    ],
    activity_log: [
      { id: "a5-1", action: "completed", description_en: "Production completed — 1,479 packs ready for dispatch", description_ar: "اكتمل الإنتاج — 1,479 عبوة جاهزة للتسليم", user: "Omar Hassan", timestamp: tsAgo(19), type: "completion" },
    ],
  },
];

const DEMO_ALERTS: ProductionAlert[] = [
  { id: "alert-1", order_id: "po-03", order_number: "PO-2026-045", type: "deadline_risk", severity: "warning", message_en: "Customs hold on printed interlock — pyjama set 3 days behind", message_ar: "حجز جمركي على القماش المطبوع — طقم البيجامة متأخر 3 أيام", created_at: tsAgo(1), dismissed: false },
  { id: "alert-2", order_id: "po-02", order_number: "PO-2026-043", type: "material_shortage", severity: "warning", message_en: "Waistband elastic — 260 m short, second lot ordered", message_ar: "أستك الوسط — ناقص 260 متر، تم طلب دفعة ثانية", created_at: tsAgo(2), dismissed: false },
  { id: "alert-3", order_id: "po-04", order_number: "PO-2026-047", type: "material_shortage", severity: "info", message_en: "Imported ripstop ETA 9 days — windbreaker cannot start", message_ar: "الريب ستوب المستورد يصل خلال 9 أيام — لا يمكن بدء الجاكيت", created_at: tsAgo(3), dismissed: false },
  { id: "alert-4", order_id: "po-02", order_number: "PO-2026-043", type: "rate_low", severity: "warning", message_en: "Sewing Line B at 84% of planned rate", message_ar: "خط الخياطة B يعمل بنسبة 84% من المعدل المخطط", created_at: tsAgo(0), dismissed: false },
];

const DEMO_WORKSTATIONS: WorkstationInfo[] = [
  { id: "ws-1", name: "Pattern & CAD Room", status: "active", current_order: null, operator: "Mona Adel", capacity: 70, queue_count: 1, last_maintenance: daysAgo(20) },
  { id: "ws-2", name: "Cutting Table 1", status: "active", current_order: "po-03", operator: "Ahmed Khalil", capacity: 95, queue_count: 0, last_maintenance: daysAgo(9) },
  { id: "ws-3", name: "Cutting Table 2", status: "idle", current_order: null, operator: "", capacity: 0, queue_count: 1, last_maintenance: daysAgo(6) },
  { id: "ws-4", name: "Sewing Line A (18 machines)", status: "active", current_order: "po-01", operator: "Hoda Saeed", capacity: 88, queue_count: 1, last_maintenance: daysAgo(11) },
  { id: "ws-5", name: "Sewing Line B (14 machines)", status: "active", current_order: "po-02", operator: "Samah Fathy", capacity: 84, queue_count: 0, last_maintenance: daysAgo(13) },
  { id: "ws-6", name: "Embroidery Machine", status: "maintenance", current_order: null, operator: "", capacity: 0, queue_count: 2, last_maintenance: daysAgo(30) },
  { id: "ws-7", name: "Finishing & Pressing", status: "active", current_order: null, operator: "Khaled Mansour", capacity: 60, queue_count: 0, last_maintenance: daysAgo(5) },
  { id: "ws-8", name: "QC Station", status: "active", current_order: null, operator: "Laila Qasim", capacity: 75, queue_count: 0, last_maintenance: daysAgo(7) },
  { id: "ws-9", name: "Packing Bay", status: "active", current_order: "po-01", operator: "Omar Hassan", capacity: 90, queue_count: 0, last_maintenance: daysAgo(12) },
];

// ─── Store ────────────────────────────────────────────────
// Demo mode starts on the sample CUBS runs. Live mode starts EMPTY and is
// filled from the database by loadLiveProduction() — sample orders must never
// show up in a real workspace.

let _orders: ProductionOrder[] = isDemoMode ? [...DEMO_ORDERS] : [];
let _alerts: ProductionAlert[] = isDemoMode ? [...DEMO_ALERTS] : [];
let _workstations: WorkstationInfo[] = isDemoMode ? [...DEMO_WORKSTATIONS] : [];

// ─── Live data (Supabase) ─────────────────────────────────

type PORow = Tables["production_orders"]["Row"];
type StageRow = Tables["production_stage_log"]["Row"];

/** production_stage_log uses the planning page's keys; the dashboards use DEFAULT_STAGES keys. */
const LOG_TO_STAGE: Record<string, StageKey> = {
  pattern: "pattern", cutting: "cutting", sewing: "sewing", finishing: "finishing",
  quality_check: "quality_control", packing: "packaging",
};

function stageDef(key: string) {
  return DEFAULT_STAGES.find((s) => s.key === key);
}

function mapOrder(po: PORow, logs: StageRow[]): ProductionOrder {
  const meta = (po.metadata ?? {}) as Record<string, unknown>;
  const planned = Number(meta.planned_qty) || 0;
  const today = new Date(new Date().toDateString());
  const done = po.status === "ready" || po.status === "delivered";
  const isDelayed = !!po.due_date && !done && po.status !== "cancelled" && new Date(po.due_date) < today;
  const delayDays = isDelayed ? Math.ceil((today.getTime() - new Date(po.due_date!).getTime()) / 86_400_000) : 0;

  const status: ProductionStatus =
    po.status === "cancelled" ? "cancelled"
    : done ? "completed"
    : po.status === "pending" ? "planned"
    : isDelayed ? "delayed" : "in_progress";

  const currentKey: string = done ? "ready_dispatch"
    : po.status === "pending" ? "order_created"
    : LOG_TO_STAGE[po.status] ?? LOG_TO_STAGE[po.current_stage ?? ""] ?? po.status;
  const cur = stageDef(currentKey);

  const stages: ProductionStage[] = logs
    .map((l) => {
      const key = LOG_TO_STAGE[l.stage] ?? l.stage;
      const def = stageDef(key);
      const st: StageStatus = l.status === "completed" ? "completed" : l.status === "in_progress" ? "in_progress" : "not_started";
      return {
        id: l.id, order_id: po.id, stage_key: key,
        stage_name_en: def?.en ?? l.stage, stage_name_ar: def?.ar ?? l.stage, status: st,
        started_at: l.started_at, finished_at: l.completed_at,
        planned_duration_hours: 0,
        actual_duration_hours: l.duration_minutes != null ? Math.round(l.duration_minutes / 6) / 10 : null,
        completed_qty: st === "completed" ? planned : 0, remaining_qty: st === "completed" ? 0 : planned,
        rejected_qty: 0, rework_qty: 0,
        assigned_team: l.station ?? "", assigned_operator: l.worker_name ?? "", notes: l.notes ?? "",
        sequence: def?.sequence ?? 99,
      };
    })
    .sort((a, b) => a.sequence - b.sequence);

  const workers = Array.isArray(po.assigned_workers) ? (po.assigned_workers as string[]) : [];
  const completedQty = done ? planned : 0;

  return {
    id: po.id, order_number: po.po_number, product_name: po.title,
    product_sku: String(meta.sku ?? ""), sales_order_ref: po.sales_order_id ?? "",
    customer_name: po.customer_name ?? "", priority: po.priority, status,
    current_stage: currentKey, current_stage_en: cur?.en ?? currentKey, current_stage_ar: cur?.ar ?? currentKey,
    planned_qty: planned, completed_qty: completedQty, remaining_qty: planned - completedQty,
    rejected_qty: 0, rework_qty: 0, waste_qty: 0, passed_qty: completedQty,
    progress_pct: po.progress ?? 0,
    // Rates and costs are not recorded yet — show zero rather than invent them.
    production_rate_per_hour: 0, production_rate_per_day: 0, efficiency_pct: 0, planned_rate_per_hour: 0,
    start_date: po.start_date ?? "", due_date: po.due_date ?? "", estimated_completion: po.due_date ?? "",
    is_delayed: isDelayed, delay_days: delayDays, delay_reason: "",
    assigned_team: po.assigned_station ?? "", assigned_lead: workers[0] ?? "", workstation: po.assigned_station ?? "",
    material_status: "available", qc_status: done ? "passed" : "pending",
    estimated_cost: 0, actual_cost: 0, material_cost: 0, labor_cost: 0,
    notes: po.notes ?? "", created_at: po.created_at, updated_at: po.updated_at,
    stages, materials: [], qc_checks: [], activity_log: [],
  };
}

/** Reads production orders and their stage log for a workspace into the store. */
export async function loadLiveProduction(workspaceId: string): Promise<void> {
  if (isDemoMode) return;
  const ds = getDataSource();
  const [pos, logs] = await Promise.all([
    ds.production_orders.list(workspaceId),
    ds.production_stage_log.list(workspaceId),
  ]);
  const byOrder = new Map<string, StageRow[]>();
  for (const l of logs as StageRow[]) {
    const list = byOrder.get(l.production_order_id) ?? [];
    list.push(l);
    byOrder.set(l.production_order_id, list);
  }
  _orders = (pos as PORow[]).map((po) => mapOrder(po, byOrder.get(po.id) ?? []));
  _workstations = [];
  _alerts = _orders
    .filter((o) => o.is_delayed)
    .map((o) => ({
      id: `late-${o.id}`, order_id: o.id, order_number: o.order_number, type: "deadline_risk" as const,
      severity: o.delay_days > 3 ? ("critical" as const) : ("warning" as const),
      message_en: `${o.product_name} is ${o.delay_days} day${o.delay_days === 1 ? "" : "s"} past its due date`,
      message_ar: `${o.product_name} متأخر ${o.delay_days} يوم عن موعد التسليم`,
      created_at: new Date().toISOString(), dismissed: false,
    }));
}

/**
 * Loads live production data for the page that calls it and re-renders when it
 * arrives. Demo mode is ready immediately.
 */
export function useProductionData(workspaceId: string | undefined) {
  const [state, setState] = useState<{ loading: boolean; error: string | null; version: number }>(
    { loading: !isDemoMode, error: null, version: 0 },
  );
  const reload = useCallback(async () => {
    if (isDemoMode || !workspaceId) { setState((st) => ({ ...st, loading: false })); return; }
    setState((st) => ({ ...st, loading: true, error: null }));
    try {
      await loadLiveProduction(workspaceId);
      setState((st) => ({ loading: false, error: null, version: st.version + 1 }));
    } catch (e) {
      setState((st) => ({ ...st, loading: false, error: e instanceof Error ? e.message : String(e) }));
    }
  }, [workspaceId]);
  useEffect(() => { reload(); }, [reload]);
  return { ...state, reload };
}

// ─── Public API ───────────────────────────────────────────

export function getProductionOrders(): ProductionOrder[] {
  return _orders;
}

export function getProductionOrder(id: string): ProductionOrder | undefined {
  return _orders.find(o => o.id === id);
}

export function getProductionAlerts(): ProductionAlert[] {
  return _alerts.filter(a => !a.dismissed);
}

export function getWorkstations(): WorkstationInfo[] {
  return _workstations;
}

export function dismissAlert(id: string) {
  _alerts = _alerts.map(a => a.id === id ? { ...a, dismissed: true } : a);
}

// ─── Computed Stats ───────────────────────────────────────

export function getProductionStats() {
  const orders = _orders;
  const active = orders.filter(o => o.status === "in_progress");
  const planned = orders.filter(o => o.status === "planned");
  const delayed = orders.filter(o => o.status === "delayed" || o.is_delayed);
  const completedToday = orders.filter(o => o.status === "completed" && o.updated_at >= new Date(new Date().toDateString()).toISOString());
  const waitingMaterials = orders.filter(o => o.material_status === "shortage" || o.material_status === "partial");
  const waitingQC = orders.filter(o => o.qc_status === "pending" && o.completed_qty > 0);
  const needsRework = orders.filter(o => o.rework_qty > 0);

  const totalCompleted = orders.reduce((s, o) => s + o.completed_qty, 0);
  const totalPlanned = orders.reduce((s, o) => s + o.planned_qty, 0);
  const avgRate = active.length > 0 ? Math.round(active.reduce((s, o) => s + o.production_rate_per_hour, 0) / active.length * 100) / 100 : 0;
  const avgEfficiency = active.length > 0 ? Math.round(active.reduce((s, o) => s + o.efficiency_pct, 0) / active.length) : 0;

  return {
    totalOrders: orders.length,
    activeOrders: active.length,
    plannedOrders: planned.length,
    delayedOrders: delayed.length,
    completedOrders: orders.filter(o => o.status === "completed").length,
    completedToday: completedToday.length,
    waitingMaterials: waitingMaterials.length,
    waitingQC: waitingQC.length,
    needsRework: needsRework.length,
    totalPlannedQty: totalPlanned,
    totalCompletedQty: totalCompleted,
    totalRemainingQty: totalPlanned - totalCompleted,
    avgProductionRate: avgRate,
    avgEfficiency,
    dailyOutput: orders.reduce((s, o) => s + o.production_rate_per_day, 0),
    onTimeRate: totalPlanned > 0 ? Math.round(((totalPlanned - delayed.reduce((s, o) => s + o.planned_qty, 0)) / totalPlanned) * 100) : 100,
  };
}

// ─── AI Insights ──────────────────────────────────────────

export interface AIInsight {
  id: string;
  type: "summary" | "bottleneck" | "prediction" | "recommendation" | "risk";
  title_en: string;
  title_ar: string;
  detail_en: string;
  detail_ar: string;
  severity: "info" | "warning" | "critical";
}

export function getAIInsights(): AIInsight[] {
  const stats = getProductionStats();

  if (!isDemoMode) {
    // Only what the data actually says — no canned advice about orders that don't exist.
    const insights: AIInsight[] = [{
      id: "ai-summary", type: "summary",
      title_en: "Production Summary", title_ar: "ملخص الإنتاج",
      detail_en: stats.totalOrders === 0
        ? "No production orders yet. Create one with New Order to start tracking."
        : `${stats.activeOrders} orders in progress, ${stats.plannedOrders} planned, ${stats.completedOrders} completed. ${stats.delayedOrders} past their due date.`,
      detail_ar: stats.totalOrders === 0
        ? "لا توجد أوامر تشغيل بعد. أنشئ أمراً جديداً لبدء المتابعة."
        : `${stats.activeOrders} أوامر قيد التنفيذ، ${stats.plannedOrders} مخططة، ${stats.completedOrders} مكتملة. ${stats.delayedOrders} متأخرة عن موعدها.`,
      severity: stats.delayedOrders > 0 ? "warning" : "info",
    }];
    for (const o of _orders.filter((x) => x.is_delayed)) {
      insights.push({
        id: `ai-late-${o.id}`, type: "risk",
        title_en: `${o.order_number}: past due`, title_ar: `${o.order_number}: متأخر`,
        detail_en: `${o.product_name} was due ${o.due_date} and is at ${o.current_stage_en} (${o.progress_pct}%).`,
        detail_ar: `${o.product_name} كان موعده ${o.due_date} وهو الآن في مرحلة ${o.current_stage_ar} (${o.progress_pct}%).`,
        severity: o.delay_days > 3 ? "critical" : "warning",
      });
    }
    return insights;
  }

  return [
    {
      id: "ai-1", type: "summary",
      title_en: "Production Summary", title_ar: "ملخص الإنتاج",
      detail_en: `${stats.activeOrders} orders in progress, ${stats.avgEfficiency}% avg efficiency. ${stats.delayedOrders} orders delayed, ${stats.waitingMaterials} waiting for materials.`,
      detail_ar: `${stats.activeOrders} أوامر قيد التنفيذ، متوسط الكفاءة ${stats.avgEfficiency}%. ${stats.delayedOrders} أوامر متأخرة، ${stats.waitingMaterials} في انتظار المواد.`,
      severity: stats.delayedOrders > 0 ? "warning" : "info",
    },
    {
      id: "ai-2", type: "bottleneck",
      title_en: "Bottleneck: Sewing", title_ar: "عائق: الخياطة",
      detail_en: "Sewing is the slowest stage across active orders. Zip insertion and waistband attaching take the most minutes per piece — consider moving two operators from Line A to Line B this week.",
      detail_ar: "الخياطة هي أبطأ مرحلة في الأوامر النشطة. تركيب السوستة والأستك يستهلكان أكبر وقت للقطعة — فكّر في نقل عاملتين من الخط A إلى الخط B هذا الأسبوع.",
      severity: "warning",
    },
    {
      id: "ai-3", type: "prediction",
      title_en: "PO-2026-045: Pyjama Set Late", title_ar: "PO-2026-045: تأخر طقم البيجامة",
      detail_en: "The customs hold cost 3 days and print-matched cutting runs 24% below plan. At this rate the order finishes 3 days after its due date unless Cutting Table 2 joins.",
      detail_ar: "الحجز الجمركي أضاع 3 أيام والقص مع مطابقة الطباعة أقل من الخطة بنسبة 24%. بهذا المعدل سينتهي الأمر بعد موعده بـ 3 أيام ما لم تنضم طاولة القص 2.",
      severity: "warning",
    },
    {
      id: "ai-4", type: "recommendation",
      title_en: "Order Elastic Now", title_ar: "اطلب الأستك الآن",
      detail_en: "PO-2026-043 has 260 m of waistband elastic left to source. Line B runs out in about 2 days — confirm the second lot with Delta Trims today.",
      detail_ar: "ينقص PO-2026-043 حوالي 260 متر أستك. سينفد في الخط B خلال يومين تقريباً — أكّد الدفعة الثانية مع Delta Trims اليوم.",
      severity: "critical",
    },
    {
      id: "ai-5", type: "risk",
      title_en: "Imported Fabric Lead Times", title_ar: "مدة توريد القماش المستورد",
      detail_en: "2 of 4 active orders were held up by imported fabric this month. Build 2 weeks of customs buffer into orders that use imported rolls.",
      detail_ar: "تأخر أمران من 4 أوامر نشطة هذا الشهر بسبب القماش المستورد. أضف أسبوعين احتياطي للجمارك في الأوامر التي تستخدم أقمشة مستوردة.",
      severity: "warning",
    },
  ];
}
