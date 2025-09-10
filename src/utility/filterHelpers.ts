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
  // 1. Escape special regex characters
  const escaped = escapeRegExp(searchString);

  // 2. Create two patterns:
  // - One with all spaces removed
  // - One allowing flexible spacing (zero or more spaces)
  const withoutSpaces = escaped.replace(/\s+/g, '');
  const withFlexibleSpaces = escaped.replace(/\s+/g, '\\s*');

  // 3. Use custom "word boundary" simulation:
  const pattern = `(?<![A-Za-z])(${withoutSpaces}|${withFlexibleSpaces})`;

  return pattern;
};

// Helper function to create a regex query
export const createRegexQuery = (
  value?: string,
  exactMatch: boolean = false,
): RegexQuery | undefined =>
  value?.trim()
    ? {
        $regex: exactMatch
          ? `^${escapeRegExp(value.trim())}$`
          : createFlexibleSearchPattern(value),
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
