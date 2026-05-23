# <p align="center">Ledgely</p>

<p align="center">
  <strong>A premium, modern, ultra-lean liquidation tracker and real-time treasury dashboard.</strong><br>
  Designed for rapid, friction-free financial organizational workflows using a Supabase PostgreSQL backend.
</p>

---

## ⚡ System Architecture

Ledgely leverages **Supabase PostgreSQL** for its database layer, paired with a Next.js App Router layout styled in a professional Slate-Grey and Mint-Green aesthetic.

| Architectural Layer | Implementation Strategy |
| :--- | :--- |
| **Data Tier** | **Supabase client** (`@supabase/supabase-js`) connecting directly to PostgreSQL tables. |
| **Authentication & Roles** | **Pre-Shared Static Access Keys** parsed via URL search parameters (`?role=member` vs `?role=treasurer`) in a secure access gate, bypassing complex OAuth boilerplate. |
| **Cache Invalidation** | **On-Demand Cache Invalidation** driven natively through Next.js server actions and layout updates (`revalidatePath`). |

---

## 🚀 Setup & Installation

### 1. Provision Database Tables
Go to your **Supabase Dashboard** -> **SQL Editor** -> **New Query**, paste the following script, and click **Run**:

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
```

### 2. Local Environment Variables
Create a `.env.local` file in the root of the project:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Access Keys
TREASURER_ACCESS_KEY=treasurer_2026
MEMBER_ACCESS_KEY=member_2026
```

### 3. Run the App
Install dependencies and launch the dev server:
```bash
npm install
npm run dev
```

---

## 📖 How to Use the Product

The application tracks operational states dynamically via URL query parameters. You can navigate between **four main user interfaces**:

### 1. General Dashboard (`?view=public`)
* **Purpose**: Public portal for organizational transparency.
* **Usage**:
  * View aggregate statistics: **Annual Allocation** (hardcoded to $500,000.00 baseline), **Liquidated Claims** (sum of approved expenses), and **Current Balance** (remaining funds).
  * Inspect the **Approved Spending by Category** chart (supplies, transportation, and equipment).
  * Audit the **Transaction Logs Feed** to review the latest adjustments and approved outlays.

### 2. Secure Access Gate (`?view=login`)
* **Purpose**: Redirects users to their corresponding dashboard desks.
* **Usage**:
  * Select either **Student Member Desk** or **Treasurer Operations Desk** to initiate write-access sessions.

### 3. Student Member Desk (`?view=portal&role=member`)
* **Purpose**: Submit claims and monitor individual request history.
* **Usage**:
  * **Submit Claim Form**: Fill out claimant email, name of item, expense amount (USD), choose category, and add an optional receipt image URL.
  * **Status Monitoring**: Review your personal **Claim Status Logs** table. Claims start as `Under Review` and transition to `Approved` or `Rejected` in real-time.

### 4. Treasurer Operations Desk (`?view=portal&role=treasurer`)
* **Purpose**: Review queues, apply budget adjustments, and audit the global ledger.
* **Usage**:
  * **Pending Approvals Queue**: Review pending claims. Click **Approve** (deducts funds from balance and records audit trail) or **Reject** (requires typing a reason note).
  * **Record Budget Adjustment**: Use the cash modifier tool to log **Cash Infusions/Top-ups** (adds to total budget) or **Budget Outflows** (deducts from total budget).
  * **Global Ledger**: Inspect the immutable table tracking all liquidation records in the system.

  ---
### Try it:

https://ledgely-eta.vercel.app/
  ---