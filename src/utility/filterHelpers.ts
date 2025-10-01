import {
  Query as order_Query,
  RegexFields as order_RegexFields,
  RegexQuery as order_RegexQuery,
} from '@/app/api/order/handlers/getAllOrders';

import {
  BooleanFields as report_BooleanFields,
  Query as report_Query,
  RegexFields as report_RegexFields,
  RegexQuery as report_RegexQuery,
} from '@/app/api/report/handlers/getAllReports';

import {
  Query as client_Query,
  RegexFields as client_RegexFields,
  RegexQuery as client_RegexQuery,
} from '@/app/api/client/handlers/getAllClients';

import {
  Query as employee_Query,
  RegexQuery as employee_RegexQuery,
} from '@/app/api/employee/handlers/getAllEmployees';

import {
  Query as invoice_Query,
  RegexFields as invoice_RegexFields,
  RegexQuery as invoice_RegexQuery,
} from '@/app/api/invoice/handlers/getAllInvoices';

import {
  Query as notice_Query,
  RegexFields as notice_RegexFields,
  RegexQuery as notice_RegexQuery,
} from '@/app/api/notice/handlers/getAllNotices';

import { Query as role_Query } from '@/app/api/role/handlers/getAllRoles';

import {
  Query as schedule_Query,
  RegexFields as schedule_RegexFields,
  RegexQuery as schedule_RegexQuery,
} from '@/app/api/schedule/handlers/getAllSchedules';

import {
  Query as user_Query,
  RegexQuery as user_RegexQuery,
} from '@/app/api/user/handlers/getAllUsers';

import { escapeRegExp } from 'lodash';

type RegexQuery =
  | report_RegexQuery
  | client_RegexQuery
  | order_RegexQuery
  | invoice_RegexQuery
  | notice_RegexQuery
  | schedule_RegexQuery
  | user_RegexQuery
  | employee_RegexQuery;
type Query =
  | report_Query
  | client_Query
  | order_Query
  | invoice_Query
  | notice_Query
  | role_Query
  | schedule_Query
  | user_Query
  | employee_Query;
type RegexFields =
  | report_RegexFields
  | client_RegexFields
  | order_RegexFields
  | invoice_RegexFields
  | notice_RegexFields
  | schedule_RegexFields;
type BooleanFields = report_BooleanFields;

export const createFlexibleSearchPattern = (searchString: string): string => {
  const escaped = escapeRegExp(searchString.trim());
  const flexibleSpaces = escaped.replace(/\s+/g, '\\s*');
  const compact = escaped.replace(/\s+/g, '');
  return `(?<![A-Za-z])(${compact}|${flexibleSpaces})`;
};

export const createRegexQuery = (
  value?: string,
  exactMatch = false,
): RegexQuery | undefined => {
  if (!value?.trim()) return undefined;
  const pattern = exactMatch
    ? `^\\s*${escapeRegExp(value.trim())}\\s*$`
    : createFlexibleSearchPattern(value);
  return { $regex: pattern, $options: 'i' };
};

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

// Helper to match '+'-separated lists where all tokens in `value` must be present in any order.
// Example: value = "Color correction+Retouch+Banner" will match:
// - "Color correction+Retouch+Banner+Shadow"
// - "Banner+Shadow+Color correction+Retouch"
// It tolerates flexible spacing and is case-insensitive.
export const addPlusSeparatedContainsAllField = (
  query: Query,
  key: RegexFields,
  value?: string,
) => {
  if (!value || !value.trim()) return;

  const tokens = value
    .split('+')
    .map(t => t.trim())
    .filter(Boolean);

  if (tokens.length === 0) return;

  // Build positive lookaheads for each token, with boundaries on '+' or string edges, allowing flexible spaces inside tokens
  const lookaheads = tokens.map(token => {
    const escaped = escapeRegExp(token).replace(/\s+/g, '\\s*');
    return `(?=.*(?:^|\\s*\\+\\s*)${escaped}(?:\\s*\\+\\s*|$))`;
  });

  const pattern = `^${lookaheads.join('')}.*$`;
  (query as any)[key] = { $regex: pattern, $options: 'i' } as any;
};
