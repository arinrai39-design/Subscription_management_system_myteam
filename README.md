# Brightloop Software | Odoo Subscription Management & Recurring Billing Platform

A unified enterprise software platform running the full lifecycle of a subscription business: from configuring products, brand variants, and tiered plans to issuing quotations, running automated billing days, collecting multi-method payments, and tracking recurring financial revenue.

Built with an **Odoo 17/18-inspired ERP aesthetic** (Signature Deep Purple & Vibrant Teal design system) with sub-second performance.

---

## 🚀 Key Features & Workflow Architecture

### 1. Multi-Persona Role-Based Access Control (RBAC)
- **Administrator (`Alex Vance`)**: Complete system authority. Exclusively authors discount rules, manages tax configurations, launches products/plans, and is the only role permitted to enroll internal staff.
- **Internal Staff (`Sarah Jenkins`)**: Day-to-day operations handling quotations, active subscriptions, automated billing runs, and registering customer payments. Restricted from modifying core admin discount/tax rules or enrolling staff.
- **Customer Self-Service Portal (`Dave Miller`, `Lisa Ray`)**: Dedicated customer portal where clients view only their own subscriptions and invoices, initiate self-service pauses/renewals (per plan policies), and pay invoices online.
- **Quick Switcher**: Instant role/persona switcher in the navigation bar to test the application from all three operational perspectives.

### 2. Product Catalog & Brand Variants (Scene 2)
- Configure software products, add-on modules, and professional services with sales prices, cost prices, and margins.
- **Brand Variant Pricing Engine**: Selecting the **Odoo Enterprise Brand** variant dynamically increments line item pricing by **+$560.00**.

### 3. Subscription Plans & Plan-by-Plan Lifecycle Policies
- Configure billing frequencies: `Daily`, `Weekly`, `Monthly`, `Yearly`.
- Minimum seat quantities and date availability windows.
- Granular lifecycle toggles:
  - **Auto-close on End Date**: Subscriptions automatically terminate upon term completion.
  - **Early Close Permissions**: Toggles whether customers or staff can close contracts early.
  - **Pause Permissions**: Enables or restricts temporary service pauses.
  - **Renewal Permissions**: Allows contract extension and renewal terms.

### 4. Quotation Templates to Active Subscriptions (Scene 3)
- Pre-configured quotation templates with bundled plans, product lines, and validity periods (e.g. 15, 30 days).
- **1-Click Generation**: Instantly generate customer quotations moving through the stage pipeline:
  `Draft` ➔ `Quotation` ➔ `Confirmed` ➔ `Active` ➔ `Closed` (or `Paused`).

### 5. Automated Billing Day & Idempotent Invoicing (Scene 4)
- **Recurring Invoicing Engine**: Scans active contracts due for billing, applies automated tax rates (VAT 10%, GST 18%, Sales Tax 8.25%), injects volume discounts, and generates invoices in batch.
- **Zero Double-Billing Guarantee (Idempotency)**: Prevents duplicate invoices for the same billing cycle.
- **Printable Invoices**: Clean, printable invoices (`@media print` formatted) ready for PDF export.

### 6. Admin Discount Rules Engine (Scene 5)
- Admin-only authoring of percentage (`%`) or fixed (`$`) discounts.
- Enforces minimum seat quantities, minimum spend, start/end dates, and strict usage caps.
- Auto-applies to eligible quotes/invoices and ceases when expired or exhausted.
- Includes an interactive **Live Discount Qualification Simulator**.

### 7. Multi-Method Payments & Overdue Tracking (Scene 6)
- Record payments against invoices across Credit Card (Stripe), Bank Wire (ACH), PayPal, and Corporate Check.
- Supports full settlements and partial installments.
- Live tracking of accounts receivable, overdue invoices, days overdue, and 1-click **Payment Reminders**.

### 8. Finance Lead End-of-Month Analytics Dashboard (Scene 7)
- Real-time KPIs: Active Subscriptions, MRR, ARR, Total Revenue Collected, Accounts Receivable, and Overdue Balances.
- Interactive Chart.js visualizations (MRR Momentum trend, Revenue by Plan doughnut).
- **Latency Benchmark Tool**: Tests and verifies processing of 1,000+ subscriptions in memory in under 20 milliseconds (well within the required `< 2,000ms` SLA).

### 9. Communications & Password Reset Simulator (Scene 1)
- Slide-out system inbox recording all outgoing emails: invoices, payment receipts, overdue reminders, and secure password reset tokens.
- Strict password validation: `> 8 characters`, uppercase, lowercase, and special characters.

---

## 🛠️ Tech Stack

- **Core**: Vanilla JavaScript (ES Modules) & HTML5
- **Styling**: Vanilla CSS with custom Odoo ERP design tokens & variables
- **Charts**: Chart.js
- **Tooling & Bundler**: Vite
- **FX**: Canvas Confetti

---

## 💻 Running Locally

1. Clone repository:
```bash
git clone https://github.com/arinrai39-design/Subscription_management_system_myteam.git
cd Subscription_management_system_myteam
```

2. Install dependencies:
```bash
npm install
```

3. Launch development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```
