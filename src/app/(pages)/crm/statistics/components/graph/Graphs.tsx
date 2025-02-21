'use client';

import { fetchApi } from '@/lib/utils';
import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import ClientsOnboardGraph from './ClientsOnboardGraph';
import ReportsCountGraph from './ReportsCountGraph';
import TestOrdersTrendGraph from './TestOrdersTrendGraph';

const Graphs = () => {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState({
    reportsCount: false,
    clientsOnboard: false,
    testOrdersTrend: false,
  });

  const [reportsCount, setReportsCount] = useState({});
  const [clientsOnboard, setClientsOnboard] = useState({});
  const [testOrdersTrend, setTestOrdersTrend] = useState({});

  async function getReportsCount() {
    try {
      setIsLoading(prevData => ({ ...prevData, reportsCount: true }));

      let url: string =
        process.env.NEXT_PUBLIC_BASE_URL +
        '/api/report?action=get-reports-count';
      let options: {} = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      };

      let response = await fetchApi(url, options);

      if (response.ok) {
        setReportsCount(response.data as number);
      } else {
        toast.error(response.data as string);
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while retrieving reports count data');
    } finally {
      setIsLoading(prevData => ({ ...prevData, reportsCount: false }));
    }
  }

  async function getClientsOnboard() {
    try {
      setIsLoading(prevData => ({
        ...prevData,
        clientsOnboard: true,
      }));

      let url: string =
        process.env.NEXT_PUBLIC_BASE_URL +
        '/api/report?action=get-clients-onboard';
      let options: {} = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      };

      let response = await fetchApi(url, options);

      if (response.ok) {
        setClientsOnboard(response.data as number);
      } else {
        toast.error(response.data as string);
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while retrieving clients onboard data');
    } finally {
      setIsLoading(prevData => ({
        ...prevData,
        clientsOnboard: false,
      }));
    }
  }

  async function getTestOrdersTrend() {
    try {
      setIsLoading(prevData => ({
        ...prevData,
        testOrdersTrend: true,
      }));

      let url: string =
        process.env.NEXT_PUBLIC_BASE_URL +
        '/api/report?action=get-test-orders-trend';
      let options: {} = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      };

      let response = await fetchApi(url, options);

      if (response.ok) {
        setTestOrdersTrend(response.data as number);
      } else {
        toast.error(response.data as string);
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while retrieving test orders trend data');
    } finally {
      setIsLoading(prevData => ({
        ...prevData,
        testOrdersTrend: false,
      }));
    }
  }

  useEffect(() => {
    getReportsCount();
    getClientsOnboard();
    getTestOrdersTrend();
  }, []);

  return (
    <div className="px-2 space-y-4">
      <div className="p-2 bg-gray-50 border-2">
        <p className="text-center mt-4 text-lg underline font-semibold uppercase">
          Reports Count (last 12 month)
        </p>
        <ReportsCountGraph
          isLoading={isLoading.reportsCount}
          data={reportsCount}
          className="h-80"
        />
      </div>
      <div className="p-2 bg-gray-50 border-2">
        <p className="text-center mt-4 text-lg underline font-semibold uppercase">
          Clients Onboard (last 12 month)
        </p>

        <ClientsOnboardGraph
          isLoading={isLoading.clientsOnboard}
          data={clientsOnboard}
          className="h-80"
        />
      </div>
      <div className="p-2 bg-gray-50 border-2">
        <p className="text-center mt-4 text-lg underline font-semibold uppercase">
          Test Orders Trend (last 12 month)
        </p>
        <TestOrdersTrendGraph
          isLoading={isLoading.testOrdersTrend}
          data={testOrdersTrend}
          className="h-80"
        />
      </div>
    </div>
  );
};

export default Graphs;
