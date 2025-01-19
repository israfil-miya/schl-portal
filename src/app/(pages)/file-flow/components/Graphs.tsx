'use client';

/*
The mismatch in numbers (between Status and Flow graphs) occurs because handleGetOrdersQP excludes test orders and shows all dates with zeros,
while handleGetOrdersStatus includes test orders and only shows dates with actual orders.
This causes the same dates to show different values in the two graphs.
*/

import { OrderData, StatusOrderData } from '@/app/api/order/route';
import { fetchApi } from '@/lib/utils';
import moment from 'moment-timezone';
import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { FiltersContext } from '../FiltersContext';
import FlowDataGraph from './FlowDataGraph';
import StatusDataGraph from './StatusDataGraph';

const Graphs = () => {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState({
    flowData: false,
    statusData: false,
  });

  const filtersCtx = React.useContext(FiltersContext);

  const [flowData, setFlowData] = useState<OrderData[]>([]);
  const [statusData, setStatusData] = useState<StatusOrderData[]>([]);

  const getFlowData = async () => {
    try {
      setIsLoading(prevData => ({ ...prevData, flowData: true }));

      let url: string =
        process.env.NEXT_PUBLIC_BASE_URL + '/api/order?action=get-orders-qp';
      let options: {} = {
        method: 'GET',
        headers: {
          from_date: filtersCtx?.filters.fromDate,
          to_date: filtersCtx?.filters.toDate,
          'Content-Type': 'application/json',
        },
      };

      let response = await fetchApi(url, options);

      if (response.ok) {
        setFlowData(response.data);
      } else {
        toast.error(response.data);
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while retrieving flow data');
    } finally {
      setIsLoading(prevData => ({ ...prevData, flowData: false }));
    }
  };

  const getStatusData = async () => {
    try {
      setIsLoading(prevData => ({
        ...prevData,
        statusData: true,
      }));

      let url: string =
        process.env.NEXT_PUBLIC_BASE_URL +
        '/api/order?action=get-orders-status';
      let options: {} = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      };

      let response = await fetchApi(url, options);

      if (response.ok) {
        setStatusData(response.data);
      } else {
        toast.error(response.data);
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while retrieving status data');
    } finally {
      setIsLoading(prevData => ({
        ...prevData,
        statusData: false,
      }));
    }
  };

  // async function getTestOrdersTrend() {
  //   try {
  //     setIsLoading(prevData => ({
  //       ...prevData,
  //       testOrdersTrend: true,
  //     }));

  //     let url: string =
  //       process.env.NEXT_PUBLIC_BASE_URL +
  //       '/api/report?action=get-test-orders-trend';
  //     let options: {} = {
  //       method: 'GET',
  //       headers: {
  //         name: session?.user.provided_name,
  //         'Content-Type': 'application/json',
  //       },
  //     };

  //     let response = await fetchData(url, options);

  //     if (response.ok) {
  //       setTestOrdersTrend(response.data);
  //     } else {
  //       toast.error(response.data);
  //     }
  //   } catch (error) {
  //     console.error(error);
  //     toast.error('An error occurred while retrieving test orders trend data');
  //   } finally {
  //     setIsLoading(prevData => ({
  //       ...prevData,
  //       testOrdersTrend: false,
  //     }));
  //   }
  // }

  useEffect(() => {
    getFlowData();
    getStatusData();
  }, []);

  return (
    <div className="px-2">
      <div className="mb-4 p-2 bg-gray-50 border-2">
        <p className="text-center mt-4 text-lg underline underline-offset-2 font-semibold uppercase">
          {`${
            filtersCtx?.filters.flowType == 'files'
              ? 'Files Flow'
              : 'Orders Flow'
          } Period: ${moment(flowData[0]?.date).format('DD MMM')} – ${moment(
            flowData[flowData.length - 1]?.date,
          ).format('DD MMM')}`}
        </p>
        <FlowDataGraph
          isLoading={isLoading.flowData}
          data={flowData}
          className="h-80"
        />
      </div>
      <div className="mb-4 p-2 bg-gray-50 border-2">
        <p className="text-center mt-4 text-lg underline underline-offset-2 font-semibold uppercase">
          {`Current Status Period: ${moment(statusData[0]?.date).format('DD MMM')} – ${moment(
            statusData[statusData.length - 1]?.date,
          ).format('DD MMM')} (Last 14 days)`}
        </p>
        <StatusDataGraph
          isLoading={isLoading.statusData}
          data={statusData}
          className="h-80"
        />
      </div>

      {/*  <div className="mb-4 p-2 bg-gray-50 border-2">
      <p className="text-center mt-4 text-lg underline font-semibold uppercase">
         Clients Onboard (last 12 month)
       </p>

      <ClientsOnboardGraph
         isLoading={isLoading.clientsOnboard}
         data={clientsOnboard}
        className="h-80"
       />
      </div>
      <div className="mb-4 p-2 bg-gray-50 border-2">
     <p className="text-center mt-4 text-lg underline font-semibold uppercase">
          Test Orders Trend (last 12 month)
     </p>
     <TestOrdersTrendGraph
          isLoading={isLoading.testOrdersTrend}
          data={testOrdersTrend}
         className="h-80"
        />
       </div> */}
    </div>
  );
};

export default Graphs;
