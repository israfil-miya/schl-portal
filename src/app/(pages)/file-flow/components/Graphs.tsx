'use client';

import { OrderData } from '@/app/api/order/route';
import { fetchApi } from '@/lib/utils';
import { getDateRange } from '@/utility/date';
import moment from 'moment-timezone';
import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { FiltersContext } from '../FiltersContext';
import CountryDataHeatMap from './CountryDataHeatMap';
import FlowDataGraph from './FlowDataGraph';
import StatusDataGraph from './StatusDataGraph';

export type CountryData = Record<
  string,
  Array<{
    date: string;
    orderQuantity: number;
    fileQuantity: number;
  }>
>;

const Graphs = () => {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState({
    flowData: false,
    statusData: false,
    countryData: false,
  });

  const filtersCtx = React.useContext(FiltersContext);

  const [flowData, setFlowData] = useState<OrderData[]>([]);
  const [statusData, setStatusData] = useState<OrderData[]>([]);

  const [countryData, setCountryData] = useState<CountryData>({});

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
    const daysOfData = 14;

    try {
      setIsLoading(prevData => ({ ...prevData, statusData: true }));

      let url: string =
        process.env.NEXT_PUBLIC_BASE_URL + '/api/order?action=get-orders-qp';
      let options: {} = {
        method: 'GET',
        headers: {
          from_date: getDateRange(daysOfData).from,
          to_date: getDateRange(daysOfData).to,
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
      setIsLoading(prevData => ({ ...prevData, statusData: false }));
    }
  };

  async function getCountryData() {
    try {
      setIsLoading(prevData => ({
        ...prevData,
        countryData: true,
      }));

      let url: string =
        process.env.NEXT_PUBLIC_BASE_URL + '/api/order?action=get-orders-cd';
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
        setCountryData(response.data);
      } else {
        toast.error(response.data);
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while retrieving country data');
    } finally {
      setIsLoading(prevData => ({
        ...prevData,
        countryData: false,
      }));
    }
  }

  useEffect(() => {
    getFlowData();
    getStatusData();
    getCountryData();
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
          data={statusData.slice(-14)}
          className="h-80"
        />
      </div>

      <div className="mb-4 p-2 bg-gray-50 border-2 table-responsive">
        <CountryDataHeatMap
          isLoading={isLoading.statusData}
          data={countryData}
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
