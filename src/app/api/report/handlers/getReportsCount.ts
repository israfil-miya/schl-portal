import Report, { ReportDataType } from '@/models/Reports';
import moment from 'moment-timezone';
import { NextRequest, NextResponse } from 'next/server';

export const handleGetReportsCount = async (
  req: NextRequest,
): Promise<{
  data: string | Record<string, number>;
  status: number;
}> => {
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
};
