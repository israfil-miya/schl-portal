'use client';

import { OrderData } from '@/app/api/order/handlers/getOrdersQP';
import { fetchApi } from '@/lib/utils';
import { getDateRange } from '@/utility/date';
import moment from 'moment-timezone';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { FiltersContext } from '../FiltersContext';
import CountryDataHeatMap from './CountryDataTable';
import FilterButton from './Filter';
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
  const router = useRouter();

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

  const getCountryData = async () => {
    const daysOfData = 30;
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
          from_date: getDateRange(daysOfData).from,
          to_date: getDateRange(daysOfData).to,
          'Content-Type': 'application/json',
        },
      };

      let response = await fetchApi(url, options);

      if (response.ok) {
        setCountryData(response.data);

        console.log('Country Data:', response.data);
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
  };

  useEffect(() => {
    getFlowData();
    getStatusData();
    getCountryData();
  }, []);

  const handleFilterChange = () => {
    getFlowData();
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-end mb-4 gap-2">
        <div className="items-center flex gap-2">
          {/* pagination controls removed for this page */}

          <FilterButton
            className="w-full justify-between sm:w-auto"
            loading={
              isLoading.flowData ||
              isLoading.statusData ||
              isLoading.countryData
            }
            submitHandler={handleFilterChange}
          />
        </div>
      </div>
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
          <p className="text-center mt-4 mb-10 text-lg underline underline-offset-2 font-semibold uppercase">
            {`Production Overview Period: ${moment(countryData['Others']?.[0]?.date).format('DD MMM')} – ${moment(
              countryData['Others']?.[countryData['Others']?.length - 1]?.date,
            ).format('DD MMM')} (Last 30 days)`}
          </p>
          <CountryDataHeatMap
            isLoading={isLoading.countryData}
            data={countryData}
          />
        </div>

        <div className="mb-4 p-2 bg-gray-50 border-2">
          <p className="text-center mt-4 text-lg underline underline-offset-2 font-semibold uppercase">
            {`House Status Period: ${moment(statusData[0]?.date).format('DD MMM')} – ${moment(
              statusData[statusData.length - 1]?.date,
            ).format('DD MMM')} (Last 14 days)`}
          </p>
          <StatusDataGraph
            isLoading={isLoading.statusData}
            data={statusData.slice(-14)}
            className="h-80"
          />
        </div>
      </div>
    </>
  );
};

export default Graphs;
