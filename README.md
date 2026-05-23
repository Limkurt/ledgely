# <p align="center"><img src="./public/logo.png" alt="Ledgely Logo" width="120" /><br>Ledgely</p>

<p align="center">
  <strong>A premium, modern, ultra-lean liquidation tracker and real-time treasury dashboard.</strong><br>
  Designed for rapid, friction-free financial organizational workflows.
</p>

---

By bypassing traditional heavy database infrastructure, **Ledgely** integrates directly with the Notion API—transforming a standard Notion workspace into a secure relational database, back-office CRM, and immutable audit log. 

Built for high-speed efficiency, Ledgely allows members to submit expense claims in seconds while providing treasurers with a responsive, high-performance console for real-time authorizations and dynamic budget monitoring.

---

---

## 🤖 Development Prompt

You are an expert Senior Solutions Architect and Full-Stack Engineer. 

### Core Task
Your task is to write a production-ready codebase for a rapid MVP of a Liquidation Tracker & Treasury Dashboard. The system must accommodate two user states: a member who can submit expense entries, and a treasurer who can review, approve/reject them, and view real-time organizational metrics.

### Rigid Constraints (Non-Negotiable)
1. **Time to Build:** The entire architecture must be straightforward enough for a single developer to fully implement, test, and deploy in **under 3 hours**.
2. **Core Integration:** The system **must use Notion** as an explicit part of its data workflow.

### Architectural & Engineering Challenge
Because of the strict 3-hour time limit, traditional heavy infrastructure setups (such as spinning up full relational databases, writing complex multi-tenant authentication layers, implementing custom file-storage buckets, or managing separate backend routers) are highly discouraged unless they can be configured instantly. 

As the Architect, evaluate how to best leverage the Notion integration to minimize database schema boilerplate, backend routing, or audit logging overhead. 

### Expected Output
Based on your architectural evaluation for speed, choose the most optimal framework, data-mutation engine, and lightweight state tracking mechanism. Then, output the complete, clean, typed code files required to run this app end-to-end. 

Ensure your response includes:
1. **Configuration Specs:** Any necessary environment variables or pre-requisite third-party setups (e.g., Notion workspace database properties).
2. **Backend/Mutation Logic:** Code handling validated data submission, status updates, and immutable audit trail logging.
3. **Frontend UI/Dashboard:** A clean, responsive single-page interface or layout split by roles. It must display core metrics (Total Allocation, Spent, Remaining Balance, Pending Authorization), a submission form for members, an actionable queue for the treasurer, and a historical transaction ledger.

Provide the modular code files directly with minimal conversational fluff.

## 📝 Documentation Prompt

You are an expert Technical Writer and Agile Scrum Master specializing in rapid hacking sprints and lean software architecture.

Generate a complete, production-grade Markdown (`.md`) implementation guide and sprint playbook for a "Rapid MVP: Liquidation Tracker & Notion Treasury Dashboard". This guide must document how to successfully build and deploy the application within a strict **3-hour time constraint**.

### Required Documentation Sections:

1. **Architectural Evaluation & Strategy**: Document why a lightweight, direct-integration architecture was chosen over a traditional heavy enterprise stack (e.g., decoupled relational databases, custom ORMs, heavy auth providers) to respect the 3-hour limit. Explain how the data layer is optimized.
2. **Data Schema & Workspace Configuration**: Detail the explicit configuration requirements for the Notion integration workspace. Clearly list what tables, property names, and field types (text, numbers, statuses, selections, or dates) must be created manually before writing code.
3. **3-Hour Timeboxing Blueprint**: Provide a strict, realistic timeline broken down into 60-minute milestones. Detail exactly what an engineer should focus on during Hour 1, Hour 2, and Hour 3 to avoid falling behind.
4. **Core Code Implementation**: Present the complete, clean, modular code blueprint files required to run the application (including data integration configuration, mutation logic, and the dashboard frontend).
5. **End-to-End Verification Sequence**: Provide a tactical, step-by-step testing checklist that a developer can execute in the final 10 minutes of the sprint to verify the layout, form submission, backend sync, and dashboard data changes work flawlessly.

### Formatting Style:
- Use clear Markdown formatting layout tools (headings, dividers, bold text).
- Highlight prerequisites and credentials management using callouts or blockquotes.
- Maintain an engineering-centric, direct, and pragmatic tone focused entirely on speed and execution.

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