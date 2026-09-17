/**
 * Demo Seed Data — بيانات تجريبية للعرض
 *
 * Realistic fashion/garment manufacturing data that tells a coherent story:
 * Customers → Consultations → Measurements → Designs → Production → QC → Delivery → Fitting
 *
 * All IDs are stable and cross-referenced across entities.
 * Linked to existing demo organizations (o02 Kids Corner, o03 Little Steps) and deals.
 */

import type { Database } from "./database.types";

type T<K extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][K]["Row"];

const W = "demo";
const now = new Date().toISOString();
const d = (daysAgo: number) => new Date(Date.now() - daysAgo * 86400000).toISOString().slice(0, 10);
const ts = (daysAgo: number) => new Date(Date.now() - daysAgo * 86400000).toISOString();

// ─── Branches ────────────────────────────────────────────

export const DEMO_BRANCHES: T<"branches">[] = [
  {
    id: "br-01", workspace_id: W, branch_code: "HQ", name: "Main Atelier", name_ar: "المشغل الرئيسي",
    address: "10th of Ramadan Industrial Zone", phone: "+20-2-200-1000", manager_name: "Ahmad Khalil",
    branch_type: "factory", is_active: true, metadata: {}, created_at: ts(180), updated_at: ts(5),
  },
  {
    id: "br-02", workspace_id: W, branch_code: "SH1", name: "Showroom Olaya", name_ar: "معرض العليا",
    address: "City Stars Mall, Nasr City", phone: "+20-2-200-2000", manager_name: "Sara Ahmed",
    branch_type: "showroom", is_active: true, metadata: {}, created_at: ts(180), updated_at: ts(10),
  },
  {
    id: "br-03", workspace_id: W, branch_code: "WH1", name: "Warehouse North", name_ar: "مخزن الشمال",
    address: "Mall of Arabia, 6th of October", phone: "+20-2-200-3000", manager_name: "Fahd Mansour",
    branch_type: "warehouse", is_active: true, metadata: {}, created_at: ts(150), updated_at: ts(15),
  },
];

// ─── Employees ───────────────────────────────────────────

export const DEMO_EMPLOYEES: T<"employees">[] = [
  {
    id: "emp-01", workspace_id: W, employee_number: "E-001", full_name: "Ahmad Khalil", full_name_ar: "أحمد خليل",
    phone: "+20-100-001-0001", email: "ahmad@demo.com", national_id: null,
    department: "management", job_title: "Factory Manager", job_title_ar: "مدير المصنع",
    employment_type: "full_time", status: "active", hire_date: d(730), termination_date: null,
    salary: 18000, salary_type: "monthly", photo_url: null,
    emergency_contact: "Khalid Khalil", emergency_phone: "+20-100-999-0001",
    address: "Cairo, King Fahd District", skills: ["management", "planning", "quality"], documents: [],
    notes: null, metadata: {}, created_at: ts(730), updated_at: ts(5),
  },
  {
    id: "emp-02", workspace_id: W, employee_number: "E-002", full_name: "Omar Hassan", full_name_ar: "عمر حسن",
    phone: "+20-100-001-0002", email: "omar@demo.com", national_id: null,
    department: "production", job_title: "Senior Pattern Maker", job_title_ar: "خبير نمذجة",
    employment_type: "full_time", status: "active", hire_date: d(540), termination_date: null,
    salary: 8500, salary_type: "monthly", photo_url: null,
    emergency_contact: null, emergency_phone: null,
    address: "Cairo", skills: ["cutting", "sewing", "finishing", "overlock"], documents: [],
    notes: null, metadata: {}, created_at: ts(540), updated_at: ts(2),
  },
  {
    id: "emp-03", workspace_id: W, employee_number: "E-003", full_name: "Youssef Ali", full_name_ar: "يوسف علي",
    phone: "+20-100-001-0003", email: "youssef@demo.com", national_id: null,
    department: "production", job_title: "Sewing Machine Operator", job_title_ar: "مشغل ماكينة خياطة",
    employment_type: "full_time", status: "active", hire_date: d(365), termination_date: null,
    salary: 7000, salary_type: "monthly", photo_url: null,
    emergency_contact: null, emergency_phone: null,
    address: "Cairo", skills: ["cutting", "marker-making", "grading"], documents: [],
    notes: null, metadata: {}, created_at: ts(365), updated_at: ts(3),
  },
  {
    id: "emp-04", workspace_id: W, employee_number: "E-004", full_name: "Fatima Nasser", full_name_ar: "فاطمة ناصر",
    phone: "+20-100-001-0004", email: "fatima@demo.com", national_id: null,
    department: "design", job_title: "Fashion Designer", job_title_ar: "مصممة أزياء",
    employment_type: "full_time", status: "active", hire_date: d(450), termination_date: null,
    salary: 10000, salary_type: "monthly", photo_url: null,
    emergency_contact: null, emergency_phone: null,
    address: "Cairo", skills: ["illustrator", "tech-packs", "design", "client-management"], documents: [],
    notes: null, metadata: {}, created_at: ts(450), updated_at: ts(1),
  },
  {
    id: "emp-05", workspace_id: W, employee_number: "E-005", full_name: "Hassan Younis", full_name_ar: "حسن يونس",
    phone: "+20-100-001-0005", email: "hassan@demo.com", national_id: null,
    department: "delivery", job_title: "Logistics Coordinator", job_title_ar: "منسق اللوجستيات",
    employment_type: "full_time", status: "active", hire_date: d(300), termination_date: null,
    salary: 6500, salary_type: "monthly", photo_url: null,
    emergency_contact: null, emergency_phone: null,
    address: "Cairo", skills: ["driving", "dispatch", "logistics"], documents: [],
    notes: null, metadata: {}, created_at: ts(300), updated_at: ts(8),
  },
  {
    id: "emp-06", workspace_id: W, employee_number: "E-006", full_name: "Khaled Mansour", full_name_ar: "خالد منصور",
    phone: "+20-100-001-0006", email: "khaled@demo.com", national_id: null,
    department: "production", job_title: "Finishing Specialist", job_title_ar: "أخصائي التشطيبات",
    employment_type: "full_time", status: "active", hire_date: d(200), termination_date: null,
    salary: 7500, salary_type: "monthly", photo_url: null,
    emergency_contact: null, emergency_phone: null,
    address: "Cairo", skills: ["pressing", "trimming", "finishing", "folding"], documents: [],
    notes: null, metadata: {}, created_at: ts(200), updated_at: ts(4),
  },
  {
    id: "emp-07", workspace_id: W, employee_number: "E-007", full_name: "Nadia Ibrahim", full_name_ar: "نادية إبراهيم",
    phone: "+20-100-001-0007", email: "nadia@demo.com", national_id: null,
    department: "sales", job_title: "Sales Executive", job_title_ar: "مسؤولة مبيعات",
    employment_type: "full_time", status: "active", hire_date: d(400), termination_date: null,
    salary: 9000, salary_type: "monthly", photo_url: null,
    emergency_contact: null, emergency_phone: null,
    address: "Cairo", skills: ["sales", "crm", "client-relations"], documents: [],
    notes: null, metadata: {}, created_at: ts(400), updated_at: ts(6),
  },
  {
    id: "emp-08", workspace_id: W, employee_number: "E-008", full_name: "Rami Saad", full_name_ar: "رامي سعد",
    phone: "+20-100-001-0008", email: "rami@demo.com", national_id: null,
    department: "production", job_title: "Garment Technician", job_title_ar: "فني ملابس",
    employment_type: "full_time", status: "active", hire_date: d(260), termination_date: null,
    salary: 6000, salary_type: "monthly", photo_url: null,
    emergency_contact: null, emergency_phone: null,
    address: "Cairo", skills: ["sewing", "fit", "sampling"], documents: [],
    notes: null, metadata: {}, created_at: ts(260), updated_at: ts(7),
  },
  {
    id: "emp-09", workspace_id: W, employee_number: "E-009", full_name: "Layla Qasim", full_name_ar: "ليلى قاسم",
    phone: "+20-100-001-0009", email: "layla@demo.com", national_id: null,
    department: "admin", job_title: "QC Inspector", job_title_ar: "مفتشة جودة",
    employment_type: "full_time", status: "active", hire_date: d(320), termination_date: null,
    salary: 8000, salary_type: "monthly", photo_url: null,
    emergency_contact: null, emergency_phone: null,
    address: "Cairo", skills: ["quality-control", "inspection", "reporting"], documents: [],
    notes: null, metadata: {}, created_at: ts(320), updated_at: ts(3),
  },
  {
    id: "emp-10", workspace_id: W, employee_number: "E-010", full_name: "Tariq Zaki", full_name_ar: "طارق زكي",
    phone: "+20-100-001-0010", email: "tariq@demo.com", national_id: null,
    department: "warehouse", job_title: "Warehouse Keeper", job_title_ar: "أمين المخزن",
    employment_type: "full_time", status: "active", hire_date: d(280), termination_date: null,
    salary: 5500, salary_type: "monthly", photo_url: null,
    emergency_contact: null, emergency_phone: null,
    address: "Cairo", skills: ["inventory", "logistics", "forklift"], documents: [],
    notes: null, metadata: {}, created_at: ts(280), updated_at: ts(9),
  },
  {
    id: "emp-11", workspace_id: W, employee_number: "E-011", full_name: "Salman Rizq", full_name_ar: "سلمان رزق",
    phone: "+20-100-001-0011", email: null, national_id: null,
    department: "production", job_title: "Embroidery Specialist", job_title_ar: "أخصائي تطريز",
    employment_type: "daily", status: "active", hire_date: d(90), termination_date: null,
    salary: 200, salary_type: "daily", photo_url: null,
    emergency_contact: null, emergency_phone: null,
    address: null, skills: ["finishing"], documents: [],
    notes: null, metadata: {}, created_at: ts(90), updated_at: ts(10),
  },
  {
    id: "emp-12", workspace_id: W, employee_number: "E-012", full_name: "Mona Saleh", full_name_ar: "منى صالح",
    phone: "+20-100-001-0012", email: "mona@demo.com", national_id: null,
    department: "admin", job_title: "HR Coordinator", job_title_ar: "منسقة موارد بشرية",
    employment_type: "full_time", status: "on_leave", hire_date: d(500), termination_date: null,
    salary: 7000, salary_type: "monthly", photo_url: null,
    emergency_contact: null, emergency_phone: null,
    address: "Cairo", skills: ["hr", "payroll", "administration"], documents: [],
    notes: "Currently on annual leave", metadata: {}, created_at: ts(500), updated_at: ts(1),
  },
];

// ─── Attendance (last 7 days for all active employees) ───

function generateAttendance(): T<"attendance">[] {
  const rows: T<"attendance">[] = [];
  const active = DEMO_EMPLOYEES.filter(e => e.status === "active");
  for (let day = 0; day < 7; day++) {
    const date = d(day);
    const isWeekend = [5, 6].includes(new Date(date).getDay()); // Fri-Sat
    if (isWeekend) continue;
    for (const emp of active) {
      const absent = day === 3 && emp.id === "emp-08"; // Rami absent 3 days ago
      const late = day === 1 && emp.id === "emp-11";   // Salman late yesterday
      rows.push({
        id: `att-${emp.id}-${day}`, workspace_id: W, employee_id: emp.id,
        date,
        check_in: absent ? null : late ? `${date}T09:22:00` : `${date}T07:${String(50 + Math.floor(Math.random() * 10)).slice(0, 2)}:00`,
        check_out: absent ? null : day === 0 ? null : `${date}T16:${String(30 + Math.floor(Math.random() * 30)).slice(0, 2)}:00`,
        status: absent ? "absent" : late ? "late" : "present",
        overtime_hours: day === 2 && emp.department === "production" ? 2 : 0,
        notes: absent ? "No call no show" : null,
        metadata: {}, created_at: ts(day), updated_at: ts(day),
      });
    }
  }
  return rows;
}

export const DEMO_ATTENDANCE = generateAttendance();

// ─── Leave Requests ──────────────────────────────────────

export const DEMO_LEAVE_REQUESTS: T<"leave_requests">[] = [
  {
    id: "lv-01", workspace_id: W, employee_id: "emp-12", leave_type: "annual",
    start_date: d(5), end_date: d(-9), days: 14, reason: "Annual family vacation",
    status: "approved", approved_by: "Ahmad Khalil", approved_at: ts(20),
    metadata: {}, created_at: ts(25), updated_at: ts(20),
  },
  {
    id: "lv-02", workspace_id: W, employee_id: "emp-08", leave_type: "sick",
    start_date: d(3), end_date: d(3), days: 1, reason: "Medical appointment",
    status: "approved", approved_by: "Ahmad Khalil", approved_at: ts(4),
    metadata: {}, created_at: ts(4), updated_at: ts(4),
  },
  {
    id: "lv-03", workspace_id: W, employee_id: "emp-05", leave_type: "annual",
    start_date: d(-14), end_date: d(-10), days: 5, reason: "Personal travel",
    status: "pending", approved_by: null, approved_at: null,
    metadata: {}, created_at: ts(2), updated_at: ts(2),
  },
  {
    id: "lv-04", workspace_id: W, employee_id: "emp-04", leave_type: "sick",
    start_date: d(30), end_date: d(29), days: 2, reason: "Flu recovery",
    status: "approved", approved_by: "Ahmad Khalil", approved_at: ts(31),
    metadata: {}, created_at: ts(32), updated_at: ts(31),
  },
];

// ─── Site Visits ─────────────────────────────────────────

