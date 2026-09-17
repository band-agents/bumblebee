import type { Faq, Issue } from "./types";

// ─── Troubleshooting: symptom → cause → fix ─────────────────────────────

export const ISSUES: Issue[] = [
  // Signing in
  { slug: "wrong-credentials", area: "Signing in", symptom: "I can't sign in", message: "That username and password don't match. Check both and try again.",
    cause: "The username or the password is wrong, or Caps Lock is on.",
    fix: ["Type the username exactly as your admin sent it (letters, numbers, dot, dash, underscore).", "Check Caps Lock; use the eye icon to see the password.", "Still failing? Ask an owner or admin to reset your password in Users & Access."], link: "signing-in" },
  { slug: "too-many-attempts", area: "Signing in", symptom: "Sign-in is temporarily blocked", message: "Too many attempts. Wait a minute, then try again.",
    cause: "Several failed attempts in a short time.", fix: ["Wait one minute before trying again.", "If you've forgotten the password, ask an admin to reset it rather than guessing."], link: "signing-in" },
  { slug: "cant-reach-server", area: "Signing in", symptom: "Nothing works and the page says it can't connect", message: "Can't reach the server. Check your connection and try again.",
    cause: "No internet, a captive Wi-Fi portal, or a network that blocks the site.", fix: ["Open any other website to check your connection.", "On office or hotel Wi-Fi, accept the Wi-Fi terms page first.", "Try mobile data to rule out a blocked network."] },
  { slug: "access-paused", area: "Signing in", symptom: "I signed in but see \"Your access is paused\"",
    cause: "An admin suspended your login.", fix: ["Ask an owner or admin to open Users & Access, select you and choose Re-activate."], link: "users-and-access" },
  { slug: "no-workspace", area: "Signing in", symptom: "I signed in but I'm told I don't belong to a workspace",
    cause: "The login exists but isn't a member of the CUBS workspace (for example it was created outside Users & Access).", fix: ["Sign out.", "Ask an owner or admin to create your login from Users & Access, which adds you to the workspace automatically."] },
  { slug: "forgot-password", area: "Signing in", symptom: "I forgot my password",
    cause: "There is no email reset link in Bumblebee.", fix: ["Ask an owner or admin to choose Reset password on your profile in Users & Access.", "Sign in with the new password, then change it in Settings → Security."], link: "signing-in" },

  // Access
  { slug: "page-not-in-access", area: "Access", symptom: "A page says it isn't part of my access", message: "This page isn't part of your access",
    cause: "Your role doesn't include that module.", fix: ["Ask an admin to change your role or add that module to your access in Users & Access."], link: "roles" },
  { slug: "missing-menu", area: "Access", symptom: "A module is missing from my sidebar",
    cause: "Your role can't open it.", fix: ["Ask an admin to check your role in Users & Access and change it, or add that module to your access."], link: "roles" },
  { slug: "cant-create-admin", area: "Access", symptom: "I can't create an admin or owner login", message: "Only the owner can create another owner or admin",
    cause: "Admins can create normal logins only.", fix: ["Ask the workspace owner to create it."], link: "users-and-access" },
  { slug: "cant-reset-admin", area: "Access", symptom: "I can't reset an admin's password", message: "Only the owner can reset an owner or admin password",
    cause: "Protection against one admin taking over another.", fix: ["Ask the workspace owner to reset it."], link: "users-and-access" },
  { slug: "username-rules", area: "Access", symptom: "Create login is greyed out or refused", message: "Usernames are 3–32 characters: letters, numbers, dot, dash, underscore",
    cause: "The username or password doesn't meet the rules, or the name is empty.", fix: ["Use 3–32 lowercase characters: a–z, 0–9, . - _ and start with a letter or number.", "Use a password of at least 8 characters (or Generate).", "Fill in the full name."], link: "users-and-access" },
  { slug: "username-taken", area: "Access", symptom: "The username is refused", message: "That username is taken",
    cause: "Another login already uses it.", fix: ["Add a distinguishing part, for example sara.ahmed2 or sara.sales."] },
  { slug: "password-short", area: "Access", symptom: "The password is refused", message: "Password must be at least 8 characters",
    cause: "Passwords need 8 or more characters.", fix: ["Use a longer password, or choose Generate."] },
  { slug: "current-password-wrong", area: "Access", symptom: "Changing my password fails", message: "Current password is wrong",
    cause: "Settings → Security checks your current password first.", fix: ["Retype your current password.", "If you don't know it, ask an admin to reset it."], link: "settings" },

  // Pages and app
  { slug: "page-didnt-load", area: "Using the app", symptom: "A page shows an error card instead of loading",
    cause: "Usually a new version of Bumblebee was released while your tab was open, or the connection dropped mid-load.", fix: ["Bumblebee reloads itself once automatically when a new version is detected.", "If the card stays, press Ctrl+Shift+R (⌘⇧R on Mac) to hard-refresh.", "If it happens on one page every time, tell your admin which page and what you clicked."] },
  { slug: "language-resets", area: "Using the app", symptom: "The language goes back to English after refreshing",
    cause: "The browser isn't allowing the site to store settings (private/incognito window or strict privacy mode).", fix: ["Use a normal browser window.", "Allow site data for bumblebee-cubs.vercel.app in the browser's privacy settings."], link: "arabic-and-english" },
  { slug: "old-data-showing", area: "Using the app", symptom: "I don't see a change a colleague just made",
    cause: "Most lists load when you open the page.", fix: ["Open the page again or refresh it (F5)."] },
  { slug: "preview-not-saving", area: "Using the app", symptom: "What I entered in CRM / Loyalty / HR dashboard disappeared",
    cause: "Those are preview modules that use sample data and don't save.", fix: ["Record real work in the live modules — see the list in Preview modules."], link: "preview-modules" },
  { slug: "buzz-api-error", area: "Using the app", symptom: "Buzz answers with an API error",
    cause: "The AI service behind Buzz isn't set up for this workspace.", fix: ["Everything else works without Buzz. Ask the Bumblebee team to switch the assistant on if you want it."], link: "finding-your-way" },
  { slug: "settings-couldnt-save", area: "Using the app", symptom: "Settings says it couldn't save",
    cause: "Workspace settings (company, currency, modules) can only be changed by an owner or admin.", fix: ["Ask an owner or admin to make the change."], link: "settings" },

  // Numbers & documents
  { slug: "couldnt-issue-number", area: "Documents", symptom: "Saving fails with a number error", message: "Couldn't issue a number",
    cause: "The numbering service didn't answer — usually the connection dropped, or the database update for document numbers hasn't been installed.", fix: ["Check your connection and save again.", "If it keeps happening for everyone, the admin must run the documents database update (3-documents.sql) in Supabase."], link: "document-numbers" },
  { slug: "number-gap", area: "Documents", symptom: "A number is missing from the sequence",
    cause: "A save failed after the number was issued. Numbers are never reused.", fix: ["Nothing to fix — a gap is expected and safe. The skipped number was never used on any document."], link: "document-numbers" },
  { slug: "cant-delete", area: "Documents", symptom: "I can't delete a document", message: "… is issued and can't be deleted — cancel it instead",
    cause: "Numbered documents are kept for the record.", fix: ["Cancel quotations, sales orders and purchase documents.", "Void invoices and receipts, with a reason."], link: "fixing-mistakes" },
  { slug: "cant-change-number", area: "Documents", symptom: "I want to change a document number", message: "Document number … can't be changed once issued",
    cause: "Numbers are permanent references that may already be printed.", fix: ["Cancel the document and create a new one if the number really must differ."], link: "document-numbers" },
  { slug: "print-nothing-opens", area: "Printing", symptom: "Clicking Print does nothing",
    cause: "The browser blocked the new tab as a pop-up.", fix: ["Look for the blocked pop-up icon at the right of the address bar and choose Always allow for this site.", "Click Print again."], link: "printing-documents" },
  { slug: "print-not-found", area: "Printing", symptom: "The print tab says \"Document not found\"",
    cause: "The document is in a different workspace, your access doesn't include it, or the link was copied from someone else's session.", fix: ["Open the document from its page in Bumblebee and click Print from there.", "Ask an admin to check your access to that module."], link: "printing-documents" },
  { slug: "print-url-in-margins", area: "Printing", symptom: "The printout shows the web address and date in the margins",
    cause: "The browser adds headers and footers.", fix: ["In the print dialog open More settings and untick Headers and footers."], link: "printing-documents" },
  { slug: "print-no-stamp", area: "Printing", symptom: "PAID / VOID stamps or table lines don't print",
    cause: "Background graphics are turned off in the print dialog.", fix: ["In the print dialog open More settings and tick Background graphics."], link: "printing-documents" },
  { slug: "print-wrong-company", area: "Printing", symptom: "The printed header shows the wrong company name or no tax number",
    cause: "Company details aren't filled in.", fix: ["An owner or admin fills Settings → Company and saves. Print again."], link: "settings" },
  { slug: "print-cut-off", area: "Printing", symptom: "The printed page is cut off or tiny",
    cause: "Paper size or scale is wrong.", fix: ["Choose A4 paper, Default margins and 100% scale."], link: "printing-documents" },

  // Sales
  { slug: "no-convert-button", area: "Sales", symptom: "There's no Convert to Sales Order button",
    cause: "The quotation isn't approved yet, or it was already converted.", fix: ["Choose Send, then Approve, then convert.", "If it says \"Sales order SO-…\", it's already converted — open that order."], link: "quotations" },
  { slug: "quotation-needs-item", area: "Sales", symptom: "A quotation won't save", message: "Add at least one item.",
    cause: "Quotations need at least one line with a product name.", fix: ["Add a line with a product name, quantity and price."], link: "quotations" },
  { slug: "so-cant-cancel", area: "Sales", symptom: "I can't cancel a sales order",
    cause: "The order has invoices that aren't void.", fix: ["Void the receipts on those invoices, void the invoices, then cancel the order."], link: "fixing-mistakes" },
  { slug: "pos-check-payment", area: "Sales", symptom: "The till says \"Check the payment\"",
    cause: "The payment details don't add up — most often cash received is less than the total.", fix: ["Enter the full cash received, or switch to Split for part cash, part card."], link: "point-of-sale" },
  { slug: "pos-no-registers", area: "Sales", symptom: "The till shows \"No registers\"",
    cause: "The selected branch has no active register.", fix: ["Open Branches, select the branch and choose Add Register."], link: "branches" },
  { slug: "pos-failed", area: "Sales", symptom: "The till says the payment failed", message: "Payment failed — The sale was not recorded.",
    cause: "The sale couldn't be saved, usually because the connection dropped.", fix: ["The cart is kept. Check your connection and choose Confirm Payment again."], link: "point-of-sale" },
  { slug: "pos-held-lost", area: "Sales", symptom: "A held sale disappeared",
    cause: "Held sales are kept only while the till page stays open.", fix: ["Add the items again. Complete held sales before refreshing or closing the tab."], link: "point-of-sale" },

  // Invoices
  { slug: "invoice-draft-order", area: "Invoices & payments", symptom: "I can't invoice an order", message: "Confirm the sales order before invoicing it",
    cause: "The order is Draft or Cancelled.", fix: ["Choose Confirm on the order row, then Create invoice.", "A cancelled order can't be invoiced — create a new order."], link: "invoices" },
  { slug: "invoice-over", area: "Invoices & payments", symptom: "The invoice amount is refused", message: "Only X is left to invoice on this order",
    cause: "The amount would take total invoicing above the order total.", fix: ["Invoice at most the amount shown. If the order total is wrong, correct the order (see Fixing mistakes)."], link: "invoices" },
  { slug: "invoice-full", area: "Invoices & payments", symptom: "Create invoice is missing on an order", message: "This order is already fully invoiced",
    cause: "The order is fully invoiced, or it's Draft/Cancelled.", fix: ["Check the billing line on the order. Record payments on the existing invoices in Finance → Invoices."], link: "invoices" },
  { slug: "invoice-zero", area: "Invoices & payments", symptom: "The invoice amount is refused", message: "Invoice amount must be more than zero",
    cause: "The amount is empty or 0.", fix: ["Type a positive amount."], link: "invoices" },
  { slug: "payment-over", area: "Invoices & payments", symptom: "A payment is refused", message: "Only X is due on invoice INV-…",
    cause: "The payment is larger than the balance.", fix: ["Record the balance on this invoice and the rest on the customer's next invoice.", "If the customer paid in advance for more, invoice more from the sales order first."], link: "payments-and-receipts" },
  { slug: "payment-void-invoice", area: "Invoices & payments", symptom: "I can't record a payment", message: "Invoice INV-… is void, payments can't be recorded",
    cause: "Payments can only go on issued, non-void invoices.", fix: ["Record the payment on the replacement invoice."], link: "payments-and-receipts" },
  { slug: "void-receipts-first", area: "Invoices & payments", symptom: "I can't void an invoice", message: "Void the receipts on INV-… first",
    cause: "The invoice has payments recorded against it.", fix: ["Void each receipt (with a reason), then void the invoice."], link: "fixing-mistakes" },
  { slug: "void-not-allowed", area: "Invoices & payments", symptom: "Void is refused", message: "Only owners, admins, managers or finance can void invoices",
    cause: "Your role can't void money documents.", fix: ["Ask a finance user, manager or admin."], link: "fixing-mistakes" },
  { slug: "void-reason", area: "Invoices & payments", symptom: "Void won't confirm", message: "Give a reason for voiding",
    cause: "A reason is required and printed on the document.", fix: ["Type a short reason, for example \"Wrong amount — replaced by INV-2026-00031\"."], link: "fixing-mistakes" },
  { slug: "cents-difference", area: "Invoices & payments", symptom: "VAT or totals differ by 0.01",
    cause: "Amounts are rounded to 2 decimals at each step.", fix: ["This is normal rounding. The invoice total is always exactly the amount you issued."], link: "invoices" },

  // Purchasing & stock
  { slug: "no-create-po", area: "Purchasing & stock", symptom: "There's no Create PO button on a request",
    cause: "The request isn't approved, or it was already turned into a PO (status Ordered).", fix: ["Submit it and have a manager approve it."], link: "purchasing" },
  { slug: "no-receive", area: "Purchasing & stock", symptom: "There's no Receive button on a purchase order",
    cause: "The PO is still Draft, already fully received, cancelled, or it's an older PO without item lines.", fix: ["Choose Send to supplier first.", "For an old PO without lines, create a new PO with lines for what's still expected."], link: "receiving-goods" },
  { slug: "over-receive", area: "Purchasing & stock", symptom: "Confirm receipt is disabled and a box is red", message: "You can't receive more than was ordered.",
    cause: "The quantity in Now is more than what's still outstanding on that line.", fix: ["Enter only what's outstanding. Raise a new PO for any extra the supplier sent."], link: "receiving-goods" },
  { slug: "po-cant-cancel", area: "Purchasing & stock", symptom: "I can't cancel a purchase order", message: "Goods were already received on this order, so it can't be cancelled.",
    cause: "The PO has at least one goods received note.", fix: ["Leave it as is and note the difference; create a new PO if more is needed."], link: "fixing-mistakes" },
  { slug: "po-needs-supplier", area: "Purchasing & stock", symptom: "A purchase order won't save", message: "Choose the supplier.",
    cause: "POs need a supplier, a description and at least one line with a quantity.", fix: ["Add the supplier with Add Vendor if they're new, then pick them."], link: "purchasing" },
  { slug: "low-stock-wrong", area: "Purchasing & stock", symptom: "An item shows Low Stock but we have enough",
    cause: "The reorder level is set too high, or the on-hand quantity wasn't updated.", fix: ["Edit the item's reorder level.", "Record a Stock In or Adjustment to correct the count."], link: "inventory" },

  // Production
  { slug: "mo-needs-qty", area: "Production", symptom: "A production order won't save", message: "Enter the quantity to produce",
    cause: "New production orders need a title and a quantity.", fix: ["Fill Title and Quantity (pieces)."], link: "production-orders" },
  { slug: "stage-cant-start", area: "Production", symptom: "I can't move a stage from the Production page",
    cause: "Stages are moved from the order itself.", fix: ["Open Production → Planning & Cutting, open the order, and use Start / Done on the stage."], link: "production-orders" },
  { slug: "design-not-listed", area: "Production", symptom: "My design brief isn't in the production order list",
    cause: "Only approved design briefs are offered.", fix: ["Move the brief to Approved in Designs."], link: "designs-and-site-visits" },
];

