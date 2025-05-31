'use client';

import NoData, { Type } from '@/components/NoData';
import Pagination from '@/components/Pagination';
import { usePaginationManager } from '@/hooks/usePaginationManager';
import { fetchApi } from '@/lib/utils';
import { useEffect } from 'react';

import Link from 'next/link';
import React, { useCallback, useState } from 'react';
import { toast } from 'sonner';
import FilterButton from './Filter';

interface TrackerDataType {
  client_code: string;
  orders: Array<{
    [key: string]: {
      count: number;
      totalFiles: number;
      invoiced: boolean;
    };
  }>;
}

type TrackerDataState = {
  pagination: {
    count: number;
    pageCount: number;
  };
  items: TrackerDataType[];
};

const Table = () => {
  const [trackerData, setTrackerData] = useState<TrackerDataState>({
    pagination: {
      count: 0,
      pageCount: 0,
    },
    items: [],
  });

  const [isFiltered, setIsFiltered] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [pageCount, setPageCount] = useState<number>(0);
  const [itemPerPage, setItemPerPage] = useState<number>(30);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchVersion, setSearchVersion] = useState<number>(0);

  const [filters, setFilters] = useState({
    clientCode: '',
  });

  const getAllOrdersByMonth = useCallback(
    async (page: number, itemPerPage: number) => {
      try {
        setLoading(true);

        let url: string =
          process.env.NEXT_PUBLIC_BASE_URL +
          '/api/order?action=get-orders-by-month';
        let options: {} = {
          method: 'POST',
          headers: {
            items_per_page: itemPerPage,
            page: page,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        };

        let response = await fetchApi(url, options);

        if (response.ok) {
          setTrackerData(response.data as TrackerDataState);
          setPageCount(
            (response.data as TrackerDataState).pagination.pageCount,
          );
        } else {
          toast.error(response.data as string);
        }
      } catch (error) {
        console.error(error);
        toast.error('An error occurred while retrieving invoice data');
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const getAllOrdersByMonthFiltered = useCallback(
    async (page: number, itemPerPage: number) => {
      try {
        setLoading(true);

        let url: string =
          process.env.NEXT_PUBLIC_BASE_URL +
          '/api/order?action=get-orders-by-month';
        let options: {} = {
          method: 'POST',
          headers: {
            items_per_page: itemPerPage,
            page: page,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...filters,
          }),
        };

        let response = await fetchApi(url, options);

        if (response.ok) {
          setTrackerData(response.data as TrackerDataState);
          setIsFiltered(true);
          setPageCount(
            (response.data as TrackerDataState).pagination.pageCount,
          );
        } else {
          toast.error(response.data as string);
        }
      } catch (error) {
        console.error(error);
        toast.error('An error occurred while retrieving invoice data');
      } finally {
        setLoading(false);
      }
      return;
    },
    [filters],
  );

  const fetchOrders = useCallback(async () => {
    if (!isFiltered) {
      await getAllOrdersByMonth(page, itemPerPage);
    } else {
      await getAllOrdersByMonthFiltered(page, itemPerPage);
    }
  }, [
    isFiltered,
    getAllOrdersByMonth,
    getAllOrdersByMonthFiltered,
    page,
    itemPerPage,
  ]);

  usePaginationManager({
    page,
    itemPerPage,
    pageCount,
    setPage,
    triggerFetch: fetchOrders,
  });

  useEffect(() => {
    if (searchVersion > 0 && isFiltered && page === 1) {
      fetchOrders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchVersion, isFiltered, page]);

  const handleSearch = useCallback(() => {
    setIsFiltered(true);
    setPage(1);
    setSearchVersion(v => v + 1);
  }, [setIsFiltered, setPage]);

  return (
    <>
      <div className="flex flex-col justify-center sm:flex-row sm:justify-end mb-4 gap-2">
        <div className="items-center flex gap-2">
          <Pagination
            page={page}
            pageCount={pageCount}
            setPage={setPage}
            isLoading={loading}
          />

          <select
            value={itemPerPage}
            disabled={loading}
            onChange={e => setItemPerPage(parseInt(e.target.value))}
            // defaultValue={30}
            required
            className="appearance-none cursor-pointer px-4 py-2 bg-gray-50 text-gray-700 border border-gray-200 rounded-md leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
          >
            <option value={30}>30</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <FilterButton
            loading={loading}
            submitHandler={handleSearch}
            setFilters={setFilters}
            filters={filters}
            className="w-full justify-between sm:w-auto"
          />
        </div>
      </div>

      {loading ? <p className="text-center">Loading...</p> : <></>}

      <div className="table-responsive text-nowrap text-base">
        {!loading &&
          (trackerData?.items?.length !== 0 ? (
            <table className="table border table-bordered table-striped">
              <thead>
                <tr>
                  <th>Client Code</th>
                  {trackerData?.items?.[0]?.orders.map((data, index) => {
                    const month = Object.keys(data)[0];
                    return <th key={index}>{month.split(' ')[0]}</th>; // <-- to display only month
                    // return <td key={month}>{month}</td>; // <-- to display month and year
                  })}
                </tr>
              </thead>
              <tbody>
                {trackerData?.items?.map((data, index) => (
                  <tr key={index}>
                    <td className="text-start fit ps-4">{data.client_code}</td>
                    {data.orders.map((ordersData, i) => {
                      const month = Object.keys(ordersData)[0];
                      const orderCount = ordersData[month].count;
                      const fileCount = ordersData[month].totalFiles;
                      const isInvoiced = ordersData[month].invoiced;
                      return (
                        <td
                          className={
                            isInvoiced
                              ? 'bg-green-800 text-white'
                              : orderCount > 0
                                ? 'bg-red-800 text-white'
                                : 'bg-gray-800 text-white'
                          }
                          key={`${month} - ${orderCount}`}
                        >
                          <Link
                            target="_blank"
                            href={
                              process.env.NEXT_PUBLIC_BASE_URL +
                              `/accountancy/invoices/create-invoice?c-code=${encodeURIComponent(
                                data.client_code,
                              )}&month=${encodeURIComponent(month.replace(' ', '-'))}`
                            }
                          >
                            {orderCount} {fileCount > 0 && `(${fileCount})`}
                          </Link>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <NoData text="No Client Records Found" type={Type.danger} />
          ))}
      </div>
      <style jsx>{``}</style>

      <style jsx>
        {`
          .table td.fit,
          .table th.fit {
            white-space: nowrap;
            width: 1%;
          }
          th,
          td {
            border: 1px solid #9ca3af;
          }
        `}
      </style>
    </>
  );
};

export default Table;