export const DEMO_SITE_VISITS: T<"site_visits">[] = [
  {
    id: "sv-01", workspace_id: W, visit_number: "SV-2026-001",
    sales_order_id: null, customer_id: "o02", customer_name: "Kids Corner Stores",
    site_address: "90th Street, New Cairo", assigned_technician: "Hassan Younis",
    visit_date: d(45), status: "completed",
    notes: "Store visit — shelf space & size-run check for the autumn drop",
    preferred_colors: "Sage, Oat", preferred_materials: "French terry, rib",
    preferred_style: "modern", special_notes: "Buyer wants hanging display for hoodies",
    installation_notes: "Deliveries through mall service gate before 10am.",
    checklist: [
      { id: "measurements", label_en: "Measurements captured", label_ar: "المقاسات اتاخدت", checked: true },
      { id: "photos", label_en: "Photos captured", label_ar: "الصور اتصورت", checked: true },
      { id: "electrical", label_en: "Electrical points checked", label_ar: "النقط الكهربائية اتراجعت", checked: true },
      { id: "plumbing", label_en: "Plumbing checked", label_ar: "السباكة اتراجعت", checked: true },
      { id: "access", label_en: "Access route checked", label_ar: "مدخل التركيب اتراجع", checked: true },
      { id: "installation", label_en: "Installation conditions reviewed", label_ar: "ظروف التركيب اتراجعت", checked: true },
    ],
    metadata: {}, created_at: ts(45), updated_at: ts(44),
  },
  {
    id: "sv-02", workspace_id: W, visit_number: "SV-2026-002",
    sales_order_id: null, customer_id: "o03", customer_name: "Little Steps Boutique",
    site_address: "Road 9, Maadi, Cairo", assigned_technician: "Hassan Younis",
    visit_date: d(30), status: "completed",
    notes: "Boutique buyer meeting — pyjama range fitting",
    preferred_colors: "Navy, Mustard", preferred_materials: "Interlock, nylon taslan",
    preferred_style: "luxury", special_notes: "Wants gift boxes for pyjama sets",
    installation_notes: "Street-level shop, load from front.",
    checklist: [
      { id: "measurements", label_en: "Measurements captured", label_ar: "المقاسات اتاخدت", checked: true },
      { id: "photos", label_en: "Photos captured", label_ar: "الصور اتصورت", checked: true },
      { id: "electrical", label_en: "Electrical points checked", label_ar: "النقط الكهربائية اتراجعت", checked: true },
      { id: "plumbing", label_en: "Plumbing checked", label_ar: "السباكة اتراجعت", checked: false },
      { id: "access", label_en: "Access route checked", label_ar: "مدخل التركيب اتراجع", checked: true },
      { id: "installation", label_en: "Installation conditions reviewed", label_ar: "ظروف التركيب اتراجعت", checked: true },
    ],
    metadata: {}, created_at: ts(30), updated_at: ts(29),
  },
  {
    id: "sv-03", workspace_id: W, visit_number: "SV-2026-003",
    sales_order_id: null, customer_id: null, customer_name: "Mini Me Online",
    site_address: "City Stars Mall, Nasr City", assigned_technician: "Nadia Ibrahim",
    visit_date: d(10), status: "completed",
    notes: "Shop-in-shop corner survey",
    preferred_colors: "Olive, Oat", preferred_materials: "Nylon shell, recycled fill",
    preferred_style: "classic", special_notes: "Opening order budget ~150K EGP",
    installation_notes: "Mall rules: install after closing",
    checklist: [
      { id: "measurements", label_en: "Measurements captured", label_ar: "المقاسات اتاخدت", checked: true },
      { id: "photos", label_en: "Photos captured", label_ar: "الصور اتصورت", checked: true },
      { id: "electrical", label_en: "Electrical points checked", label_ar: "النقط الكهربائية اتراجعت", checked: true },
      { id: "plumbing", label_en: "Plumbing checked", label_ar: "السباكة اتراجعت", checked: true },
      { id: "access", label_en: "Access route checked", label_ar: "مدخل التركيب اتراجع", checked: true },
      { id: "installation", label_en: "Installation conditions reviewed", label_ar: "ظروف التركيب اتراجعت", checked: true },
    ],
    metadata: {}, created_at: ts(10), updated_at: ts(9),
  },
  {
    id: "sv-04", workspace_id: W, visit_number: "SV-2026-004",
    sales_order_id: null, customer_id: null, customer_name: "Toy Town Kiosks",
    site_address: "Mall of Arabia, 6th of October", assigned_technician: "Hassan Younis",
    visit_date: d(3), status: "scheduled",
    notes: "Pop-up stand survey",
    preferred_colors: null, preferred_materials: null,
    preferred_style: null, special_notes: "Reschedule if mall management blocks access",
    installation_notes: null,
    checklist: [
      { id: "measurements", label_en: "Measurements captured", label_ar: "المقاسات اتاخدت", checked: false },
      { id: "photos", label_en: "Photos captured", label_ar: "الصور اتصورت", checked: false },
      { id: "electrical", label_en: "Electrical points checked", label_ar: "النقط الكهربائية اتراجعت", checked: false },
      { id: "plumbing", label_en: "Plumbing checked", label_ar: "السباكة اتراجعت", checked: false },
      { id: "access", label_en: "Access route checked", label_ar: "مدخل التركيب اتراجع", checked: false },
      { id: "installation", label_en: "Installation conditions reviewed", label_ar: "ظروف التركيب اتراجعت", checked: false },
    ],
    metadata: {}, created_at: ts(5), updated_at: ts(3),
  },
  {
    id: "sv-05", workspace_id: W, visit_number: "SV-2026-005",
    sales_order_id: null, customer_id: "o02", customer_name: "Kids Corner Stores",
    site_address: "San Stefano Mall, Alexandria", assigned_technician: "Nadia Ibrahim",
    visit_date: d(1), status: "in_progress",
    notes: "Franchise corner — fixture & display measurements",
    preferred_colors: "Brand colours", preferred_materials: "Wooden fixtures",
    preferred_style: "modern", special_notes: "Fixtures must match franchise guide",
    installation_notes: null,
    checklist: [
      { id: "measurements", label_en: "Measurements captured", label_ar: "المقاسات اتاخدت", checked: true },
      { id: "photos", label_en: "Photos captured", label_ar: "الصور اتصورت", checked: true },
      { id: "electrical", label_en: "Electrical points checked", label_ar: "النقط الكهربائية اتراجعت", checked: false },
      { id: "plumbing", label_en: "Plumbing checked", label_ar: "السباكة اتراجعت", checked: false },
      { id: "access", label_en: "Access route checked", label_ar: "مدخل التركيب اتراجع", checked: false },
      { id: "installation", label_en: "Installation conditions reviewed", label_ar: "ظروف التركيب اتراجعت", checked: false },
    ],
    metadata: {}, created_at: ts(3), updated_at: ts(1),
  },
];

// ─── Measurements ────────────────────────────────────────

export const DEMO_MEASUREMENTS: T<"measurements">[] = [
  // SV-01: Kids Corner store visit
  {
    id: "ms-01", workspace_id: W, site_visit_id: "sv-01", room_name: "Hanging wall",
    room_type: "custom", label: "Hoodie hanging wall", width: 4200, height: 2700, depth: 600, length: 3800,
    ceiling_height: 2800, notes: "Two-level rail, 12 faces out.",
    approval_status: "approved", approved_by: "Ahmad Khalil", approved_at: ts(43),
    metadata: {}, created_at: ts(44), updated_at: ts(43),
  },
  {
    id: "ms-02", workspace_id: W, site_visit_id: "sv-01", room_name: "Shelving",
    room_type: "custom", label: "Folded jogger shelves", width: 3600, height: 2500, depth: 600, length: null,
    ceiling_height: 2800, notes: "Five shelves, size dividers",
    approval_status: "approved", approved_by: "Ahmad Khalil", approved_at: ts(43),
    metadata: {}, created_at: ts(44), updated_at: ts(43),
  },
  // SV-02: Little Steps buyer meeting
  {
    id: "ms-03", workspace_id: W, site_visit_id: "sv-02", room_name: "Window",
    room_type: "custom", label: "Window display", width: 3000, height: 1100, depth: 700, length: 5000,
    ceiling_height: 3200, notes: "Three mannequins, 2Y / 6Y / 10Y",
    approval_status: "approved", approved_by: "Ahmad Khalil", approved_at: ts(28),
    metadata: {}, created_at: ts(29), updated_at: ts(28),
  },
  {
    id: "ms-04", workspace_id: W, site_visit_id: "sv-02", room_name: "Counter",
    room_type: "custom", label: "Gift-box counter display", width: 2400, height: 760, depth: 900, length: 6000,
    ceiling_height: 3200, notes: "Pyjama gift boxes stacked 3 high.",
    approval_status: "approved", approved_by: "Ahmad Khalil", approved_at: ts(28),
    metadata: {}, created_at: ts(29), updated_at: ts(28),
  },
  // SV-03: shop-in-shop corner
  {
    id: "ms-05", workspace_id: W, site_visit_id: "sv-03", room_name: "Corner",
    room_type: "custom", label: "Shop-in-shop corner", width: 5000, height: 2700, depth: 650, length: 4500,
    ceiling_height: 3000, notes: "Corner with central table.",
    approval_status: "submitted", approved_by: null, approved_at: null,
    metadata: {}, created_at: ts(9), updated_at: ts(8),
  },
  {
    id: "ms-06", workspace_id: W, site_visit_id: "sv-03", room_name: "Fitting",
    room_type: "custom", label: "Fitting nook", width: 3200, height: 2500, depth: 600, length: 2800,
    ceiling_height: 3000, notes: "Curtain rail and mirror",
    approval_status: "submitted", approved_by: null, approved_at: null,
    metadata: {}, created_at: ts(9), updated_at: ts(8),
  },
  {
    id: "ms-07", workspace_id: W, site_visit_id: "sv-03", room_name: "Back wall",
    room_type: "custom", label: "Brand wall graphic", width: 4000, height: 2200, depth: 450, length: null,
    ceiling_height: 3000, notes: "Printed CUBS mural",
    approval_status: "draft", approved_by: null, approved_at: null,
    metadata: {}, created_at: ts(9), updated_at: ts(9),
  },
  // SV-05: franchise stand
  {
    id: "ms-08", workspace_id: W, site_visit_id: "sv-05", room_name: "Stand",
    room_type: "custom", label: "Franchise stand", width: 2400, height: 1050, depth: 600, length: 3000,
    ceiling_height: 2800, notes: "Freestanding 2m stand",
    approval_status: "draft", approved_by: null, approved_at: null,
    metadata: {}, created_at: ts(1), updated_at: ts(1),
  },
];

// ─── Design Briefs ───────────────────────────────────────

export const DEMO_DESIGN_BRIEFS: T<"design_briefs">[] = [
  {
    id: "db-01", workspace_id: W, brief_number: "DB-2026-001", title: "Explorer Zip Hoodie — AW26",
    sales_order_id: null, site_visit_id: "sv-01", customer_id: "o02", customer_name: "Kids Corner Stores",
    assigned_designer: "Fatima Nasser", design_type: "custom", style: "modern",
    dimensions_summary: { rooms: ["Size run 2Y–12Y, graded"] },
    preferred_colors: "Sage, Oat", preferred_materials: "French terry, rib",
    special_notes: "Hood lined in jersey, YKK #5 zip, chest embroidery.",
    status: "approved", version: 2, approved_by: "Ahmad Khalil", approved_at: ts(35),
    revision_notes: "V1 hood too shallow for 10Y–12Y, revised in V2",
    start_date: d(42), due_date: d(35), completed_date: d(36),
    metadata: {}, created_at: ts(42), updated_at: ts(35),
  },
  {
    id: "db-02", workspace_id: W, brief_number: "DB-2026-002", title: "Little Cub Pyjama — Bear Print",
    sales_order_id: null, site_visit_id: "sv-02", customer_id: "o03", customer_name: "Little Steps Boutique",
    assigned_designer: "Fatima Nasser", design_type: "office", style: "luxury",
    dimensions_summary: { rooms: ["Size run 1Y–8Y", "Print repeat 32cm"] },
    preferred_colors: "Navy, Mustard", preferred_materials: "Interlock, nylon taslan",
    special_notes: "Print must line up across the front panels. Soft rib cuffs.",
    status: "in_progress", version: 1, approved_by: null, approved_at: null,
    revision_notes: null,
    start_date: d(25), due_date: d(15), completed_date: null,
    metadata: {}, created_at: ts(25), updated_at: ts(5),
  },
  {
    id: "db-03", workspace_id: W, brief_number: "DB-2026-003", title: "Adventure Jogger — waistband update",
    sales_order_id: null, site_visit_id: "sv-01", customer_id: "o02", customer_name: "Kids Corner Stores",
    assigned_designer: "Fatima Nasser", design_type: "wardrobe", style: "modern",
    dimensions_summary: { rooms: ["Size run 2Y–12Y"] },
    preferred_colors: "Sage, Oat", preferred_materials: "Brushed fleece",
    special_notes: "Wider 30mm elastic, flat drawcord, zip pocket.",
    status: "approved", version: 1, approved_by: "Ahmad Khalil", approved_at: ts(38),
    revision_notes: null,
    start_date: d(41), due_date: d(36), completed_date: d(38),
    metadata: {}, created_at: ts(41), updated_at: ts(38),
  },
  {
    id: "db-04", workspace_id: W, brief_number: "DB-2026-004", title: "Puffer Vest — Olive",
    sales_order_id: null, site_visit_id: "sv-03", customer_id: null, customer_name: "Mini Me Online",
    assigned_designer: "Fatima Nasser", design_type: "custom", style: "classic",
    dimensions_summary: { rooms: ["Size run 2Y–12Y"] },
    preferred_colors: "Olive, Oat", preferred_materials: "Nylon shell, recycled fill",
    special_notes: "Recycled fill, snap front, reflective tab.",
    status: "client_review", version: 1, approved_by: null, approved_at: null,
    revision_notes: null,
    start_date: d(7), due_date: d(2), completed_date: null,
    metadata: {}, created_at: ts(7), updated_at: ts(2),
  },
  {
    id: "db-05", workspace_id: W, brief_number: "DB-2026-005", title: "Trail Windbreaker — Mustard",
    sales_order_id: null, site_visit_id: "sv-02", customer_id: "o03", customer_name: "Little Steps Boutique",
    assigned_designer: "Fatima Nasser", design_type: "reception", style: "luxury",
    dimensions_summary: { rooms: ["Size run 3Y–12Y"] },
    preferred_colors: "Bear print, cream", preferred_materials: "Printed interlock",
    special_notes: "Packable into its own pocket. Mesh lining.",
    status: "internal_review", version: 1, approved_by: null, approved_at: null,
    revision_notes: null,
    start_date: d(20), due_date: d(12), completed_date: null,
    metadata: {}, created_at: ts(20), updated_at: ts(6),
  },
];

// ─── Design Files ────────────────────────────────────────

export const DEMO_DESIGN_FILES: T<"design_files">[] = [
  { id: "df-01", workspace_id: W, design_brief_id: "db-01", file_url: "#", file_name: "Explorer-Hoodie-V2-TechPack.pdf", file_type: "technical_drawing", file_format: "dwg", file_size: 2450000, version: 2, notes: "Final approved floor plan", metadata: {}, created_at: ts(36), updated_at: ts(36) },
  { id: "df-02", workspace_id: W, design_brief_id: "db-01", file_url: "#", file_name: "Explorer-Hoodie-V2-Flat.png", file_type: "3d_render", file_format: "png", file_size: 8200000, version: 2, notes: "3D render for client approval", metadata: {}, created_at: ts(36), updated_at: ts(36) },
  { id: "df-03", workspace_id: W, design_brief_id: "db-01", file_url: "#", file_name: "Explorer-Hoodie-Grading.pdf", file_type: "elevation", file_format: "pdf", file_size: 1800000, version: 2, notes: "Wall A elevation with dimensions", metadata: {}, created_at: ts(36), updated_at: ts(36) },
  { id: "df-04", workspace_id: W, design_brief_id: "db-02", file_url: "#", file_name: "Pyjama-TechPack-V1.pdf", file_type: "technical_drawing", file_format: "dwg", file_size: 1900000, version: 1, notes: "Executive desk with cable management detail", metadata: {}, created_at: ts(18), updated_at: ts(18) },
  { id: "df-05", workspace_id: W, design_brief_id: "db-02", file_url: "#", file_name: "Pyjama-Print-Repeat.png", file_type: "3d_render", file_format: "png", file_size: 6500000, version: 1, notes: null, metadata: {}, created_at: ts(18), updated_at: ts(18) },
  { id: "df-06", workspace_id: W, design_brief_id: "db-03", file_url: "#", file_name: "Jogger-Waistband-Spec.pdf", file_type: "technical_drawing", file_format: "dwg", file_size: 1600000, version: 1, notes: "Full wall wardrobe floor plan", metadata: {}, created_at: ts(39), updated_at: ts(39) },
  { id: "df-07", workspace_id: W, design_brief_id: "db-04", file_url: "#", file_name: "Puffer-Vest-V1-Flat.png", file_type: "3d_render", file_format: "png", file_size: 9100000, version: 1, notes: "Awaiting client feedback", metadata: {}, created_at: ts(4), updated_at: ts(4) },
  { id: "df-08", workspace_id: W, design_brief_id: "db-05", file_url: "#", file_name: "Windbreaker-Moodboard.pdf", file_type: "reference", file_format: "pdf", file_size: 3200000, version: 1, notes: "Concept mood board + sketches", metadata: {}, created_at: ts(15), updated_at: ts(15) },
];

// ─── Design Comments ─────────────────────────────────────

export const DEMO_DESIGN_COMMENTS: T<"design_comments">[] = [
  { id: "dc-01", workspace_id: W, design_brief_id: "db-01", author_name: "Fatima Nasser", author_role: "designer", comment: "V1 complete — please review the hob and sink positions", comment_type: "general", resolved: true, metadata: {}, created_at: ts(40), updated_at: ts(40) },
  { id: "dc-02", workspace_id: W, design_brief_id: "db-01", author_name: "Ahmad Khalil", author_role: "manager", comment: "Hob cutout is 580mm but spec says 560mm. Please revise.", comment_type: "revision_request", resolved: true, metadata: {}, created_at: ts(39), updated_at: ts(37) },
  { id: "dc-03", workspace_id: W, design_brief_id: "db-01", author_name: "Fatima Nasser", author_role: "designer", comment: "Fixed in V2. All cutouts verified against appliance specs.", comment_type: "general", resolved: true, metadata: {}, created_at: ts(37), updated_at: ts(37) },
  { id: "dc-04", workspace_id: W, design_brief_id: "db-01", author_name: "Ahmad Khalil", author_role: "manager", comment: "Approved. Good to go to production.", comment_type: "approval", resolved: false, metadata: {}, created_at: ts(35), updated_at: ts(35) },
  { id: "dc-05", workspace_id: W, design_brief_id: "db-02", author_name: "Fatima Nasser", author_role: "designer", comment: "Desk cable channel routing — need input on preferred orientation", comment_type: "question", resolved: false, metadata: {}, created_at: ts(15), updated_at: ts(15) },
  { id: "dc-06", workspace_id: W, design_brief_id: "db-04", author_name: "Mini Me Online", author_role: "client", comment: "Can we make the island slightly bigger? We need 4 bar stools.", comment_type: "revision_request", resolved: false, metadata: {}, created_at: ts(1), updated_at: ts(1) },
];

