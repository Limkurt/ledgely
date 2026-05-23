# <p align="center"><img src="./public/logo.png" alt="Ledgely Logo" width="120" /><br>Ledgely</p>

<p align="center">
  <strong>A premium, modern, ultra-lean liquidation tracker and real-time treasury dashboard.</strong><br>
  Designed for rapid, friction-free financial organizational workflows.
</p>

---

By bypassing traditional heavy database infrastructure, **Ledgely** integrates directly with the Notion API—transforming a standard Notion workspace into a secure relational database, back-office CRM, and immutable audit log. 

Built for high-speed efficiency, Ledgely allows members to submit expense claims in seconds while providing treasurers with a responsive, high-performance console for real-time authorizations and dynamic budget monitoring.

---

## 🎨 System Architecture & Optimization Strategy

To achieve zero infrastructure bloat and maximize operational deployment speeds, Ledgely splits roles natively via lightweight state mechanics and leverages standard server rendering paradigms:

| Architectural Layer | Ledgely Lean Implementation Strategy |
| :--- | :--- |
| **Data Tier & Backend CRM** | **Notion API Client** (`@notionhq/client`) acting natively as a unified data layer. Tables represent Expenses, Budgets, and Log events directly. |
| **Authentication & Roles** | **Pre-Shared Static Access Tokens** parsed via URL parameters (`?role=member` vs `?role=treasurer`) inside a unified layout, avoiding heavy auth provider boilerplate. |
| **File Storage** | **Direct Image/File URL Submission** via standard form input blocks or native Notion block attachments, eliminating third-party S3/bucket complexity. |
| **Real-Time Synchronicity** | **On-Demand Cache Invalidation** driven natively through server component layout updates and quick structural revalidation pipelines (`revalidatePath`). |

---

## 🗺️ Notion Workspace Schema Blueprint

Before initiating your local development cluster, manually instantiate **two independent databases** within a dedicated parent page inside your Notion Workspace. Share page access explicitly with your workspace's Internal Integration Token.

### 1. Expense Records Database (`NOTION_EXPENSES_DB_ID`)
* **`Title`** *(Title Property)* — Item Name / Short Description
* **`Amount`** *(Number Property)* — Formatted as currency
* **`Category`** *(Select Property)* — Options: `SUPPLIES`, `FOOD_AND_BEVERAGE`, `TRANSPORTATION`, `ACCOMMODATION`, `EQUIPMENT`, `MARKETING`, `UTILITIES`, `MISCELLANEOUS`
* **`Status`** *(Status Property)* — Options: `Pending` (Default), `Approved`, `Rejected`
* **`Submitted By`** *(Email Property)* — Submitting organizational coordinates
* **`Receipt URL`** *(URL Property)* — Pointer to digital receipt asset
* **`Rejection Note`** *(Text Property)* — Context captured on review actions
* **`Date`** *(Date Property)* — Transaction timeline stamp

### 2. Live Budget & Audit Log Database (`NOTION_BUDGET_DB_ID`)
* **`Activity / Action`** *(Title Property)* — Log descriptive index (e.g., `[APPROVED] Laboratory Jumper Wires`)
* **`Type`** *(Select Property)* — Options: `LOG_ENTRY`, `BUDGET_ADJUSTMENT`
* **`Amount Impact`** *(Number Property)* — Negative for outlays, positive for top-up injections
* **`Timestamp`** *(Date Property)* — Structural creation timeline

---

## 📁 Repository Directory Matrix

```text
ledgely/
├── public/
│   └── logo.png           # Your custom generated logo asset
├── src/
│   ├── app/
│   │   ├── actions.ts     # High-speed server mutations engine (Zod validation + Notion sync)
│   │   ├── layout.tsx     # Global styling sheet wrapping context
│   │   └── page.tsx       # Unified role-aware dashboard (Dynamic server calculations)
│   └── lib/
│       └── notion.ts      # Notion Engine Client SDK initialization singleton
├── .env.local.example     # Blueprint template for local environmental variables
├── .gitignore             # Strict credential lockdown rules
├── tailwind.config.ts     # Interface layout rules
└── tsconfig.json          # TypeScript engine adjustments