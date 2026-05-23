'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';

export interface ActionState {
  success: boolean;
  errors: Record<string, string[] | undefined>;
}

// Category enum matching supplies, transportation, equipment (allowing case-insensitive forms)
const CategoryEnum = z.preprocess(
  (val) => (typeof val === 'string' ? val.toUpperCase() : val),
  z.enum([
    'SUPPLIES',
    'TRANSPORTATION',
    'EQUIPMENT',
    'FOOD_AND_BEVERAGE',
    'ACCOMMODATION',
    'MARKETING',
    'UTILITIES',
    'MISCELLANEOUS',
  ])
);

// Validation Schema for Expense
const expenseSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters.' }),
  amount: z.coerce.number().positive({ message: 'Amount must be a positive number.' }),
  category: CategoryEnum,
  submittedBy: z.string().email({ message: 'Please enter a valid email address.' }),
  receiptUrl: z.string().url({ message: 'Please enter a valid receipt image URL.' }).or(z.literal('')),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Please enter a valid date.' }),
});

/**
 * Server Action to submit an expense. Writes to Supabase 'expenses' table.
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
  
  // Clean category to match DB CHECK constraint ('supplies', 'transportation', 'equipment')
  // Default non-supported categories to 'supplies' for postgres CHECK constraint safety
  let dbCategory = data.category.toLowerCase();
  if (!['supplies', 'transportation', 'equipment'].includes(dbCategory)) {
    dbCategory = 'supplies';
  }

  try {
    const { error } = await supabase
      .from('expenses')
      .insert([{
        title: data.title,
        amount: data.amount,
        category: dbCategory,
        status: 'UNDER_REVIEW',
        submitted_by: data.submittedBy,
        receipt_url: data.receiptUrl,
        created_at: new Date(data.date).toISOString(),
      }]);

    if (error) {
      throw error;
    }

    revalidatePath('/');
    return {
      success: true,
      errors: {},
    };
  } catch (error: any) {
    console.error('Error submitting expense to Supabase:', error);
    return {
      success: false,
      errors: {
        form: [error?.message || 'Failed to submit expense to database. Please check configuration.'],
      },
    };
  }
}

export const submitExpense = submitExpenseAction;

/**
 * Server Action to review (approve or reject) an expense.
 */
export async function reviewExpenseAction(
  id: string,
  status: 'Approved' | 'Rejected' | 'APPROVED' | 'REJECTED',
  rejectionNote: string = '',
  amount: number,
  title: string,
  submittedBy: string
) {
  try {
    // Map status to uppercase DB enum values
    const dbStatus = (status === 'Approved' || status === 'APPROVED') ? 'APPROVED' : 'REJECTED';

    // 1. Update the claim status
    const updatePromise = supabase
      .from('expenses')
      .update({ status: dbStatus })
      .eq('id', Number(id));

    // 2. Format activity log title and append to budget_log
    const activity = dbStatus === 'APPROVED'
      ? `Expense Approved: ${title} (Submitted by ${submittedBy})`
      : `Expense Rejected: ${title} (${rejectionNote || 'No explanation provided'})`;
    
    const logPromise = supabase
      .from('budget_log')
      .insert([{
        activity_action: activity,
        entry_type: 'LOG_ENTRY',
        amount_impact: dbStatus === 'APPROVED' ? -Number(amount) : 0,
        timestamp: new Date().toISOString(),
      }]);

    // Await both operations concurrently
    const [updateResult, logResult] = await Promise.all([updatePromise, logPromise]);

    if (updateResult.error) throw updateResult.error;
    if (logResult.error) throw logResult.error;

    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error('Error reviewing expense in Supabase:', error);
    return { success: false, error: error?.message || 'Failed to review expense.' };
  }
}

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
    const { error } = await supabase
      .from('budget_log')
      .insert([{
        activity_action: data.description,
        entry_type: 'BUDGET_ADJUSTMENT',
        amount_impact: data.amount,
        timestamp: new Date().toISOString(),
      }]);

    if (error) {
      throw error;
    }

    revalidatePath('/');
    return {
      success: true,
      errors: {},
    };
  } catch (error: any) {
    console.error('Error adding budget adjustment to Supabase:', error);
    return {
      success: false,
      errors: {
        form: [error?.message || 'Failed to add budget adjustment.'],
      },
    };
  }
}