// ─── Production Orders ───────────────────────────────────

export const DEMO_PRODUCTION_ORDERS: T<"production_orders">[] = [
  {
    id: "po-01", workspace_id: W, po_number: "PO-2026-041", title: "Explorer Zip Hoodie — Sage × 600",
    sales_order_id: null, design_brief_id: null, customer_id: null, customer_name: "CUBS Online Store",
    assigned_station: "Sewing Line A", assigned_workers: ["Hoda Saeed", "Mona Adel"],
    priority: "high", start_date: d(24), due_date: d(-3), completed_date: null,
    status: "packing", current_stage: "packing", progress: 90,
    materials_summary: { fabric_m: 540, zips: 600, labels: 600, sizes: "2Y–12Y" },
    notes: "Imported French terry (Turkey). Ships to online store + City Stars branch.",
    metadata: {}, created_at: ts(24), updated_at: ts(1),
  },
  {
    id: "po-02", workspace_id: W, po_number: "PO-2026-043", title: "Adventure Jogger Set — Navy × 800",
    sales_order_id: null, design_brief_id: null, customer_id: null, customer_name: "CUBS Retail Branches",
    assigned_station: "Sewing Line B", assigned_workers: ["Samah Fathy", "Nadia Ibrahim"],
    priority: "medium", start_date: d(18), due_date: d(-9), completed_date: null,
    status: "sewing", current_stage: "sewing", progress: 52,
    materials_summary: { fabric_m: 960, elastic_m: 560, rib_m: 120 },
    notes: "Back-to-school drop. Waistband elastic second lot must land before day 6.",
    metadata: {}, created_at: ts(18), updated_at: ts(0),
  },
  {
    id: "po-03", workspace_id: W, po_number: "PO-2026-045", title: "Little Cub Pyjama Set — Bear Print × 1,200",
    sales_order_id: null, design_brief_id: null, customer_id: null, customer_name: "CUBS Online Store",
    assigned_station: "Cutting Table 1", assigned_workers: ["Ahmed Khalil"],
    priority: "urgent", start_date: d(10), due_date: d(-12), completed_date: null,
    status: "cutting", current_stage: "cutting", progress: 28,
    materials_summary: { fabric_m: 1380, snaps: 4800, labels: 1200 },
    notes: "Printed interlock held at customs 3 days. Print must match across front panels.",
    metadata: {}, created_at: ts(10), updated_at: ts(0),
  },
  {
    id: "po-04", workspace_id: W, po_number: "PO-2026-047", title: "Trail Windbreaker — Mustard × 400",
    sales_order_id: null, design_brief_id: null, customer_id: null, customer_name: "CUBS Retail Branches",
    assigned_station: null, assigned_workers: [],
    priority: "low", start_date: null, due_date: d(-30), completed_date: null,
    status: "pending", current_stage: null, progress: 0,
    materials_summary: {},
    notes: "Imported ripstop nylon on the water — ETA 9 days.",
    metadata: {}, created_at: ts(3), updated_at: ts(3),
  },
  {
    id: "po-05", workspace_id: W, po_number: "PO-2026-032", title: "Everyday Tee 3-Pack × 1,500",
    sales_order_id: null, design_brief_id: null, customer_id: null, customer_name: "CUBS Online Store",
    assigned_station: "Sewing Line A", assigned_workers: ["Hoda Saeed", "Omar Hassan"],
    priority: "high", start_date: d(40), due_date: d(17), completed_date: d(19),
    status: "ready", current_stage: "packing", progress: 100,
    materials_summary: { fabric_m: 2700, labels: 4500, boxes: 1500 },
    notes: "Delivered two days early.",
    metadata: {}, created_at: ts(40), updated_at: ts(19),
  },
];

// ─── Cutting List Items ──────────────────────────────────
// Garment cutting reuses the shared columns: thickness = plies,
// width/length = marker size (cm), cnc_program = size ratio.

export const DEMO_CUTTING_ITEMS: T<"cutting_list_items">[] = [
  // PO-01: Explorer Hoodie
  { id: "cl-01", workspace_id: W, production_order_id: "po-01", piece_number: 1, part_name: "Front body (L/R)", material: "French Terry 320gsm — Sage", thickness: 60, width: 160, length: 540, qty: 1200, edge_top: null, edge_bottom: null, edge_left: null, edge_right: null, grain_direction: "vertical", cnc_program: "2Y:1 4Y:2 6Y:2 8Y:2 10Y:2 12Y:1", notes: "Check shade by roll", completed: true, metadata: {}, created_at: ts(22), updated_at: ts(19) },
  { id: "cl-02", workspace_id: W, production_order_id: "po-01", piece_number: 2, part_name: "Back body", material: "French Terry 320gsm — Sage", thickness: 60, width: 160, length: 540, qty: 600, edge_top: null, edge_bottom: null, edge_left: null, edge_right: null, grain_direction: "vertical", cnc_program: "2Y:1 4Y:2 6Y:2 8Y:2 10Y:2 12Y:1", notes: null, completed: true, metadata: {}, created_at: ts(22), updated_at: ts(19) },
  { id: "cl-03", workspace_id: W, production_order_id: "po-01", piece_number: 3, part_name: "Sleeves", material: "French Terry 320gsm — Sage", thickness: 60, width: 160, length: 420, qty: 1200, edge_top: null, edge_bottom: null, edge_left: null, edge_right: null, grain_direction: "vertical", cnc_program: "2Y:1 4Y:2 6Y:2 8Y:2 10Y:2 12Y:1", notes: null, completed: true, metadata: {}, created_at: ts(22), updated_at: ts(19) },
  { id: "cl-04", workspace_id: W, production_order_id: "po-01", piece_number: 4, part_name: "Hood (3-panel)", material: "French Terry 320gsm — Sage", thickness: 60, width: 160, length: 380, qty: 1800, edge_top: null, edge_bottom: null, edge_left: null, edge_right: null, grain_direction: "vertical", cnc_program: "2Y:1 4Y:2 6Y:2 8Y:2 10Y:2 12Y:1", notes: "6 panels recut — shade variation on roll 14", completed: true, metadata: {}, created_at: ts(22), updated_at: ts(19) },
  // PO-03: Pyjama Set
  { id: "cl-05", workspace_id: W, production_order_id: "po-03", piece_number: 1, part_name: "Top front (print-matched)", material: "Printed Interlock 200gsm — Bear", thickness: 40, width: 150, length: 610, qty: 1200, edge_top: null, edge_bottom: null, edge_left: null, edge_right: null, grain_direction: "vertical", cnc_program: "1Y:1 2Y:2 4Y:2 6Y:2 8Y:1", notes: "Lock print direction on marker", completed: false, metadata: {}, created_at: ts(6), updated_at: ts(0) },
  { id: "cl-06", workspace_id: W, production_order_id: "po-03", piece_number: 2, part_name: "Trouser legs", material: "Printed Interlock 200gsm — Bear", thickness: 40, width: 150, length: 700, qty: 2400, edge_top: null, edge_bottom: null, edge_left: null, edge_right: null, grain_direction: "vertical", cnc_program: "1Y:1 2Y:2 4Y:2 6Y:2 8Y:1", notes: null, completed: false, metadata: {}, created_at: ts(6), updated_at: ts(0) },
];

// ─── Production Stage Log ────────────────────────────────

export const DEMO_STAGE_LOG: T<"production_stage_log">[] = [
  // PO-01 stages
  { id: "sl-01", workspace_id: W, production_order_id: "po-01", stage: "pattern", status: "completed", started_at: ts(22), completed_at: ts(21), duration_minutes: 540, worker_name: "Mona Adel", station: "Pattern & CAD Room", notes: "Graded 2Y–12Y, marker efficiency 86%", metadata: {}, created_at: ts(22), updated_at: ts(21) },
  { id: "sl-02", workspace_id: W, production_order_id: "po-01", stage: "cutting", status: "completed", started_at: ts(21), completed_at: ts(19), duration_minutes: 1080, worker_name: "Ahmed Khalil", station: "Cutting Table 1", notes: null, metadata: {}, created_at: ts(21), updated_at: ts(19) },
  { id: "sl-03", workspace_id: W, production_order_id: "po-01", stage: "sewing", status: "completed", started_at: ts(19), completed_at: ts(11), duration_minutes: 6240, worker_name: "Hoda Saeed", station: "Sewing Line A", notes: "Zip insertion was the slow operation", metadata: {}, created_at: ts(19), updated_at: ts(11) },
  { id: "sl-04", workspace_id: W, production_order_id: "po-01", stage: "finishing", status: "completed", started_at: ts(11), completed_at: ts(8), duration_minutes: 1320, worker_name: "Khaled Mansour", station: "Finishing & Pressing", notes: null, metadata: {}, created_at: ts(11), updated_at: ts(8) },
  { id: "sl-05", workspace_id: W, production_order_id: "po-01", stage: "quality_check", status: "completed", started_at: ts(8), completed_at: ts(6), duration_minutes: 660, worker_name: "Laila Qasim", station: "QC Station", notes: "AQL 2.5 passed", metadata: {}, created_at: ts(8), updated_at: ts(6) },
  { id: "sl-06", workspace_id: W, production_order_id: "po-01", stage: "packing", status: "in_progress", started_at: ts(6), completed_at: null, duration_minutes: null, worker_name: "Omar Hassan", station: "Packing Bay", notes: "420 of 600 packed", metadata: {}, created_at: ts(6), updated_at: ts(1) },
  // PO-02 stages
  { id: "sl-07", workspace_id: W, production_order_id: "po-02", stage: "pattern", status: "completed", started_at: ts(15), completed_at: ts(14), duration_minutes: 480, worker_name: "Mona Adel", station: "Pattern & CAD Room", notes: null, metadata: {}, created_at: ts(15), updated_at: ts(14) },
  { id: "sl-08", workspace_id: W, production_order_id: "po-02", stage: "cutting", status: "completed", started_at: ts(14), completed_at: ts(12), duration_minutes: 1140, worker_name: "Ahmed Khalil", station: "Cutting Table 2", notes: null, metadata: {}, created_at: ts(14), updated_at: ts(12) },
  { id: "sl-09", workspace_id: W, production_order_id: "po-02", stage: "sewing", status: "in_progress", started_at: ts(12), completed_at: null, duration_minutes: null, worker_name: "Samah Fathy", station: "Sewing Line B", notes: "460 of 800 sets — elastic running low", metadata: {}, created_at: ts(12), updated_at: ts(0) },
  // PO-03 stages
  { id: "sl-10", workspace_id: W, production_order_id: "po-03", stage: "pattern", status: "completed", started_at: ts(6), completed_at: ts(5), duration_minutes: 720, worker_name: "Mona Adel", station: "Pattern & CAD Room", notes: "Print direction locked on marker", metadata: {}, created_at: ts(6), updated_at: ts(5) },
  { id: "sl-11", workspace_id: W, production_order_id: "po-03", stage: "cutting", status: "in_progress", started_at: ts(5), completed_at: null, duration_minutes: null, worker_name: "Ahmed Khalil", station: "Cutting Table 1", notes: "540 of 1,200 sets cut", metadata: {}, created_at: ts(5), updated_at: ts(0) },
  // PO-05 stages (completed)
  { id: "sl-12", workspace_id: W, production_order_id: "po-05", stage: "sewing", status: "completed", started_at: ts(36), completed_at: ts(26), duration_minutes: 6120, worker_name: "Hoda Saeed", station: "Sewing Line A", notes: null, metadata: {}, created_at: ts(36), updated_at: ts(26) },
  { id: "sl-13", workspace_id: W, production_order_id: "po-05", stage: "packing", status: "completed", started_at: ts(21), completed_at: ts(19), duration_minutes: 780, worker_name: "Omar Hassan", station: "Packing Bay", notes: "3 per box, 50 boxes per carton", metadata: {}, created_at: ts(21), updated_at: ts(19) },
];

// ─── QC Inspections ──────────────────────────────────────

export const DEMO_QC_INSPECTIONS: T<"qc_inspections">[] = [
  {
    id: "qc-01", workspace_id: W, inspection_number: "QC-2026-061",
    production_order_id: "po-01", sales_order_id: null, customer_name: "CUBS Online Store",
    inspector_name: "Laila Qasim", inspection_type: "final", status: "passed",
    checklist: [
      { item: "Measurements within size-chart tolerance (±1cm)", passed: true },
      { item: "Seams: no skipped or open stitches", passed: true },
      { item: "Zip runs smoothly, ends secured", passed: true },
      { item: "Woven label position and wording", passed: true },
      { item: "Shade consistent across panels", passed: true },
    ],
    overall_score: 94, result_notes: "AQL 2.5 passed. 9 pcs with open seam at zip end moved to seconds.",
    inspected_at: ts(6), metadata: {}, created_at: ts(6), updated_at: ts(6),
  },
  {
    id: "qc-02", workspace_id: W, inspection_number: "QC-2026-064",
    production_order_id: "po-02", sales_order_id: null, customer_name: "CUBS Retail Branches",
    inspector_name: "Laila Qasim", inspection_type: "in_process", status: "conditional",
    checklist: [
      { item: "Measurements within size-chart tolerance (±1cm)", passed: true },
      { item: "Waistband elastic stretch and recovery", passed: false },
      { item: "Embroidery position and density", passed: true },
      { item: "Seams: no skipped or open stitches", passed: true },
    ],
    overall_score: 81, result_notes: "Elastic from the substitute lot recovers poorly — hold 22 sets for rework.",
    inspected_at: ts(2), metadata: {}, created_at: ts(2), updated_at: ts(2),
  },
  {
    id: "qc-03", workspace_id: W, inspection_number: "QC-2026-052",
    production_order_id: "po-05", sales_order_id: null, customer_name: "CUBS Online Store",
    inspector_name: "Laila Qasim", inspection_type: "final", status: "passed",
    checklist: [
      { item: "All sizes and colours counted per pack", passed: true },
      { item: "Print adhesion after wash test", passed: true },
      { item: "Neck rib lies flat", passed: true },
      { item: "Packaging and barcode labels", passed: true },
    ],
    overall_score: 96, result_notes: "Ready for dispatch.",
    inspected_at: ts(21), metadata: {}, created_at: ts(21), updated_at: ts(21),
  },
  {
    id: "qc-04", workspace_id: W, inspection_number: "QC-2026-066",
    production_order_id: "po-03", sales_order_id: null, customer_name: "CUBS Online Store",
    inspector_name: "Laila Qasim", inspection_type: "in_process", status: "pending",
    checklist: [],
    overall_score: null, result_notes: null,
    inspected_at: null, metadata: {}, created_at: ts(0), updated_at: ts(0),
  },
];

// ─── QC Defects ──────────────────────────────────────────

export const DEMO_QC_DEFECTS: T<"qc_defects">[] = [
  {
    id: "qd-01", workspace_id: W, inspection_id: "qc-01", defect_number: "DEF-001",
    title: "Open seam at zip end", severity: "minor", category: "assembly",
    description: "Stitching not back-tacked where the zip tape meets the hem — seam opens under pull.",
    location: "Explorer Hoodie, lower front at zip", photo_url: null,
    status: "accepted", rework_notes: "9 pcs moved to seconds; operators briefed on back-tacking",
    reworked_by: null, reworked_at: null,
    metadata: {}, created_at: ts(6), updated_at: ts(6),
  },
  {
    id: "qd-02", workspace_id: W, inspection_id: "qc-02", defect_number: "DEF-002",
    title: "Waistband elastic poor recovery", severity: "major", category: "material",
    description: "Elastic from the substitute lot stays stretched after 30 seconds; waist loosens.",
    location: "Adventure Jogger, waistband", photo_url: null,
    status: "rework", rework_notes: "Replace elastic on 22 sets once the original lot arrives",
    reworked_by: "Samah Fathy", reworked_at: null,
    metadata: {}, created_at: ts(2), updated_at: ts(1),
  },
  {
    id: "qd-03", workspace_id: W, inspection_id: "qc-02", defect_number: "DEF-003",
    title: "Chest embroidery 1cm off centre", severity: "cosmetic", category: "finish",
    description: "Hooping drift on one machine head placed the logo 1cm left of the centre line.",
    location: "Adventure Sweatshirt, left chest", photo_url: null,
    status: "re_inspected", rework_notes: "Re-hooped head 4. Next 40 pcs measured and passed.",
    reworked_by: "Nadia Ibrahim", reworked_at: ts(1),
    metadata: {}, created_at: ts(2), updated_at: ts(1),
  },
];

