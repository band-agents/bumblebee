import type { Article, Category } from "./types";

export const CATEGORIES: Category[] = [
  { id: "start", title: "Getting started", blurb: "Sign in, find your way around, switch language.", icon: "Compass" },
  { id: "sales", title: "Sales", blurb: "Quotations, sales orders and the shop till.", icon: "ShoppingBag" },
  { id: "production", title: "Products & production", blurb: "Products, production orders, stages, quality, delivery.", icon: "Factory" },
  { id: "stock", title: "Stock & purchasing", blurb: "Fabrics, trims, assets, purchase orders, goods received.", icon: "Boxes" },
  { id: "finance", title: "Invoices & payments", blurb: "Invoicing orders, recording payments, fixing mistakes.", icon: "Landmark" },
  { id: "documents", title: "Documents & printing", blurb: "Numbers, references and printed paperwork.", icon: "FileText" },
  { id: "people", title: "People & access", blurb: "Logins, roles, team and employees.", icon: "Users" },
  { id: "admin", title: "Settings & data", blurb: "Company details, branches, reports, import and export.", icon: "Settings" },
  { id: "preview", title: "Preview modules", blurb: "Screens that show sample data today.", icon: "Sparkles" },
];

export const ARTICLES: Article[] = [
  // ───────────────────────── Getting started ─────────────────────────
  {
    slug: "what-is-bumblebee",
    category: "start",
    title: "What Bumblebee is",
    summary: "One system for everything CUBS makes and sells — from the fabric roll to the packed order and the paid invoice.",
    status: "live",
    sections: [
      {
        id: "overview",
        heading: "One place for the whole business",
        shot: "landing",
        caption: "The public page at bumblebee-cubs.vercel.app",
        blocks: [
          { t: "p", text: "Bumblebee is the operating system for **CUBS** (cubsgoplaces.com), a kidswear brand that designs, cuts, sews and packs everything in-house and imports part of its fabric and trims." },
          { t: "p", text: "It replaces spreadsheets, WhatsApp threads and paper books with one shared record: what customers ordered, what the factory is making, what is in the warehouse, what was bought from suppliers, and what has been invoiced and paid." },
          { t: "list", items: [
            "Runs in the browser — nothing to install. Works on laptops, tablets and phones.",
            "English and Arabic, with the whole screen switching to right-to-left.",
            "Every login is created by your admin, and each person only sees the modules their role allows.",
            "Every document — quotation, order, invoice, receipt, goods received note — gets a permanent number and can be printed.",
          ] },
        ],
      },
      {
        id: "home",
        heading: "The home dashboard",
        shot: "dashboard",
        caption: "Home → Dashboard",
        blocks: [
          { t: "p", text: "After you sign in you land on the **Dashboard**. It summarises the business at a glance: pipeline value, revenue, work completed, overdue invoices, stock alerts, and orders by production stage." },
          { t: "p", text: "Numbers on the dashboard are calculated from the records in the system, so they are only as current as the data your team enters." },
        ],
      },
      {
        id: "live-vs-preview",
        heading: "What is live and what is a preview",
        blocks: [
          { t: "p", text: "Most modules save real data to your workspace. A few newer modules are **previews**: they show sample data so you can see where the product is going, but changes there are not saved." },
          { t: "table", head: ["Area", "Status"], rows: [
            ["Quotations, Sales Orders, Point of Sale", "Live"],
            ["Products, Production, Planning & Cutting, Quality Control, Designs, Site Visits, Delivery", "Live"],
            ["Inventory, Fabrics, Materials, Assets, Purchasing", "Live"],
            ["Invoices & Receipts", "Live"],
            ["Users & Access, Team, Employees (HR → Employees)", "Live"],
            ["Settings, Branches, Reports, Analytics, Data import/export, Activity, Work items", "Live"],
            ["CRM, Finance dashboard/expenses/bank/AR-AP, HR dashboards/payroll/recruitment, Loyalty, Shopify kit, Mobile apps, Studio, Intelligence/Forecast/Risk", "Preview (sample data)"],
          ] },
          { t: "note", tone: "info", text: "See [Preview modules](/docs/preview-modules) for exactly what each preview shows." },
        ],
      },
      {
        id: "flow",
        heading: "How work moves through Bumblebee",
        shot: "production-exec",
        caption: "Production → Overview shows every order by stage",
        blocks: [
          { t: "p", text: "The main chain for a customer order:" },
          { t: "steps", items: [
            "**Quotation** (QT-) — prices for the customer. Send, then approve.",
            "**Sales order** (SO-) — created from the approved quotation, or directly.",
            "**Production order** (MO-) — pattern → cutting → sewing → finishing → quality check → packing.",
            "**Quality inspection** (QC-) — pass, fail or conditional, with a defect log.",
            "**Delivery note** (DN-) — scheduled, loaded, in transit, delivered.",
            "**Invoice** (INV-) — full amount or a deposit, from the sales order.",
            "**Receipt** (RCT-) — each payment against the invoice.",
          ] },
          { t: "p", text: "And for buying materials: **Purchase request** (PR-) → **Purchase order** (PO-) → **Goods received note** (GRN-)." },
        ],
      },
    ],
    related: ["signing-in", "finding-your-way", "document-numbers"],
  },
  {
    slug: "signing-in",
    category: "start",
    title: "Signing in and out",
    summary: "Your admin gives you a username and password. There is no self sign-up and no Google login.",
    status: "live",
    sections: [
      {
        id: "sign-in",
        heading: "Sign in",
        shot: "login",
        caption: "The sign-in page",
        blocks: [
          { t: "steps", items: [
            "Open **bumblebee-cubs.vercel.app** and choose **Sign in**.",
            "Type the **username** your admin gave you (for example `sara.ahmed`). Usernames are not case-sensitive.",
            "Type your **password**. Use the eye icon to check what you typed.",
            "Choose **Sign in**. You land on the Dashboard.",
          ] },
          { t: "note", tone: "info", text: "Accounts are created only by an owner or admin inside **Users & Access**. If you don't have a login, ask them — there is no \"create account\" button on purpose." },
        ],
      },
      {
        id: "stay-signed-in",
        heading: "Staying signed in",
        blocks: [
          { t: "p", text: "Bumblebee keeps you signed in on that browser until you sign out, clear the browser's site data, or your admin suspends your account." },
          { t: "p", text: "On a shared computer, always sign out when you finish: open the menu under your name in the top-right corner and choose **Sign out**." },
        ],
      },
      {
        id: "forgot",
        heading: "Forgot your password?",
        blocks: [
          { t: "p", text: "There is no email reset link. Ask an owner or admin to open **Users & Access**, select your name and choose **Reset password**. They set a new password and pass it to you." },
          { t: "p", text: "Once you are signed in, change it to something only you know: **Settings → Security → Change password**." },
          { t: "note", tone: "warn", text: "Only the workspace **owner** can reset the password of another owner or an admin." },
        ],
      },
      {
        id: "errors",
        heading: "Messages you might see",
        blocks: [
          { t: "table", head: ["Message", "What it means"], rows: [
            ["That username and password don't match.", "Either the username or the password is wrong. Check Caps Lock and spelling."],
            ["Too many attempts. Wait a minute, then try again.", "Several wrong attempts in a row. Wait one minute."],
            ["Can't reach the server.", "Your internet connection dropped, or a firewall blocks the site."],
          ] },
          { t: "p", text: "If your account was suspended you can still sign in, but you see \"Your access is paused\" instead of any data. Your admin can choose **Re-activate** on your profile." },
        ],
      },
    ],
    related: ["users-and-access", "troubleshooting"],
  },
  {
    slug: "finding-your-way",
    category: "start",
    title: "Finding your way around",
    summary: "The sidebar, the top bar, search, pinned pages, notifications and Buzz.",
    status: "live",
    sections: [
      {
        id: "sidebar",
        heading: "The sidebar",
        shot: "production-order-detail",
        caption: "Left rail for areas, second column for pages in that area",
        blocks: [
          { t: "p", text: "The narrow rail on the far left holds the main areas: **Home, Sales, Production, Inventory, Delivery, Finance, People, Loyalty, Channels, Insights**. Choosing one opens its pages in the second column." },
          { t: "list", items: [
            "**Home** — Dashboard, Today, Work Queue, Activity.",
            "**Sales** — Sales pipeline, Quotations, Sales Orders, Point of Sale, CRM, Organizations, Contacts.",
            "**Production** — Production, Overview, Planning & Cutting, Work Items, Operations, Quality Control, Designs, Products, Site Visits.",
            "**Inventory** — Overview, Fabrics, Materials, Assets, Purchasing.",
            "**Finance** — Overview, Dashboard, Invoices, Expenses, Receivable/Payable, Bank, Reports.",
            "**People** — HR, Employees, Team, Users & Access.",
          ] },
          { t: "p", text: "You only see the areas your role allows. The **«** button collapses the second column to give the page more room." },
        ],
      },
      {
        id: "topbar",
        heading: "The top bar",
        blocks: [
          { t: "table", head: ["Control", "What it does"], rows: [
            ["‹ ›", "Back and forward through the pages you visited."],
            ["Breadcrumb", "Shows where you are; click a part to go up a level."],
            ["☆ Pin page", "Keeps the page in your pinned list for one-click access."],
            ["Search (Ctrl+K / ⌘K)", "Finds pages and records by name."],
            ["🕘 Recent pages", "The last pages you opened."],
            ["🔔 Notifications", "Alerts such as low stock or overdue items."],
            ["☀ Theme", "Switches between light and dark."],
            ["AR / EN", "Switches the language."],
            ["Your name", "Your role, and Sign out."],
          ] },
        ],
      },
      {
        id: "search",
        heading: "Search anything with Ctrl+K",
        shot: "command-bar",
        caption: "Ctrl+K opens search from any page",
        blocks: [
          { t: "p", text: "Press **Ctrl+K** (Windows) or **⌘K** (Mac), or click the search box. Start typing a page name, customer, product or document. Use the arrow keys and **Enter** to open a result, **Esc** to close." },
        ],
      },
      {
        id: "buzz",
        heading: "Buzz, the assistant",
        shot: "buzz",
        caption: "The round bee button opens Buzz",
        blocks: [
          { t: "p", text: "The yellow bee button in the bottom corner opens **Buzz**, an assistant that answers questions about your workspace in plain language." },
          { t: "note", tone: "info", text: "Buzz needs its AI service switched on for your workspace. If it replies with an \"API error\", the service is not configured yet — everything else in Bumblebee works without it." },
        ],
      },
      {
        id: "today",
        heading: "Today",
        shot: "today",
        caption: "Home → Today",
        blocks: [
          { t: "p", text: "**Today** is a short morning view: revenue collected, outstanding and overdue amounts, active work, and quick links to create a customer, invoice, expense or work item." },
        ],
      },
    ],
    related: ["arabic-and-english", "what-is-bumblebee"],
  },
  {
    slug: "arabic-and-english",
    category: "start",
    title: "Arabic and English",
    summary: "Switch language any time; Bumblebee remembers your choice on that browser.",
    status: "live",
    sections: [
      {
        id: "switch",
        heading: "Switching language",
        shot: "arabic",
        caption: "The dashboard in Arabic, laid out right-to-left",
        blocks: [
          { t: "steps", items: [
            "Click **AR** in the top bar to switch to Arabic, or **EN** to switch back.",
            "The whole interface flips to right-to-left, including the sidebar and tables.",
            "Your choice is saved on this browser and stays after refreshing or signing in again.",
          ] },
          { t: "p", text: "The language is saved per browser, not per account. On a new computer or phone, choose it once." },
          { t: "note", tone: "tip", text: "If the language goes back to English every time you refresh, the browser is blocking site storage (private/incognito mode or a strict privacy setting). Use a normal window or allow storage for the site." },
        ],
      },
      {
        id: "data",
        heading: "What gets translated",
        blocks: [
          { t: "list", items: [
            "All menus, buttons, labels and messages.",
            "Records you create keep the text you typed. Products, employees and some other records have separate English and Arabic name fields — fill both if you work in both languages.",
            "Printed documents are **always bilingual** (English and Arabic side by side), whatever language you are using.",
          ] },
        ],
      },
    ],
    related: ["printing-documents"],
  },

  // ───────────────────────── Sales ─────────────────────────
  {
    slug: "quotations",
    category: "sales",
    title: "Quotations",
    summary: "Price an order for a customer, send it, get it approved and turn it into a sales order.",
    status: "live",
    sections: [
      {
        id: "list",
        heading: "The quotations list",
        shot: "quotations",
        caption: "Sales → Quotations",
        blocks: [
          { t: "p", text: "Each card shows the quotation number, status, customer, project name, total and validity date. Use the search box and the status filter to narrow the list." },
          { t: "table", head: ["Status", "Meaning"], rows: [
            ["Draft", "Being prepared. Not sent yet."],
            ["Sent", "Sent to the customer, waiting for a decision."],
            ["Approved", "The customer accepted. It can now become a sales order."],
            ["Rejected", "The customer declined."],
            ["Expired", "Past its validity date without a decision."],
            ["Converted", "A sales order was created from it. Shows the SO number."],
            ["Cancelled", "Withdrawn. The number stays on record."],
          ] },
        ],
      },
      {
        id: "create",
        heading: "Create a quotation",
        shot: "quotation-new",
        caption: "New Quotation",
        blocks: [
          { t: "steps", items: [
            "Choose **New Quotation**.",
            "Pick the customer (or type a name), contact person, project name, quotation date and **valid until** date.",
            "Add one line per product: product name, description, quantity and unit price. Add a line discount as a **%** or a fixed amount if needed.",
            "Optionally add an **order discount** (% or fixed) and the **VAT rate** (14% in Egypt).",
            "Check the totals at the bottom — subtotal, discount, VAT and grand total.",
            "Choose **Save**. The number (for example `QT-2026-00027`) is issued at that moment.",
          ] },
          { t: "note", tone: "info", text: "A quotation needs at least one line. The number field shows \"Issued automatically on save\" — you can't type your own number." },
        ],
      },
      {
        id: "math",
        heading: "How the total is calculated",
        blocks: [
          { t: "steps", items: [
            "Line total = quantity × unit price, minus the line discount (a fixed discount can't go below zero; a % discount is capped at 100%).",
            "Subtotal = sum of all line totals.",
            "Order discount is taken off the subtotal (fixed discounts are capped at the subtotal).",
            "VAT = (subtotal − order discount) × VAT rate.",
            "Grand total = subtotal − order discount + VAT.",
          ] },
          { t: "p", text: "The same calculation is used by sales orders, invoices and the printed documents, so the numbers always agree." },
        ],
      },
      {
        id: "lifecycle",
        heading: "Send, approve, convert",
        blocks: [
          { t: "steps", items: [
            "On a draft, choose **Send** once it has gone to the customer.",
            "When the customer answers, choose **Approve** or **Reject**.",
            "On an approved quotation, choose **Convert to Sales Order**. A sales order is created with its own SO number, the same lines, discounts and VAT, and a reference back to the quotation.",
          ] },
          { t: "note", tone: "warn", text: "A quotation can be converted **once**. After conversion the button is replaced by \"Sales order SO-…\"." },
        ],
      },
      {
        id: "print-cancel",
        heading: "Print or cancel",
        shot: "print-quotation",
        caption: "A printed quotation",
        blocks: [
          { t: "p", text: "Choose **Print** on any quotation to open the A4 version in a new tab, then **Print / Save PDF**." },
          { t: "p", text: "Quotations are never deleted. The ✕ button **cancels** a quotation so its number stays accounted for. Converted quotations can't be cancelled." },
        ],
      },
    ],
    related: ["sales-orders", "printing-documents", "document-numbers"],
  },
  {
    slug: "sales-orders",
    category: "sales",
    title: "Sales orders",
    summary: "Confirmed customer orders — the starting point for production, delivery and invoicing.",
    status: "live",
    sections: [
      {
        id: "list",
        heading: "The sales orders list",
        shot: "sales-orders",
        caption: "Sales → Sales Orders",
        blocks: [
          { t: "p", text: "Each order shows its number, status, customer, items, total and a billing line: how much has been **invoiced**, how much is **paid**, and the **balance**." },
          { t: "table", head: ["Status", "Meaning"], rows: [
            ["Draft", "Not confirmed. Can't be invoiced yet."],
            ["Confirmed", "The customer confirmed. Ready to plan production and to invoice."],
            ["In Production", "Being made."],
            ["Ready", "Made and packed, waiting for delivery."],
            ["Delivered", "Handed to the customer."],
            ["Closed", "Finished — delivered and settled."],
            ["Cancelled", "Withdrawn. Only possible while no active invoice exists."],
          ] },
        ],
      },
      {
        id: "create",
        heading: "Create a sales order",
        shot: "sales-order-new",
        caption: "New Order wizard",
        blocks: [
          { t: "p", text: "Most orders come from an approved quotation (**Convert to Sales Order**). To create one directly, choose **New Order** and follow the six steps:" },
          { t: "steps", items: [
            "**Customer** — company or individual, contact, phone, address.",
            "**Products** — one line per product with quantity and unit price.",
            "**Details** — project name, priority, due date, notes.",
            "**Mfg Route** — the production route for the order.",
            "**Cost & Time** — estimated days and cost.",
            "**Confirm** — review and save. The SO number is issued on save.",
          ] },
          { t: "note", tone: "info", text: "Payments are **not** entered on the sales order. You invoice the order and record payments on the invoice — see [Invoices](/docs/invoices)." },
          { t: "p", text: "Move the order along with the button on its row: **Confirm** → **Start Production** → **Ready** → **Delivered** → **Close**." },
        ],
      },
      {
        id: "invoice",
        heading: "Invoice an order",
        shot: "invoice-create",
        caption: "Create invoice — full remaining amount or a deposit",
        blocks: [
          { t: "p", text: "On a confirmed order that is not fully invoiced, choose **Create invoice**. You can invoice the **full remaining** amount or a **part / deposit**. Full details in [Invoices](/docs/invoices)." },
        ],
      },
      {
        id: "print-cancel",
        heading: "Print, export, cancel",
        shot: "print-sales-order",
        caption: "A printed sales order with its references",
        blocks: [
          { t: "list", items: [
            "**Print** opens the A4 sales order with the source quotation and every invoice listed, plus invoiced / paid / balance.",
            "**Export** downloads the list as CSV, including invoiced and paid amounts.",
            "**Cancel** is refused while the order has active (not void) invoices. Void those first.",
          ] },
        ],
      },
    ],
    related: ["quotations", "invoices", "production-orders"],
  },
  {
    slug: "point-of-sale",
    category: "sales",
    title: "Point of Sale (shop till)",
    summary: "Sell over the counter, take cash, card, mobile wallet or split payments, and print the receipt.",
    status: "live",
    sections: [
      {
        id: "setup",
        heading: "Before the first sale",
        shot: "pos",
        caption: "Sales → Point of Sale",
        blocks: [
          { t: "p", text: "The till needs at least one **branch** with one **register**. Create them in **Branches** (see [Branches & registers](/docs/branches)). Choose the branch and register at the top of the till." },
          { t: "p", text: "Products appear as tiles. Search by name, SKU or barcode, filter by category, or sort by price or stock." },
        ],
      },
      {
        id: "sell",
        heading: "Make a sale",
        blocks: [
          { t: "steps", items: [
            "Click products to add them to the cart; use + / − to change quantity.",
            "Optionally add the customer name and phone, a discount %, and a note.",
            "Choose **Pay**, then the method: **Cash**, **Card**, **Mobile** wallet or **Split** (part cash, part card).",
            "For cash, enter the amount received — the till shows the change.",
            "Choose **Confirm Payment**. The sale gets its number (`POS-2026-…`) and the cart clears.",
            "Choose **Print** to print the sale receipt, or **New Sale** to continue.",
          ] },
          { t: "table", head: ["Line", "How it's worked out"], rows: [
            ["Subtotal", "Sum of item prices × quantities."],
            ["Discount", "Subtotal × discount %."],
            ["VAT (14%)", "(Subtotal − discount) × 14%."],
            ["Total", "Subtotal − discount + VAT."],
            ["Loyalty points earned", "One point per whole EGP of subtotal."],
          ] },
        ],
      },
      {
        id: "hold",
        heading: "Hold a sale",
        blocks: [
          { t: "p", text: "Serving someone else mid-sale? Choose **Hold**. The cart is parked and the till is free. Open **held** sales to bring it back, or discard it." },
          { t: "note", tone: "warn", text: "Held sales are kept only while the till page is open. Refreshing or closing the tab loses them — complete them first." },
        ],
      },
      {
        id: "errors",
        heading: "If payment doesn't go through",
        blocks: [
          { t: "list", items: [
            "**Check the payment** — the details don't add up, usually cash received is less than the total. Fix the amount and confirm again.",
            "**Payment failed — The sale was not recorded.** Nothing was saved and the cart is kept. Check your connection and try again.",
            "**No registers** — the chosen branch has no active register. Add one in Branches.",
          ] },
        ],
      },
    ],
    related: ["branches", "products-and-bom"],
  },

  // ───────────────────────── Production ─────────────────────────
  {
    slug: "products-and-bom",
    category: "production",
    title: "Products, materials list and costing",
    summary: "Build each product once — sizes, materials, stages and cost — then reuse it for orders and production.",
    status: "live",
    sections: [
      {
        id: "list",
        heading: "The product catalogue",
        shot: "products",
        caption: "Production → Products",
        blocks: [
          { t: "p", text: "Products shows every item CUBS makes, with SKU, category, cost, margin and warnings such as **Missing BOM** (no materials list) or **Missing Stages**." },
          { t: "p", text: "Use **Export** for a CSV of the catalogue and **Import** to add many products from a spreadsheet." },
        ],
      },
      {
        id: "wizard",
        heading: "Create a product",
        shot: "product-new",
        caption: "New Product — manufacturing wizard",
        blocks: [
          { t: "p", text: "Choose **New Product**. Start blank or **From Template** (for example the garment template). The wizard has six steps:" },
          { t: "steps", items: [
            "**Basic Info** — English and Arabic name, SKU, category, description, active or inactive.",
            "**Dimensions** — sizes, measurements and estimated weight (optional).",
            "**Materials & BOM** — each fabric and trim with quantity, unit, unit cost and waste %.",
            "**Mfg Stages** — pattern, cutting, sewing, finishing, quality check, packing, with duration in hours, team and capacity per day.",
            "**Dependencies** — which stages must finish before others (sequential) and which can run alongside (parallel).",
            "**Cost & Review** — material, labour, machine and overhead cost, margin and the **suggested selling price**. Choose **Create Product**.",
          ] },
        ],
      },
      {
        id: "costing",
        heading: "How cost and price are worked out",
        blocks: [
          { t: "table", head: ["Part", "Calculation"], rows: [
            ["Material cost", "Sum of BOM lines (quantity × unit cost), plus each line's waste %."],
            ["Labour & machine", "From the stages: hours × the cost rates you enter."],
            ["Overhead", "The overhead amount or % you enter."],
            ["Total cost", "Material + labour + machine + overhead."],
            ["Suggested price", "Total cost plus your profit margin."],
          ] },
          { t: "p", text: "Critical path and **Total Work Days** show how long one batch takes when parallel stages run together." },
        ],
      },
      {
        id: "detail",
        heading: "Product page, duplicates and variants",
        shot: "product-detail",
        caption: "A product's overview, BOM, stages and cost",
        blocks: [
          { t: "list", items: [
            "Open a product to see Overview, BOM, Stages and Cost. Choose **Edit** to change it and **Save Changes**.",
            "**Duplicate** copies a product — choose what to copy (dimensions, BOM, stages, pricing). Tick **Create as Variant** to link the copy to the original (for example another colourway).",
            "**Delete Product** removes it permanently; this can't be undone.",
          ] },
        ],
      },
    ],
    related: ["production-orders", "inventory"],
  },
  {
    slug: "production-orders",
    category: "production",
    title: "Production orders, stages and cutting lists",
    summary: "Plan a batch, move it through each stage, keep its cutting list, and print the job sheet.",
    status: "live",
    sections: [
      {
        id: "list",
        heading: "Planning & Cutting",
        shot: "production-planning",
        caption: "Production → Planning & Cutting",
        blocks: [
          { t: "p", text: "Every production order (MO) with its status, priority, customer, station, due date and progress bar. Overdue orders are flagged in red." },
        ],
      },
      {
        id: "create",
        heading: "Create a production order",
        shot: "production-order-new",
        caption: "New Production Order",
        blocks: [
          { t: "steps", items: [
            "Choose **New Order**.",
            "Enter a **Title** (for example \"Explorer Zip Hoodie — Sage × 600\") and the **Quantity (pieces)**. Both are required.",
            "Optionally pick an approved **Design Brief** — it fills the title, customer and sales order for you.",
            "Link the **Sales Order**, set **Priority**, **Station / Workshop**, **Start Date**, **Due Date** and notes.",
            "Choose **Create Order**. The number (`MO-2026-…`) is issued and six stages are created: Pattern & Marker, Cutting, Sewing, Finishing & Pressing, Quality Check, Packing.",
          ] },
          { t: "note", tone: "info", text: "Orders created before numbering was switched on may show older numbers such as PO-2026-041. They keep them." },
        ],
      },
      {
        id: "stages",
        heading: "Move through the stages",
        shot: "production-order-detail",
        caption: "Production Line tab — each stage with time, worker and station",
        blocks: [
          { t: "steps", items: [
            "Open the order. The **Production Line** tab lists the stages in order.",
            "Choose **Start** on a stage when work begins; its start time is recorded.",
            "Choose **Done** when it finishes; the duration is calculated and the progress bar moves.",
            "When the last stage (Packing) is done, the order becomes **Ready** for delivery.",
          ] },
          { t: "p", text: "The **Timeline** tab shows when each stage started and finished." },
        ],
      },
      {
        id: "cutting",
        heading: "Cutting list",
        blocks: [
          { t: "p", text: "The **Cutting List** tab records each pattern piece: part name (for example \"Front body (L/R)\"), fabric, marker width and length (cm), plies, quantity, grain direction, size ratio (for example `2Y:1 4Y:2 6Y:2`) and notes. Tick a piece when it is cut." },
          { t: "p", text: "Use **Add Piece** to add, the pencil to edit, and the bin to remove a piece." },
        ],
      },
      {
        id: "print",
        heading: "Print the job sheet",
        shot: "print-production-order",
        caption: "A printed production order with cutting list and stage log",
        blocks: [
          { t: "p", text: "Choose **Print** in the order header. The A4 job sheet includes the linked sales order, quantity, the full cutting list and the stage log with sign-off columns — ready to hang at the cutting table." },
          { t: "p", text: "**Edit** changes title, dates, station, priority and quantity. The MO number never changes." },
        ],
      },
    ],
    related: ["production-floor", "quality-control", "delivery"],
  },
  {
    slug: "production-floor",
    category: "production",
    title: "Production floor overview",
    summary: "Kanban and list views of everything being made, with alerts and production reports.",
    status: "live",
    sections: [
      {
        id: "production",
        heading: "Production",
        shot: "production",
        caption: "Production → Production",
        blocks: [
          { t: "p", text: "The Production page brings all orders together. Switch between **Dashboard**, **Kanban** (a column per stage: Planned, Pattern, Cutting, Sewing, Finishing, QC, Packaging, Ready) and **List**." },
          { t: "list", items: [
            "**Alerts** — delayed orders, material shortages, failed QC.",
            "**Materials** — fabric and trims needed by open orders.",
            "**Reports** — daily and weekly production, delayed orders, QC defects, material usage, efficiency and cost variance.",
          ] },
          { t: "p", text: "To move a stage forward or edit a cutting list, open the order in **Planning & Cutting**. New orders can be started from **New Order** here too." },
        ],
      },
      {
        id: "overview",
        heading: "Overview (executive view)",
        shot: "production-exec",
        caption: "Production → Overview",
        blocks: [
          { t: "p", text: "A live picture for managers: how many orders sit in each stage, what is late, and what is ready to ship." },
        ],
      },
    ],
    related: ["production-orders"],
  },
  {
    slug: "quality-control",
    category: "production",
    title: "Quality control",
    summary: "Inspect production orders against a checklist, log defects, send work back for rework and re-inspect.",
    status: "live",
    sections: [
      {
        id: "inspect",
        heading: "Run an inspection",
        shot: "quality",
        caption: "Production → Quality Control",
        blocks: [
          { t: "steps", items: [
            "Choose **New Inspection**. Pick the **Production Order** (the customer fills in), the **Inspector** and the **Type**: Pre-Assembly, In-Process, Final, Pre-Delivery or Re-Inspection.",
            "Choose **Create**. The number (`QC-2026-…`) is issued and the status is **Pending**.",
            "Choose **Start** when you begin. Go through the **Checklist** and mark each point pass or fail.",
            "Finish with **Pass**, **Fail** or **Conditional** (accepted with minor issues).",
          ] },
        ],
      },
      {
        id: "defects",
        heading: "Log defects",
        blocks: [
          { t: "p", text: "In the **Defect Log**, choose **Log Defect**: title, severity (**Critical, Major, Minor, Cosmetic**), category, description, location on the garment and a photo." },
          { t: "table", head: ["Defect status", "Meaning"], rows: [
            ["Open", "Found, not handled yet."],
            ["Rework", "Sent back to the line to fix."],
            ["Re-Inspected", "Checked again after rework."],
            ["Accepted", "Accepted as is (for example moved to seconds)."],
            ["Rejected", "Scrapped."],
          ] },
        ],
      },
    ],
    related: ["production-orders", "delivery"],
  },
  {
    slug: "designs-and-site-visits",
    category: "production",
    title: "Designs and site visits",
    summary: "Design briefs with versions and client approval; site visits for store and buyer measurements.",
    status: "live",
    sections: [
      {
        id: "designs",
        heading: "Design briefs",
        shot: "designs",
        caption: "Production → Designs",
        blocks: [
          { t: "steps", items: [
            "Choose **New Design**. Give it a **Title**, customer, sales order, designer, style, colours, materials and due date. The brief number (`DB-2026-…`) is issued on save.",
            "Upload tech packs, flats and drawings under **Drawings**. Each upload is a new **Version**; **Version History** keeps the old ones.",
            "Use **Comments & Annotations** for questions and revision requests; **Resolve** them when done.",
            "Move the brief through Draft → In Progress → Internal Review → **Send to Client** → Client Review → **Approved** (or Revision).",
          ] },
          { t: "p", text: "An approved brief can be picked when creating a production order, which fills in the details." },
        ],
      },
      {
        id: "visits",
        heading: "Site visits",
        shot: "site-visits",
        caption: "Production → Site Visits",
        blocks: [
          { t: "p", text: "Use site visits when someone goes out to measure — a store's hanging wall, a boutique window, a franchise stand. Each visit (`SV-2026-…`) holds the address, technician, date, a checklist, photos and **measurements by area** (width, height, depth, length)." },
          { t: "p", text: "Measurements go through Draft → Submitted → Approved (or Needs Revision). **Export Measurements** downloads them; **Download Template** gives an empty sheet to fill on site." },
        ],
      },
    ],
    related: ["production-orders"],
  },
  {
    slug: "delivery",
    category: "production",
    title: "Delivery and set-up",
    summary: "Schedule deliveries from production orders, track them to the door, and print the delivery note.",
    status: "live",
    sections: [
      {
        id: "deliveries",
        heading: "Deliveries",
        shot: "delivery",
        caption: "Delivery → Deliveries and Installations",
        blocks: [
          { t: "steps", items: [
            "Choose **New Delivery** and pick the **Production Order**. The customer, sales order and production order numbers are linked automatically.",
            "Add phone, delivery address, date, time slot, driver, vehicle, number of pieces and packages. The delivery note number (`DN-2026-…`) is issued on save.",
            "On the day: **Start Loading** → **Dispatch** (in transit) → **Complete** (delivered) or **Failed**.",
            "Choose **Print delivery note** for the driver. The customer signs the \"Received by\" box.",
          ] },
        ],
      },
      {
        id: "installations",
        heading: "Installations (store set-up)",
        blocks: [
          { t: "p", text: "For deliveries that need the team on site — dressing a window, fitting a shop-in-shop — create an **Installation** from the delivery (`INS-2026-…`). Track Scheduled → In Progress → Completed or On Hold, tick the checklist, log snags, add photos and the customer rating." },
        ],
      },
    ],
    related: ["production-orders", "printing-documents"],
  },

  // ───────────────────────── Stock & purchasing ─────────────────────────
  {
    slug: "inventory",
    category: "stock",
    title: "Inventory: fabrics, materials and assets",
    summary: "What you hold, where it is, what it's worth, and what needs re-ordering.",
    status: "live",
    sections: [
      {
        id: "overview",
        heading: "Inventory overview",
        shot: "inventory",
        caption: "Inventory → Overview",
        blocks: [
          { t: "p", text: "Inventory & Assets shows stock value, low and out-of-stock items, a **Reorder Planner** with a suggested purchase budget, ABC analysis (items ranked by value share), recent movements and maintenance." },
          { t: "list", items: [
            "**Add Inventory Item** — name, SKU, barcode, category, unit (metre, roll, piece, kg…), unit cost, quantity, reorder level, max level, location, vendor, photo.",
            "**New Movement** — **Stock In**, **Stock Out** or **Adjustment**, with quantity, reason and location. The on-hand quantity and status update automatically.",
            "**Quick adjust** — correct a count from the item row.",
          ] },
        ],
      },
      {
        id: "fabrics",
        heading: "Fabrics",
        shot: "fabrics",
        caption: "Inventory → Fabrics",
        blocks: [
          { t: "p", text: "A dedicated list for fabric rolls: composition, GSM, width (cm), colour, supplier, location, quantity, reorder level and unit cost. Status is **In Stock**, **Low Stock** (at or below the reorder level) or **Out of Stock**." },
        ],
      },
      {
        id: "materials",
        heading: "Materials and trims",
        shot: "materials",
        caption: "Inventory → Materials",
        blocks: [
          { t: "p", text: "Trims and supplies grouped by category: Zippers, Buttons & Snaps, Elastic, Thread & Yarn, Labels & Tags, Lining, Packaging, Notions & Trims, Chemicals & Dyes, Other." },
        ],
      },
      {
        id: "assets",
        heading: "Assets and equipment",
        shot: "equipment",
        caption: "Inventory → Assets",
        blocks: [
          { t: "p", text: "Sewing machines, overlockers, embroidery heads, vehicles, tools and software licences. Each asset has a tag, serial number, condition, assignment, warranty expiry and **straight-line depreciation** (purchase cost ÷ useful life in years), showing book value and life used." },
          { t: "p", text: "**Schedule Maintenance** records preventive, corrective, inspection or emergency work with date, vendor and cost." },
        ],
      },
    ],
    related: ["purchasing"],
  },
  {
    slug: "purchasing",
    category: "stock",
    title: "Purchase requests and purchase orders",
    summary: "Ask for materials, get approval, order from the supplier with item lines and VAT, and print the PO.",
    status: "live",
    sections: [
      {
        id: "overview",
        heading: "Purchasing & Vendors",
        shot: "purchasing",
        caption: "Inventory → Purchasing",
        blocks: [
          { t: "p", text: "Four tabs: **Overview** (pending approvals and recent orders), **Vendors**, **Requests** and **Orders**. The cards at the top count vendors, open requests, pending approvals, approved requests, open POs and PO value." },
          { t: "p", text: "Add suppliers with **Add Vendor** — name, category, contact, phone, email, payment terms, country and notes." },
        ],
      },
      {
        id: "request",
        heading: "Purchase requests",
        shot: "purchase-requests",
        caption: "Requests tab",
        blocks: [
          { t: "steps", items: [
            "Choose **New PR**. Add a description, supplier (optional), needed-by date, department, priority and item lines (item, quantity, unit, unit price).",
            "Choose **Save & issue number** — you get `PR-2026-…` as a **Draft**.",
            "Choose **Submit** to send it for approval.",
            "A manager chooses ✓ **Approve** or ✕ **Reject**.",
            "On an approved request choose **Create PO**. The PO opens pre-filled with the request's lines; when saved, the request becomes **Ordered** and shows \"→ PO-…\".",
          ] },
        ],
      },
      {
        id: "order",
        heading: "Purchase orders",
        shot: "purchase-order-new",
        caption: "New purchase order with item lines and VAT",
        blocks: [
          { t: "steps", items: [
            "Choose **New PO** (or **Create PO** from a request).",
            "Description and **Supplier** are required. Add delivery date, payment terms and VAT % (14% by default).",
            "Add item lines. Lines with no name or zero quantity are ignored; at least one real line is needed.",
            "Check subtotal, VAT and total, then **Save & issue number** — `PO-2026-…` as a **Draft**.",
            "Choose **Send to supplier** when it goes out. Status: **Sent**.",
          ] },
          { t: "table", head: ["PO status", "Meaning"], rows: [
            ["Draft", "Saved, not sent."],
            ["Sent", "With the supplier, waiting for goods."],
            ["Partially Received", "Some lines or quantities arrived."],
            ["Received", "Everything ordered arrived."],
            ["Cancelled", "Withdrawn. Not possible once goods were received."],
          ] },
        ],
      },
      {
        id: "print",
        heading: "Print the purchase order",
        shot: "print-purchase-order",
        caption: "A printed purchase order",
        blocks: [
          { t: "p", text: "The printer icon on a PO opens the A4 purchase order: supplier, delivery date, payment terms, the source request number, item lines with ordered and received quantities, totals and signature boxes." },
        ],
      },
    ],
    related: ["receiving-goods", "inventory"],
  },
  {
    slug: "receiving-goods",
    category: "stock",
    title: "Receiving goods (GRN)",
    summary: "Record what actually arrived — in one delivery or several — and print a goods received note for each.",
    status: "live",
    sections: [
      {
        id: "receive",
        heading: "Receive against a PO",
        shot: "receive-goods",
        caption: "Receive goods — ordered, already received and now",
        blocks: [
          { t: "steps", items: [
            "In **Orders**, find a PO that is **Sent** or **Partially Received** and choose **Receive**.",
            "Each line shows **Ordered**, **Received** so far, and a **Now** box pre-filled with what is still outstanding.",
            "Change **Now** to what really arrived (0 for lines that didn't come).",
            "Add the supplier's delivery note number and any notes.",
            "Choose **Confirm receipt**. A goods received note `GRN-2026-…` is issued.",
          ] },
          { t: "p", text: "If every line is now fully received the PO becomes **Received**; otherwise **Partially Received** and you can receive again later. Each delivery gets its own GRN." },
          { t: "note", tone: "warn", text: "You can't receive more than was ordered on any line — the box turns red and **Confirm receipt** is disabled. If the supplier sent extra, raise a new PO for the extra." },
        ],
      },
      {
        id: "print",
        heading: "Print the GRN",
        shot: "print-grn",
        caption: "A printed goods received note",
        blocks: [
          { t: "p", text: "After confirming, choose **Print GRN**. Every GRN number also appears on the PO row — click it to print that note again. The GRN shows the supplier, who received it, the PO reference, quantities received against quantities ordered, and signature boxes for the warehouse and the supplier's driver." },
          { t: "note", tone: "info", text: "Older purchase orders created before item lines existed have no lines, so **Receive** doesn't appear on them." },
        ],
      },
    ],
    related: ["purchasing", "inventory"],
  },

  // ───────────────────────── Finance ─────────────────────────
  {
    slug: "invoices",
    category: "finance",
    title: "Invoices",
    summary: "Invoice a confirmed sales order in full or in parts. Bumblebee never lets an order be over-invoiced.",
    status: "live",
    sections: [
      {
        id: "create",
        heading: "Create an invoice from a sales order",
        shot: "invoice-create",
        caption: "Create invoice",
        blocks: [
          { t: "steps", items: [
            "Open **Sales → Sales Orders** and choose **Create invoice** on the order.",
            "The panel shows the order total, what is already invoiced and what is **left to invoice**.",
            "Choose **Full remaining** or **Part / deposit** and type the amount (VAT included).",
            "Optionally set a due date and a note (for example \"50% deposit\").",
            "Choose **Issue invoice**. You get `INV-2026-…` and can print it straight away.",
          ] },
          { t: "table", head: ["Rule", "Why"], rows: [
            ["Only confirmed orders (not Draft or Cancelled)", "You can't bill something the customer hasn't confirmed."],
            ["Amount must be more than zero", "An empty invoice has no meaning."],
            ["Amount can't exceed what is left to invoice", "The sum of all invoices never passes the order total."],
          ] },
        ],
      },
      {
        id: "vat",
        heading: "How VAT is shown on an invoice",
        blocks: [
          { t: "p", text: "The amount you invoice includes VAT. Bumblebee splits it using the order's VAT rate: **amount before VAT = amount ÷ (1 + rate)**, and **VAT = amount − amount before VAT**." },
          { t: "p", text: "Example: a 1,000 EGP deposit at 14% → 877.19 before VAT + 122.81 VAT." },
          { t: "p", text: "A deposit invoice prints as a single instalment line referencing the sales order and its full total. A full invoice prints the order's item lines." },
        ],
      },
      {
        id: "list",
        heading: "Invoices & Receipts page",
        shot: "finance-invoices",
        caption: "Finance → Invoices",
        blocks: [
          { t: "p", text: "The cards show **Outstanding**, **Overdue**, **Invoiced this month** and **Collected this month**. Search by number or customer, and filter **All / Due / Overdue / Paid / Void**. Expand an invoice to see its receipts." },
          { t: "table", head: ["Invoice status", "Meaning"], rows: [
            ["Sent", "Issued, nothing paid yet."],
            ["Partially paid", "Some payments recorded; a balance remains."],
            ["Paid", "Fully paid. Prints with a PAID stamp."],
            ["Overdue", "Past its due date with a balance."],
            ["Void", "Cancelled with a reason. Prints with a VOID stamp."],
          ] },
        ],
      },
      {
        id: "print",
        heading: "The printed invoice",
        shot: "print-invoice",
        caption: "A printed tax invoice",
        blocks: [
          { t: "p", text: "Shows your company details (from **Settings → Company**), bill-to, sales order and quotation references, every receipt number, lines, amount before VAT, VAT, invoice total, paid and **balance due**." },
        ],
      },
    ],
    related: ["payments-and-receipts", "fixing-mistakes", "sales-orders"],
  },
  {
    slug: "payments-and-receipts",
    category: "finance",
    title: "Payments and receipts",
    summary: "Record each payment against its invoice and hand the customer a numbered receipt.",
    status: "live",
    sections: [
      {
        id: "record",
        heading: "Record a payment",
        shot: "payment-record",
        caption: "Record payment",
        blocks: [
          { t: "steps", items: [
            "In **Finance → Invoices**, choose **Record payment** on the invoice.",
            "The amount is pre-filled with the balance due. Change it for a partial payment.",
            "Pick the date and the method: **Cash, InstaPay, Bank transfer, Card, Mobile wallet** or **Cheque**.",
            "Add a reference (transfer or cheque number) if there is one.",
            "Choose **Record & issue receipt**. You get `RCT-2026-…` and can print it.",
          ] },
          { t: "table", head: ["Rule", "Message if broken"], rows: [
            ["Payment must be more than zero", "Payment must be more than zero"],
            ["Can't pay more than the balance", "Only X is due on invoice INV-…"],
            ["Invoice must be issued and not void", "Invoice INV-… is void, payments can't be recorded"],
          ] },
          { t: "p", text: "The invoice status updates by itself: **Partially paid** while a balance remains, **Paid** when it reaches zero." },
        ],
      },
      {
        id: "receipts",
        heading: "The receipts list",
        shot: "finance-receipts",
        caption: "Receipts tab",
        blocks: [
          { t: "p", text: "The **Receipts** tab lists every payment: receipt number, invoice, customer, method, reference, date and amount. Each printed receipt shows the invoice balance **before** and **after** that payment." },
        ],
      },
    ],
    related: ["invoices", "fixing-mistakes"],
  },
  {
    slug: "fixing-mistakes",
    category: "finance",
    title: "Fixing mistakes: void and cancel",
    summary: "Issued documents are never deleted. Here is the right way to correct each kind of mistake.",
    status: "live",
    sections: [
      {
        id: "why",
        heading: "Why nothing can be deleted",
        blocks: [
          { t: "p", text: "Once a document has a number, it may already be on paper in a customer's or supplier's hands. Deleting it would leave a hole nobody can explain. So Bumblebee **voids** money documents and **cancels** everything else — the record stays, marked, with the reason." },
        ],
      },
      {
        id: "recipes",
        heading: "What to do for each mistake",
        blocks: [
          { t: "table", head: ["Mistake", "Fix"], rows: [
            ["Wrong payment amount or method", "Void the receipt (reason required), then record the payment again."],
            ["Payment recorded on the wrong invoice", "Void that receipt, then record it on the right invoice."],
            ["Wrong invoice amount", "Void every receipt on it, void the invoice, then create a new invoice from the sales order."],
            ["Sales order is wrong", "Void its invoices first, then cancel the order and create a new one."],
            ["Quotation is wrong", "Cancel it and create a new quotation with the right details."],
            ["Purchase order is wrong and nothing arrived yet", "Cancel it and create a new PO."],
            ["Purchase order is wrong but goods arrived", "It can't be cancelled. Create a new PO for the difference and note it."],
            ["Production order details are wrong", "Use Edit — title, dates, quantity and station can change. The MO number can't."],
          ] },
        ],
      },
      {
        id: "void",
        heading: "Void an invoice or a receipt",
        blocks: [
          { t: "steps", items: [
            "In **Finance → Invoices**, choose **Void invoice** on the invoice, or the void button on a receipt (in the expanded invoice or the Receipts tab).",
            "Type the reason — it's required and appears on the printed document.",
            "Confirm. A voided receipt no longer counts towards the invoice; the invoice balance and status update.",
          ] },
          { t: "note", tone: "warn", text: "Only **owners, admins, managers and finance** can void. An invoice with active receipts can't be voided — void the receipts first." },
        ],
      },
    ],
    related: ["invoices", "payments-and-receipts", "document-numbers"],
  },

  // ───────────────────────── Documents ─────────────────────────
  {
    slug: "document-numbers",
    category: "documents",
    title: "Document numbers",
    summary: "Every document gets a permanent, sequential number from the database the moment it is saved.",
    status: "live",
    sections: [
      {
        id: "format",
        heading: "The format",
        blocks: [
          { t: "p", text: "Numbers look like `PREFIX-YEAR-00001`. The counter is per document type and restarts at 00001 every January (Cairo time)." },
          { t: "table", head: ["Prefix", "Document"], rows: [
            ["QT", "Quotation"], ["SO", "Sales order"], ["INV", "Invoice"], ["RCT", "Receipt (payment)"],
            ["PR", "Purchase request"], ["PO", "Purchase order"], ["GRN", "Goods received note"],
            ["MO", "Production (manufacturing) order"], ["QC", "Quality inspection"], ["DN", "Delivery note"],
            ["INS", "Installation"], ["POS", "Point-of-sale sale"], ["DB", "Design brief"], ["SV", "Site visit"],
          ] },
        ],
      },
      {
        id: "rules",
        heading: "The rules",
        blocks: [
          { t: "list", items: [
            "The number is issued by the database when you save, never typed by hand.",
            "Two people saving at the same second still get different numbers.",
            "A number can't be changed once issued.",
            "The same number can't exist twice in your workspace.",
            "Issued quotations, sales orders, purchase requests and purchase orders can't be deleted — only cancelled. Invoices and receipts can only be voided.",
          ] },
          { t: "note", tone: "info", text: "A **gap** in the sequence is normal: if a save fails after the number was issued (for example the connection dropped), that number is not reused." },
        ],
      },
    ],
    related: ["references", "printing-documents"],
  },
  {
    slug: "references",
    category: "documents",
    title: "How documents reference each other",
    summary: "Follow any document back to where it came from and forward to what it produced.",
    status: "live",
    sections: [
      {
        id: "chain",
        heading: "The reference chain",
        shot: "print-sales-order",
        caption: "A sales order shows its quotation and every invoice",
        blocks: [
          { t: "table", head: ["Document", "Points back to", "Points forward to"], rows: [
            ["Quotation", "—", "The sales order it became"],
            ["Sales order", "Source quotation", "Its invoices; production orders linked to it"],
            ["Invoice", "Sales order and quotation", "Every receipt paid against it"],
            ["Receipt", "Invoice (and its sales order)", "—"],
            ["Purchase request", "—", "The purchase order it became"],
            ["Purchase order", "Source purchase request", "Every goods received note"],
            ["Goods received note", "Purchase order", "—"],
            ["Production order", "Sales order, design brief", "Deliveries, QC inspections"],
            ["Delivery note", "Production order and sales order", "Installation"],
          ] },
          { t: "p", text: "These references are printed on the documents too, so a customer, supplier or accountant can trace them without logging in." },
        ],
      },
    ],
    related: ["document-numbers", "printing-documents"],
  },
  {
    slug: "printing-documents",
    category: "documents",
    title: "Printing and saving as PDF",
    summary: "Every document prints on A4 in English and Arabic, with your company header.",
    status: "live",
    sections: [
      {
        id: "how",
        heading: "Print a document",
        shot: "print-quotation",
        caption: "The print view",
        blocks: [
          { t: "steps", items: [
            "Choose **Print** (or the printer icon) on the document.",
            "A new tab opens with the A4 page.",
            "Choose **Print / Save PDF**. In the browser's dialog pick a printer, or **Save as PDF** to email it.",
            "Choose **Close** to close the tab.",
          ] },
          { t: "table", head: ["Document", "Where the Print button is"], rows: [
            ["Quotation", "On the quotation card"], ["Sales order", "On the order row"],
            ["Invoice / receipt", "Finance → Invoices (and right after issuing)"],
            ["Purchase request / order", "Purchasing → Requests / Orders"], ["Goods received note", "After receiving, or the GRN number on the PO row"],
            ["Production order", "Planning & Cutting → open the order"], ["Delivery note", "Delivery → open the delivery"],
            ["POS sale", "After payment on the till"],
          ] },
        ],
      },
      {
        id: "settings",
        heading: "Best print settings",
        blocks: [
          { t: "list", items: [
            "Paper: **A4**. Margins: **Default**. Scale: **100%**.",
            "Turn **off** \"Headers and footers\" so the browser doesn't add the web address and date.",
            "Turn **on** \"Background graphics\" so PAID / VOID stamps and table lines print.",
          ] },
          { t: "note", tone: "tip", text: "If nothing opens when you click Print, your browser blocked the new tab. Allow pop-ups for bumblebee-cubs.vercel.app." },
        ],
      },
      {
        id: "header",
        heading: "Your company details on paper",
        shot: "settings-company",
        caption: "Settings → Company",
        blocks: [
          { t: "p", text: "The header of every printed document uses **Settings → Company**: legal name in English and Arabic, address, phone, email, tax registration number and commercial register number. Only owners and admins can edit these." },
        ],
      },
    ],
    related: ["document-numbers", "settings"],
  },

  // ───────────────────────── People ─────────────────────────
  {
    slug: "users-and-access",
    category: "people",
    title: "Users and access",
    summary: "Create a login for each colleague and decide exactly what they can open.",
    status: "live",
    sections: [
      {
        id: "page",
        heading: "Users & Access",
        shot: "users",
        caption: "People → Users & Access",
        blocks: [
          { t: "p", text: "Lists every member with role, department, status (**Active** or **Suspended**) and last sign-in. Tabs: **Overview**, **Members**, **Roles** and **Role Templates**. Filter by role, department or status." },
        ],
      },
      {
        id: "create",
        heading: "Create a login",
        shot: "users-create",
        caption: "Create a login for a colleague",
        blocks: [
          { t: "steps", items: [
            "Choose **Create login**.",
            "Enter the **Full name**.",
            "Enter a **Username**: 3–32 characters, lowercase letters, numbers, dot, dash or underscore, starting with a letter or number (for example `sara.ahmed`).",
            "Type a **Password** of at least 8 characters, or choose **Generate** for a strong one.",
            "Pick the **Access level** (role) and department.",
            "Choose **Create login**, then **Copy login details** and send them privately.",
          ] },
          { t: "note", tone: "warn", text: "The password is shown **once**. If it's lost, reset it — nobody can read it later, not even the owner." },
        ],
      },
      {
        id: "manage",
        heading: "Change role, suspend, reset password",
        blocks: [
          { t: "p", text: "Click a member to open their panel:" },
          { t: "list", items: [
            "**Role** — change their access level. Only the owner can make someone an admin.",
            "**Suspend login** — immediately stops them opening any workspace data, without deleting anything they created. **Re-activate** reverses it; they sign in with the same username and password.",
            "**Reset password** — set a new password (8+ characters) and pass it on.",
          ] },
          { t: "table", head: ["Who can…", "Owner", "Admin", "Others"], rows: [
            ["Create normal logins", "✓", "✓", "—"],
            ["Create owner or admin logins", "✓", "—", "—"],
            ["Reset a normal member's password", "✓", "✓", "—"],
            ["Reset an owner's or admin's password", "✓", "—", "—"],
            ["Change the owner", "—", "—", "—"],
          ] },
        ],
      },
    ],
    related: ["roles", "signing-in"],
  },
  {
    slug: "roles",
    category: "people",
    title: "Roles and what each can open",
    summary: "Ready-made access levels for each job, based on the modules they need.",
    status: "live",
    sections: [
      {
        id: "templates",
        heading: "Role templates",
        blocks: [
          { t: "table", head: ["Role", "For", "Main access"], rows: [
            ["Owner", "The business owner", "Everything, including other admins."],
            ["Admin", "System manager", "Everything; can't delete the workspace or manage the owner."],
            ["Sales", "Sales team", "Customers, contacts, quotations (incl. approve), orders; read-only elsewhere."],
            ["Finance", "Accountants", "Finance (create, approve, release), approvals on quotations, orders and purchasing; read-only elsewhere."],
            ["Production Manager", "Factory manager", "Products, BOM, production, stages, quality (approve); delivery assignment."],
            ["Warehouse", "Store keeper", "Inventory and stock, purchasing."],
            ["Purchasing", "Buyer", "Purchase orders and suppliers."],
            ["Quality Control", "QC inspectors", "Quality checks and inspections."],
            ["Delivery", "Drivers, logistics", "Delivery and installation."],
            ["Viewer", "Read-only users", "Can look at everything, change nothing."],
          ] },
          { t: "p", text: "A person only sees the areas their role can open in the sidebar. Opening a hidden page from a pasted link shows a \"no access\" message instead." },
          { t: "note", tone: "info", text: "Voiding invoices and receipts is limited to owner, admin, manager and finance at the database level, whatever else the role allows." },
        ],
      },
    ],
    related: ["users-and-access"],
  },
  {
    slug: "team-and-employees",
    category: "people",
    title: "Team and employees",
    summary: "Your people directory, attendance and leave requests.",
    status: "live",
    sections: [
      {
        id: "team",
        heading: "Team",
        shot: "team",
        caption: "People → Team",
        blocks: [
          { t: "p", text: "Team shows each member's job title, department, type (employee, contractor, intern), status and workload — open tasks, overdue items and work done this week. **Add Employee** adds someone to the directory." },
          { t: "note", tone: "info", text: "Adding someone to Team does **not** give them a login. Logins are created in [Users & Access](/docs/users-and-access)." },
        ],
      },
      {
        id: "employees",
        heading: "Employees, attendance and leave",
        shot: "hr-employees",
        caption: "People → Employees",
        blocks: [
          { t: "list", items: [
            "**Employees** — employee number, English and Arabic name and title, department, contract type, hire date, salary, skills, emergency contact.",
            "**Attendance** — Present, Absent, Late, Half Day, Excused or Holiday per day, with check-out.",
            "**Leave Requests** — Annual, Sick, Unpaid, Maternity, Emergency or Other, with dates and reason. Managers **Approve** or **Reject**.",
          ] },
        ],
      },
    ],
    related: ["users-and-access"],
  },

  // ───────────────────────── Admin ─────────────────────────
  {
    slug: "settings",
    category: "admin",
    title: "Settings",
    summary: "Your profile and password, workspace preferences, company details, modules and notifications.",
    status: "live",
    sections: [
      {
        id: "tabs",
        heading: "The settings tabs",
        shot: "settings",
        caption: "Settings",
        blocks: [
          { t: "table", head: ["Tab", "What you can do", "Who"], rows: [
            ["Profile", "Your name, phone, job title, department, bio, time zone, date and time format.", "Everyone (for themselves)"],
            ["Preferences", "Workspace currency and language setting.", "Owner / admin"],
            ["Security", "Change your password (you must enter the current one).", "Everyone"],
            ["Company", "Legal names, address, phone, email, tax number, commercial register — printed on documents.", "Owner / admin"],
            ["Modules", "A list of modules to switch on or off. (Preview — the sidebar is decided by each person's role, not by this list.)", "Owner / admin"],
            ["Notifications", "Which alerts you want and on which channel. (Preview — these choices aren't saved yet.)", "Everyone"],
          ] },
          { t: "p", text: "Your sign-in email and username can't be changed here. Ask an admin if your username must change." },
        ],
      },
      {
        id: "company",
        heading: "Company details",
        shot: "settings-company",
        caption: "Settings → Company",
        blocks: [
          { t: "steps", items: [
            "Open **Settings → Company**.",
            "Fill the legal name (English and Arabic), phone, email, tax registration number, commercial register number and address.",
            "Choose **Save**. The next document you print carries the new header.",
          ] },
          { t: "note", tone: "warn", text: "If you see \"Couldn't save\", your role is not owner or admin." },
        ],
      },
    ],
    related: ["printing-documents", "users-and-access"],
  },
  {
    slug: "branches",
    category: "admin",
    title: "Branches and registers",
    summary: "Your factory, warehouse, shops and showrooms — and the tills in each.",
    status: "live",
    sections: [
      {
        id: "branches",
        heading: "Branches",
        shot: "branches",
        caption: "Branches",
        blocks: [
          { t: "steps", items: [
            "Choose **Add Branch**. Enter the name (English and Arabic), code, type (**Retail, Showroom, Warehouse, Factory, Office**), address, phone, manager and status.",
            "Select the branch and choose **Add Register** for each till: name and opening **float** (cash in the drawer).",
            "Registers marked active appear on the Point of Sale.",
          ] },
        ],
      },
    ],
    related: ["point-of-sale"],
  },
  {
    slug: "reports-and-data",
    category: "admin",
    title: "Reports, analytics, activity and data",
    summary: "Build reports, read the analytics centre, follow activity, and move data in and out with CSV.",
    status: "live",
    sections: [
      {
        id: "reports",
        heading: "Reports",
        shot: "reports",
        caption: "Insights → Reports",
        blocks: [
          { t: "p", text: "Ready reports for sales, finance, operations, inventory, purchasing and executive views, plus a **Report Builder**: choose the data source, metric, group-by, filters, date range (today, last 7/30/90 days, this year, all time) and chart type (table, bar, donut). **Save** it to reuse; **Export** downloads it." },
        ],
      },
      {
        id: "analytics",
        heading: "Analytics",
        shot: "analytics",
        caption: "Insights → Analytics",
        blocks: [
          { t: "p", text: "The Analytics Command Center reads your real records: sales funnel, top customers and products by revenue, collection rate, cash flow, production efficiency, stock distribution, items needing reorder and purchase orders by status." },
        ],
      },
      {
        id: "activity",
        heading: "Activity and work items",
        shot: "activity",
        caption: "Home → Activity",
        blocks: [
          { t: "p", text: "**Activity** is a feed of what happened — orders created, stages completed, inspections passed — filterable by type, person and date." },
          { t: "p", text: "**Work Items** is a general task board (list, kanban or calendar) for tasks, tickets, requests and work orders with assignee, priority and due date." },
        ],
      },
      {
        id: "data",
        heading: "Import and export",
        shot: "data",
        caption: "Data management",
        blocks: [
          { t: "list", items: [
            "**Export** any list (organizations, people, work items, invoices, payments, expenses, resources, activity) as CSV, or **Export All Data**.",
            "**Import** from a CSV file: download the **template** first, fill it in Excel or Google Sheets, save as CSV (UTF-8), then upload. The importer maps columns and shows how many rows were created or failed.",
          ] },
          { t: "note", tone: "tip", text: "Keep Arabic text readable in Excel by saving as \"CSV UTF-8\"." },
        ],
      },
    ],
    related: ["what-is-bumblebee"],
  },

  // ───────────────────────── Preview ─────────────────────────
  {
    slug: "preview-modules",
    category: "preview",
    title: "Preview modules",
    summary: "What the sample-data modules show today, and why changes there aren't saved.",
    status: "preview",
    sections: [
      {
        id: "what",
        heading: "What a preview module is",
        shot: "crm",
        caption: "CRM (preview)",
        blocks: [
          { t: "p", text: "These screens are fully designed and clickable, but they read **sample data** built into the app instead of your workspace. Anything you add or edit there disappears when you refresh. Use them to explore and give feedback; don't record real business in them yet." },
          { t: "table", head: ["Module", "Shows"], rows: [
            ["CRM, Customers, Deal pipeline", "Customer profiles, segments, deals by stage."],
            ["Finance dashboard, Expenses, Receivable/Payable, Bank, Finance reports", "Cash position, expense tracking, ageing, bank accounts."],
            ["HR dashboard, Payroll, Recruitment, Performance, Training, Compliance, Relations, Org structure", "The full HR suite."],
            ["Loyalty (all pages)", "Points, tiers, rewards, campaigns, redemptions."],
            ["Shopify kit: Wallet, Wishlist, Reviews", "Storefront add-ons."],
            ["Mobile apps", "App builder, configuration, push notifications, analytics."],
            ["Studio", "Pages and databases workspace."],
            ["Intelligence, Memory, Decisions, Forecast, Risk Radar, Rhythms, Work Queue", "Insight and planning views."],
          ] },
          { t: "note", tone: "info", text: "Live equivalents exist for the essentials: invoices and receipts (Finance → Invoices), employees and leave (People → Employees), and customers inside quotations and sales orders." },
        ],
      },
      {
        id: "finance",
        heading: "Finance dashboard",
        shot: "finance-dashboard",
        caption: "Finance → Dashboard (preview)",
        blocks: [{ t: "p", text: "A picture of the planned finance cockpit: revenue, expenses, cash flow and ageing. Real invoices and payments live in **Finance → Invoices**." }],
      },
      {
        id: "hr",
        heading: "HR dashboard",
        shot: "hr-dashboard",
        caption: "People → HR (preview)",
        blocks: [{ t: "p", text: "Headcount, attendance trends, payroll and hiring at a glance. Real employee records, attendance and leave live in **People → Employees**." }],
      },
      {
        id: "loyalty",
        heading: "Loyalty",
        shot: "loyalty",
        caption: "Loyalty (preview)",
        blocks: [{ t: "p", text: "Members, tiers, earning rules and rewards. The Point of Sale already records loyalty points earned per sale." }],
      },
      {
        id: "channels",
        heading: "Shopify and mobile apps",
        shot: "shopify",
        caption: "Channels → Shopify integration",
        blocks: [
          { t: "p", text: "The Shopify integration screen walks through connecting a store (client ID or access token), choosing what syncs in which direction and how often. Connecting requires the Shopify sync service to be set up for your workspace by the Bumblebee team." },
        ],
      },
    ],
    related: ["what-is-bumblebee"],
  },
];

export const ARTICLE_BY_SLUG = Object.fromEntries(ARTICLES.map((a) => [a.slug, a]));
