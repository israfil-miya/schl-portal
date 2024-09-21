export interface RegexQuery {
  $regex: string;
  $options: string;
}

export interface Query {
  country?: RegexQuery;
  company_name?: RegexQuery;
  category?: RegexQuery;
  marketer_name?:
    | RegexQuery
    | { [key: string]: RegexQuery | string | undefined };
  // is_test?: boolean;
  is_prospected?: boolean;
  is_lead?: boolean;
  followup_done?: boolean;
  onboard_date?: string | { [key: string]: RegexQuery | string | undefined };
  prospect_status?: RegexQuery;
  calling_date_history?: { [key: string]: any };
  regular_client?: boolean;
  test_given_date_history?: { [key: string]: any };
  $or?: { [key: string]: RegexQuery }[];
}

type BooleanFields = Extract<
  keyof Query,
  'is_test' | 'is_prospected' | 'is_lead' | 'followup_done' | 'regular_client'
>;
type RegexFields = Extract<
  keyof Query,
  'country' | 'company_name' | 'category' | 'marketer_name' | 'prospect_status'
>;

// Helper function to create a regex query
export const createRegexQuery = (
  value?: string,
  exactMatch: boolean = false,
): RegexQuery | undefined =>
  value
    ? { $regex: exactMatch ? `^${value}$` : value, $options: 'i' }
    : undefined;

// Helper function to add boolean fields to the query
export const addBooleanField = (
  query: Query,
  key: BooleanFields,
  value?: boolean,
) => {
  if (value === true) {
    query[key] = value;
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
    query[key] = regexQuery;
  }
};

// Helper function to add fields if they are defined
export const addIfDefined = (query: Query, key: keyof Query, value: any) => {
  if (value !== undefined && value !== null && value !== '') {
    query[key] = value;
  }
};
