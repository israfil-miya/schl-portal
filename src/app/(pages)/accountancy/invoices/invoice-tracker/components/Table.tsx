'use client';

import Badge from '@/components/Badge';
import ClickToCopy from '@/components/CopyText';
import { cn, fetchApi } from '@/lib/utils';
import { formatDate, formatTime } from '@/utility/date';
import {
  BookCheck,
  ChevronLeft,
  ChevronRight,
  CirclePlus,
  Redo2,
} from 'lucide-react';
import moment from 'moment-timezone';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
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

  const router = useRouter();

  const [isFiltered, setIsFiltered] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [pageCount, setPageCount] = useState<number>(0);
  const [itemPerPage, setItemPerPage] = useState<number>(30);
  const [loading, setLoading] = useState<boolean>(true);

  const prevPageCount = useRef<number>(0);
  const prevPage = useRef<number>(1);

  const { data: session } = useSession();
  const userRole = session?.user.role;

  const [filters, setFilters] = useState({
    clientCode: '',
  });

  async function getAllDataByMonth() {
    try {
      setLoading(true);

      let url: string =
        process.env.NEXT_PUBLIC_BASE_URL +
        '/api/order?action=get-orders-by-month';
      let options: {} = {
        method: 'POST',
        headers: {
          items_per_page: itemPerPage,
          page,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      };

      let response = await fetchApi(url, options);

      if (response.ok) {
        setTrackerData(response.data as TrackerDataState);
      } else {
        toast.error(response.data as string);
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while retrieving invoice data');
    } finally {
      setLoading(false);
    }
  }

  async function getAllDataByMonthFiltered() {
    try {
      setLoading(true);

      let url: string =
        process.env.NEXT_PUBLIC_BASE_URL +
        '/api/order?action=get-orders-by-month';
      let options: {} = {
        method: 'POST',
        headers: {
          // page,
          items_per_page: itemPerPage,
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
  }

  useEffect(() => {
    getAllDataByMonth();
  }, []);

  function handlePrevious() {
    setPage(p => {
      if (p === 1) return p;
      return p - 1;
    });
  }

  function handleNext() {
    setPage(p => {
      if (p === pageCount) return p;
      return p + 1;
    });
  }

  useEffect(() => {
    if (prevPage.current !== 1 || page > 1) {
      if (trackerData?.pagination?.pageCount == 1) return;
      if (!isFiltered) getAllDataByMonth();
      else getAllDataByMonthFiltered();
    }
    prevPage.current = page;
  }, [page]);

  useEffect(() => {
    if (trackerData?.pagination?.pageCount !== undefined) {
      setPage(1);
      if (prevPageCount.current !== 0) {
        if (!isFiltered) getAllDataByMonthFiltered();
      }
      if (trackerData) setPageCount(trackerData?.pagination?.pageCount);
      prevPageCount.current = trackerData?.pagination?.pageCount;
      prevPage.current = 1;
    }
  }, [trackerData?.pagination?.pageCount]);

  useEffect(() => {
    // Reset to first page when itemPerPage changes
    prevPageCount.current = 0;
    prevPage.current = 1;
    setPage(1);

    if (!isFiltered) getAllDataByMonth();
    else getAllDataByMonthFiltered();
  }, [itemPerPage]);

  return (
    <>
      <div className="flex flex-col justify-center sm:flex-row sm:justify-end mb-4 gap-2">
        <div className="items-center flex gap-2">
          <div className="inline-flex rounded-md" role="group">
            <button
              onClick={handlePrevious}
              disabled={page === 1 || pageCount === 0 || loading}
              type="button"
              className="inline-flex items-center px-4 py-2 text-sm bg-gray-50 text-gray-700 border border-gray-200 rounded-s-md leading-tight focus:outline-none focus:bg-white focus:border-gray-500 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={18} className="stroke-gray-500" />
              Prev
            </button>
            <button
              disabled={true}
              className="hidden sm:visible sm:inline-flex items-center px-4 py-2 text-sm font-medium border"
            >
              <label>
                Page <b>{trackerData?.items?.length !== 0 ? page : 0}</b> of{' '}
                <b>{pageCount}</b>
              </label>
            </button>
            <button
              onClick={handleNext}
              disabled={page === pageCount || pageCount === 0 || loading}
              type="button"
              className="inline-flex items-center px-4 py-2 text-sm bg-gray-50 text-gray-700 border border-gray-200 rounded-e-md leading-tight focus:outline-none focus:bg-white focus:border-gray-500 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight size={18} className="stroke-gray-500" />
            </button>
          </div>

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
            submitHandler={getAllDataByMonthFiltered}
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
            <table className="table border table-bordered table-striped">
              <tbody>
                <tr key={0}>
                  <td className="align-center text-center text-wrap">
                    No Data To Show.
                  </td>
                </tr>
              </tbody>
            </table>
          ))}
      </div>
      <style jsx>{`
        .table td.fit,
        .table th.fit {
          white-space: nowrap;
          width: 1%;
        }
      `}</style>
    </>
  );
};

export default Table;
