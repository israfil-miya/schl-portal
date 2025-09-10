import Report, { ReportDataType } from '@/models/Reports';

import {
  addBooleanField,
  addIfDefined,
  addRegexField,
  createRegexQuery,
} from '@/utility/filterHelpers';
import moment from 'moment-timezone';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

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
  is_prospected?: boolean;
  is_lead?: boolean;
  followup_done?: boolean;
  client_status?: string | { $in: string[] };
  onboard_date?: string | { [key: string]: RegexQuery | string | undefined };
  prospect_status?: RegexQuery;
  calling_date_history?: { [key: string]: any };
  test_given_date_history?: { [key: string]: any };
  $or?: { [key: string]: RegexQuery }[];
}

export type BooleanFields = Extract<
  keyof Query,
  | 'is_test'
  | 'is_prospected'
  | 'is_lead'
  | 'followup_done'
  | 'regular_client'
  | 'permanent_client'
>;
export type RegexFields = Extract<
  keyof Query,
  | 'country'
  | 'company_name'
  | 'category'
  | 'marketer_name'
  | 'prospect_status'
  | 'client_status'
>;

interface PaginatedData<ItemsType> {
  pagination: { count: number; pageCount: number };
  items: ItemsType;
}

export const handleGetAllReports = async (
  req: NextRequest,
): Promise<{
  data: string | PaginatedData<ReportDataType[]>;
  status: number;
}> => {
  try {
    const headersList = await headers();
    const page: number = Number(headersList.get('page')) || 1;
    const ITEMS_PER_PAGE: number =
      Number(headersList.get('items_per_page')) || 30;
    const isFilter: boolean = headersList.get('filtered') === 'true';
    const paginated: boolean = headersList.get('paginated') === 'true';

    const filters = await req.json();

    const {
      country,
      companyName,
      category,
      marketerName,
      fromDate,
      toDate,
      test,
      prospect,
      onlyLead,
      followupDone,
      regularClient,
      staleClient,
      prospectStatus,
      generalSearchString,
    } = filters;

    const query: Query = {};

    addRegexField(query, 'country', country);
    addRegexField(query, 'company_name', companyName);
    addRegexField(query, 'category', category);
    addRegexField(query, 'marketer_name', marketerName, true);
    addRegexField(query, 'prospect_status', prospectStatus, true);

    addBooleanField(query, 'is_prospected', prospect);

    query.is_lead = onlyLead || false;

    addIfDefined(query, 'followup_done', followupDone);

    if (regularClient) {
      query.client_status = 'pending';
    } else {
      if (regularClient === false) {
        query.client_status = { $in: ['none', 'pending'] };
      }
    }

    if (staleClient) {
      const twoMonthsAgo = moment().subtract(2, 'months').format('YYYY-MM-DD');
      query.calling_date_history = {
        $not: { $elemMatch: { $gte: twoMonthsAgo } },
      };
    }

    if (fromDate || toDate) {
      query.calling_date_history = query.calling_date_history || {};
      query.calling_date_history.$elemMatch = {
        ...(fromDate && { $gte: fromDate }),
        ...(toDate && { $lte: toDate }),
      };
    }

    if (!fromDate && !toDate && !staleClient) {
      delete query.calling_date_history;
    }

    // if is_test filter is true
    if (test === true) {
      if (query.calling_date_history) {
        query.test_given_date_history = query.calling_date_history;
        delete query.calling_date_history;
      } else {
        query.test_given_date_history = { $exists: true, $ne: [] };
      }
    }

    const searchQuery: Query = { ...query };

    let sortQuery: Record<string, 1 | -1> = {
      createdAt: -1,
    };

    // Sorting by followup date (ascending) if followup is pending and not a regular client (/pending-followups)
    if (
      followupDone === false &&
      regularClient === false &&
      searchQuery.is_lead === false
    ) {
      sortQuery = {
        hasFollowupDate: 1, // Sort by presence of followup_date first (0 for missing, 1 for present)
        followup_date: 1, // Then sort by followup_date ascending
        createdAt: -1, // Finally, sort by createdAt descending
      };
    }

    if (!query && isFilter == true && !generalSearchString) {
      return { data: 'No filter applied', status: 400 };
    } else {
      const skip = (page - 1) * ITEMS_PER_PAGE;

      if (generalSearchString) {
        const searchPattern = createRegexQuery(generalSearchString);

        searchQuery['$or'] = [
          { country: searchPattern! },
          { company_name: searchPattern! },
          { category: searchPattern! },
          { marketer_name: searchPattern! },
          { designation: searchPattern! },
          { website: searchPattern! },
          { contact_person: searchPattern! },
          { contact_number: searchPattern! },
          { calling_status: searchPattern! },
          { email_address: searchPattern! },
          { linkedin: searchPattern! },
        ];
      }

      const count: number = await Report.countDocuments(searchQuery);
      let reports: any;

      if (paginated) {
        reports = await Report.aggregate([
          { $match: searchQuery },
          {
            $addFields: {
              hasFollowupDate: {
                $cond: {
                  if: { $eq: ['$followup_date', ''] },
                  then: 1,
                  else: 0,
                },
              },
            },
          },
          { $sort: sortQuery },
          { $skip: skip },
          { $limit: ITEMS_PER_PAGE },
          {
            $project: {
              hasFollowupDate: 0, // Remove the added field from the final output
            },
          },
        ]);
      } else {
        reports = await Report.find(searchQuery).lean();
      }

      console.log('GET REPORTS: SEARCH Query:', searchQuery);

      const pageCount: number = Math.ceil(count / ITEMS_PER_PAGE);

      if (!reports) {
        return { data: 'Unable to retrieve reports', status: 400 };
      } else {
        let reportsData = {
          pagination: {
            count,
            pageCount,
          },
          items: reports,
        };

        return { data: reportsData, status: 200 };
      }
    }
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
};
