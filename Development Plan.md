# ⚡ Supabase-Migrated 3-Hour Rapid MVP Plan: Secure Treasury Vault

This document migrates our **3-hour rapid engineering sprint** from the Notion API to a dedicated **Supabase cloud PostgreSQL instance**. We maintain a single-page **Next.js 14 App Router layout** using query search parameters for client view states, connecting directly to Postgres via the standard `@supabase/supabase-js` data connection pooling client.

---

## 🎯 State Router Switch Logic

The application tracks active client views natively inside the root layout tree (`src/app/page.tsx`) by reading query search criteria parameters:
- `?view=public` (Default) -> Displays the summary cards and the open database log table rows.
- `?view=login` -> Mounts the secure authorization credentials layout check gate.
- `?view=portal&role=member` -> Mounts the student liquidation claim entry desk.
- `?view=portal&role=treasurer` -> Exposes the administrative action queue desk.

---

## 🗄️ Relational PostgreSQL Schema (SQL Setup Script)

Run this schema generation script inside your Supabase SQL query editor tab to configure the relational data tables:

```sql
-- 1. Create the primary liquidation claims database table
CREATE TABLE expenses (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('supplies', 'transportation', 'equipment')),
  status TEXT NOT NULL DEFAULT 'UNDER_REVIEW' CHECK (status IN ('UNDER_REVIEW', 'APPROVED', 'REJECTED')),
  submitted_by TEXT NOT NULL,
  receipt_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create the internal real-time operational audit log ledger
CREATE TABLE budget_log (
  id BIGSERIAL PRIMARY KEY,
  activity_action TEXT NOT NULL,
  entry_type TEXT NOT NULL DEFAULT 'LOG_ENTRY',
  amount_impact NUMERIC(12, 2) NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);