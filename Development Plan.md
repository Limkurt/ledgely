# ⚡ 3-Hour Rapid MVP Plan: Liquidation Tracker & Notion Treasury Dashboard

This document reframes the V1 full-stack production prompt into an aggressive, ultra-focused **3-hour engineering sprint**. To make execution feasible within this extreme constraint, we eliminate heavy multi-repo database setups, custom auth providers, and local storage boilerplate. Instead, we pivot to a **Lean Stack** where **Notion acts as the real-time Database, Back-office CRM, and Audit Log**, paired with a lightweight **Next.js 14 API / Tailwind single-page application** for streamlined member submissions and responsive metrics.

---

## 🎯 Strategic Realignment: Scope vs. Time Constraint

| Architectural Layer | Original V1 Production Design | 3-Hour Realignment Strategy | Time Saved |
| :--- | :--- | :--- | :--- |
| **Authentication** | Full Clerk or NextAuth infrastructure with custom role-based hooks | **Pre-Shared Static Access Tokens** stored in individual URL parameters or simple `.env` config blocks. Role switching via a lightweight client switcher or split layouts. | ~45 Mins |
| **Database** | PostgreSQL hosted on Supabase/Neon with Prisma schemas and migrations | **Notion Databases** acting natively as the unified data layer. Tables represent Expenses, Budgets, and Log events directly. | ~60 Mins |
| **File Storage** | Cloudflare R2 / Supabase Storage buckets with signed multi-part upload routes | **Direct Image/File URL Submission** via form input field, or using native Notion block attachment uploads. | ~30 Mins |
| **Real-Time Layer** | Supabase Realtime subscriptions or Pusher websocket events | **On-Demand Cache Invalidation** via Next.js server components and manual `router.refresh()` actions. | ~30 Mins |

---

## 🛠️ Streamlined Tech Stack

* **Frontend & Routing Engine:** `Next.js 14` (App Router) utilizing high-speed **Server Actions** to completely bypass specialized tRPC layer setup.
* **Data Tier & Backend CRM:** `@notionhq/client` (Official Notion JavaScript SDK).
* **Styling & UI Primitives:** `Tailwind CSS` for instant UI layout execution. (Skip raw `shadcn/ui` initializations if configuration issues risk burning >15 minutes; stick to inline tailwind classes or simple pre-built layout patterns).
* **Forms & Verification:** Native HTML Form API paired with inline `zod` verification inside the Server Actions.

---

## 🗺️ Notion Schema Configuration (Pre-Requisite Setup)

To execute this build in under 3 hours, you must manually spin up **two distinct databases** inside a dedicated Notion Workspace page before writing code, then share access via an Integration Token.

### 1. Expense Records Database (`EXPENSES_DB_ID`)
* `Title` (Title Property) — Item name / Short description
* `Amount` (Number Property) — Formatted as currency
* `Category` (Select Property) — Options: `SUPPLIES`, `FOOD_AND_BEVERAGE`, `TRANSPORTATION`, `ACCOMMODATION`, `EQUIPMENT`, `MARKETING`, `UTILITIES`, `MISCELLANEOUS`
* `Status` (Status Property) — Options: `Pending` (Default), `Approved`, `Rejected`
* `Submitted By` (Text Property) — Name/Email of the submitting member
* `Receipt URL` (URL Property) — Link to screenshot or image receipt
* `Rejection Note` (Text Property) — Context provided by treasurer
* `Date` (Date Property) — Transaction date

### 2. Live Budget & Audit Log Database (`BUDGET_LOG_DB_ID`)
* `Activity / Action` (Title Property) — Log description (e.g., *“Expense Approved: Food for General Assembly”*)
* `Type` (Select Property) — Options: `LOG_ENTRY`, `BUDGET_ADJUSTMENT`
* `Amount Impact` (Number Property) — Negative for expenses, positive for cash infusions
* `Timestamp` (Date Property) — Exact execution time

---

## ⏱️ Hyper-Focused 3-Hour Timeboxing Blueprint

### 🟦 Hour 1: Environment Provisioning & Integration Setup (00:00 - 01:00)
* **00:00 - 00:15:** Create a new integration at `developers.notion.com`, copy the **Internal Integration Token**, and share the target Notion parent page with the integration.
* **00:15 - 00:30:** Bootstrap your workspace:
    ```bash
    npx create-next-app@latest . --typescript --tailwind --app --src-dir --eslint

    ```
* **00:30 - 01:00:** Establish a unified Notion client instance in `src/lib/notion.ts`. Create standard `.env.local` blocks for:
    ```env
    NOTION_INTEGRATION_TOKEN=secret_xxx
    NOTION_EXPENSES_DB_ID=xxx
    NOTION_BUDGET_DB_ID=xxx
    TREASURER_ACCESS_KEY=treasurer_2026
    MEMBER_ACCESS_KEY=member_2026
    ```

### 🟨 Hour 2: Data Mutations & Server Action Pipeline (01:00 - 02:00)
* **01:00 - 01:30:** Build out the `submitExpense` Server Action inside `src/app/actions.ts`. This takes incoming form data and uses `notion.pages.create()` to push structural records straight into your Notion Expenses Database.
* **01:30 - 02:00:** Build out the `reviewExpense` Server Action. This changes the status field of a specific Notion entry using `notion.pages.update()`. If approved or rejected, it simultaneously fires a secondary `notion.pages.create()` sequence to append a record to the Audit Log database.

### 🟩 Hour 3: Dashboard Interface Construction & Verification (02:00 - 03:00)
* **02:00 - 02:30:** Formulate your core metrics queries using `notion.databases.query()`. Fetch all expenses to dynamically calculate aggregate values via native JavaScript arrays (`.reduce()` loops to extract Total Budget, Spent, Pending, and Category breakdowns).
* **02:30 - 02:50:** Build a clean, responsive single-page interface using standard Tailwind flex/grid styling blocks. Split screen variants or toggle layouts using simple URL search parameters (e.g., `?role=member` vs `?role=treasurer`) to completely bypass heavy router setups.
* **02:50 - 03:00:** Execute complete lifecycle testing: Submit an expense via the member interface, check your Notion workspace for instantly updated tables, click approve as a treasurer, and verify that data recalculates dynamically on the dashboard.

---

## 📁 Optimized Core Code Architecture

### 1. Notion Engine Client (`src/lib/notion.ts`)
```typescript
import { Client } from '@notionhq/client';

if (!process.env.NOTION_INTEGRATION_TOKEN) {
  throw new Error('Missing NOTION_INTEGRATION_TOKEN inside system environment configuration.');
}

export const notion = new Client({
  auth: process.env.NOTION_INTEGRATION_TOKEN,
});

export const EXPENSES_DB_ID = process.env.NOTION_EXPENSES_DB_ID || '';
export const BUDGET_LOG_DB_ID = process.env.NOTION_BUDGET_LOG_DB_ID || '';