// ─── FAQ ─────────────────────────────────────────────────────────────────

export const FAQS: Faq[] = [
  // General
  { group: "General", q: "What is Bumblebee?", a: "The system CUBS uses to run the business: sales, production, stock, purchasing, invoicing and the team, in English and Arabic. See [What Bumblebee is](/docs/what-is-bumblebee)." },
  { group: "General", q: "Do I need to install anything?", a: "No. It runs in any modern browser — Chrome, Edge, Safari or Firefox — on a computer, tablet or phone." },
  { group: "General", q: "Does it work on my phone?", a: "Yes. The layout adapts to phone screens. For long forms like sales orders and product costing, a laptop or tablet is more comfortable." },
  { group: "General", q: "Does it work offline?", a: "No. Bumblebee needs an internet connection to load and save data. If the connection drops, saving fails with a clear message and nothing half-saved is kept." },
  { group: "General", q: "Which modules save real data?", a: "Sales, production, stock, purchasing, invoices, users, team, employees, settings, reports and data. A few modules are previews with sample data — see [Preview modules](/docs/preview-modules)." },
  { group: "General", q: "What currency does it use?", a: "Egyptian pounds (EGP) by default. The workspace currency can be changed in Settings → Preferences by an owner or admin." },
  { group: "General", q: "What VAT rate is used?", a: "14% (Egyptian VAT) by default on purchase orders and the Point of Sale. On quotations you enter the VAT rate per document, so 0% is possible for exempt sales." },
  { group: "General", q: "Is there a user manual I can share?", a: "Yes — this help centre, and the PDF version downloadable from the top of the [docs home](/docs)." },

  // Accounts
  { group: "Accounts & access", q: "How do I get a login?", a: "An owner or admin creates it in Users & Access and sends you the username and password. There's no public sign-up." },
  { group: "Accounts & access", q: "Can I sign in with Google?", a: "No. Bumblebee uses usernames and passwords created by your admin only." },
  { group: "Accounts & access", q: "How do I change my password?", a: "Settings → Security → enter your current password and the new one (8+ characters) → Change password." },
  { group: "Accounts & access", q: "I forgot my password. What now?", a: "Ask an owner or admin to reset it from Users & Access. Only the owner can reset an owner's or admin's password." },
  { group: "Accounts & access", q: "Can I change my username?", a: "Not by yourself. Ask an admin; if needed they create a new login and suspend the old one." },
  { group: "Accounts & access", q: "Can two people share one login?", a: "Don't. Each person should have their own login so the activity feed and documents show who did what, and access can be removed for one person without affecting others." },
  { group: "Accounts & access", q: "Someone left the company. How do I remove their access?", a: "Users & Access → select them → Suspend login. It takes effect immediately and keeps everything they created." },
  { group: "Accounts & access", q: "What can each role do?", a: "See [Roles](/docs/roles) for the full table: Owner, Admin, Sales, Finance, Production Manager, Warehouse, Purchasing, Quality Control, Delivery and Viewer." },
  { group: "Accounts & access", q: "How long do I stay signed in?", a: "Until you sign out or clear the browser's site data. Always sign out on shared computers." },
  { group: "Accounts & access", q: "Can I be signed in on my laptop and phone at the same time?", a: "Yes." },

  // Documents
  { group: "Numbers & documents", q: "How are document numbers created?", a: "The database issues them when you save: PREFIX-YEAR-00001, one counter per document type, restarting every January. See [Document numbers](/docs/document-numbers)." },
  { group: "Numbers & documents", q: "Can I type my own quotation or invoice number?", a: "No. Hand-typed numbers lead to duplicates and gaps. The number is issued on save and can't be edited." },
  { group: "Numbers & documents", q: "Why is there a gap in the numbers?", a: "A save failed after its number was issued. Numbers are never reused, so a gap is expected and harmless." },
  { group: "Numbers & documents", q: "Can I delete an invoice or order I created by mistake?", a: "No. Cancel quotations, orders and purchase documents; void invoices and receipts with a reason. See [Fixing mistakes](/docs/fixing-mistakes)." },
  { group: "Numbers & documents", q: "Can I edit a sales order after invoicing it?", a: "Status and details can be updated, but invoices already issued don't change. If the amount is wrong, void the invoice(s) and invoice again." },
  { group: "Numbers & documents", q: "How do I find which quotation an invoice came from?", a: "It's printed on the invoice and on the sales order. See [References](/docs/references)." },
  { group: "Numbers & documents", q: "Do the numbers restart every year?", a: "Yes, each type starts again at 00001 on 1 January, Cairo time. The year in the number keeps them unique." },

  // Money
  { group: "Invoices & payments", q: "Can I take a deposit?", a: "Yes. On the sales order choose Create invoice → Part / deposit and type the amount. Invoice the rest later — Bumblebee tracks what's left." },
  { group: "Invoices & payments", q: "Can a customer pay one invoice in instalments?", a: "Yes. Record each payment separately; each gets its own receipt and the invoice moves from Partially paid to Paid." },
  { group: "Invoices & payments", q: "What payment methods can I record?", a: "Cash, InstaPay, bank transfer, card, mobile wallet and cheque, each with an optional reference number." },
  { group: "Invoices & payments", q: "A customer overpaid. How do I record it?", a: "Record only the balance on the invoice. Invoice the next part of their order (or a new order) and record the rest there." },
  { group: "Invoices & payments", q: "I recorded a payment on the wrong invoice.", a: "Void that receipt with a reason, then record the payment on the correct invoice." },
  { group: "Invoices & payments", q: "When is an invoice overdue?", a: "When its due date has passed and a balance remains. Overdue invoices show in red and on the dashboard." },
  { group: "Invoices & payments", q: "Who can void invoices and receipts?", a: "Owners, admins, managers and finance users." },
  { group: "Invoices & payments", q: "Is the invoice a valid e-invoice for the Egyptian Tax Authority?", a: "No. Bumblebee prints a tax invoice with your tax number, but it doesn't submit to the ETA e-invoicing portal." },
  { group: "Invoices & payments", q: "How is VAT split on a deposit?", a: "The amount includes VAT: before VAT = amount ÷ 1.14, VAT = the difference. A 1,000 EGP deposit is 877.19 + 122.81." },

  // Purchasing & stock
  { group: "Purchasing & stock", q: "Do I need a purchase request before a purchase order?", a: "No. Requests are for getting approval. You can create a PO directly with New PO." },
  { group: "Purchasing & stock", q: "The supplier delivered in two shipments.", a: "Receive twice. Each delivery gets its own GRN and the PO stays Partially Received until everything arrives." },
  { group: "Purchasing & stock", q: "The supplier sent more than we ordered.", a: "You can't receive more than ordered. Raise a new PO for the extra quantity and receive it there." },
  { group: "Purchasing & stock", q: "How do I track imported fabric?", a: "Create the PO with the overseas supplier, payment terms (for example 30% advance) and lines in metres; receive against it when it clears customs. Keep the supplier's delivery or B/L number in the GRN's supplier reference." },
  { group: "Purchasing & stock", q: "How do I correct a stock count?", a: "Inventory → New Movement → Adjustment, with the reason. Or use Quick adjust on the item." },
  { group: "Purchasing & stock", q: "What does Low Stock mean?", a: "The on-hand quantity is at or below the item's reorder level." },

  // Production
  { group: "Production", q: "What are the production stages?", a: "Pattern & Marker, Cutting, Sewing, Finishing & Pressing, Quality Check, Packing — created automatically for every production order." },
  { group: "Production", q: "Can I skip a stage?", a: "Mark it Done straight away with a note. Progress is based on stages completed." },
  { group: "Production", q: "How do I record the size ratio for cutting?", a: "In the order's Cutting List, each piece has a size ratio field, for example 2Y:1 4Y:2 6Y:2 8Y:2." },
  { group: "Production", q: "How do I know what's late?", a: "Overdue orders are flagged on Planning & Cutting, in Production → Alerts, and on the Overview." },
  { group: "Production", q: "What happens when QC fails?", a: "Log the defects, send them to rework, and run a Re-Inspection. The production order stays open until it passes." },

  // Printing
  { group: "Printing", q: "Can I save a document as PDF?", a: "Yes. Print → Print / Save PDF → choose Save as PDF as the printer." },
  { group: "Printing", q: "Why are documents in both English and Arabic?", a: "So one printout works for every customer, supplier and authority. It doesn't depend on the language you use in the app." },
  { group: "Printing", q: "How do I put our logo and tax number on documents?", a: "The CUBS logo is built in. Tax number, commercial register, address and legal names come from Settings → Company." },
  { group: "Printing", q: "Can a customer see a document without logging in?", a: "No. Print or save it as PDF and send them the file." },

  // Data
  { group: "Data & security", q: "Where is our data stored?", a: "In a dedicated, encrypted database project for CUBS on Supabase. Every table is protected so only members of the CUBS workspace can read it." },
  { group: "Data & security", q: "Can I export everything?", a: "Yes. Data → Export All Data, or Export on any list, downloads CSV files you can open in Excel." },
  { group: "Data & security", q: "Can I import from Excel?", a: "Yes. Download the CSV template in Data, fill it, save as CSV UTF-8 and import." },
  { group: "Data & security", q: "Who can see salaries?", a: "Anyone whose role opens People → Employees. Give HR access only to people who should see it." },
  { group: "Data & security", q: "Is there an audit trail?", a: "The Activity feed shows what was created and changed, and every document keeps who issued it, when, and void or cancel reasons." },

  // Language
  { group: "Language", q: "How do I switch to Arabic?", a: "Click AR in the top bar. Click EN to switch back." },
  { group: "Language", q: "Why does it switch back to English?", a: "Your browser is blocking site storage (usually a private window). Use a normal window." },
  { group: "Language", q: "Can a record have both English and Arabic names?", a: "Products, employees, branches and several other records have separate English and Arabic fields." },
];
