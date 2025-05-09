import { dbConnect, getQuery } from '@/lib/utils';
import Report, { ReportDataType } from '@/models/Reports';
import User from '@/models/Users';
import {
  addBooleanField,
  addIfDefined,
  addRegexField,
  createRegexQuery,
} from '@/utility/filterHelpers';
import moment from 'moment-timezone';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import Client, { ClientDataType } from '@/models/Clients';
import { getTodayDate } from '@/utility/date';
import { startSession } from 'mongoose';

dbConnect();

interface ReportCount {
  [key: string]: {
    totalCalls: number;
    totalLeads: number;
    totalClients: number;
    totalTests: number;
    totalProspects: number;
  };
}

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

async function handleGetTestOrdersTrend(req: NextRequest): Promise<{
  data: string | Record<string, number>;
  status: number;
}> {
  try {
    const now = moment().tz('Asia/Dhaka');
    const startDate = now
      .clone()
      .subtract(12, 'months')
      .startOf('month')
      .toDate();

    const endDate = now.clone().endOf('month').toDate();

    interface ReportCount {
      [key: string]: number;
    }

    // Initialize the result object with zero counts
    const result: ReportCount = {};
    for (let i = 0; i <= 12; i++) {
      const month = now
        .clone()
        .subtract(i, 'months')
        .format('MMMM_YYYY')
        .toLowerCase();
      result[month] = 0;
    }

    // Optimize the query with indexing, projections, and date range filtering
    const reports = await Report.find({
      is_lead: false,
      test_given_date_history: {
        $exists: true,
        $ne: [],
      },
    })
      .select('test_given_date_history')
      .exec();

    // Count the test_given_date_history dates per month
    reports.forEach(report => {
      report.test_given_date_history.forEach((testDate: string) => {
        const testMoment = moment(testDate);
        if (testMoment.isBetween(startDate, endDate, 'day', '[]')) {
          const month = testMoment.format('MMMM_YYYY').toLowerCase();
          if (result.hasOwnProperty(month)) {
            result[month] += 1;
          }
        }
      });
    });

    // Sort the result by month
    const sortedResult: ReportCount = Object.keys(result)
      .sort((a, b) => moment(a, 'MMMM_YYYY').diff(moment(b, 'MMMM_YYYY')))
      .reduce((obj: ReportCount, key: string) => {
        obj[key] = result[key];
        return obj;
      }, {});

    return { data: sortedResult, status: 200 };
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
}

async function handleGetReportsCount(req: NextRequest): Promise<{
  data: string | Record<string, number>;
  status: number;
}> {
  try {
    const now = moment().tz('Asia/Dhaka');
    const startDate = now
      .clone()
      .subtract(12, 'months')
      .startOf('month')
      .toDate();
    const endDate = now.clone().endOf('month').toDate();

    interface ReportCount {
      [key: string]: number;
    }

    // Aggregation pipeline to count the number of reports per month
    const reports = await Report.aggregate([
      {
        $match: {
          is_lead: false,
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1,
        },
      },
    ]);

    // Initialize result object with zero counts
    const result: ReportCount = {};
    for (let i = 0; i <= 12; i++) {
      const month = now
        .clone()
        .subtract(i, 'months')
        .format('MMMM_YYYY')
        .toLowerCase();
      result[month] = 0;
    }

    // Populate result with the actual counts
    reports.forEach(report => {
      const monthStr = moment()
        .month(report._id.month - 1) // MongoDB months are 1-based
        .year(report._id.year)
        .format('MMMM_YYYY')
        .toLowerCase();
      result[monthStr] = report.count;
    });

    // Return the sorted result
    const sortedResult: ReportCount = Object.keys(result)
      .sort((a, b) => moment(a, 'MMMM_YYYY').diff(moment(b, 'MMMM_YYYY')))
      .reduce((obj: ReportCount, key: string) => {
        obj[key] = result[key];
        return obj;
      }, {});

    return { data: sortedResult, status: 200 };
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
}

async function handleGetClientsOnboard(req: NextRequest): Promise<{
  data: string | Record<string, number>;
  status: number;
}> {
  try {
    const now = moment().tz('Asia/Dhaka');
    const startDate = now
      .clone()
      .subtract(12, 'months')
      .startOf('month')
      .toDate();
    const endDate = now.clone().endOf('month').toDate();

    interface ReportCount {
      [key: string]: number;
    }

    // Optimize the query with indexing and projections
    const reports = await Report.find({
      is_lead: false,
      regular_client: true,
      onboard_date: { $gte: startDate, $lte: endDate },
    }).select('onboard_date');

    const result: ReportCount = {};

    // Initialize the result object with zero counts
    for (let i = 0; i <= 12; i++) {
      const month = now
        .clone()
        .subtract(i, 'months')
        .format('MMMM_YYYY')
        .toLowerCase();
      result[month] = 0;
    }

    // Count the reports per month
    reports.forEach(report => {
      const month = moment(report.onboard_date)
        .format('MMMM_YYYY')
        .toLowerCase();
      if (result.hasOwnProperty(month)) {
        result[month] += 1;
      }
    });

    // Sort the result by month
    const sortedResult: ReportCount = Object.keys(result)
      .sort((a, b) => moment(a, 'MMMM_YYYY').diff(moment(b, 'MMMM_YYYY')))
      .reduce((obj: ReportCount, key: string) => {
        obj[key] = result[key];
        return obj;
      }, {});

    return { data: sortedResult, status: 200 };
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
}

async function handleGetReportsStatus(req: NextRequest): Promise<{
  data: string | ReportCount;
  status: number;
}> {
  try {
    const { fromDate, toDate } = await req.json();

    // Fetch all marketer names in one go
    const marketerNames = (await User.find({ role: 'marketer' })
      .distinct('provided_name')
      .exec()) as string[]; // Cast to string[] as provided_name is always present for marketers

    // Create a range query for the dates
    const dateRangeQuery = {
      ...(fromDate && { $gte: fromDate }),
      ...(toDate && { $lte: toDate }),
    };

    // Create an array of promises to fetch data concurrently
    const reportPromises = marketerNames.map(async marketerName => {
      // Fetch call reports
      const callReports = await Report.find({
        marketer_name: marketerName,
        is_lead: false,
        calling_date_history: { $elemMatch: dateRangeQuery },
      }).select('calling_date_history');

      // Calculate total calls within date range
      let totalCalls = 0;
      callReports.forEach(report => {
        report.calling_date_history.forEach((callDate: string) => {
          const callMoment = moment(callDate);
          if (callMoment.isBetween(fromDate, toDate, 'day', '[]')) {
            totalCalls += 1;
          }
        });
      });

      // Fetch total leads
      const totalLeads = await Report.countDocuments({
        marketer_name: marketerName,
        calling_date_history: { $elemMatch: dateRangeQuery },
        is_lead: true,
      });

      // Fetch total clients
      const totalClients = await Report.countDocuments({
        marketer_name: marketerName,
        client_status: 'approved',
        is_lead: false,
        onboard_date: dateRangeQuery,
      });

      // Fetch test reports
      const testReports = await Report.find({
        is_lead: false,
        marketer_name: marketerName,
        test_given_date_history: { $exists: true, $ne: [] },
      }).select('test_given_date_history');

      // Calculate total tests within date range
      let totalTests = 0;
      testReports.forEach(report => {
        report.test_given_date_history.forEach((testDate: string) => {
          const testMoment = moment(testDate);
          if (testMoment.isBetween(fromDate, toDate, 'day', '[]')) {
            totalTests += 1;
          }
        });
      });

      // Fetch total prospects
      const totalProspects = await Report.countDocuments({
        marketer_name: marketerName,
        calling_date_history: { $elemMatch: dateRangeQuery },
        is_prospected: true,
        is_lead: false,
      });

      // Return the calculated data for this marketer
      return {
        marketerName,
        totalCalls,
        totalLeads,
        totalClients,
        totalTests,
        totalProspects,
      };
    });

    // Resolve all the promises concurrently
    const reportResults = await Promise.all(reportPromises);

    // Prepare the final data object
    const data: ReportCount = {};
    reportResults.forEach(result => {
      data[result.marketerName] = {
        totalCalls: result.totalCalls || 0,
        totalLeads: result.totalLeads || 0,
        totalClients: result.totalClients || 0,
        totalTests: result.totalTests || 0,
        totalProspects: result.totalProspects || 0,
      };
    });

    return {
      data,
      status: 200,
    };
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
}

async function handleGetAllReports(req: NextRequest): Promise<{
  data: string | Object;
  status: number;
}> {
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
}

async function handleConvertToPermanent(req: NextRequest): Promise<{
  data: string | Record<string, number>;
  status: number;
}> {
  const session = await startSession();
  session.startTransaction();

  try {
    const data: ClientDataType = await req.json();
    console.log('Received data:', data);

    const existingClientCount = await Client.countDocuments(
      { client_code: data.client_code },
      { session },
    );

    if (existingClientCount > 0) {
      await session.abortTransaction();
      session.endSession();
      return { data: 'Client with the same code already exists', status: 400 };
    }

    const clientData = await Client.create([data], { session });

    if (clientData) {
      const reportData = await Report.findOneAndUpdate(
        { company_name: data.client_name, is_lead: false },
        { client_status: 'approved', onboard_date: getTodayDate() },
        { new: true, session },
      );

      if (reportData) {
        await session.commitTransaction();
        session.endSession();
        console.log('Added the client successfully', reportData);
        return { data: 'Added the client successfully', status: 200 };
      } else {
        await session.abortTransaction();
        session.endSession();
        return {
          data: 'Unable to change the status of the report',
          status: 400,
        };
      }
    } else {
      await session.abortTransaction();
      session.endSession();
      return { data: 'Unable to add new client', status: 400 };
    }
  } catch (e) {
    await session.abortTransaction();
    session.endSession();
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
}

async function handleRejectClient(req: NextRequest): Promise<{
  data: string | Object;
  status: number;
}> {
  try {
    let { id } = await req.json();

    const resData = await Report.findByIdAndUpdate(
      id,
      { client_status: 'none' },
      {
        new: true,
      },
    );

    if (resData) {
      return { data: 'Rejected regular client request', status: 200 };
    } else {
      return { data: 'Unable reject regular client request', status: 400 };
    }
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
}

async function handleMarkDuplicateClient(req: NextRequest): Promise<{
  data: string | Object;
  status: number;
}> {
  try {
    let { id } = await req.json();

    const resData = await Report.findByIdAndUpdate(
      id,
      {
        client_status: 'approved',
      },
      {
        new: true,
      },
    );

    if (resData) {
      return { data: 'Marked the request as duplicate client', status: 200 };
    } else {
      return { data: 'Unable mark the request as duplicate', status: 400 };
    }
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
}

export async function POST(req: NextRequest) {
  let res: { data: string | Object | number; status: number };

  switch (getQuery(req).action) {
    case 'get-reports-status':
      res = await handleGetReportsStatus(req);
      return NextResponse.json(res.data, { status: res.status });
    case 'get-all-reports':
      res = await handleGetAllReports(req);
      return NextResponse.json(res.data, { status: res.status });
    case 'convert-to-permanent':
      res = await handleConvertToPermanent(req);
      return NextResponse.json(res.data, { status: res.status });
    case 'reject-regular-client-request':
      res = await handleRejectClient(req);
      return NextResponse.json(res.data, { status: res.status });
    case 'mark-duplicate-client':
      res = await handleMarkDuplicateClient(req);
      return NextResponse.json(res.data, { status: res.status });
    default:
      return NextResponse.json({ response: 'OK' }, { status: 200 });
  }
}

export async function GET(req: NextRequest) {
  let res: { data: string | Object | number; status: number };

  switch (getQuery(req).action) {
    case 'get-reports-count':
      res = await handleGetReportsCount(req);
      return NextResponse.json(res.data, { status: res.status });
    case 'get-clients-onboard':
      res = await handleGetClientsOnboard(req);
      return NextResponse.json(res.data, { status: res.status });
    case 'get-test-orders-trend':
      res = await handleGetTestOrdersTrend(req);
      return NextResponse.json(res.data, { status: res.status });
    default:
      return NextResponse.json({ response: 'OK' }, { status: 200 });
  }
}
