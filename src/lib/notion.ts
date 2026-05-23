import { Client } from '@notionhq/client';

export const isNotionConfigured = !!process.env.NOTION_INTEGRATION_TOKEN;

export const notion = isNotionConfigured
  ? new Client({
      auth: process.env.NOTION_INTEGRATION_TOKEN,
    })
  : null;

export const EXPENSES_DB_ID = process.env.NOTION_EXPENSES_DB_ID || '';
export const BUDGET_LOG_DB_ID = process.env.NOTION_BUDGET_LOG_DB_ID || '';