// ─── Deliveries ──────────────────────────────────────────

export const DEMO_DELIVERIES: T<"deliveries">[] = [
  {
    id: "del-01", workspace_id: W, delivery_number: "DEL-2025-045",
    production_order_id: "po-05", sales_order_id: null,
    customer_name: "CUBS City Stars Branch", customer_phone: "+20-100-555-1234",
    delivery_address: "CUBS Warehouse, 10th of Ramadan",
    delivery_date: d(30), delivery_time_slot: "09:00-12:00",
    driver_name: "Hassan Younis", vehicle_info: "Van (Plate: ق ط ر 1234)",
    status: "delivered",
    loading_notes: "22 cartons. Keep hanging stock upright.",
    delivery_notes: "Branch manager signed. All cartons counted.",
    recipient_name: "CUBS City Stars Branch", recipient_phone: "+20-100-555-1234",
    delivered_at: ts(30), delivery_photo_url: null,
    num_pieces: 38, num_packages: 22,
    metadata: {}, created_at: ts(32), updated_at: ts(30),
  },
  {
    id: "del-02", workspace_id: W, delivery_number: "DEL-2026-001",
    production_order_id: "po-01", sales_order_id: null,
    customer_name: "Kids Corner Stores", customer_phone: "+20-100-222-1000",
    delivery_address: "90th Street, New Cairo",
    delivery_date: d(-3), delivery_time_slot: "10:00-13:00",
    driver_name: "Hassan Younis", vehicle_info: "Van (Plate: ق ط ر 1234)",
    status: "scheduled",
    loading_notes: null, delivery_notes: null,
    recipient_name: null, recipient_phone: null,
    delivered_at: null, delivery_photo_url: null,
    num_pieces: 31, num_packages: 18,
    metadata: {}, created_at: ts(5), updated_at: ts(2),
  },
  {
    id: "del-03", workspace_id: W, delivery_number: "DEL-2026-002",
    production_order_id: "po-02", sales_order_id: null,
    customer_name: "Kids Corner Stores", customer_phone: "+20-100-222-1000",
    delivery_address: "90th Street, New Cairo",
    delivery_date: d(-5), delivery_time_slot: "14:00-17:00",
    driver_name: null, vehicle_info: null,
    status: "scheduled",
    loading_notes: null, delivery_notes: null,
    recipient_name: null, recipient_phone: null,
    delivered_at: null, delivery_photo_url: null,
    num_pieces: 24, num_packages: 14,
    metadata: {}, created_at: ts(3), updated_at: ts(3),
  },
];

// ─── Installations ───────────────────────────────────────

export const DEMO_INSTALLATIONS: T<"installations">[] = [
  {
    id: "ins-01", workspace_id: W, installation_number: "INS-2025-045",
    delivery_id: "del-01", sales_order_id: null,
    customer_name: "CUBS City Stars Branch", customer_phone: "+20-100-555-1234",
    site_address: "CUBS Warehouse, 10th of Ramadan",
    scheduled_date: d(29), scheduled_time_slot: "08:00-17:00",
    team_leader: "Hassan Younis", team_members: ["Rami Saad", "Omar Hassan"],
    status: "completed",
    checklist: [
      { id: "site_ready", label_en: "Site is ready & clean", passed: true, notes: "" },
      { id: "pieces_check", label_en: "All pieces accounted for", passed: true, notes: "" },
      { id: "no_damage", label_en: "No transport damage", passed: true, notes: "" },
      { id: "level_plumb", label_en: "Rails level and secure", passed: true, notes: "" },
      { id: "doors_drawers", label_en: "Size dividers in place", passed: true, notes: "" },
      { id: "hardware", label_en: "Hangers & tags on all pieces", passed: true, notes: "" },
      { id: "handles", label_en: "Mannequins dressed", passed: true, notes: "" },
      { id: "worktop", label_en: "Price cards placed", passed: true, notes: "" },
      { id: "cleanup", label_en: "Site cleaned after install", passed: true, notes: "" },
      { id: "walkthrough", label_en: "Customer walkthrough done", passed: true, notes: "" },
    ],
    snag_list: [],
    completion_notes: "Display set up before opening.",
    customer_rating: 5, customer_feedback: "Great display, quick team",
    signature_url: null,
    started_at: ts(29), completed_at: ts(29),
    photos: [],
    metadata: {}, created_at: ts(30), updated_at: ts(29),
  },
  {
    id: "ins-02", workspace_id: W, installation_number: "INS-2026-001",
    delivery_id: "del-02", sales_order_id: null,
    customer_name: "Kids Corner Stores", customer_phone: "+20-100-222-1000",
    site_address: "90th Street, New Cairo",
    scheduled_date: d(-2), scheduled_time_slot: "09:00-18:00",
    team_leader: "Hassan Younis", team_members: ["Rami Saad"],
    status: "scheduled",
    checklist: [], snag_list: [],
    completion_notes: null, customer_rating: null, customer_feedback: null, signature_url: null,
    started_at: null, completed_at: null, photos: [],
    metadata: {}, created_at: ts(5), updated_at: ts(2),
  },
];

// ─── Cost Entries ────────────────────────────────────────

export const DEMO_COST_ENTRIES: T<"cost_entries">[] = [
  { id: "ce-01", workspace_id: W, sales_order_id: null, production_order_id: "po-01", cost_type: "material", description: "French terry 320gsm — Sage (540 m)", quantity: 18, unit_cost: 120, total_cost: 2160, currency: "EGP", date: d(30), supplier: "Anatolia Textiles (TR)", notes: null, metadata: {}, created_at: ts(30), updated_at: ts(30) },
  { id: "ce-02", workspace_id: W, sales_order_id: null, production_order_id: "po-01", cost_type: "material", description: "Jersey hood lining (120 m)", quantity: 10, unit_cost: 180, total_cost: 1800, currency: "EGP", date: d(30), supplier: "Anatolia Textiles (TR)", notes: null, metadata: {}, created_at: ts(30), updated_at: ts(30) },
  { id: "ce-03", workspace_id: W, sales_order_id: null, production_order_id: "po-01", cost_type: "material", description: "Rib cuffs & waistband", quantity: 1, unit_cost: 850, total_cost: 850, currency: "EGP", date: d(29), supplier: "Nile Trims", notes: null, metadata: {}, created_at: ts(29), updated_at: ts(29) },
  { id: "ce-04", workspace_id: W, sales_order_id: null, production_order_id: "po-01", cost_type: "hardware", description: "YKK #5 zippers", quantity: 28, unit_cost: 22, total_cost: 616, currency: "EGP", date: d(28), supplier: "YKK Egypt", notes: null, metadata: {}, created_at: ts(28), updated_at: ts(28) },
  { id: "ce-05", workspace_id: W, sales_order_id: null, production_order_id: "po-01", cost_type: "hardware", description: "Woven labels", quantity: 12, unit_cost: 45, total_cost: 540, currency: "EGP", date: d(28), supplier: "YKK Egypt", notes: null, metadata: {}, created_at: ts(28), updated_at: ts(28) },
  { id: "ce-06", workspace_id: W, sales_order_id: null, production_order_id: "po-01", cost_type: "labor", description: "Marker making & grading", quantity: 1, unit_cost: 500, total_cost: 500, currency: "EGP", date: d(27), supplier: null, notes: null, metadata: {}, created_at: ts(27), updated_at: ts(27) },
  { id: "ce-07", workspace_id: W, sales_order_id: null, production_order_id: "po-02", cost_type: "material", description: "Brushed fleece — Navy", quantity: 12, unit_cost: 120, total_cost: 1440, currency: "EGP", date: d(28), supplier: "Anatolia Textiles (TR)", notes: null, metadata: {}, created_at: ts(28), updated_at: ts(28) },
  { id: "ce-08", workspace_id: W, sales_order_id: null, production_order_id: "po-02", cost_type: "hardware", description: "Waistband elastic 30mm", quantity: 3, unit_cost: 350, total_cost: 1050, currency: "EGP", date: d(25), supplier: "Nile Trims", notes: "Delivery delayed 3 days", metadata: {}, created_at: ts(25), updated_at: ts(25) },
  { id: "ce-09", workspace_id: W, sales_order_id: null, production_order_id: "po-03", cost_type: "material", description: "Printed interlock — Bear", quantity: 8, unit_cost: 280, total_cost: 2240, currency: "EGP", date: d(14), supplier: "Delta Knits", notes: null, metadata: {}, created_at: ts(14), updated_at: ts(14) },
  { id: "ce-10", workspace_id: W, sales_order_id: null, production_order_id: "po-03", cost_type: "material", description: "Screen printing (external)", quantity: 4, unit_cost: 800, total_cost: 3200, currency: "EGP", date: d(12), supplier: "Print House Cairo", notes: "External fabrication — 10 day lead", metadata: {}, created_at: ts(12), updated_at: ts(12) },
  { id: "ce-11", workspace_id: W, sales_order_id: null, production_order_id: "po-05", cost_type: "material", description: "Cotton jersey bundle", quantity: 1, unit_cost: 4500, total_cost: 4500, currency: "EGP", date: d(58), supplier: "Anatolia Textiles (TR)", notes: null, metadata: {}, created_at: ts(58), updated_at: ts(58) },
  { id: "ce-12", workspace_id: W, sales_order_id: null, production_order_id: "po-05", cost_type: "hardware", description: "Trims bundle (labels, tags, polybags)", quantity: 1, unit_cost: 2200, total_cost: 2200, currency: "EGP", date: d(55), supplier: "YKK Egypt", notes: null, metadata: {}, created_at: ts(55), updated_at: ts(55) },
];

// ─── Material Requirements ───────────────────────────────

export const DEMO_MATERIAL_REQUIREMENTS: T<"material_requirements">[] = [
  {
    id: "mr-01", workspace_id: W, source_type: "production_order", source_id: "po-01",
    material_name: "French Terry 320gsm — Sage", sku: "FT-320-SAGE",
    quantity_required: 18, quantity_available: 25, quantity_reserved: 18, quantity_to_purchase: 0,
    unit: "sheet", unit_cost: 120, total_cost: 2160, status: "fulfilled",
    purchase_request_id: null, inventory_item_id: null, priority: "high",
    notes: null, metadata: {}, created_at: ts(30), updated_at: ts(30),
  },
  {
    id: "mr-02", workspace_id: W, source_type: "production_order", source_id: "po-01",
    material_name: "Jersey 180gsm — Sage (hood lining)", sku: "JR-180-SAGE",
    quantity_required: 10, quantity_available: 6, quantity_reserved: 6, quantity_to_purchase: 4,
    unit: "sheet", unit_cost: 180, total_cost: 1800, status: "partial",
    purchase_request_id: null, inventory_item_id: null, priority: "high",
    notes: "40 m on order — ETA 3 days", metadata: {}, created_at: ts(30), updated_at: ts(28),
  },
  {
    id: "mr-03", workspace_id: W, source_type: "production_order", source_id: "po-03",
    material_name: "Printed interlock — Bear (2440x1220)", sku: "IL-200-BEAR",
    quantity_required: 8, quantity_available: 3, quantity_reserved: 3, quantity_to_purchase: 5,
    unit: "sheet", unit_cost: 280, total_cost: 2240, status: "partial",
    purchase_request_id: null, inventory_item_id: null, priority: "urgent",
    notes: "Urgent — production starting this week", metadata: {}, created_at: ts(15), updated_at: ts(3),
  },
  {
    id: "mr-04", workspace_id: W, source_type: "production_order", source_id: "po-03",
    material_name: "Screen print — bear chest motif", sku: "SP-BEAR",
    quantity_required: 4, quantity_available: 0, quantity_reserved: 0, quantity_to_purchase: 4,
    unit: "sqm", unit_cost: 800, total_cost: 3200, status: "pending",
    purchase_request_id: null, inventory_item_id: null, priority: "urgent",
    notes: "External printer — 10 day lead time", metadata: {}, created_at: ts(15), updated_at: ts(12),
  },
  {
    id: "mr-05", workspace_id: W, source_type: "production_order", source_id: "po-02",
    material_name: "Sliding Door Tracks 2500mm", sku: "HDW-SDT-2500",
    quantity_required: 3, quantity_available: 0, quantity_reserved: 0, quantity_to_purchase: 3,
    unit: "set", unit_cost: 350, total_cost: 1050, status: "ordered",
    purchase_request_id: null, inventory_item_id: null, priority: "medium",
    notes: "Nile Trims — delayed, ETA this week", metadata: {}, created_at: ts(28), updated_at: ts(8),
  },
  {
    id: "mr-06", workspace_id: W, source_type: "production_order", source_id: "po-04",
    material_name: "Classic Profile Moulding (per meter)", sku: "MOULD-CL-01",
    quantity_required: 25, quantity_available: 0, quantity_reserved: 0, quantity_to_purchase: 25,
    unit: "meter", unit_cost: 35, total_cost: 875, status: "pending",
    purchase_request_id: null, inventory_item_id: null, priority: "low",
    notes: "Not needed until design approval", metadata: {}, created_at: ts(5), updated_at: ts(5),
  },
];

// ─── Activity Events ─────────────────────────────────────

export const DEMO_ACTIVITY_EVENTS: T<"activity_events">[] = [
  { id: "ae-01", workspace_id: W, actor_id: "emp-04", action: "created", entity_type: "design_brief", entity_id: "db-01", description_en: "Created design brief DB-2026-001 for Explorer Hoodie", description_ar: "تم إنشاء ملف تصميم DB-2026-001 لهودي إكسبلورر", metadata: {}, created_at: ts(42) },
  { id: "ae-02", workspace_id: W, actor_id: "emp-01", action: "approved", entity_type: "design_brief", entity_id: "db-01", description_en: "Approved design brief DB-2026-001 (V2)", description_ar: "تم اعتماد ملف تصميم DB-2026-001 (V2)", metadata: {}, created_at: ts(35) },
  { id: "ae-03", workspace_id: W, actor_id: "emp-01", action: "created", entity_type: "production_order", entity_id: "po-01", description_en: "Created production order PO-2026-001 for Explorer Hoodie", description_ar: "تم إنشاء أمر إنتاج PO-2026-001 لهودي إكسبلورر", metadata: {}, created_at: ts(30) },
  { id: "ae-04", workspace_id: W, actor_id: "emp-02", action: "stage_completed", entity_type: "production_order", entity_id: "po-01", description_en: "Cutting stage completed for PO-2026-001", description_ar: "تم اكتمال مرحلة التقطيع لأمر PO-2026-001", metadata: {}, created_at: ts(27) },
  { id: "ae-05", workspace_id: W, actor_id: "emp-09", action: "inspected", entity_type: "qc_inspection", entity_id: "qc-01", description_en: "QC inspection QC-2026-001 passed (score: 92)", description_ar: "فحص الجودة QC-2026-001 ناجح (درجة: 92)", metadata: {}, created_at: ts(18) },
  { id: "ae-06", workspace_id: W, actor_id: "emp-05", action: "delivered", entity_type: "delivery", entity_id: "del-01", description_en: "Delivered to CUBS City Stars Branch (22 cartons)", description_ar: "تم التوصيل لفرع سيتي ستارز (22 كرتونة)", metadata: {}, created_at: ts(30) },
  { id: "ae-07", workspace_id: W, actor_id: "emp-05", action: "installed", entity_type: "installation", entity_id: "ins-01", description_en: "Display set up at City Stars Branch (5★)", description_ar: "تم تجهيز العرض بفرع سيتي ستارز (5★)", metadata: {}, created_at: ts(29) },
  { id: "ae-08", workspace_id: W, actor_id: "emp-04", action: "created", entity_type: "design_brief", entity_id: "db-04", description_en: "Created design brief for Puffer Vest — Olive", description_ar: "تم إنشاء ملف تصميم لفيست بافر", metadata: {}, created_at: ts(7) },
  { id: "ae-09", workspace_id: W, actor_id: "emp-07", action: "created", entity_type: "site_visit", entity_id: "sv-05", description_en: "Scheduled site visit SV-2026-005 for San Stefano franchise", description_ar: "تم جدولة معاينة SV-2026-005 لفرانشايز سان ستيفانو", metadata: {}, created_at: ts(3) },
  { id: "ae-10", workspace_id: W, actor_id: "emp-02", action: "stage_started", entity_type: "production_order", entity_id: "po-03", description_en: "Started cutting for Trail Windbreaker — Mustard", description_ar: "بدء التقطيع لبيجامة ليتل كب", metadata: {}, created_at: ts(3) },
];

