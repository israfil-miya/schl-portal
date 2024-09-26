'use client';
import fetchData from '@/utility/fetchData';
import getTodayDate from '@/utility/getTodayDate';
import moment from 'moment-timezone';
import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import FilterButton from './Filter';

interface ReportsStatusState {
  [key: string]: {
    totalCalls: number;
    totalLeads: number;
    totalTests: number;
    totalProspects: number;
  };
}

const countDays = (startDate: string, endDate: string): number => {
  // Parse the input dates using moment
  const start = moment.tz(startDate, 'YYYY-MM-DD', 'Asia/Dhaka');
  const end = moment.tz(endDate, 'YYYY-MM-DD', 'Asia/Dhaka');

  // Calculate the difference in days
  const dayDifference = end.diff(start, 'days');

  // If dates are equal, return 1
  if (dayDifference === 0) {
    return 1;
  }

  // Return the absolute value to ensure the difference is positive
  return Math.abs(dayDifference) + 1;
};

const DailyStatusTable = () => {
  const callsTargetConst = 60;
  const leadsTargetConst = 10;

  const [reportsStatus, setReportsStatus] = useState<ReportsStatusState>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { data: session } = useSession();

  const [filters, setFilters] = useState({
    fromDate: getTodayDate(),
    toDate: getTodayDate(),
  });

  const [callsTarget, setCallsTarget] = useState<number>(callsTargetConst);
  const [leadsTarget, setLeadsTarget] = useState<number>(leadsTargetConst);

  async function getReportsStatus() {
    try {
      setIsLoading(true);

      let url: string =
        process.env.NEXT_PUBLIC_BASE_URL +
        '/api/report?action=get-reports-status';
      let options: {} = {
        method: 'POST',
        body: JSON.stringify(filters),
        headers: {
          name: session?.user.real_name,
          'Content-Type': 'application/json',
        },
      };

      let response = await fetchData(url, options);

      if (response.ok) {
        setReportsStatus(response.data);
        setCallsTarget(
          callsTargetConst * countDays(filters.fromDate, filters.toDate),
        );
        setLeadsTarget(
          leadsTargetConst * countDays(filters.fromDate, filters.toDate),
        );
      } else {
        toast.error(response.data);
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while retrieving daily reports status');
    } finally {
      setIsLoading(false);
      console.log(callsTarget, leadsTarget);
    }
  }

  useEffect(() => {
    getReportsStatus();
  }, []);

  return (
    <div className="mt-6">
      <div className="flex flex-col sm:flex-row justify-center gap-1 mb-2 sm:gap-4 sm:mb-0 items-center px-2">
        <p className="font-mono inline-block text-destructive font-extrabold text-md sm:text-lg md:text-xl text-center uppercase">
          <span className="underline">DAILY TARGET:</span> {callsTargetConst}{' '}
          CALLS (20 NORMAL, 40 RECALL), {leadsTargetConst} LEADS, 10 TESTS/MONTH
        </p>
        <FilterButton
          isLoading={isLoading}
          submitHandler={getReportsStatus}
          setFilters={setFilters}
          filters={filters}
          className="w-full justify-between sm:w-auto"
        />
      </div>

      <div className="table-responsive text-center text-lg px-2 mt-1">
        <table className="table table-bordered border">
          <thead>
            <tr className="bg-gray-50">
              <th className="w-8">Marketer</th>
              <th>Calls</th>
              <th>Tests</th>
              <th>Prospects</th>
              <th>Leads</th>
            </tr>
          </thead>
          <tbody>
            {!isLoading ? (
              <>
                {Object.keys(reportsStatus).map((key, index) => {
                  return (
                    <tr key={key}>
                      <td
                        className={`${
                          callsTarget - reportsStatus[key].totalCalls <= 0 &&
                          leadsTarget - reportsStatus[key].totalLeads <= 0
                            ? 'bg-green-500'
                            : 'bg-red-500'
                        } w-8 text-wrap lg:text-nowrap text-left text-white ps-3`}
                      >
                        {index + 1}. {key}
                      </td>
                      <td
                        className={
                          reportsStatus[key].totalCalls < callsTarget
                            ? 'text-destructive'
                            : 'text-green-400'
                        }
                      >
                        {reportsStatus[key].totalCalls}
                        {reportsStatus[key].totalCalls < callsTarget &&
                          ` (${callsTarget - reportsStatus[key].totalCalls})`}
                      </td>
                      <td>{reportsStatus[key].totalTests}</td>
                      <td>{reportsStatus[key].totalProspects}</td>
                      <td
                        className={
                          reportsStatus[key].totalLeads < leadsTarget
                            ? 'text-destructive'
                            : 'text-green-400'
                        }
                      >
                        {reportsStatus[key].totalLeads}
                        {reportsStatus[key].totalLeads < leadsTarget &&
                          ` (${leadsTarget - reportsStatus[key].totalLeads})`}
                      </td>
                    </tr>
                  );
                })}
                <tr className="bg-gray-50">
                  {/* Calculate the total values for all marketers */}
                  <td className="text-center text-bold">Total</td>

                  <td className="text-bold">
                    {/* Calculate capped total calls made */}
                    {Object.values(reportsStatus).reduce(
                      (acc, curr) =>
                        acc +
                        (curr.totalCalls > callsTarget
                          ? callsTarget
                          : curr.totalCalls),
                      0,
                    )}

                    {/* Show remaining total calls if below target */}
                    {Object.values(reportsStatus).reduce(
                      (acc, curr) =>
                        acc +
                        (curr.totalCalls > callsTarget
                          ? callsTarget
                          : curr.totalCalls),
                      0,
                    ) <
                      callsTarget * Object.keys(reportsStatus).length &&
                      ` (${
                        callsTarget * Object.keys(reportsStatus).length -
                        Object.values(reportsStatus).reduce(
                          (acc, curr) =>
                            acc +
                            (curr.totalCalls > callsTarget
                              ? callsTarget
                              : curr.totalCalls),
                          0,
                        )
                      })`}
                  </td>

                  <td className="text-bold">
                    {Object.values(reportsStatus).reduce(
                      (acc, curr) => acc + curr.totalTests,
                      0,
                    )}
                  </td>
                  <td className="text-bold">
                    {Object.values(reportsStatus).reduce(
                      (acc, curr) => acc + curr.totalProspects,
                      0,
                    )}
                  </td>
                  <td className="text-bold">
                    {/* Calculate capped total calls made */}
                    {Object.values(reportsStatus).reduce(
                      (acc, curr) =>
                        acc +
                        (curr.totalLeads > leadsTarget
                          ? leadsTarget
                          : curr.totalLeads),
                      0,
                    )}

                    {/* Show remaining total calls if below target */}
                    {Object.values(reportsStatus).reduce(
                      (acc, curr) =>
                        acc +
                        (curr.totalLeads > leadsTarget
                          ? leadsTarget
                          : curr.totalLeads),
                      0,
                    ) <
                      leadsTarget * Object.keys(reportsStatus).length &&
                      ` (${
                        leadsTarget * Object.keys(reportsStatus).length -
                        Object.values(reportsStatus).reduce(
                          (acc, curr) =>
                            acc +
                            (curr.totalLeads > leadsTarget
                              ? leadsTarget
                              : curr.totalLeads),
                          0,
                        )
                      })`}
                  </td>
                </tr>
              </>
            ) : (
              <tr key={0}>
                <td colSpan={5} className="align-center text-center">
                  Loading...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DailyStatusTable;
