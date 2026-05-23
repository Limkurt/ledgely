'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { notion, isNotionConfigured, EXPENSES_DB_ID, BUDGET_LOG_DB_ID } from '@/lib/notion';
import { mockStore } from '@/lib/mockStore';

export interface ActionState {
  success: boolean;
  errors: Record<string, string[] | undefined>;
}

// Category enum
const CategoryEnum = z.enum([
  'SUPPLIES',
  'FOOD_AND_BEVERAGE',
  'TRANSPORTATION',
  'ACCOMMODATION',
  'EQUIPMENT',
  'MARKETING',
  'UTILITIES',
  'MISCELLANEOUS',
]);

// Validation Schema for Expense
const expenseSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters.' }),
  amount: z.coerce.number().positive({ message: 'Amount must be a positive number.' }),
  category: CategoryEnum,
  submittedBy: z.string().email({ message: 'Please enter a valid email address.' }),
  receiptUrl: z.string().url({ message: 'Please enter a valid URL.' }).or(z.literal('')),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Please enter a valid date.' }),
});

/**
 * Server Action to submit an expense. Supports both Notion and Mock fallbacks.
 */
export async function submitExpenseAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const rawData = {
    title: formData.get('title'),
    amount: formData.get('amount'),
    category: formData.get('category'),
    submittedBy: formData.get('submittedBy'),
    receiptUrl: formData.get('receiptUrl'),
    date: formData.get('date'),
  };

  const validation = expenseSchema.safeParse(rawData);

  if (!validation.success) {
    return {
      success: false,
      errors: validation.error.flatten().fieldErrors,
    };
  }

  const data = validation.data;

  try {
    if (isNotionConfigured && notion) {
      const properties: any = {
        Title: {
          title: [{ text: { content: data.title } }],
        },
        Amount: {
          number: data.amount,
        },
        Category: {
          select: { name: data.category },
        },
        'Submitted By': {
          rich_text: [{ text: { content: data.submittedBy } }],
        },
        'Receipt URL': {
          url: data.receiptUrl || null,
        },
        Date: {
          date: { start: data.date },
        },
      };

      try {
        await notion.pages.create({
          parent: { database_id: EXPENSES_DB_ID },
          properties: {
            ...properties,
            Status: {
              status: { name: 'Pending' },
            },
          },
        });
      } catch (err) {
        // Fallback if Status is a select field instead of a status field
        await notion.pages.create({
          parent: { database_id: EXPENSES_DB_ID },
          properties: {
            ...properties,
            Status: {
              select: { name: 'Pending' },
            },
          },
        });
      }
    } else {
      await mockStore.addExpense(data);
    }

    revalidatePath('/');
    return {
      success: true,
      errors: {},
    };
  } catch (error: any) {
    console.error('Error submitting expense:', error);
    return {
      success: false,
      errors: {
        form: [error?.message || 'Failed to submit expense to database. Please check configuration.'],
      },
    };
  }
}

// Alias for submitExpenseAction to match prompt request
export const submitExpense = submitExpenseAction;

/**
 * Server Action to review (approve or reject) an expense.
 */
export async function reviewExpenseAction(
  id: string,
  status: 'Approved' | 'Rejected',
  rejectionNote: string = '',
  amount: number,
  title: string,
  submittedBy: string
) {
  try {
    if (isNotionConfigured && notion) {
      const properties: any = {
        'Rejection Note': {
          rich_text: [{ text: { content: rejectionNote } }],
        },
      };

      try {
        await notion.pages.update({
          page_id: id,
          properties: {
            ...properties,
            Status: {
              status: { name: status },
            },
          },
        });
      } catch (err) {
        // Fallback for select properties
        await notion.pages.update({
          page_id: id,
          properties: {
            ...properties,
            Status: {
              select: { name: status },
            },
          },
        });
      }

      // Add to live budget log database
      const activity = status === 'Approved'
        ? `Expense Approved: ${title} (Submitted by ${submittedBy})`
        : `Expense Rejected: ${title} (${rejectionNote || 'No explanation provided'})`;
      
      const logProperties: any = {
        Type: {
          select: { name: 'LOG_ENTRY' },
        },
        'Amount Impact': {
          number: status === 'Approved' ? -amount : 0,
        },
        Timestamp: {
          date: { start: new Date().toISOString() },
        },
      };

      // Handle Activity/Action title property safely
      try {
        await notion.pages.create({
          parent: { database_id: BUDGET_LOG_DB_ID },
          properties: {
            ...logProperties,
            'Activity / Action': {
              title: [{ text: { content: activity } }],
            },
          },
        });
      } catch (err) {
        try {
          await notion.pages.create({
            parent: { database_id: BUDGET_LOG_DB_ID },
            properties: {
              ...logProperties,
              'Activity': {
                title: [{ text: { content: activity } }],
              },
            },
          });
        } catch (err2) {
          await notion.pages.create({
            parent: { database_id: BUDGET_LOG_DB_ID },
            properties: {
              ...logProperties,
              'Title': {
                title: [{ text: { content: activity } }],
              },
            },
          });
        }
      }
    } else {
      await mockStore.reviewExpense(id, status, rejectionNote);
    }

    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error('Error reviewing expense:', error);
    return { success: false, error: error?.message || 'Failed to review expense.' };
  }
}

// Alias to match prompt request
export const reviewExpense = reviewExpenseAction;

// Validation Schema for Budget Adjustment
const budgetAdjustmentSchema = z.object({
  amount: z.coerce.number().refine(n => n !== 0, { message: 'Amount impact cannot be zero.' }),
  description: z.string().min(5, { message: 'Description must be at least 5 characters.' }),
});

/**
 * Server Action to record a budget adjustment.
 */
export async function addBudgetAdjustmentAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const rawData = {
    amount: formData.get('amount'),
    description: formData.get('description'),
  };

  const validation = budgetAdjustmentSchema.safeParse(rawData);

  if (!validation.success) {
    return {
      success: false,
      errors: validation.error.flatten().fieldErrors,
    };
  }

  const data = validation.data;

  try {
    if (isNotionConfigured && notion) {
      const logProperties: any = {
        Type: {
          select: { name: 'BUDGET_ADJUSTMENT' },
        },
        'Amount Impact': {
          number: data.amount,
        },
        Timestamp: {
          date: { start: new Date().toISOString() },
        },
      };

      try {
        await notion.pages.create({
          parent: { database_id: BUDGET_LOG_DB_ID },
          properties: {
            ...logProperties,
            'Activity / Action': {
              title: [{ text: { content: data.description } }],
            },
          },
        });
      } catch (err) {
        try {
          await notion.pages.create({
            parent: { database_id: BUDGET_LOG_DB_ID },
            properties: {
              ...logProperties,
              'Activity': {
                title: [{ text: { content: data.description } }],
              },
            },
          });
        } catch (err2) {
          await notion.pages.create({
            parent: { database_id: BUDGET_LOG_DB_ID },
            properties: {
              ...logProperties,
              'Title': {
                title: [{ text: { content: data.description } }],
              },
            },
          });
        }
      }
    } else {
      await mockStore.addBudgetAdjustment(data.amount, data.description);
    }

    revalidatePath('/');
    return {
      success: true,
      errors: {},
    };
  } catch (error: any) {
    console.error('Error adding budget adjustment:', error);
    return {
      success: false,
      errors: {
        form: [error?.message || 'Failed to add budget adjustment.'],
      },
    };
  }
}