// ─── Sales Orders (work_items type=sales_order) ──────────

export const DEMO_SALES_ORDERS: T<"work_items">[] = [
  {
    id: "so-01", workspace_id: W,
    title_en: "SO-2026-00012 — Kids Corner Stores", title_ar: "أمر بيع — كيدز كورنر",
    type: "sales_order", status: "in_progress", priority: "high",
    assignee_id: "emp-07", parent_id: null, organization_id: "o02",
    due_date: d(10), progress: 65, tags: ["wholesale", "autumn"],
    doc_number: "SO-2026-00012",
    metadata: {
      so_number: "SO-2026-00012", customer_type: "company",
      customer_id: "o02", customer_name: "Kids Corner Stores",
      contact_person: "Nadine Farid", phone: "+20-100-222-1000",
      email: "buying@kidscorner.eg", address: "90th Street, New Cairo",
      city: "Cairo", company_name: "Kids Corner Stores",
      project_name: "Autumn wholesale drop",
      priority: "high",
      items: [
        { id: "soi-01", product_name: "Explorer Zip Hoodie — Sage", description: "French terry 320gsm, sizes 2Y–12Y", qty: 600, unitPrice: 420, material: "French Terry 320gsm", color: "Sage" },
        { id: "soi-02", product_name: "Adventure Jogger — Navy", description: "Brushed fleece, elastic waist, sizes 2Y–12Y", qty: 400, unitPrice: 310, material: "Brushed Fleece 280gsm", color: "Navy" },
      ],
      tax_rate: 14, currency: "EGP",
      customer_confirmed: true, design_approved: true, materials_available: true, deposit_received: true,
      total_amount: 428640, estimated_days: 35,
      manufacturing_route: "pattern → cutting → sewing → finishing → qc → packing",
    },
    created_at: ts(45), updated_at: ts(2),
  },
  {
    id: "so-02", workspace_id: W,
    title_en: "SO-2026-00014 — Little Steps Boutique", title_ar: "أمر بيع — ليتل ستبس",
    type: "sales_order", status: "approved", priority: "urgent",
    assignee_id: "emp-07", parent_id: null, organization_id: "o03",
    due_date: d(5), progress: 30, tags: ["boutique"],
    doc_number: "SO-2026-00014",
    metadata: {
      so_number: "SO-2026-00014", customer_type: "company",
      customer_id: "o03", customer_name: "Little Steps Boutique",
      contact_person: "Hana Mostafa", phone: "+20-122-333-2000",
      email: "hana@littlesteps.eg", address: "Road 9, Maadi",
      city: "Cairo", company_name: "Little Steps Boutique",
      project_name: "Pyjama & windbreaker restock",
      priority: "urgent",
      items: [
        { id: "soi-03", product_name: "Little Cub Pyjama Set — Bear Print", description: "Printed interlock 200gsm, sizes 1Y–8Y", qty: 150, unitPrice: 260, material: "Printed Interlock 200gsm", color: "Bear print" },
        { id: "soi-04", product_name: "Trail Windbreaker — Mustard", description: "Water-repellent shell, mesh lining", qty: 80, unitPrice: 390, material: "Nylon Taslan", color: "Mustard" },
        { id: "soi-05", product_name: "Everyday Tee 3-Pack", description: "Combed cotton jersey 180gsm", qty: 60, unitPrice: 210, material: "Cotton Jersey 180gsm", color: "White/Grey/Sage" },
      ],
      tax_rate: 0, currency: "EGP",
      customer_confirmed: true, design_approved: true, materials_available: false, deposit_received: true,
      total_amount: 82800, estimated_days: 21,
    },
    created_at: ts(30), updated_at: ts(1),
  },
  {
    id: "so-03", workspace_id: W,
    title_en: "SO-2026-00015 — Mini Me Online", title_ar: "أمر بيع — ميني مي",
    type: "sales_order", status: "draft", priority: "medium",
    assignee_id: "emp-07", parent_id: null, organization_id: null,
    due_date: d(-20), progress: 10, tags: ["online"],
    doc_number: "SO-2026-00015",
    metadata: {
      so_number: "SO-2026-00015", customer_type: "company",
      customer_name: "Mini Me Online", contact_person: "Karim Samy", phone: "+20-111-888-5555",
      address: "Smart Village, Giza", city: "Giza",
      project_name: "Winter capsule",
      priority: "medium",
      items: [
        { id: "soi-06", product_name: "Puffer Vest — Olive", description: "Recycled fill, snap front", qty: 300, unitPrice: 450, material: "Nylon + recycled fill", color: "Olive" },
        { id: "soi-07", product_name: "Rib Beanie", description: "Acrylic rib knit, embroidered cub", qty: 300, unitPrice: 95, material: "Acrylic rib", color: "Oat" },
      ],
      tax_rate: 14, currency: "EGP",
      customer_confirmed: false, design_approved: false, materials_available: false, deposit_received: false,
      total_amount: 186390, estimated_days: 40,
    },
    created_at: ts(10), updated_at: ts(2),
  },
  {
    id: "so-04", workspace_id: W,
    title_en: "SO-2026-00009 — Kids Corner Stores", title_ar: "أمر بيع — كيدز كورنر",
    type: "sales_order", status: "done", priority: "high",
    assignee_id: "emp-07", parent_id: null, organization_id: "o02",
    due_date: d(35), progress: 100, tags: ["wholesale", "summer"],
    doc_number: "SO-2026-00009",
    metadata: {
      so_number: "SO-2026-00009", customer_type: "company",
      customer_id: "o02", customer_name: "Kids Corner Stores", contact_person: "Nadine Farid",
      phone: "+20-100-222-1000", address: "90th Street, New Cairo", city: "Cairo",
      project_name: "Summer tees",
      priority: "high",
      items: [
        { id: "soi-09", product_name: "Everyday Tee 3-Pack", description: "Combed cotton jersey 180gsm", qty: 1500, unitPrice: 210, material: "Cotton Jersey 180gsm", color: "Assorted" },
      ],
      tax_rate: 0, currency: "EGP",
      customer_confirmed: true, design_approved: true, materials_available: true, deposit_received: true,
      total_amount: 315000, estimated_days: 30,
    },
    created_at: ts(70), updated_at: ts(29),
  },
];

// ─── Quotations (work_items type=quotation) ──────────────

export const DEMO_QUOTATIONS: T<"work_items">[] = [
  {
    id: "qt-01", workspace_id: W,
    title_en: "Quotation — Kids Corner autumn drop", title_ar: "عرض سعر — كيدز كورنر",
    type: "quotation", status: "converted", priority: "high",
    assignee_id: "emp-07", parent_id: null, organization_id: "o02",
    due_date: null, progress: 100, tags: ["wholesale"],
    doc_number: "QT-2026-00021",
    metadata: {
      quotation_number: "QT-2026-00021", customer_id: "o02",
      customer_name: "Kids Corner Stores", contact_person: "Nadine Farid",
      quotation_date: d(50), validity_date: d(20),
      project_name: "Autumn wholesale drop",
      items: [
        { id: "qi-01", product: "Explorer Zip Hoodie — Sage", description: "French terry 320gsm, sizes 2Y–12Y", qty: 600, unitPrice: 420 },
        { id: "qi-02", product: "Adventure Jogger — Navy", description: "Brushed fleece, sizes 2Y–12Y", qty: 400, unitPrice: 310 },
      ],
      tax_rate: 14, currency: "EGP",
      converted_to: "so-01", converted_to_number: "SO-2026-00012",
    },
    created_at: ts(50), updated_at: ts(45),
  },
  {
    id: "qt-02", workspace_id: W,
    title_en: "Quotation — Little Steps restock", title_ar: "عرض سعر — ليتل ستبس",
    type: "quotation", status: "approved", priority: "urgent",
    assignee_id: "emp-07", parent_id: null, organization_id: "o03",
    due_date: null, progress: 100, tags: ["boutique"],
    doc_number: "QT-2026-00024",
    metadata: {
      quotation_number: "QT-2026-00024", customer_id: "o03",
      customer_name: "Little Steps Boutique", contact_person: "Hana Mostafa",
      quotation_date: d(35), validity_date: d(5),
      project_name: "Pyjama & windbreaker restock",
      items: [
        { id: "qi-03", product: "Little Cub Pyjama Set — Bear Print", description: "Printed interlock 200gsm", qty: 150, unitPrice: 260 },
        { id: "qi-04", product: "Trail Windbreaker — Mustard", description: "Water-repellent shell", qty: 80, unitPrice: 390 },
        { id: "qi-05", product: "Everyday Tee 3-Pack", description: "Combed cotton jersey", qty: 60, unitPrice: 210, discount: 5, discountType: "pct" },
      ],
      tax_rate: 0, currency: "EGP",
    },
    created_at: ts(35), updated_at: ts(30),
  },
  {
    id: "qt-03", workspace_id: W,
    title_en: "Quotation — Mini Me winter capsule", title_ar: "عرض سعر — ميني مي",
    type: "quotation", status: "sent", priority: "medium",
    assignee_id: "emp-07", parent_id: null, organization_id: null,
    due_date: null, progress: 50, tags: ["online"],
    doc_number: "QT-2026-00026",
    metadata: {
      quotation_number: "QT-2026-00026",
      customer_name: "Mini Me Online", contact_person: "Karim Samy",
      quotation_date: d(8), validity_date: d(-22),
      project_name: "Winter capsule",
      items: [
        { id: "qi-06", product: "Puffer Vest — Olive", description: "Recycled fill, snap front", qty: 300, unitPrice: 450 },
        { id: "qi-07", product: "Rib Beanie", description: "Embroidered cub", qty: 300, unitPrice: 95 },
      ],
      order_discount: 3, order_discount_type: "pct", tax_rate: 14, currency: "EGP",
    },
    created_at: ts(8), updated_at: ts(8),
  },
  {
    id: "qt-04", workspace_id: W,
    title_en: "Quotation — School uniform polos", title_ar: "عرض سعر — بولو مدرسي",
    type: "quotation", status: "draft", priority: "low",
    assignee_id: "emp-07", parent_id: null, organization_id: "o02",
    due_date: null, progress: 0, tags: ["uniform"],
    doc_number: "QT-2026-00027",
    metadata: {
      quotation_number: "QT-2026-00027", customer_id: "o02",
      customer_name: "Kids Corner Stores", contact_person: "Nadine Farid",
      quotation_date: d(2), validity_date: d(-28),
      project_name: "Back-to-school polos",
      items: [
        { id: "qi-09", product: "Piqué Polo — White", description: "Cotton piqué 220gsm, embroidered crest", qty: 1000, unitPrice: 175 },
      ],
      tax_rate: 14, currency: "EGP",
    },
    created_at: ts(2), updated_at: ts(2),
  },
];

// ─── Purchase Requests & Orders (work_items) ─────────────

export const DEMO_PURCHASE_ITEMS: T<"work_items">[] = [
  {
    id: "pr-01", workspace_id: W,
    title_en: "YKK zippers for Explorer hoodies", title_ar: "سوست YKK لهوديز إكسبلورر",
    type: "purchase_request", status: "approved", priority: "high",
    assignee_id: "emp-10", parent_id: null, organization_id: "vendor-04",
    due_date: d(2), progress: 100, tags: ["purchasing"],
    doc_number: "PR-2026-00031",
    metadata: {
      pr_number: "PR-2026-00031", vendor_id: "vendor-04", vendor_name: "YKK Egypt",
      lines: [{ id: "l1", name: "YKK #5 vislon zipper 35cm — Sage", qty: 650, unit: "pcs", unitPrice: 14 }],
      estimated_amount: 9100, department: "Production", currency: "EGP",
      approved_by: "Ahmad Khalil", approved_at: ts(5),
    },
    created_at: ts(7), updated_at: ts(5),
  },
  {
    id: "pr-02", workspace_id: W,
    title_en: "Printed interlock for pyjama sets", title_ar: "قماش إنترلوك مطبوع للبيجامات",
    type: "purchase_request", status: "submitted", priority: "urgent",
    assignee_id: "emp-10", parent_id: null, organization_id: "vendor-02",
    due_date: d(1), progress: 50, tags: ["purchasing"],
    doc_number: "PR-2026-00033",
    metadata: {
      pr_number: "PR-2026-00033", vendor_id: "vendor-02", vendor_name: "Delta Knits",
      lines: [{ id: "l1", name: "Printed Interlock 200gsm — Bear", qty: 420, unit: "m", unitPrice: 95 }],
      estimated_amount: 39900, department: "Production", currency: "EGP",
    },
    created_at: ts(4), updated_at: ts(3),
  },
  {
    id: "pr-03", workspace_id: W,
    title_en: "Woven labels & swing tags", title_ar: "ليبل منسوج وتاجات",
    type: "purchase_request", status: "draft", priority: "medium",
    assignee_id: "emp-10", parent_id: null, organization_id: "vendor-05",
    due_date: d(-5), progress: 0, tags: ["purchasing"],
    doc_number: "PR-2026-00034",
    metadata: {
      pr_number: "PR-2026-00034", vendor_id: "vendor-05", vendor_name: "LabelTech Cairo",
      lines: [
        { id: "l1", name: "Woven main label — CUBS", qty: 3000, unit: "pcs", unitPrice: 1.2 },
        { id: "l2", name: "Swing tag with string", qty: 3000, unit: "pcs", unitPrice: 0.9 },
      ],
      estimated_amount: 6300, department: "Production", currency: "EGP",
    },
    created_at: ts(2), updated_at: ts(2),
  },
  {
    id: "po-p01", workspace_id: W,
    title_en: "French terry — Sage (imported)", title_ar: "فرنش تيري — سيج (مستورد)",
    type: "purchase_order", status: "received", priority: "high",
    assignee_id: "emp-10", parent_id: null, organization_id: "vendor-01",
    due_date: d(25), progress: 100, tags: ["purchasing"],
    doc_number: "PO-2026-00018",
    metadata: {
      po_number: "PO-2026-00018", vendor_id: "vendor-01", vendor_name: "Anatolia Textiles (TR)",
      lines: [{ id: "l1", name: "French Terry 320gsm — Sage", qty: 900, unit: "m", unitPrice: 118, received: 900 }],
      receipts: [{ number: "GRN-2026-00011", received_at: ts(28), received_by: "Omar Salah", supplier_ref: "AT-5521", lines: [{ name: "French Terry 320gsm — Sage", qty: 900, unit: "m", ordered: 900 }] }],
      tax_rate: 14, estimated_amount: 121068, payment_terms: "30% advance, 70% on B/L", currency: "EGP",
    },
    created_at: ts(32), updated_at: ts(28),
  },
  {
    id: "po-p02", workspace_id: W,
    title_en: "Rib & elastic trims", title_ar: "ريب وأستك",
    type: "purchase_order", status: "partially_received", priority: "medium",
    assignee_id: "emp-10", parent_id: null, organization_id: "vendor-03",
    due_date: d(4), progress: 60, tags: ["purchasing"],
    doc_number: "PO-2026-00021",
    metadata: {
      po_number: "PO-2026-00021", vendor_id: "vendor-03", vendor_name: "Nile Trims",
      lines: [
        { id: "l1", name: "Waistband elastic 30mm", qty: 1200, unit: "m", unitPrice: 6.5, received: 1200 },
        { id: "l2", name: "1x1 rib 220gsm — Navy", qty: 300, unit: "m", unitPrice: 72, received: 120 },
      ],
      receipts: [{ number: "GRN-2026-00014", received_at: ts(3), received_by: "Omar Salah", lines: [{ name: "Waistband elastic 30mm", qty: 1200, unit: "m", ordered: 1200 }, { name: "1x1 rib 220gsm — Navy", qty: 120, unit: "m", ordered: 300 }] }],
      tax_rate: 14, estimated_amount: 33516, payment_terms: "Net 30", currency: "EGP",
    },
    created_at: ts(12), updated_at: ts(3),
  },
  {
    id: "po-p03", workspace_id: W,
    title_en: "Polybags & shipping cartons", title_ar: "أكياس وكراتين شحن",
    type: "purchase_order", status: "sent", priority: "medium",
    assignee_id: "emp-10", parent_id: null, organization_id: "vendor-06",
    due_date: d(6), progress: 20, tags: ["purchasing"],
    doc_number: "PO-2026-00023",
    metadata: {
      po_number: "PO-2026-00023", vendor_id: "vendor-06", vendor_name: "Cairo Pack",
      lines: [
        { id: "l1", name: "Resealable polybag 30x40", qty: 5000, unit: "pcs", unitPrice: 1.1, received: 0 },
        { id: "l2", name: "5-ply carton 60x40x40", qty: 250, unit: "pcs", unitPrice: 18, received: 0 },
      ],
      receipts: [], tax_rate: 14, estimated_amount: 11400, payment_terms: "Cash on delivery", currency: "EGP",
    },
    created_at: ts(5), updated_at: ts(4),
  },
];

