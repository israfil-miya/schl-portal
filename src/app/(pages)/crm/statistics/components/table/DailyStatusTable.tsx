'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import FilterButton from './Filter';

export interface ReportsStatusState {
  [key: string]: {
    totalCalls: number;
    totalLeads: number;
    totalClients: number;
    totalTests: number;
    totalProspects: number;
  };
}

export const callsTargetConst = 50;
export const leadsTargetConst = 20;

const DailyStatusTable = () => {
  const [reportsStatus, setReportsStatus] = useState<ReportsStatusState>({});
  const [loading, setLoading] = useState<boolean>(true);

  const [callsTarget, setCallsTarget] = useState<number>(callsTargetConst);
  const [leadsTarget, setLeadsTarget] = useState<number>(leadsTargetConst);

  return (
    <div className="space-y-2">
      <div className="flex flex-col sm:flex-row justify-center gap-1 sm:gap-4 sm:mb-0 items-center px-2">
        <p className="font-mono inline-block text-destructive font-extrabold text-lg sm:text-xl md:text-2xl text-center uppercase">
          <span className="underline">DAILY TARGET:</span> {callsTargetConst}{' '}
          CALLS (20 NORMAL, 30 RECALL), {leadsTargetConst} LEADS, 10 TESTS/MONTH
        </p>
        <FilterButton
          loading={loading}
          setLoading={setLoading}
          setReportsStatus={setReportsStatus}
          setCallsTarget={setCallsTarget}
          setLeadsTarget={setLeadsTarget}
          className="w-full justify-between sm:w-auto"
        />
      </div>

      <div className="table-responsive-sm text-center text-lg px-2 mt-1">
        <table className="table table-bordered border">
          <thead>
            <tr className="bg-gray-50">
              <th className="sm:max-w-8">Marketer</th>
              <th>Calls</th>
              <th>Leads</th>
              <th>Tests</th>
              <th>Prospects</th>
              <th>Clients</th>
            </tr>
          </thead>
          <tbody className="text-base">
            {!loading ? (
              <>
                {Object.keys(reportsStatus).map((key, index) => {
                  return (
                    <tr key={key}>
                      <td
                        className={`${
                          callsTarget - reportsStatus[key].totalCalls <= 0 &&
                          leadsTarget - reportsStatus[key].totalLeads <= 0
                            ? 'bg-green-800'
                            : 'bg-red-800'
                        } sm:max-w-8 text-wrap lg:text-nowrap text-left text-white ps-3`}
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
                      <td>{reportsStatus[key].totalTests}</td>
                      <td>{reportsStatus[key].totalProspects}</td>
                      <td>{reportsStatus[key].totalClients}</td>
                    </tr>
                  );
                })}
                <tr className="bg-gray-50">
                  {/* Calculate the total values for all marketers */}
                  <td className="text-center font-bold">Total</td>

                  <td className="font-bold">
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

                  <td className="font-bold">
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

                  <td className="font-bold">
                    {Object.values(reportsStatus).reduce(
                      (acc, curr) => acc + curr.totalTests,
                      0,
                    )}
                  </td>

                  <td className="font-bold">
                    {Object.values(reportsStatus).reduce(
                      (acc, curr) => acc + curr.totalProspects,
                      0,
                    )}
                  </td>

                  <td className="font-bold">
                    {Object.values(reportsStatus).reduce(
                      (acc, curr) => acc + curr.totalClients,
                      0,
                    )}
                  </td>
                </tr>
              </>
            ) : (
              <tr key={0}>
                <td colSpan={6} className="align-center text-center">
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
