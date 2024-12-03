import {
  Query as client_Query,
  RegexFields as client_RegexFields,
  RegexQuery as client_RegexQuery,
} from '@/app/api/client/route';
import {
  Query as invoice_Query,
  RegexFields as invoice_RegexFields,
  RegexQuery as invoice_RegexQuery,
} from '@/app/api/invoice/route';
import {
  Query as order_Query,
  RegexFields as order_RegexFields,
  RegexQuery as order_RegexQuery,
} from '@/app/api/order/route';
import {
  BooleanFields as report_BooleanFields,
  Query as report_Query,
  RegexFields as report_RegexFields,
  RegexQuery as report_RegexQuery,
} from '@/app/api/report/route';

import {
  Query as approval_Query,
  RegexFields as approval_RegexFields,
  RegexQuery as approval_RegexQuery,
} from '@/app/api/approval/route';

import {
  Query as notice_Query,
  RegexFields as notice_RegexFields,
  RegexQuery as notice_RegexQuery,
} from '@/app/api/notice/route';

import { escapeRegex } from '@/lib/utils';

type RegexQuery =
  | report_RegexQuery
  | client_RegexQuery
  | order_RegexQuery
  | invoice_RegexQuery
  | approval_RegexQuery
  | notice_RegexQuery;
type Query =
  | report_Query
  | client_Query
  | order_Query
  | invoice_Query
  | approval_Query
  | notice_Query;
type RegexFields =
  | report_RegexFields
  | client_RegexFields
  | order_RegexFields
  | invoice_RegexFields
  | approval_RegexFields
  | notice_RegexFields;
type BooleanFields = report_BooleanFields;

// Helper function to create a regex query
export const createRegexQuery = (
  value?: string,
  exactMatch: boolean = false,
): RegexQuery | undefined =>
  value
    ? {
        $regex: exactMatch ? `^${escapeRegex(value.trim() || '')}$` : value,
        $options: 'i',
      }
    : undefined;

// Helper function to add boolean fields to the query
export const addBooleanField = (
  query: Query,
  key: BooleanFields,
  value?: boolean,
) => {
  if (value === true) {
    (query as any)[key] = value;
  }
};

// Helper function to add regex fields to the query
export const addRegexField = (
  query: Query,
  key: RegexFields,
  value?: string,
  exactMatch: boolean = false,
) => {
  const regexQuery = createRegexQuery(value, exactMatch);
  if (regexQuery) {
    (query as any)[key] = regexQuery;
  }
};

// Helper function to add fields if they are defined

export const addIfDefined = <T extends Query>(
  query: T,
  key: keyof T,
  value: any,
) => {
  if (
    value !== undefined &&
    value !== null &&
    value !== '' &&
    value !== false
  ) {
    query[key] = value;
  }
};