// ─── Vendor Organizations ────────────────────────────────

export const DEMO_VENDORS: T<"organizations">[] = [
  {
    id: "vendor-01", workspace_id: W, name_en: "Anatolia Textiles (TR)", name_ar: "أناتوليا للنسيج",
    type: "company", status: "active", industry: "Fabric — imported",
    website: null, email: "export@anatoliatex.com.tr", phone: "+90-212-400-1000",
    tags: ["vendor"], metadata: { org_type: "vendor", vendor_category: "material", payment_terms: "30% advance", country: "Turkey", city: "Istanbul", notes: "French terry and fleece. 25-day lead time plus shipping." },
    created_at: ts(365), updated_at: ts(30),
  },
  {
    id: "vendor-02", workspace_id: W, name_en: "Delta Knits", name_ar: "دلتا للتريكو",
    type: "company", status: "active", industry: "Fabric — local",
    website: null, email: "sales@deltaknits.eg", phone: "+20-40-400-2000",
    tags: ["vendor"], metadata: { org_type: "vendor", vendor_category: "material", payment_terms: "Net 15", country: "Egypt", city: "Mahalla", notes: "Jersey, interlock and printing." },
    created_at: ts(300), updated_at: ts(14),
  },
  {
    id: "vendor-03", workspace_id: W, name_en: "Nile Trims", name_ar: "النيل للإكسسوار",
    type: "company", status: "active", industry: "Trims",
    website: null, email: "orders@niletrims.eg", phone: "+20-2-400-3000",
    tags: ["vendor"], metadata: { org_type: "vendor", vendor_category: "material", payment_terms: "Net 30", country: "Egypt", city: "Cairo", notes: "Elastic, rib, drawcords." },
    created_at: ts(200), updated_at: ts(12),
  },
  {
    id: "vendor-04", workspace_id: W, name_en: "YKK Egypt", name_ar: "واي كي كي مصر",
    type: "company", status: "active", industry: "Trims",
    website: "https://ykk.com", email: "egypt@ykk.com", phone: "+20-2-400-4000",
    tags: ["vendor"], metadata: { org_type: "vendor", vendor_category: "material", payment_terms: "Net 30", country: "Egypt", city: "Cairo", notes: "Zippers and snaps. MOQ 500 per colour." },
    created_at: ts(365), updated_at: ts(27),
  },
  {
    id: "vendor-05", workspace_id: W, name_en: "LabelTech Cairo", name_ar: "ليبل تك",
    type: "company", status: "active", industry: "Labels & packaging",
    website: null, email: "hello@labeltech.eg", phone: "+20-2-400-5000",
    tags: ["vendor"], metadata: { org_type: "vendor", vendor_category: "material", payment_terms: "50% advance", country: "Egypt", city: "Cairo", notes: "Woven labels, care labels, swing tags." },
    created_at: ts(300), updated_at: ts(8),
  },
  {
    id: "vendor-06", workspace_id: W, name_en: "Cairo Pack", name_ar: "كايرو باك",
    type: "company", status: "active", industry: "Packaging",
    website: null, email: "sales@cairopack.eg", phone: "+20-2-400-6000",
    tags: ["vendor"], metadata: { org_type: "vendor", vendor_category: "material", payment_terms: "Cash on delivery", country: "Egypt", city: "Cairo", notes: "Polybags and cartons." },
    created_at: ts(250), updated_at: ts(29),
  },
] as unknown as T<"organizations">[];

// ─── Inventory Resources ─────────────────────────────────

export const DEMO_INVENTORY: T<"resources">[] = [
  // Inventory items (raw materials in stock)
  {
    id: "inv-01", workspace_id: W, name_en: "Cotton Poplin — White", name_ar: "قماش كoton أبيض",
    type: "inventory", utilization: 72, department: "warehouse", skills: ["inventory"],
    metadata: { category: "fabric", sku: "COT-WHT-001", quantity: 120, reorder_level: 50, unit_cost: 35, vendor_name: "Egyptian Cotton Co.", location: "Fabric Rack A1", inv_status: "in_stock" },
    created_at: ts(365), updated_at: ts(2),
  },
  {
    id: "inv-02", workspace_id: W, name_en: "Silk Charmeuse — Ivory", name_ar: "حرير شاموز عاجي",
    type: "inventory", utilization: 33, department: "warehouse", skills: ["inventory"],
    metadata: { category: "fabric", sku: "SLK-IVR-001", quantity: 45, reorder_level: 30, unit_cost: 300, vendor_name: "Premium Textiles", location: "Fabric Rack A2", inv_status: "in_stock" },
    created_at: ts(365), updated_at: ts(5),
  },
  {
    id: "inv-03", workspace_id: W, name_en: "Wool Blend — Charcoal", name_ar: "خليط صوف فحمي",
    type: "inventory", utilization: 25, department: "warehouse", skills: ["inventory"],
    metadata: { category: "fabric", sku: "WOL-CHR-001", quantity: 60, reorder_level: 40, unit_cost: 180, vendor_name: "Anatolia Textiles (TR)", location: "Fabric Rack A3", inv_status: "in_stock" },
    created_at: ts(300), updated_at: ts(3),
  },
  {
    id: "inv-04", workspace_id: W, name_en: "Invisible Zipper 50cm", name_ar: "سحاب خفي 50سم",
    type: "inventory", utilization: 60, department: "warehouse", skills: ["inventory"],
    metadata: { category: "trims", sku: "ZIP-INV-50", quantity: 200, reorder_level: 80, unit_cost: 12, vendor_name: "YKK Egypt", location: "Trims Shelf B1", inv_status: "in_stock" },
    created_at: ts(200), updated_at: ts(10),
  },
  {
    id: "inv-05", workspace_id: W, name_en: "Shoulder Pads — Standard", name_ar: "وسائد كتف — قياسي",
    type: "inventory", utilization: 45, department: "warehouse", skills: ["inventory"],
    metadata: { category: "trims", sku: "SP-STD-001", quantity: 100, reorder_level: 40, unit_cost: 8, vendor_name: "Trim Supply", location: "Trims Shelf C1", inv_status: "in_stock" },
    created_at: ts(365), updated_at: ts(7),
  },
  {
    id: "inv-06", workspace_id: W, name_en: "Sewing Thread — Black", name_ar: "خيط خياطة — أسود",
    type: "inventory", utilization: 50, department: "warehouse", skills: ["inventory"],
    metadata: { category: "trims", sku: "THR-BLK-001", quantity: 50, reorder_level: 20, unit_cost: 15, vendor_name: "Gutermann", location: "Trims Shelf C2", inv_status: "in_stock" },
    created_at: ts(300), updated_at: ts(8),
  },
  {
    id: "inv-07", workspace_id: W, name_en: "Tulle — White 3m roll", name_ar: "تول — أبيض 3م",
    type: "inventory", utilization: 0, department: "warehouse", skills: ["inventory"],
    metadata: { category: "fabric", sku: "TUL-WHT-003", quantity: 25, reorder_level: 15, unit_cost: 40, vendor_name: "Bridal Fabrics", location: "Fabric Shelf D1", inv_status: "in_stock" },
    created_at: ts(100), updated_at: ts(29),
  },
  {
    id: "inv-08", workspace_id: W, name_en: "Lace Trim — 5m roll", name_ar: "شرائط كرنش — 5م",
    type: "inventory", utilization: 70, department: "warehouse", skills: ["inventory"],
    metadata: { category: "trims", sku: "LAC-TRM-005", quantity: 35, reorder_level: 15, unit_cost: 65, vendor_name: "French Laces", location: "Trims Shelf B3", inv_status: "in_stock" },
    created_at: ts(180), updated_at: ts(15),
  },
  {
    id: "inv-09", workspace_id: W, name_en: "Cotton Jersey — Navy", name_ar: "جيرسي قطن — كحلي",
    type: "inventory", utilization: 55, department: "warehouse", skills: ["inventory"],
    metadata: { category: "fabric", sku: "JRS-NVY-001", quantity: 80, reorder_level: 30, unit_cost: 50, vendor_name: "Egyptian Cotton Co.", location: "Fabric Floor D2", inv_status: "in_stock" },
    created_at: ts(150), updated_at: ts(4),
  },
  {
    id: "inv-10", workspace_id: W, name_en: "Buttons — Horn (bag of 50)", name_ar: "أزرار — قرن (كيس 50)",
    type: "inventory", utilization: 40, department: "warehouse", skills: ["inventory"],
    metadata: { category: "trims", sku: "BTN-HRN-050", quantity: 15, reorder_level: 5, unit_cost: 45, vendor_name: "Button World", location: "Trims Shelf B4", inv_status: "in_stock" },
    created_at: ts(120), updated_at: ts(9),
  },
  // Assets (atelier equipment)
  {
    id: "ast-01", workspace_id: W, name_en: "Industrial Sewing Machine — Juki DDL-9000C", name_ar: "ماكينة خياطة جوكي DDL-9000C",
    type: "equipment", utilization: 85, department: "production", skills: ["asset"],
    metadata: { category: "machinery", asset_tag: "AST-SMN-001", assigned_to: "Youssef Ali", assigned_dept: "sewing", purchase_date: d(730), purchase_cost: 85000, current_value: 65000, condition: "good", warranty_expiry: d(-365), asset_status: "in_use", useful_life_years: 10, salvage_value: 10000 },
    created_at: ts(730), updated_at: ts(1),
  },
  {
    id: "ast-02", workspace_id: W, name_en: "Overlock Machine — Pegasus M500", name_ar: "ماكينة سيروfiler بيغاسوس",
    type: "equipment", utilization: 70, department: "production", skills: ["asset"],
    metadata: { category: "machinery", asset_tag: "AST-OVL-001", assigned_to: "Salman Rizq", assigned_dept: "sewing", purchase_date: d(540), purchase_cost: 65000, current_value: 50000, condition: "good", warranty_expiry: d(-180), asset_status: "in_use", useful_life_years: 10, salvage_value: 8000 },
    created_at: ts(540), updated_at: ts(3),
  },
  {
    id: "ast-03", workspace_id: W, name_en: "Fabric Cutting Table — Gerber Cutter", name_ar: "طاولة تقطيع جيربر",
    type: "equipment", utilization: 75, department: "production", skills: ["asset"],
    metadata: { category: "machinery", asset_tag: "AST-CTT-001", assigned_to: "Omar Hassan", assigned_dept: "cutting", purchase_date: d(900), purchase_cost: 120000, current_value: 80000, condition: "fair", warranty_expiry: d(-600), asset_status: "in_use", useful_life_years: 8, salvage_value: 15000 },
    created_at: ts(900), updated_at: ts(5),
  },
  {
    id: "ast-04", workspace_id: W, name_en: "Steam Press — Veit 8362", name_ar: "ماكينة كوي فايت",
    type: "equipment", utilization: 60, department: "production", skills: ["asset"],
    metadata: { category: "machinery", asset_tag: "AST-PRS-001", assigned_to: "Khaled Mansour", assigned_dept: "finishing", purchase_date: d(400), purchase_cost: 45000, current_value: 35000, condition: "good", warranty_expiry: d(-35), asset_status: "in_use", useful_life_years: 12, salvage_value: 5000 },
    created_at: ts(400), updated_at: ts(2),
  },
  {
    id: "ast-05", workspace_id: W, name_en: "Delivery Van — Ford Transit", name_ar: "فان توصيل — فورد ترانزيت",
    type: "vehicle", utilization: 40, department: "shipping", skills: ["asset"],
    metadata: { category: "vehicle", asset_tag: "AST-VAN-001", assigned_to: "Hassan Younis", assigned_dept: "shipping", purchase_date: d(500), purchase_cost: 95000, current_value: 65000, condition: "good", warranty_expiry: d(-200), asset_status: "in_use", useful_life_years: 7, salvage_value: 20000 },
    created_at: ts(500), updated_at: ts(30),
  },
];

// ─── Stock movements + maintenance (work_items) ──────────
// 30 days of in/out movements referencing DEMO_INVENTORY ids,
// so the Inventory movement-trend chart has real data in demo mode.

