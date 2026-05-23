import { notion, EXPENSES_DB_ID, BUDGET_LOG_DB_ID, isNotionConfigured } from './notion';
import { mockStore, Expense, BudgetLog } from './mockStore';

// Safe property accessors
function getTitle(property: any): string {
  if (!property) return '';
  if (property.type === 'title') {
    return property.title?.map((t: any) => t.plain_text).join('') || '';
  }
  return '';
}

function getRichText(property: any): string {
  if (!property) return '';
  if (property.type === 'rich_text') {
    return property.rich_text?.map((t: any) => t.plain_text).join('') || '';
  }
  return '';
}

function getNumber(property: any): number {
  if (!property) return 0;
  if (property.type === 'number') {
    return property.number || 0;
  }
  return 0;
}

function getSelect(property: any): string {
  if (!property) return '';
  if (property.type === 'select') {
    return property.select?.name || '';
  }
  if (property.type === 'status') {
    return property.status?.name || '';
  }
  return '';
}

function getUrl(property: any): string {
  if (!property) return '';
  if (property.type === 'url') {
    return property.url || '';
  }
  return '';
}

function getDate(property: any): string {
  if (!property) return '';
  if (property.type === 'date') {
    return property.date?.start || '';
  }
  return '';
}

export async function getExpenses(): Promise<Expense[]> {
  if (!isNotionConfigured || !notion) {
    return mockStore.getExpenses();
  }

  try {
    const response = await notion.databases.query({
      database_id: EXPENSES_DB_ID,
    });

    return response.results.map((page: any) => {
      const props = page.properties;
      return {
        id: page.id,
        title: getTitle(props.Title) || getTitle(props.Name) || 'Untitled Expense',
        amount: getNumber(props.Amount),
        category: getSelect(props.Category),
        status: (getSelect(props.Status) || 'Pending') as 'Pending' | 'Approved' | 'Rejected',
        submittedBy: getRichText(props['Submitted By']),
        receiptUrl: getUrl(props['Receipt URL']),
        rejectionNote: getRichText(props['Rejection Note']),
        date: getDate(props.Date) || new Date(page.created_time).toISOString().split('T')[0],
      };
    });
  } catch (error) {
    console.error('Error fetching expenses from Notion, falling back to mock:', error);
    return mockStore.getExpenses();
  }
}

export async function getBudgetLogs(): Promise<BudgetLog[]> {
  if (!isNotionConfigured || !notion) {
    return mockStore.getLogs();
  }

  try {
    const response = await notion.databases.query({
      database_id: BUDGET_LOG_DB_ID,
    });

    return response.results.map((page: any) => {
      const props = page.properties;
      return {
        id: page.id,
        activity:
          getTitle(props['Activity / Action']) ||
          getTitle(props.Activity) ||
          getTitle(props.Title) ||
          getTitle(props.Name) ||
          'Unknown Activity',
        type: (getSelect(props.Type) || 'LOG_ENTRY') as 'LOG_ENTRY' | 'BUDGET_ADJUSTMENT',
        amountImpact: getNumber(props['Amount Impact']),
        timestamp: getDate(props.Timestamp) || page.created_time,
      };
    });
  } catch (error) {
    console.error('Error fetching budget logs from Notion, falling back to mock:', error);
    return mockStore.getLogs();
  }
}
