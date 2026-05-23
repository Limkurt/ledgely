export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  submittedBy: string;
  receiptUrl: string;
  rejectionNote: string;
  date: string;
}

export interface BudgetLog {
  id: string;
  activity: string;
  type: 'LOG_ENTRY' | 'BUDGET_ADJUSTMENT';
  amountImpact: number;
  timestamp: string;
}

// In-memory mock databases
let mockExpenses: Expense[] = [
  {
    id: 'exp_1',
    title: 'General Assembly Catering',
    amount: 450.00,
    category: 'FOOD_AND_BEVERAGE',
    status: 'Approved',
    submittedBy: 'alice@ledgely.com',
    receiptUrl: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=500',
    rejectionNote: '',
    date: '2026-05-20',
  },
  {
    id: 'exp_2',
    title: 'Whiteboard Markers & Post-its',
    amount: 32.50,
    category: 'SUPPLIES',
    status: 'Approved',
    submittedBy: 'bob@ledgely.com',
    receiptUrl: '',
    rejectionNote: '',
    date: '2026-05-22',
  },
  {
    id: 'exp_3',
    title: 'AWS Server Hosting',
    amount: 120.00,
    category: 'UTILITIES',
    status: 'Pending',
    submittedBy: 'charlie@ledgely.com',
    receiptUrl: 'https://images.unsplash.com/photo-1600132806370-bf17e65e942f?w=500',
    rejectionNote: '',
    date: '2026-05-23',
  },
  {
    id: 'exp_4',
    title: 'Marketing Flyers Print',
    amount: 85.00,
    category: 'MARKETING',
    status: 'Rejected',
    submittedBy: 'alice@ledgely.com',
    receiptUrl: '',
    rejectionNote: 'Please attach a valid invoice with the company header instead of a cart summary.',
    date: '2026-05-18',
  },
  {
    id: 'exp_5',
    title: 'Ergonomic Desk Chairs',
    amount: 850.00,
    category: 'EQUIPMENT',
    status: 'Pending',
    submittedBy: 'dennis@ledgely.com',
    receiptUrl: '',
    rejectionNote: '',
    date: '2026-05-23',
  }
];

let mockLogs: BudgetLog[] = [
  {
    id: 'log_1',
    activity: 'Initial Treasury Funding',
    type: 'BUDGET_ADJUSTMENT',
    amountImpact: 10000.00,
    timestamp: '2026-05-01T08:00:00.000Z',
  },
  {
    id: 'log_2',
    activity: 'Expense Approved: General Assembly Catering (Submitted by alice@ledgely.com)',
    type: 'LOG_ENTRY',
    amountImpact: -450.00,
    timestamp: '2026-05-20T14:30:00.000Z',
  },
  {
    id: 'log_3',
    activity: 'Budget Top-up: Q2 Sponsorship Grant',
    type: 'BUDGET_ADJUSTMENT',
    amountImpact: 3500.00,
    timestamp: '2026-05-15T10:00:00.000Z',
  },
  {
    id: 'log_4',
    activity: 'Expense Approved: Whiteboard Markers & Post-its (Submitted by bob@ledgely.com)',
    type: 'LOG_ENTRY',
    amountImpact: -32.50,
    timestamp: '2026-05-22T17:15:00.000Z',
  },
];

// Helper functions for mock store
export const mockStore = {
  getExpenses: async () => {
    // Sort descending by date
    return [...mockExpenses].sort((a, b) => b.date.localeCompare(a.date));
  },
  getLogs: async () => {
    // Sort descending by timestamp
    return [...mockLogs].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  },
  addExpense: async (expense: Omit<Expense, 'id' | 'status' | 'rejectionNote'>) => {
    const newExpense: Expense = {
      ...expense,
      id: `exp_${Date.now()}`,
      status: 'Pending',
      rejectionNote: '',
    };
    mockExpenses.push(newExpense);
    return newExpense;
  },
  reviewExpense: async (id: string, status: 'Approved' | 'Rejected', rejectionNote: string = '') => {
    const expenseIndex = mockExpenses.findIndex(e => e.id === id);
    if (expenseIndex === -1) throw new Error(`Expense with ID ${id} not found.`);
    
    mockExpenses[expenseIndex].status = status;
    mockExpenses[expenseIndex].rejectionNote = rejectionNote;
    
    const expense = mockExpenses[expenseIndex];
    
    // Add log entry
    const newLog: BudgetLog = {
      id: `log_${Date.now()}`,
      activity: status === 'Approved' 
        ? `Expense Approved: ${expense.title} (Submitted by ${expense.submittedBy})`
        : `Expense Rejected: ${expense.title} (${rejectionNote || 'No explanation provided'})`,
      type: 'LOG_ENTRY',
      amountImpact: status === 'Approved' ? -expense.amount : 0,
      timestamp: new Date().toISOString(),
    };
    mockLogs.push(newLog);
    return expense;
  },
  addBudgetAdjustment: async (amount: number, description: string) => {
    const newLog: BudgetLog = {
      id: `log_${Date.now()}`,
      activity: `${description} (Budget Adjustment)`,
      type: 'BUDGET_ADJUSTMENT',
      amountImpact: amount,
      timestamp: new Date().toISOString(),
    };
    mockLogs.push(newLog);
    return newLog;
  }
};