export const DEMO_STOCK_MOVEMENTS: T<"work_items">[] = [
  {
    id: "mov-01", workspace_id: W,
    title_en: "Stock In: French Terry — Sage (20)", title_ar: "إضافة للمخزون: فرنش تيري سيج (20)",
    type: "stock_movement", status: "done", priority: "medium",
    assignee_id: "emp-10", parent_id: null, organization_id: null,
    due_date: null, progress: 100, tags: ["inventory"],
    metadata: { resource_id: "inv-01", resource_name: "French Terry 320gsm — Sage", move_qty: 20, move_type: "stock_in", from_location: null, to_location: "Fabric Rack A1", reason: "PO PUR-2025-088 received" },
    created_at: ts(28), updated_at: ts(28),
  },
  {
    id: "mov-02", workspace_id: W,
    title_en: "Stock Out: French Terry — Sage (8)", title_ar: "صرف من المخزون: فرنش تيري سيج (8)",
    type: "stock_movement", status: "done", priority: "medium",
    assignee_id: "emp-04", parent_id: null, organization_id: null,
    due_date: null, progress: 100, tags: ["inventory"],
    metadata: { resource_id: "inv-01", resource_name: "French Terry 320gsm — Sage", move_qty: 8, move_type: "stock_out", from_location: "Fabric Rack A1", to_location: null, reason: "Issued to PO-2026-001 cutting" },
    created_at: ts(24), updated_at: ts(24),
  },
  {
    id: "mov-03", workspace_id: W,
    title_en: "Stock Out: YKK Zippers (12)", title_ar: "صرف من المخزون: سوست YKK (12)",
    type: "stock_movement", status: "done", priority: "medium",
    assignee_id: "emp-05", parent_id: null, organization_id: null,
    due_date: null, progress: 100, tags: ["inventory"],
    metadata: { resource_id: "inv-05", resource_name: "YKK #5 Zipper 35cm", move_qty: 12, move_type: "stock_out", from_location: "Trims Shelf C1", to_location: null, reason: "Issued to PO-2026-001 sewing" },
    created_at: ts(20), updated_at: ts(20),
  },
  {
    id: "mov-04", workspace_id: W,
    title_en: "Stock In: Waistband Elastic (30)", title_ar: "إضافة للمخزون: أستك وسط (30)",
    type: "stock_movement", status: "done", priority: "medium",
    assignee_id: "emp-10", parent_id: null, organization_id: null,
    due_date: null, progress: 100, tags: ["inventory"],
    metadata: { resource_id: "inv-06", resource_name: "Waistband Elastic 30mm", move_qty: 30, move_type: "stock_in", from_location: null, to_location: "Trims Shelf C2", reason: "PO PUR-2026-002 received" },
    created_at: ts(16), updated_at: ts(16),
  },
  {
    id: "mov-05", workspace_id: W,
    title_en: "Stock Out: Woven Labels (3)", title_ar: "صرف من المخزون: ليبل منسوج (3)",
    type: "stock_movement", status: "done", priority: "medium",
    assignee_id: "emp-04", parent_id: null, organization_id: null,
    due_date: null, progress: 100, tags: ["inventory"],
    metadata: { resource_id: "inv-04", resource_name: "Woven Label — CUBS", move_qty: 3, move_type: "stock_out", from_location: "Trims Shelf B1", to_location: null, reason: "Issued to PO-2026-002 edging" },
    created_at: ts(12), updated_at: ts(12),
  },
  {
    id: "mov-06", workspace_id: W,
    title_en: "Stock Out: Jersey — Sage (4)", title_ar: "صرف من المخزون: جيرسي سيج (4)",
    type: "stock_movement", status: "done", priority: "high",
    assignee_id: "emp-04", parent_id: null, organization_id: null,
    due_date: null, progress: 100, tags: ["inventory"],
    metadata: { resource_id: "inv-02", resource_name: "Jersey 180gsm — Sage", move_qty: 4, move_type: "stock_out", from_location: "Fabric Rack A2", to_location: null, reason: "Issued to PO-2026-001 finishing" },
    created_at: ts(8), updated_at: ts(8),
  },
  {
    id: "mov-07", workspace_id: W,
    title_en: "Stock Out: Rib — Navy (2)", title_ar: "صرف من المخزون: ريب كحلي (2)",
    type: "stock_movement", status: "done", priority: "high",
    assignee_id: "emp-05", parent_id: null, organization_id: null,
    due_date: null, progress: 100, tags: ["inventory"],
    metadata: { resource_id: "inv-07", resource_name: "Rib 1x1 — Navy", move_qty: 2, move_type: "stock_out", from_location: "Fabric Rack D1", to_location: null, reason: "Issued to PO-2025-098 — stock depleted" },
    created_at: ts(29), updated_at: ts(29),
  },
  {
    id: "mov-08", workspace_id: W,
    title_en: "Stock In: Polybags (10)", title_ar: "إضافة للمخزون: أكياس (10)",
    type: "stock_movement", status: "done", priority: "medium",
    assignee_id: "emp-10", parent_id: null, organization_id: null,
    due_date: null, progress: 100, tags: ["inventory"],
    metadata: { resource_id: "inv-08", resource_name: "Polybag 30x40", move_qty: 10, move_type: "stock_in", from_location: null, to_location: "Packing Shelf B3", reason: "PO PUR-2026-002 received" },
    created_at: ts(15), updated_at: ts(15),
  },
  {
    id: "mov-09", workspace_id: W,
    title_en: "Adjustment: Printed Interlock (-1)", title_ar: "تعديل: إنترلوك مطبوع (-1)",
    type: "stock_movement", status: "done", priority: "low",
    assignee_id: "emp-10", parent_id: null, organization_id: null,
    due_date: null, progress: 100, tags: ["inventory"],
    metadata: { resource_id: "inv-03", resource_name: "Printed interlock — Bear", move_qty: 1, move_type: "adjustment", from_location: null, to_location: null, reason: "Misprinted metre written off after QC" },
    created_at: ts(6), updated_at: ts(6),
  },
  {
    id: "mov-10", workspace_id: W,
    title_en: "Stock Out: YKK Zippers (6)", title_ar: "صرف من المخزون: سوست YKK (6)",
    type: "stock_movement", status: "done", priority: "medium",
    assignee_id: "emp-05", parent_id: null, organization_id: null,
    due_date: null, progress: 100, tags: ["inventory"],
    metadata: { resource_id: "inv-05", resource_name: "YKK #5 Zipper 35cm", move_qty: 6, move_type: "stock_out", from_location: "Trims Shelf C1", to_location: null, reason: "Issued to PO-2026-002 sewing" },
    created_at: ts(3), updated_at: ts(3),
  },
  {
    id: "mov-11", workspace_id: W,
    title_en: "Stock In: Woven Labels (5)", title_ar: "إضافة للمخزون: ليبل منسوج (5)",
    type: "stock_movement", status: "done", priority: "medium",
    assignee_id: "emp-10", parent_id: null, organization_id: null,
    due_date: null, progress: 100, tags: ["inventory"],
    metadata: { resource_id: "inv-04", resource_name: "Woven Label — CUBS", move_qty: 5, move_type: "stock_in", from_location: null, to_location: "Trims Shelf B1", reason: "PO PUR-2026-001 received" },
    created_at: ts(2), updated_at: ts(2),
  },
  {
    id: "mov-12", workspace_id: W,
    title_en: "Stock Out: French Terry — Sage (5)", title_ar: "صرف من المخزون: فرنش تيري سيج (5)",
    type: "stock_movement", status: "done", priority: "medium",
    assignee_id: "emp-04", parent_id: null, organization_id: null,
    due_date: null, progress: 100, tags: ["inventory"],
    metadata: { resource_id: "inv-01", resource_name: "French Terry 320gsm — Sage", move_qty: 5, move_type: "stock_out", from_location: "Fabric Rack A1", to_location: null, reason: "Issued to PO-2026-003 cutting" },
    created_at: ts(1), updated_at: ts(1),
  },
];

export const DEMO_MAINTENANCE: T<"work_items">[] = [
  {
    id: "mnt-01", workspace_id: W,
    title_en: "Preventive: Juki Overlock MO-6816", title_ar: "صيانة وقائية: ماكينة أوفرلوك",
    type: "maintenance", status: "planned", priority: "high",
    assignee_id: "emp-03", parent_id: null, organization_id: null,
    due_date: d(-4), progress: 0, tags: ["maintenance"],
    metadata: { resource_id: "ast-01", resource_name: "Juki Overlock MO-6816", maint_type: "preventive", cost: 3500, vendor_name: "Juki Service Egypt", notes: "Quarterly looper timing + oiling", completed_date: null },
    created_at: ts(10), updated_at: ts(10),
  },
  {
    id: "mnt-02", workspace_id: W,
    title_en: "Repair: Tajima Embroidery Machine", title_ar: "إصلاح: ماكينة التطريز",
    type: "maintenance", status: "in_progress", priority: "urgent",
    assignee_id: "emp-03", parent_id: null, organization_id: null,
    due_date: d(-1), progress: 60, tags: ["maintenance"],
    metadata: { resource_id: "ast-02", resource_name: "Tajima Embroidery Machine", maint_type: "corrective", cost: 1800, vendor_name: "Tajima Egypt", notes: "Hoop sensor replacement", completed_date: null },
    created_at: ts(4), updated_at: ts(1),
  },
  {
    id: "mnt-03", workspace_id: W,
    title_en: "Service: Delivery Truck 3-Ton", title_ar: "خدمة: شاحنة التوصيل",
    type: "maintenance", status: "done", priority: "medium",
    assignee_id: "emp-09", parent_id: null, organization_id: null,
    due_date: d(14), progress: 100, tags: ["maintenance"],
    metadata: { resource_id: "ast-05", resource_name: "Delivery Truck 3-Ton", maint_type: "preventive", cost: 950, vendor_name: "Ghabbour Service", notes: "20,000 km service — oil, filters, brakes", completed_date: d(14) },
    created_at: ts(20), updated_at: ts(14),
  },
];

// ─── Products with bill of materials ─────────────────────
// resources(type "product") whose metadata.bom lines link to
// DEMO_INVENTORY ids — powers the Materials & BOM dashboard
// (composition, stock coverage, buildable units, costing).

/**
 * Garment routing for a kidswear piece. Minutes per piece become hours over
 * a typical run, so costing and critical path read like a real sewing floor.
 */
function garmentStages(opts: { sewHours: number; print?: "screen" | "embroidery"; imported?: boolean }) {
  const s = (
    id: string, order: number, name: string, name_ar: string, department: string,
    duration_hours: number, labor_cost: number, machine_cost: number, checklist: string[],
    extra: Record<string, unknown> = {},
  ) => ({
    id, order, name, name_ar, department, duration_hours, labor_cost, machine_cost,
    material_waste_pct: department === "cutting" ? 8 : 0, overhead_cost: Math.round(labor_cost * 0.15),
    dependency_type: "sequential" as const, depends_on: order > 1 ? [`st-${order - 1}`] : [], checklist, ...extra,
  });
  const list = [
    s("st-1", 1, "Pattern & Marker", "الباترون والماركر", "pattern", 3, 6, 1, ["Grade sizes 2Y–12Y", "Marker efficiency ≥ 85%"]),
    s("st-2", 2, "Cutting", "القص", "cutting", 2, 4, 2, ["Check shade by roll", "Bundle and ticket by size"], { machine: "Straight knife" }),
  ];
  if (opts.print) {
    list.push(s("st-3", 3, opts.print === "screen" ? "Screen Print" : "Embroidery", opts.print === "screen" ? "طباعة سلك سكرين" : "تطريز", "embroidery", 2, 5, 4,
      ["Match approved strike-off", "Cure / trim threads"], { can_run_parallel: false }));
  }
  const n = list.length;
  list.push(
    s(`st-${n + 1}`, n + 1, "Sewing", "الخياطة", "sewing", opts.sewHours, 22, 4, ["Seam allowance per spec", "Label placement"], { team: "Sewing Line A", capacity_units_per_day: 180 }),
    s(`st-${n + 2}`, n + 2, "Finishing & Pressing", "التشطيب والكي", "pressing", 1.5, 4, 1, ["Trim threads", "Press and fold"]),
    s(`st-${n + 3}`, n + 3, "Quality Control", "مراقبة الجودة", "qc", 1, 3, 0, ["AQL 2.5 inspection", "Measure against size chart"], { quality_checkpoint: true, blocks_next: true }),
    s(`st-${n + 4}`, n + 4, "Packing & Labels", "التغليف والتيكيت", "packing", 0.5, 2, 0, ["Hang tag + size sticker", "Polybag"]),
  );
  return list;
}

/** A soft garment silhouette on a pastel tile — stands in for a product photo. */
const tile = (fill: string, path: string) =>
  `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect width='80' height='80' rx='12' fill='%23${fill}'/%3E%3Cpath d='${path}' fill='%23FFFFFF' opacity='0.85'/%3E%3C/svg%3E`;

export const DEMO_PRODUCTS: T<"resources">[] = [
  {
    id: "prd-01", workspace_id: W, name_en: "Explorer Zip Hoodie", name_ar: "هودي إكسبلورر بسوستة",
    type: "product", utilization: 0, department: "production", skills: ["product"],
    metadata: {
      sku: "CUB-HOOD-EXP", category: "Children", product_type: "hoodie", active: true,
      description: "Brushed French terry zip hoodie with a CUBS woven label. Sizes 2Y–12Y.",
      main_material: "French Terry 320gsm (imported, Turkey)", secondary_material: "1x1 Rib", finish: "Garment Washed",
      sizes: ["2Y", "4Y", "6Y", "8Y", "10Y", "12Y"], colors: ["Sage", "Navy", "Sand"],
      bom: [
        { id: "b1", material: "French Terry 320gsm (imported)", qty: 0.9, unit: "m", costPerUnit: 165 },
        { id: "b2", material: "1x1 Rib — cuffs & hem", qty: 0.15, unit: "m", costPerUnit: 80 },
        { id: "b3", material: "YKK Metal Zip 35cm (imported)", qty: 1, unit: "pcs", costPerUnit: 38 },
        { id: "b4", material: "CUBS Woven Label", qty: 1, unit: "pcs", costPerUnit: 4 },
        { id: "b5", material: "Hang Tag + Polybag", qty: 1, unit: "set", costPerUnit: 6 },
      ],
      stages: garmentStages({ sewHours: 6, imported: true }),
      labor_cost: 41, machine_cost: 12, overhead_cost: 18, suggested_price: 1190,
      images: [tile("9DB8A0", "M26 20l8-4h12l8 4 8 14-7 4-3-5v31H28V33l-3 5-7-4z")],
    },
    created_at: ts(45), updated_at: ts(1),
  },
  {
    id: "prd-02", workspace_id: W, name_en: "Adventure Jogger Set", name_ar: "طقم جوجر أدفنشر",
    type: "product", utilization: 0, department: "production", skills: ["product"],
    metadata: {
      sku: "CUB-SET-ADV", category: "Children", product_type: "set", active: true,
      description: "Crew sweatshirt and elastic-waist jogger in cotton fleece.",
      main_material: "Cotton Fleece 280gsm", secondary_material: "Waistband Elastic 30mm", finish: "Embroidered chest logo",
      sizes: ["2Y", "4Y", "6Y", "8Y", "10Y"], colors: ["Navy", "Heather Grey"],
      bom: [
        { id: "b1", material: "Cotton Fleece 280gsm", qty: 1.2, unit: "m", costPerUnit: 120 },
        { id: "b2", material: "Waistband Elastic 30mm", qty: 0.7, unit: "m", costPerUnit: 14 },
        { id: "b3", material: "Rib Trim (imported, China)", qty: 0.2, unit: "m", costPerUnit: 70 },
        { id: "b4", material: "Embroidery Thread", qty: 1, unit: "set", costPerUnit: 9 },
        { id: "b5", material: "CUBS Woven Label", qty: 2, unit: "pcs", costPerUnit: 4 },
      ],
      stages: garmentStages({ sewHours: 7, print: "embroidery" }),
      labor_cost: 49, machine_cost: 16, overhead_cost: 22, suggested_price: 1450,
      images: [tile("4A5A7A", "M24 16h32l6 14-6 2v6H24v-6l-6-2zM28 42h24l-2 26h-8l-2-16-2 16h-8z")],
    },
    created_at: ts(30), updated_at: ts(0),
  },
  {
    id: "prd-03", workspace_id: W, name_en: "Little Cub Pyjama Set", name_ar: "طقم بيجامة ليتل كب",
    type: "product", utilization: 0, department: "production", skills: ["product"],
    metadata: {
      sku: "CUB-PJ-LCB", category: "Children", product_type: "sleepwear", active: true,
      description: "Printed interlock pyjama set with snap placket. Print matched across panels.",
      main_material: "Printed Interlock 200gsm (imported, Portugal)", finish: "Soft wash",
      sizes: ["1Y", "2Y", "4Y", "6Y", "8Y"], colors: ["Bear Print", "Star Print"],
      bom: [
        { id: "b1", material: "Printed Interlock 200gsm (imported)", qty: 1.15, unit: "m", costPerUnit: 140 },
        { id: "b2", material: "Snap Buttons 12mm", qty: 4, unit: "pcs", costPerUnit: 2 },
        { id: "b3", material: "Care Label (EN/AR)", qty: 1, unit: "pcs", costPerUnit: 2 },
        { id: "b4", material: "Gift Box", qty: 1, unit: "pcs", costPerUnit: 18 },
      ],
      stages: garmentStages({ sewHours: 5, imported: true }),
      labor_cost: 36, machine_cost: 10, overhead_cost: 15, suggested_price: 890,
      images: [tile("E4B97A", "M22 18h36l4 12-6 3v35H24V33l-6-3z")],
    },
    created_at: ts(20), updated_at: ts(0),
  },
  {
    id: "prd-04", workspace_id: W, name_en: "Everyday Tee 3-Pack", name_ar: "تيشيرت يومي 3 قطع",
    type: "product", utilization: 0, department: "production", skills: ["product"],
    metadata: {
      sku: "CUB-TEE-3PK", category: "Children", product_type: "tshirt", active: true,
      description: "Combed cotton crew tees, screen-printed CUBS mark, sold as a 3-pack.",
      main_material: "Combed Cotton Jersey 180gsm", finish: "Screen Printed",
      sizes: ["2Y", "4Y", "6Y", "8Y", "10Y", "12Y"], colors: ["Multicolour"],
      bom: [
        { id: "b1", material: "Combed Cotton Jersey 180gsm", qty: 1.8, unit: "m", costPerUnit: 62 },
        { id: "b2", material: "Neck Rib", qty: 0.24, unit: "m", costPerUnit: 40 },
        { id: "b3", material: "Plastisol Ink", qty: 3, unit: "prints", costPerUnit: 5 },
        { id: "b4", material: "CUBS Printed Neck Label", qty: 3, unit: "pcs", costPerUnit: 1.5 },
        { id: "b5", material: "3-Pack Box", qty: 1, unit: "pcs", costPerUnit: 14 },
      ],
      stages: garmentStages({ sewHours: 4, print: "screen" }),
      labor_cost: 30, machine_cost: 14, overhead_cost: 12, suggested_price: 790,
      images: [tile("C98B8B", "M24 20h32l8 10-7 5-3-3v36H26V32l-3 3-7-5z")],
    },
    created_at: ts(60), updated_at: ts(2),
  },
  {
    id: "prd-05", workspace_id: W, name_en: "Trail Windbreaker", name_ar: "جاكيت ويندبريكر تريل",
    type: "product", utilization: 0, department: "production", skills: ["product"],
    metadata: {
      sku: "CUB-JKT-TRL", category: "Outerwear", product_type: "jacket", active: true,
      description: "Packable ripstop windbreaker with mesh lining and reflective tab.",
      main_material: "Ripstop Nylon (imported, China)", secondary_material: "Mesh Lining", finish: "DWR coated",
      sizes: ["4Y", "6Y", "8Y", "10Y", "12Y"], colors: ["Mustard", "Olive"],
      bom: [
        { id: "b1", material: "Ripstop Nylon (imported)", qty: 1.3, unit: "m", costPerUnit: 150 },
        { id: "b2", material: "Mesh Lining", qty: 1, unit: "m", costPerUnit: 45 },
        { id: "b3", material: "Plastic Zip 40cm", qty: 1, unit: "pcs", costPerUnit: 22 },
        { id: "b4", material: "Reflective Tab", qty: 1, unit: "pcs", costPerUnit: 8 },
      ],
      stages: garmentStages({ sewHours: 8, imported: true }),
      labor_cost: 58, machine_cost: 14, overhead_cost: 24, suggested_price: 1650,
      images: [tile("D6A93A", "M26 16h28l10 16-7 4-3-4v36H26V32l-3 4-7-4z")],
    },
    created_at: ts(8), updated_at: ts(3),
  },
];

