import Report, { ReportDataType } from '@/models/Reports';
import moment from 'moment-timezone';
import { NextRequest, NextResponse } from 'next/server';

export const handleGetTestOrdersTrend = async (
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
};
