import { supabase } from './supabase';

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: 'SUPPLIES' | 'TRANSPORTATION' | 'EQUIPMENT' | string;
  status: 'Pending' | 'Approved' | 'Rejected';
  submittedBy: string;
  receiptUrl: string;
  rejectionNote?: string;
  date: string;
}

export interface BudgetLog {
  id: string;
  activity: string;
  type: 'LOG_ENTRY' | 'BUDGET_ADJUSTMENT';
  amountImpact: number;
  timestamp: string;
}

/**
 * Fetches all expenses from the Supabase PostgreSQL database.
 */
export async function getExpenses(): Promise<Expense[]> {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching expenses from Supabase:', error);
      return [];
    }

    return (data || []).map((row: any) => {
      // Map DB schema to UI compatibility
      let uiStatus: 'Pending' | 'Approved' | 'Rejected' = 'Pending';
      if (row.status === 'APPROVED') uiStatus = 'Approved';
      if (row.status === 'REJECTED') uiStatus = 'Rejected';

      return {
        id: String(row.id),
        title: row.title,
        amount: Number(row.amount),
        category: (row.category || '').toUpperCase(),
        status: uiStatus,
        submittedBy: row.submitted_by,
        receiptUrl: row.receipt_url || '',
        rejectionNote: '', // Note: rejection reasons are logged in the audit trail (budget_log)
        date: row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : '',
      };
    });
  } catch (err) {
    console.error('Failed to get expenses:', err);
    return [];
  }
}

/**
 * Fetches all budget log entries from the Supabase PostgreSQL database.
 */
export async function getBudgetLogs(): Promise<BudgetLog[]> {
  try {
    const { data, error } = await supabase
      .from('budget_log')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Error fetching budget logs from Supabase:', error);
      return [];
    }

    return (data || []).map((row: any) => {
      return {
        id: String(row.id),
        activity: row.activity_action,
        type: row.entry_type as 'LOG_ENTRY' | 'BUDGET_ADJUSTMENT',
        amountImpact: Number(row.amount_impact),
        timestamp: row.timestamp || new Date().toISOString(),
      };
    });
  } catch (err) {
    console.error('Failed to get budget logs:', err);
    return [];
  }
}