// ─── POS Registers ────────────────────────────────────────

export const DEMO_POS_REGISTERS: T<"pos_registers">[] = [
  {
    id: "pos-reg-01", workspace_id: W, branch_id: "br-02", register_code: "POS-SH1-01",
    name: "Showroom Main Counter", name_ar: "كاونتر المعرض الرئيسي",
    status: "active", opened_by: "emp-04", opened_at: ts(0), closed_at: null,
    float_amount: 2000, current_cash: 4850,
    metadata: { cashier: "Fatima Nasser" },
    created_at: ts(90), updated_at: ts(0),
  },
  {
    id: "pos-reg-02", workspace_id: W, branch_id: "br-02", register_code: "POS-SH1-02",
    name: "Showroom Fitting Area", name_ar: "منطقة القياس بالمعرض",
    status: "active", opened_by: "emp-02", opened_at: ts(0), closed_at: null,
    float_amount: 1500, current_cash: 3200,
    metadata: { cashier: "Omar Hassan" },
    created_at: ts(60), updated_at: ts(0),
  },
  {
    id: "pos-reg-03", workspace_id: W, branch_id: "br-01", register_code: "POS-HQ-01",
    name: "Factory Outlet Counter", name_ar: "كاونتر ب outlet المصنع",
    status: "inactive", opened_by: null, opened_at: null, closed_at: null,
    float_amount: 1000, current_cash: 1000,
    metadata: {},
    created_at: ts(45), updated_at: ts(30),
  },
];

// ─── POS Transactions ─────────────────────────────────────

export const DEMO_POS_TRANSACTIONS: T<"pos_transactions">[] = [
  {
    id: "pos-txn-01", workspace_id: W, branch_id: "br-02", register_id: "pos-reg-01",
    transaction_number: "TXN-2026-001",
    customer_id: null, customer_name: "Nora Al-Farsi", customer_phone: "+20-100-123-4567",
    loyalty_card_number: "LOY-NOR-001",
    subtotal: 1850, discount_amount: 185, discount_percent: 10,
    tax_amount: 249.75, tax_rate: 15, total: 1914.75, currency: "EGP",
    payment_method: "card", payment_details: { card_last_four: "4521", card_type: "visa" },
    status: "completed", cashier_name: "Fatima Nasser",
    notes: null, receipt_printed: true,
    loyalty_points_earned: 185, loyalty_points_redeemed: 0,
    metadata: {},
    created_at: ts(0), updated_at: ts(0),
  },
  {
    id: "pos-txn-02", workspace_id: W, branch_id: "br-02", register_id: "pos-reg-01",
    transaction_number: "TXN-2026-002",
    customer_id: null, customer_name: "Layla Hassan", customer_phone: "+20-100-234-5678",
    loyalty_card_number: null,
    subtotal: 3200, discount_amount: 0, discount_percent: 0,
    tax_amount: 480, tax_rate: 15, total: 3680, currency: "EGP",
    payment_method: "cash", payment_details: { cash_received: 4000, change: 320 },
    status: "completed", cashier_name: "Fatima Nasser",
    notes: "Custom hemming requested", receipt_printed: true,
    loyalty_points_earned: 320, loyalty_points_redeemed: 0,
    metadata: {},
    created_at: ts(0), updated_at: ts(0),
  },
  {
    id: "pos-txn-03", workspace_id: W, branch_id: "br-02", register_id: "pos-reg-02",
    transaction_number: "TXN-2026-003",
    customer_id: null, customer_name: "Sara Mahmoud", customer_phone: "+20-100-345-6789",
    loyalty_card_number: "LOY-EGP-002",
    subtotal: 750, discount_amount: 75, discount_percent: 10,
    tax_amount: 101.25, tax_rate: 15, total: 776.25, currency: "EGP",
    payment_method: "mobile_wallet", payment_details: { provider: "STC Pay", reference: "STC-78945" },
    status: "completed", cashier_name: "Omar Hassan",
    notes: null, receipt_printed: true,
    loyalty_points_earned: 75, loyalty_points_redeemed: 0,
    metadata: {},
    created_at: ts(0), updated_at: ts(0),
  },
  {
    id: "pos-txn-04", workspace_id: W, branch_id: "br-02", register_id: "pos-reg-01",
    transaction_number: "TXN-2026-004",
    customer_id: null, customer_name: "Khalid Al-Mansouri", customer_phone: "+20-100-456-7890",
    loyalty_card_number: "LOY-KHA-003",
    subtotal: 4500, discount_amount: 450, discount_percent: 10,
    tax_amount: 607.50, tax_rate: 15, total: 4657.50, currency: "EGP",
    payment_method: "split", payment_details: { cash: 2000, card: 2657.50 },
    status: "completed", cashier_name: "Fatima Nasser",
    notes: "VIP customer — loyalty discount applied", receipt_printed: true,
    loyalty_points_earned: 450, loyalty_points_redeemed: 0,
    metadata: {},
    created_at: ts(1), updated_at: ts(1),
  },
  {
    id: "pos-txn-05", workspace_id: W, branch_id: "br-02", register_id: "pos-reg-02",
    transaction_number: "TXN-2026-005",
    customer_id: null, customer_name: "Fatima Al-Zahra", customer_phone: "+20-100-567-8901",
    loyalty_card_number: null,
    subtotal: 950, discount_amount: 0, discount_percent: 0,
    tax_amount: 142.50, tax_rate: 15, total: 1092.50, currency: "EGP",
    payment_method: "card", payment_details: { card_last_four: "8832", card_type: "mastercard" },
    status: "completed", cashier_name: "Omar Hassan",
    notes: null, receipt_printed: true,
    loyalty_points_earned: 95, loyalty_points_redeemed: 0,
    metadata: {},
    created_at: ts(1), updated_at: ts(1),
  },
  {
    id: "pos-txn-06", workspace_id: W, branch_id: "br-02", register_id: "pos-reg-01",
    transaction_number: "TXN-2026-006",
    customer_id: null, customer_name: "Ahmed Khalil", customer_phone: "+20-100-678-9012",
    loyalty_card_number: null,
    subtotal: 2200, discount_amount: 0, discount_percent: 0,
    tax_amount: 330, tax_rate: 15, total: 2530, currency: "EGP",
    payment_method: "cash", payment_details: { cash_received: 2600, change: 70 },
    status: "voided", cashier_name: "Fatima Nasser",
    notes: "Customer changed mind", receipt_printed: false,
    loyalty_points_earned: 0, loyalty_points_redeemed: 0,
    metadata: { voided_at: ts(0), voided_by: "Fatima Nasser", void_reason: "Customer request" },
    created_at: ts(2), updated_at: ts(2),
  },
];

// ─── POS Transaction Items ────────────────────────────────

export const DEMO_POS_TXN_ITEMS: T<"pos_transaction_items">[] = [
  { id: "pos-item-01", workspace_id: W, transaction_id: "pos-txn-01", product_id: "prd-01", product_name: "Abaya — Zahra", product_name_ar: "عباءة زهرة", sku: "ABY-ZAH-001", quantity: 1, unit_price: 1200, discount_amount: 120, discount_percent: 10, total: 1080, cost_price: 650, branch_id: "br-02", metadata: {}, created_at: ts(0), updated_at: ts(0) },
  { id: "pos-item-02", workspace_id: W, transaction_id: "pos-txn-01", product_id: "prd-01", product_name: "Scarf — Midnight", product_name_ar: "وشاح منتصف الليل", sku: "SCF-MID-001", quantity: 1, unit_price: 450, discount_amount: 45, discount_percent: 10, total: 405, cost_price: 180, branch_id: "br-02", metadata: {}, created_at: ts(0), updated_at: ts(0) },
  { id: "pos-item-03", workspace_id: W, transaction_id: "pos-txn-01", product_id: "prd-01", product_name: "Belt — Gold Chain", product_name_ar: "حزام سلسلة ذهبية", sku: "BLT-GLD-001", quantity: 2, unit_price: 185, discount_amount: 18.5, discount_percent: 10, total: 167.5, cost_price: 60, branch_id: "br-02", metadata: {}, created_at: ts(0), updated_at: ts(0) },
  { id: "pos-item-04", workspace_id: W, transaction_id: "pos-txn-02", product_id: "prd-02", product_name: "Kaftan — Nefertiti", product_name_ar: "قفطان نفرتيتي", sku: "KFT-NEF-001", quantity: 1, unit_price: 2800, discount_amount: 0, discount_percent: 0, total: 2800, cost_price: 1400, branch_id: "br-02", metadata: {}, created_at: ts(0), updated_at: ts(0) },
  { id: "pos-item-05", workspace_id: W, transaction_id: "pos-txn-02", product_id: "prd-01", product_name: "Clutch — Velvet", product_name_ar: "كلاتش مخملي", sku: "CLT-VLV-001", quantity: 1, unit_price: 400, discount_amount: 0, discount_percent: 0, total: 400, cost_price: 150, branch_id: "br-02", metadata: {}, created_at: ts(0), updated_at: ts(0) },
  { id: "pos-item-06", workspace_id: W, transaction_id: "pos-txn-03", product_id: "prd-03", product_name: "T-Shirt — Cairo", product_name_ar: "تيشيرت كايرو", sku: "TSH-CAI-001", quantity: 5, unit_price: 150, discount_amount: 75, discount_percent: 10, total: 675, cost_price: 45, branch_id: "br-02", metadata: {}, created_at: ts(0), updated_at: ts(0) },
  { id: "pos-item-07", workspace_id: W, transaction_id: "pos-txn-04", product_id: "prd-02", product_name: "Kaftan — Nefertiti", product_name_ar: "قفطان نفرتيتي", sku: "KFT-NEF-001", quantity: 1, unit_price: 2800, discount_amount: 280, discount_percent: 10, total: 2520, cost_price: 1400, branch_id: "br-02", metadata: {}, created_at: ts(1), updated_at: ts(1) },
  { id: "pos-item-08", workspace_id: W, transaction_id: "pos-txn-04", product_id: "prd-01", product_name: "Abaya — Zahra", product_name_ar: "عباءة زهرة", sku: "ABY-ZAH-001", quantity: 1, unit_price: 1200, discount_amount: 120, discount_percent: 10, total: 1080, cost_price: 650, branch_id: "br-02", metadata: {}, created_at: ts(1), updated_at: ts(1) },
  { id: "pos-item-09", workspace_id: W, transaction_id: "pos-txn-04", product_id: "prd-01", product_name: "Scarf — Midnight", product_name_ar: "وشاح منتصف الليل", sku: "SCF-MID-001", quantity: 1, unit_price: 450, discount_amount: 45, discount_percent: 10, total: 405, cost_price: 180, branch_id: "br-02", metadata: {}, created_at: ts(1), updated_at: ts(1) },
  { id: "pos-item-10", workspace_id: W, transaction_id: "pos-txn-05", product_id: "prd-01", product_name: "Abaya — Zahra", product_name_ar: "عباءة زهرة", sku: "ABY-ZAH-001", quantity: 1, unit_price: 950, discount_amount: 0, discount_percent: 0, total: 950, cost_price: 650, branch_id: "br-02", metadata: {}, created_at: ts(1), updated_at: ts(1) },
];

// ─── Branch Inventory ─────────────────────────────────────

export const DEMO_BRANCH_INVENTORY: T<"branch_inventory">[] = [
  { id: "bi-01", workspace_id: W, branch_id: "br-02", product_id: "prd-01", product_name: "Abaya — Zahra", sku: "ABY-ZAH-001", quantity: 24, reserved_quantity: 2, reorder_level: 5, unit_cost: 650, unit_price: 1200, last_restocked_at: ts(3), metadata: {}, created_at: ts(90), updated_at: ts(0) },
  { id: "bi-02", workspace_id: W, branch_id: "br-02", product_id: "prd-01", product_name: "Scarf — Midnight", sku: "SCF-MID-001", quantity: 45, reserved_quantity: 0, reorder_level: 10, unit_cost: 180, unit_price: 450, last_restocked_at: ts(5), metadata: {}, created_at: ts(90), updated_at: ts(0) },
  { id: "bi-03", workspace_id: W, branch_id: "br-02", product_id: "prd-01", product_name: "Belt — Gold Chain", sku: "BLT-GLD-001", quantity: 30, reserved_quantity: 0, reorder_level: 8, unit_cost: 60, unit_price: 185, last_restocked_at: ts(7), metadata: {}, created_at: ts(90), updated_at: ts(0) },
  { id: "bi-04", workspace_id: W, branch_id: "br-02", product_id: "prd-02", product_name: "Kaftan — Nefertiti", sku: "KFT-NEF-001", quantity: 12, reserved_quantity: 1, reorder_level: 3, unit_cost: 1400, unit_price: 2800, last_restocked_at: ts(2), metadata: {}, created_at: ts(90), updated_at: ts(0) },
  { id: "bi-05", workspace_id: W, branch_id: "br-02", product_id: "prd-01", product_name: "Clutch — Velvet", sku: "CLT-VLV-001", quantity: 18, reserved_quantity: 0, reorder_level: 5, unit_cost: 150, unit_price: 400, last_restocked_at: ts(10), metadata: {}, created_at: ts(90), updated_at: ts(0) },
  { id: "bi-06", workspace_id: W, branch_id: "br-02", product_id: "prd-03", product_name: "T-Shirt — Cairo", sku: "TSH-CAI-001", quantity: 60, reserved_quantity: 0, reorder_level: 15, unit_cost: 45, unit_price: 150, last_restocked_at: ts(1), metadata: {}, created_at: ts(90), updated_at: ts(0) },
  { id: "bi-07", workspace_id: W, branch_id: "br-02", product_id: "prd-04", product_name: "Bridal Gown — Leila", sku: "BRL-LEI-001", quantity: 3, reserved_quantity: 1, reorder_level: 1, unit_cost: 5150, unit_price: 8500, last_restocked_at: ts(15), metadata: {}, created_at: ts(90), updated_at: ts(0) },
  { id: "bi-08", workspace_id: W, branch_id: "br-01", product_id: "prd-01", product_name: "Abaya — Zahra", sku: "ABY-ZAH-001", quantity: 50, reserved_quantity: 0, reorder_level: 10, unit_cost: 650, unit_price: 1200, last_restocked_at: ts(1), metadata: {}, created_at: ts(90), updated_at: ts(0) },
  { id: "bi-09", workspace_id: W, branch_id: "br-01", product_id: "prd-02", product_name: "Kaftan — Nefertiti", sku: "KFT-NEF-001", quantity: 20, reserved_quantity: 0, reorder_level: 5, unit_cost: 1400, unit_price: 2800, last_restocked_at: ts(2), metadata: {}, created_at: ts(90), updated_at: ts(0) },
  { id: "bi-10", workspace_id: W, branch_id: "br-03", product_id: "prd-01", product_name: "Abaya — Zahra", sku: "ABY-ZAH-001", quantity: 100, reserved_quantity: 0, reorder_level: 20, unit_cost: 650, unit_price: 1200, last_restocked_at: ts(5), metadata: {}, created_at: ts(90), updated_at: ts(0) },
  { id: "bi-11", workspace_id: W, branch_id: "br-03", product_id: "prd-02", product_name: "Kaftan — Nefertiti", sku: "KFT-NEF-001", quantity: 40, reserved_quantity: 0, reorder_level: 10, unit_cost: 1400, unit_price: 2800, last_restocked_at: ts(8), metadata: {}, created_at: ts(90), updated_at: ts(0) },
  { id: "bi-12", workspace_id: W, branch_id: "br-03", product_id: "prd-03", product_name: "T-Shirt — Cairo", sku: "TSH-CAI-001", quantity: 200, reserved_quantity: 0, reorder_level: 30, unit_cost: 45, unit_price: 150, last_restocked_at: ts(3), metadata: {}, created_at: ts(90), updated_at: ts(0) },
];
