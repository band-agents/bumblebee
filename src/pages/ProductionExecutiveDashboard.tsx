/**
 * Production Executive Dashboard
 * High-level production overview with charts, stage analytics, garment flow
 */

import { useState, useMemo } from "react";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { isDemoMode } from "../lib/supabase";
import {
  getProductionOrders, getProductionStats, getProductionAlerts,
  getAIInsights, getWorkstations, DEFAULT_STAGES, useProductionData,
  type ProductionOrder, type ProductionStage,
} from "../lib/production-data";
import {
  Factory, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Clock,
  Package, Zap, Users, Target, BarChart3, Activity, ShieldCheck,
  ChevronRight, Calendar, Bell, Brain, Sparkles, DollarSign,
  ArrowUpRight, ArrowDownRight, Minus, Eye, Box, Layers,
  Scissors, Wrench, Paintbrush, ClipboardCheck, Truck, CircleDot,
} from "lucide-react";

function t(ar: boolean, en: string, arText: string) { return ar ? arText : en; }
function fmt(n: number) { return n.toLocaleString(); }

// ─── SVG Chart Components ─────────────────────────────────

function BarChart({ data, height = 140, color = "hsl(var(--primary))", labels, showValues = true }: {
  data: { label: string; value: number; color?: string }[];
  height?: number;
  color?: string;
  labels?: boolean;
  showValues?: boolean;
}) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="w-full">
      <div className="flex items-end gap-1.5" style={{ height }}>
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            {showValues && (
              <span className="text-micro tabular-nums text-muted-foreground font-medium">{d.value}</span>
            )}
            <div className="w-full rounded-t-md transition-all duration-500" style={{
              height: `${(d.value / max) * 100}%`,
              minHeight: d.value > 0 ? 4 : 0,
              backgroundColor: d.color || color,
              opacity: 0.7 + (i / data.length) * 0.3,
            }} />
          </div>
        ))}
      </div>
      {labels && (
        <div className="flex gap-1.5 mt-2">
          {data.map((d, i) => (
            <div key={i} className="flex-1 text-center">
              <span className="text-micro text-muted-foreground leading-tight block truncate">{d.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function HorizontalBar({ items, maxWidth = 100 }: {
  items: { label: string; value: number; max?: number; color?: string }[];
  maxWidth?: number;
}) {
  const overallMax = Math.max(...items.map(i => i.max || i.value), 1);
  return (
    <div className="space-y-2.5">
      {items.map((item, i) => (
        <div key={i}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-micro font-medium truncate">{item.label}</span>
            <span className="text-micro tabular-nums text-muted-foreground ml-2 shrink-0">{item.value}</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700" style={{
              width: `${(item.value / overallMax) * 100}%`,
              backgroundColor: item.color || "hsl(var(--primary))",
            }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function DonutChart({ segments, size = 120, thickness = 16 }: {
  segments: { value: number; color: string; label: string }[];
  size?: number;
  thickness?: number;
}) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  if (total === 0) return null;
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {segments.map((seg, i) => {
          const pct = seg.value / total;
          const dash = pct * circumference;
          const currentOffset = offset;
          offset += dash;
          return (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={thickness}
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-currentOffset}
              className="transition-all duration-700"
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-title font-semibold tabular-nums" style={{ fontFamily: "var(--app-font-serif)" }}>{total}</span>
        <span className="text-micro text-muted-foreground">total</span>
      </div>
    </div>
  );
}

function SparkLine({ data, width = 80, height = 24, color = "hsl(var(--primary))" }: {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
}) {
  if (data.length < 2) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  }).join(" ");
  const areaPoints = `0,${height} ${points} ${width},${height}`;
  return (
    <svg width={width} height={height} className="overflow-visible">
      <polygon points={areaPoints} fill={color} opacity={0.1} />
      <polyline points={points} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TrendBadge({ value, suffix = "" }: { value: number; suffix?: string }) {
  if (value === 0) return <span className="text-micro text-muted-foreground flex items-center gap-0.5"><Minus size={10} />0{suffix}</span>;
  if (value > 0) return <span className="text-micro text-emerald-600 flex items-center gap-0.5"><ArrowUpRight size={10} />+{value}{suffix}</span>;
  return <span className="text-micro text-rose-600 flex items-center gap-0.5"><ArrowDownRight size={10} />{value}{suffix}</span>;
}

// ─── Stage Pipeline ───────────────────────────────────────

function StagePipeline({ orders, ar }: { orders: ProductionOrder[]; ar: boolean }) {
  const stageFlow = [
    { key: "order_created", icon: Box, en: "Created", ar: "إنشاء" },
    { key: "materials_reserved", icon: Package, en: "Fabric", ar: "القماش" },
    { key: "pattern", icon: Layers, en: "Pattern", ar: "الباترون" },
    { key: "cutting", icon: Scissors, en: "Cutting", ar: "القص" },
    { key: "sewing", icon: Wrench, en: "Sewing", ar: "الخياطة" },
    { key: "finishing", icon: Paintbrush, en: "Finishing", ar: "التشطيب" },
    { key: "quality_control", icon: ClipboardCheck, en: "QC", ar: "الجودة" },
    { key: "packaging", icon: Package, en: "Packing", ar: "التغليف" },
    { key: "ready_dispatch", icon: Truck, en: "Ready", ar: "جاهز" },
  ];

  const stageCounts = useMemo(() => {
    const counts: Record<string, { total: number; active: number; completed: number; stuck: number }> = {};
    for (const s of stageFlow) counts[s.key] = { total: 0, active: 0, completed: 0, stuck: 0 };

    for (const order of orders) {
      if (order.status === "completed") {
        for (const s of stageFlow) counts[s.key].completed++;
        continue;
      }
      if (order.status === "planned") {
        counts["order_created"].total++;
        continue;
      }
      // Find current and previous stages
      const currentIdx = stageFlow.findIndex(s => s.key === order.current_stage);
      for (let i = 0; i <= currentIdx; i++) {
        counts[stageFlow[i].key].total++;
        if (i < currentIdx) counts[stageFlow[i].key].completed++;
        if (i === currentIdx) counts[stageFlow[i].key].active++;
      }
      // Check if stuck (delayed at this stage)
      if (order.is_delayed && currentIdx >= 0) {
        counts[stageFlow[currentIdx].key].stuck++;
      }
    }
    return counts;
  }, [orders]);

  const maxCount = Math.max(...Object.values(stageCounts).map(c => c.total), 1);

  return (
    <div className="bg-background border border-border/40 rounded-xl p-5">
      <h3 className="text-body-lg font-semibold mb-4" style={{ fontFamily: "var(--app-font-serif)" }}>
        {t(ar, "Garment Production Pipeline", "خط إنتاج الملابس")}
      </h3>

      {/* Pipeline visual */}
      <div className="flex items-center gap-0 mb-5 overflow-x-auto pb-2">
        {stageFlow.map((stage, i) => {
          const counts = stageCounts[stage.key];
          const pct = counts.total > 0 ? (counts.active / counts.total) * 100 : 0;
          const hasStuck = counts.stuck > 0;
          const Icon = stage.icon;
          return (
            <div key={stage.key} className="flex items-center shrink-0">
              <div className="flex flex-col items-center gap-1.5 px-2">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  counts.active > 0 ? "bg-primary/15 text-brand-ink ring-2 ring-brand-ink/20" :
                  counts.completed > 0 ? "bg-emerald-100 text-emerald-600" :
                  "bg-muted/50 text-muted-foreground/40"
                }`}>
                  <Icon size={16} />
                </div>
                <span className="text-micro text-muted-foreground text-center leading-tight">{ar ? stage.ar : stage.en}</span>
                <div className="flex items-center gap-1">
                  <span className="text-micro font-semibold tabular-nums">{counts.total}</span>
                  {hasStuck && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />}
                </div>
              </div>
              {i < stageFlow.length - 1 && (
                <div className="flex items-center px-0.5">
                  <div className={`w-6 h-0.5 ${counts.completed > 0 ? "bg-primary/40" : "bg-border/30"}`} />
                  <ChevronRight size={10} className={`-ml-0.5 ${counts.completed > 0 ? "text-brand-ink/40" : "text-border/30"}`} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Stage bars */}
      <div className="space-y-3">
        {stageFlow.map(stage => {
          const counts = stageCounts[stage.key];
          if (counts.total === 0) return null;
          const Icon = stage.icon;
          const activePct = counts.total > 0 ? Math.round((counts.active / counts.total) * 100) : 0;
          const completedPct = counts.total > 0 ? Math.round((counts.completed / counts.total) * 100) : 0;
          return (
            <div key={stage.key} className="flex items-center gap-3">
              <div className="w-24 flex items-center gap-2 shrink-0">
                <Icon size={12} className="text-muted-foreground" />
                <span className="text-micro font-medium">{ar ? stage.ar : stage.en}</span>
              </div>
              <div className="flex-1 h-6 bg-muted/30 rounded-lg overflow-hidden relative">
                {/* Completed portion */}
                <div className="absolute inset-y-0 left-0 bg-emerald-200/60 rounded-l-lg transition-all duration-700"
                  style={{ width: `${completedPct}%` }} />
                {/* Active portion */}
                <div className="absolute inset-y-0 bg-primary/30 transition-all duration-700"
                  style={{ left: `${completedPct}%`, width: `${activePct}%` }} />
                {/* Labels */}
                <div className="absolute inset-0 flex items-center px-2 gap-2">
                  {counts.completed > 0 && <span className="text-micro font-medium text-emerald-700">{counts.completed}</span>}
                  {counts.active > 0 && <span className="text-micro font-medium text-brand-ink">{counts.active} {t(ar, "active", "جاري")}</span>}
                </div>
              </div>
              {counts.stuck > 0 && (
                <span className="text-micro text-rose-600 font-medium flex items-center gap-0.5 shrink-0">
                  <AlertTriangle size={9} />{counts.stuck} {t(ar, "stuck", "عائق")}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Stage Performance ────────────────────────────────────

function StagePerformance({ orders, ar }: { orders: ProductionOrder[]; ar: boolean }) {
  const stageStats = useMemo(() => {
    const stats: Record<string, { planned: number; actual: number; count: number; rejections: number }> = {};
    for (const order of orders) {
      for (const stage of order.stages) {
        if (!stats[stage.stage_key]) stats[stage.stage_key] = { planned: 0, actual: 0, count: 0, rejections: 0 };
        stats[stage.stage_key].planned += stage.planned_duration_hours;
        if (stage.actual_duration_hours) stats[stage.stage_key].actual += stage.actual_duration_hours;
        if (stage.status === "completed") stats[stage.stage_key].count++;
        stats[stage.stage_key].rejections += stage.rejected_qty;
      }
    }
    return Object.entries(stats)
      .map(([key, val]) => ({
        key,
        label: DEFAULT_STAGES.find(s => s.key === key)?.en || key,
        labelAr: DEFAULT_STAGES.find(s => s.key === key)?.ar || key,
        planned: val.planned,
        actual: val.actual,
        count: val.count,
        rejections: val.rejections,
        efficiency: val.planned > 0 && val.actual > 0 ? Math.round((val.planned / val.actual) * 100) : 0,
      }))
      .filter(s => s.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [orders]);

  return (
    <div className="bg-background border border-border/40 rounded-xl p-5">
      <h3 className="text-body-lg font-semibold mb-4" style={{ fontFamily: "var(--app-font-serif)" }}>
        {t(ar, "Stage Performance", "أداء المراحل")}
      </h3>
      <div className="space-y-3">
        {stageStats.map(stage => (
          <div key={stage.key} className="flex items-center gap-3">
            <div className="w-20 shrink-0">
              <span className="text-micro font-medium">{ar ? stage.labelAr : stage.label}</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <div className="flex-1 h-5 bg-muted/30 rounded-md overflow-hidden relative">
                  <div className="absolute inset-y-0 left-0 bg-primary/20 rounded-md transition-all duration-700"
                    style={{ width: `${stage.planned}%` }} />
                  <div className="absolute inset-y-0 left-0 rounded-md transition-all duration-700"
                    style={{
                      width: `${stage.actual}%`,
                      backgroundColor: stage.efficiency >= 90 ? "#6FC39E" : stage.efficiency >= 70 ? "#EFC274" : "#EE9E9E",
                      opacity: 0.6,
                    }} />
                  <div className="absolute inset-0 flex items-center px-2">
                    <span className="text-micro font-medium text-foreground/60">{stage.actual}h / {stage.planned}h planned</span>
                  </div>
                </div>
                <span className={`text-micro font-semibold tabular-nums w-10 text-right ${
                  stage.efficiency >= 90 ? "text-emerald-600" : stage.efficiency >= 70 ? "text-warning" : "text-rose-600"
                }`}>{stage.efficiency}%</span>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0 text-micro text-muted-foreground">
              <span>{stage.count}x</span>
              {stage.rejections > 0 && (
                <span className="text-rose-600 flex items-center gap-0.5"><AlertTriangle size={9} />{stage.rejections}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Order Health Table ───────────────────────────────────

function OrderHealthTable({ orders, ar }: { orders: ProductionOrder[]; ar: boolean }) {
  const sorted = [...orders].sort((a, b) => {
    if (a.is_delayed && !b.is_delayed) return -1;
    if (!a.is_delayed && b.is_delayed) return 1;
    const prioOrder = { critical: 0, urgent: 1, high: 2, medium: 3, low: 4 };
    return (prioOrder[a.priority] ?? 5) - (prioOrder[b.priority] ?? 5);
  });

  return (
    <div className="bg-background border border-border/40 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-border/30">
        <h3 className="text-body-lg font-semibold" style={{ fontFamily: "var(--app-font-serif)" }}>
          {t(ar, "Order Health Overview", "نظرة عامة على صحة الأوامر")}
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/30 text-micro text-muted-foreground">
              <th className="text-left px-5 py-2.5 font-medium">{t(ar, "Order", "الطلب")}</th>
              <th className="text-left px-3 py-2.5 font-medium">{t(ar, "Product", "المنتج")}</th>
              <th className="text-center px-3 py-2.5 font-medium">{t(ar, "Progress", "التقدم")}</th>
              <th className="text-center px-3 py-2.5 font-medium">{t(ar, "Rate", "المعدل")}</th>
              <th className="text-center px-3 py-2.5 font-medium">{t(ar, "Efficiency", "الكفاءة")}</th>
              <th className="text-center px-3 py-2.5 font-medium">{t(ar, "Stage", "المرحلة")}</th>
              <th className="text-center px-3 py-2.5 font-medium">{t(ar, "Due", "التسليم")}</th>
              <th className="text-center px-3 py-2.5 font-medium">{t(ar, "Status", "الحالة")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/20">
            {sorted.map(order => {
              const isOverdue = order.is_delayed;
              const healthColor = order.status === "completed" ? "emerald" :
                isOverdue ? "rose" :
                order.efficiency_pct >= 85 ? "emerald" :
                order.efficiency_pct >= 70 ? "amber" : "rose";
              return (
                <tr key={order.id} className={`hover:bg-muted/20 transition-colors ${isOverdue ? "bg-rose-50/30" : ""}`}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full bg-${healthColor}-500`} />
                      <span className="text-micro font-mono">{order.order_number}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div>
                      <p className="text-micro font-medium">{order.product_name}</p>
                      <p className="text-micro text-muted-foreground">{order.customer_name}</p>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <div className="w-14 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full rounded-full bg-${healthColor}-500`}
                          style={{ width: `${order.progress_pct}%` }} />
                      </div>
                      <span className="text-micro tabular-nums font-medium">{order.progress_pct}%</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span className="text-micro tabular-nums">{order.production_rate_per_hour}/hr</span>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span className={`text-micro tabular-nums font-medium ${
                      order.efficiency_pct >= 85 ? "text-emerald-600" : order.efficiency_pct >= 70 ? "text-warning" : "text-rose-600"
                    }`}>{order.efficiency_pct}%</span>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span className="text-micro text-muted-foreground">{order.current_stage_en}</span>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span className={`text-micro ${isOverdue ? "text-rose-600 font-medium" : "text-muted-foreground"}`}>
                      {order.due_date}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span className={`text-micro px-2 py-0.5 rounded-full font-medium ${
                      order.status === "completed" ? "bg-emerald-100 text-emerald-700" :
                      order.status === "delayed" || isOverdue ? "bg-rose-100 text-rose-700" :
                      order.status === "in_progress" ? "bg-blue-100 text-blue-700" :
                      "bg-zinc-100 text-zinc-600"
                    }`}>
                      {isOverdue ? t(ar, "Delayed", "متأخر") : t(ar, order.status.replace("_", " "), order.status.replace("_", " "))}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Team Productivity ────────────────────────────────────

function TeamProductivity({ orders, ar }: { orders: ProductionOrder[]; ar: boolean }) {
  const teamStats = useMemo(() => {
    const teams: Record<string, { orders: number; completedQty: number; avgEfficiency: number; rejections: number }> = {};
    for (const order of orders) {
      const team = order.assigned_team;
      if (!teams[team]) teams[team] = { orders: 0, completedQty: 0, avgEfficiency: 0, rejections: 0 };
      teams[team].orders++;
      teams[team].completedQty += order.completed_qty;
      teams[team].avgEfficiency += order.efficiency_pct;
      teams[team].rejections += order.rejected_qty;
    }
    return Object.entries(teams)
      .map(([name, stats]) => ({
        name,
        ...stats,
        avgEfficiency: stats.orders > 0 ? Math.round(stats.avgEfficiency / stats.orders) : 0,
      }))
      .sort((a, b) => b.completedQty - a.completedQty);
  }, [orders]);

  return (
    <div className="bg-background border border-border/40 rounded-xl p-5">
      <h3 className="text-body-lg font-semibold mb-4" style={{ fontFamily: "var(--app-font-serif)" }}>
        {t(ar, "Team Productivity", "إنتاجية الفرق")}
      </h3>
      <HorizontalBar items={teamStats.map(team => ({
        label: `${team.name} (${team.orders} ${t(ar, "orders", "أوامر")})`,
        value: team.completedQty,
        color: team.avgEfficiency >= 85 ? "#6FC39E" : team.avgEfficiency >= 70 ? "#EFC274" : "#EE9E9E",
      }))} />
    </div>
  );
}

// ─── Cost Analysis ────────────────────────────────────────

function CostAnalysis({ orders, ar }: { orders: ProductionOrder[]; ar: boolean }) {
  const totals = useMemo(() => {
    let estimated = 0, actual = 0, material = 0, labor = 0, waste = 0;
    for (const o of orders) {
      estimated += o.estimated_cost;
      actual += o.actual_cost;
      material += o.material_cost;
      labor += o.labor_cost;
      waste += (o as any).waste_cost || 0;
    }
    return { estimated, actual, material, labor, waste, variance: actual - estimated };
  }, [orders]);

  const costSegments = [
    { value: totals.material, color: "#8AB0EA", label: t(ar, "Material", "المواد") },
    { value: totals.labor, color: "#B6A0EA", label: t(ar, "Labor", "العمالة") },
    { value: totals.waste, color: "#EE9E9E", label: t(ar, "Waste", "الهالك") },
  ];

  return (
    <div className="bg-background border border-border/40 rounded-xl p-5">
      <h3 className="text-body-lg font-semibold mb-4" style={{ fontFamily: "var(--app-font-serif)" }}>
        {t(ar, "Cost Analysis", "تحليل التكاليف")}
      </h3>
      <div className="flex items-center gap-6">
        <DonutChart segments={costSegments} size={110} thickness={14} />
        <div className="flex-1 space-y-2">
          {costSegments.map((seg, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: seg.color }} />
              <span className="text-micro flex-1">{seg.label}</span>
              <span className="text-micro font-medium tabular-nums">${fmt(seg.value)}</span>
            </div>
          ))}
          <div className="pt-2 mt-2 border-t border-border/30">
            <div className="flex items-center justify-between">
              <span className="text-micro text-muted-foreground">{t(ar, "Estimated", "المقدّر")}</span>
              <span className="text-micro font-medium tabular-nums">${fmt(totals.estimated)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-micro text-muted-foreground">{t(ar, "Actual", "الفعلي")}</span>
              <span className={`text-micro font-medium tabular-nums ${totals.variance > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                ${fmt(totals.actual)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-micro text-muted-foreground">{t(ar, "Variance", "الانحراف")}</span>
              <span className={`text-micro font-semibold tabular-nums ${totals.variance > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                {totals.variance > 0 ? "+" : ""}${fmt(totals.variance)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────

export default function ProductionExecutiveDashboard() {
  const { lang } = useLanguage();
  const ar = lang === "ar";
  const { workspace } = useAuth();
  const data = useProductionData(workspace?.id);
  const orders = useMemo(() => getProductionOrders(), [data.version]);
  const stats = useMemo(() => getProductionStats(), [data.version]);
  const alerts = useMemo(() => getProductionAlerts(), [data.version]);
  const insights = useMemo(() => getAIInsights(), [data.version]);
  const workstations = useMemo(() => getWorkstations(), [data.version]);

  // Output/efficiency history isn't recorded in live mode yet — the sample
  // trend only belongs to the demo workspace.
  const dailyTrend = isDemoMode ? [42, 38, 55, 48, 62, 51, 58] : [0, 0, 0, 0, 0, 0, 0];
  const efficiencyTrend = isDemoMode ? [82, 85, 80, 88, 86, 84, 87] : [0, 0, 0, 0, 0, 0, 0];

  const activeOrders = orders.filter(o => o.status === "in_progress" || o.status === "delayed");
  const completedOrders = orders.filter(o => o.status === "completed");
  const delayedOrders = orders.filter(o => o.is_delayed || o.status === "delayed");
  const materialIssues = orders.filter(o => o.material_status === "shortage" || o.material_status === "partial");

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading font-semibold tracking-tight" style={{ fontFamily: "var(--app-font-serif)" }}>
            {t(ar, "Production Overview", "نظرة عامة على الإنتاج")}
          </h1>
          <p className="text-caption text-muted-foreground mt-0.5">
            {t(ar, "Executive dashboard — from fabric to packed order", "لوحة تنفيذية — من القماش حتى التغليف")}
          </p>
        </div>
        <div className="flex items-center gap-2 text-micro text-muted-foreground">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          {ar ? "مباشر" : "Live"} — {new Date().toLocaleTimeString(ar ? "ar-EG" : "en-US", { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {[
          { label: t(ar, "Active orders", "أوامر نشطة"), value: stats.activeOrders, icon: Factory, color: "text-blue-600", bg: "bg-blue-50", trend: +2 },
          { label: t(ar, "Delayed", "متأخرة"), value: stats.delayedOrders, icon: AlertTriangle, color: "text-rose-600", bg: "bg-rose-50", trend: -1 },
          { label: t(ar, "Completed", "مكتملة"), value: stats.completedOrders, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", trend: +3 },
          { label: t(ar, "Pieces / hour", "قطعة/ساعة"), value: stats.avgProductionRate, icon: Zap, color: "text-violet-600", bg: "bg-chart-4/10", trend: +5 },
          { label: t(ar, "Efficiency", "كفاءة"), value: `${stats.avgEfficiency}%`, icon: TrendingUp, color: "text-cyan-600", bg: "bg-cyan-50", trend: +3 },
          { label: t(ar, "Material issues", "نواقص خامات"), value: stats.waitingMaterials, icon: Package, color: "text-warning", bg: "bg-warning/10", trend: 0 },
          { label: t(ar, "QC pending", "بانتظار الجودة"), value: stats.waitingQC, icon: ShieldCheck, color: "text-orange-600", bg: "bg-orange-50", trend: 0 },
          { label: t(ar, "Alerts", "تنبيهات"), value: alerts.length, icon: Bell, color: "text-rose-600", bg: "bg-rose-50", trend: 0 },
        ].map((kpi, i) => (
          <div key={i} className="bg-background border border-border/40 rounded-xl p-3.5 hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className={`w-7 h-7 rounded-lg ${kpi.bg} flex items-center justify-center`}>
                <kpi.icon size={13} className={kpi.color} />
              </div>
              <TrendBadge value={kpi.trend} />
            </div>
            <p className={`text-heading font-semibold tabular-nums ${kpi.color}`} style={{ fontFamily: "var(--app-font-serif)" }}>{kpi.value}</p>
            <p className="text-micro text-muted-foreground mt-0.5">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Daily Output Chart */}
        <div className="lg:col-span-2 bg-background border border-border/40 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-body font-semibold" style={{ fontFamily: "var(--app-font-serif)" }}>
              {t(ar, "Daily Production Output (7 days)", "الإنتاج اليومي (7 أيام)")}
            </h3>
            <SparkLine data={dailyTrend} color="#8AB0EA" />
          </div>
          <BarChart
            data={dailyTrend.map((v, i) => ({
              label: ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"][i],
              value: v,
              color: i === dailyTrend.length - 1 ? "hsl(var(--primary))" : "hsl(var(--primary))",
            }))}
            height={120}
            labels
          />
        </div>

        {/* Efficiency Trend */}
        <div className="bg-background border border-border/40 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-body font-semibold" style={{ fontFamily: "var(--app-font-serif)" }}>
              {t(ar, "Efficiency Trend", "اتجاه الكفاءة")}
            </h3>
            <TrendBadge value={3} suffix="%" />
          </div>
          <div className="space-y-3">
            {efficiencyTrend.map((val, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-micro text-muted-foreground w-6">{["S", "S", "M", "T", "W", "T", "F"][i]}</span>
                <div className="flex-1 h-3 bg-muted/30 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-700 ${
                    val >= 85 ? "bg-emerald-400" : val >= 70 ? "bg-warning" : "bg-rose-400"
                  }`} style={{ width: `${val}%` }} />
                </div>
                <span className="text-micro tabular-nums font-medium w-8 text-right">{val}%</span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-border/30 flex items-center justify-between">
            <span className="text-micro text-muted-foreground">{t(ar, "Avg", "متوسط")}</span>
            <span className="text-body font-semibold tabular-nums text-emerald-600">{Math.round(efficiencyTrend.reduce((s, v) => s + v, 0) / efficiencyTrend.length)}%</span>
          </div>
        </div>
      </div>

      {/* Stage Pipeline */}
      <StagePipeline orders={orders} ar={ar} />

      {/* Stage Performance + Cost + Team */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <StagePerformance orders={orders} ar={ar} />
        </div>
        <div className="space-y-5">
          <CostAnalysis orders={orders} ar={ar} />
          <TeamProductivity orders={orders} ar={ar} />
        </div>
      </div>

      {/* Order Health Table */}
      <OrderHealthTable orders={orders} ar={ar} />

      {/* AI + Alerts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* AI Insights */}
        <div className="bg-background border border-border/40 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Brain size={15} className="text-brand-ink" />
            <h3 className="text-body font-semibold" style={{ fontFamily: "var(--app-font-serif)" }}>
              {t(ar, "Buzz Insights", "رؤى Buzz")}
            </h3>
          </div>
          <div className="space-y-2.5">
            {insights.slice(0, 4).map(insight => {
              const Icon = insight.type === "bottleneck" ? AlertTriangle :
                insight.type === "prediction" ? TrendingUp :
                insight.type === "risk" ? ShieldCheck : Sparkles;
              return (
                <div key={insight.id} className={`p-3 rounded-lg border-l-3 ${
                  insight.severity === "critical" ? "border-l-rose-400 bg-rose-50/30" :
                  insight.severity === "warning" ? "border-l-warning bg-warning/10" :
                  "border-l-blue-400 bg-blue-50/30"
                }`}>
                  <div className="flex items-start gap-2.5">
                    <Icon size={12} className="shrink-0 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="text-micro font-semibold">{ar ? insight.title_ar : insight.title_en}</p>
                      <p className="text-micro text-muted-foreground mt-0.5 leading-relaxed">{ar ? insight.detail_ar : insight.detail_en}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Active Alerts + Workstation Status */}
        <div className="space-y-5">
          <div className="bg-background border border-border/40 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-body font-semibold" style={{ fontFamily: "var(--app-font-serif)" }}>
                {t(ar, "Active Alerts", "التنبيهات النشطة")}
              </h3>
              {alerts.length > 0 && <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 text-micro font-medium flex items-center justify-center">{alerts.length}</span>}
            </div>
            <div className="space-y-2">
              {alerts.slice(0, 4).map(alert => (
                <div key={alert.id} className={`p-3 rounded-lg border text-micro ${
                  alert.severity === "critical" ? "border-rose-200 bg-rose-50 text-rose-700" :
                  alert.severity === "warning" ? "border-warning/30 bg-warning/10 text-warning" :
                  "border-blue-200 bg-blue-50 text-blue-700"
                }`}>
                  <div className="flex items-start gap-2">
                    <AlertTriangle size={11} className="shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium">{alert.order_number}</span>
                      <span className="mx-1">·</span>
                      <span>{ar ? alert.message_ar : alert.message_en}</span>
                    </div>
                  </div>
                </div>
              ))}
              {alerts.length === 0 && (
                <div className="py-4 text-center text-micro text-muted-foreground/50">{t(ar, "No alerts", "لا تنبيهات")}</div>
              )}
            </div>
          </div>

          <div className="bg-background border border-border/40 rounded-xl p-5">
            <h3 className="text-body font-semibold mb-3" style={{ fontFamily: "var(--app-font-serif)" }}>
              {t(ar, "Workstation Status", "حالة محطات العمل")}
            </h3>
            <div className="space-y-2">
              {workstations.map(ws => (
                <div key={ws.id} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/20 border border-border/20">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${
                    ws.status === "active" ? "bg-emerald-500" :
                    ws.status === "maintenance" ? "bg-warning animate-pulse" :
                    ws.status === "down" ? "bg-rose-500" : "bg-zinc-300"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-micro font-medium truncate">{ws.name}</p>
                    <p className="text-micro text-muted-foreground">{ws.operator || t(ar, "Idle", "خامل")}</p>
                  </div>
                  {ws.queue_count > 0 && (
                    <span className="text-micro bg-warning/15 text-warning px-1.5 py-0.5 rounded-full font-medium">
                      {ws.queue_count} {t(ar, "queued", "في الطابور")}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
