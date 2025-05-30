'use client';

import Badge from '@/components/Badge';
import ExtendableTd from '@/components/ExtendableTd';
import { fetchApi } from '@/lib/utils';
import { ClientDataType } from '@/models/Clients';

import {
  validationSchema,
  OrderDataType as zod_OrderDataType,
} from '@/app/(pages)/browse/schema';
import NoData, { Type } from '@/components/NoData';
import Pagination from '@/components/Pagination';
import { usePaginationManager } from '@/hooks/usePaginationManager';
import { OrderDataType } from '@/models/Orders';
import { formatDate, formatTime } from '@/utility/date';
import {
  ChevronLeft,
  ChevronRight,
  CirclePlus,
  ClipboardCopy,
} from 'lucide-react';
import moment from 'moment-timezone';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import Details from './Details';
import FilterButton from './Filter';

type OrdersState = {
  pagination: {
    count: number;
    pageCount: number;
  };
  items: OrderDataType[];
};

function getMonthRange(monthYear: string): { from: string; to: string } {
  if (!monthYear) return { from: '', to: '' };

  const [monthName, year] = monthYear.split('-');
  const monthNumber = moment().month(monthName).format('MM');

  const startDate = moment
    .tz(`${year}-${monthNumber}-01`, 'Asia/Dhaka')
    .startOf('month')
    .format('YYYY-MM-DD');
  const endDate = moment
    .tz(`${year}-${monthNumber}-01`, 'Asia/Dhaka')
    .endOf('month')
    .format('YYYY-MM-DD');

  return { from: startDate, to: endDate };
}

const Table: React.FC<{ clientsData: ClientDataType[] }> = props => {
  const [orders, setOrders] = useState<OrdersState>({
    pagination: {
      count: 0,
      pageCount: 0,
    },
    items: [],
  });

  const [isFiltered, setIsFiltered] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [pageCount, setPageCount] = useState<number>(0);
  const [itemPerPage, setItemPerPage] = useState<number>(30);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchVersion, setSearchVersion] = useState<number>(0);

  const searchParams = useSearchParams();
  const c_code =
    searchParams.get('c-code') || props.clientsData?.[0].client_code;
  const month = searchParams.get('month') || moment().format('MMMM-YYYY');
  const { from, to } = getMonthRange(month);

  const [selectedClient, setSelectedClient] = useState<string>(c_code || '');

  const [filters, setFilters] = useState({
    folder: '',
    clientCode: c_code || '',
    task: '',
    status: '',
    fromDate: from,
    toDate: to,
  });

  const getAllOrdersFiltered = useCallback(
    async (page: number, itemPerPage: number) => {
      try {
        // setLoading(true);

        let url: string =
          process.env.NEXT_PUBLIC_BASE_URL + '/api/order?action=get-all-orders';
        let options: {} = {
          method: 'POST',
          headers: {
            for_invoice: true,
            filtered: true,
            paginated: true,
            items_per_page: itemPerPage,
            page: page,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...filters,
            type: 'general',
          }),
        };

        let response = await fetchApi(url, options);

        if (response.ok) {
          setOrders(response.data as OrdersState);
          setIsFiltered(true);
          setSelectedClient(filters.clientCode);
          setPageCount((response.data as OrdersState).pagination.pageCount);
        } else {
          toast.error(response.data as string);
        }
      } catch (error) {
        console.error(error);
        toast.error('An error occurred while retrieving orders data');
      } finally {
        setLoading(false);
        console.log('Filters::: ', filters);
      }
      return;
    },
    [filters],
  );

  const fetchOrders = useCallback(async () => {
    // if (!isFiltered) {
    //   await getAllOrders(page, itemPerPage);
    // } else {
    await getAllOrdersFiltered(page, itemPerPage);
    // }
  }, [getAllOrdersFiltered, page, itemPerPage]);

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
      <div className="flex flex-col sm:items-center sm:flex-row justify-between mb-4 gap-2">
        <p className="text-lg text-center bg-gray-100 w-full sm:w-fit border-2 px-3.5 py-2 rounded-md">
          Client selected:
          <span className="px-1.5 font-semibold">{selectedClient}</span>
        </p>
        {/* Details button - below client selected on mobile, in the controls group on desktop */}
        {orders?.items?.length !== 0 && (
          <div className="sm:hidden w-full mb-2">
            <Details
              clientCode={selectedClient}
              className="w-full"
              filters={filters}
            />
          </div>
        )}

        <div className="items-center flex gap-2">
          <Pagination
            pageCount={pageCount}
            page={page}
            setPage={setPage}
            isLoading={loading}
          />

          <select
            value={itemPerPage}
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
            clientsData={props.clientsData}
            className="w-full justify-between sm:w-auto"
          />
          {orders?.items?.length !== 0 && (
            <Details
              clientCode={selectedClient}
              className="hidden sm:inline-flex"
              filters={filters}
            />
          )}
        </div>
      </div>

      {loading ? <p className="text-center">Loading...</p> : <></>}

      <div className="table-responsive text-nowrap text-base">
        {!loading &&
          (orders?.items?.length !== 0 ? (
            <table className="table border table-bordered table-striped">
              <thead className="table-dark">
                <tr>
                  <th>S/N</th>
                  <th>Folder</th>
                  <th>NOF</th>
                  <th>Rate</th>
                  <th>Download</th>
                  <th>Delivery</th>
                  <th>Task(s)</th>
                  <th>E.T.</th>
                  <th>Production</th>
                  <th>QC1</th>
                  <th>QC2</th>
                  <th>Status</th>
                  <th>Comment</th>
                  {/* <th>Action</th> */}
                </tr>
              </thead>
              <tbody>
                {orders?.items?.map((order, index) => (
                  <tr key={String(order._id)}>
                    <td>{index + 1 + itemPerPage * (page - 1)}</td>
                    <td className="text-wrap">{order.folder}</td>
                    <td className="text-wrap">{order.quantity}</td>
                    <td className="text-wrap">{order.rate}</td>
                    <td className="text-wrap">
                      {formatDate(order.download_date)}
                    </td>
                    <td className="text-wrap">
                      {formatDate(order.delivery_date)}
                      {' | '}
                      {formatTime(order.delivery_bd_time)}
                    </td>
                    <td
                      className="uppercase text-wrap"
                      style={{ verticalAlign: 'middle' }}
                    >
                      {order.task?.split('+').map((task, index) => {
                        return <Badge key={index} value={task} />;
                      })}
                    </td>
                    <td className="text-wrap">{order.et}</td>
                    <td className="text-wrap">{order.production}</td>
                    <td className="text-wrap">{order.qc1}</td>
                    <td className="text-wrap">{order.qc2}</td>
                    <td
                      className="uppercase text-wrap"
                      style={{ verticalAlign: 'middle' }}
                    >
                      {order.status?.trim().toLocaleLowerCase() ==
                      'finished' ? (
                        <Badge
                          value={order.status}
                          className="bg-green-600 text-white border-green-600"
                        />
                      ) : order.status?.trim().toLocaleLowerCase() ==
                        'client hold' ? (
                        <Badge
                          value={order.status}
                          className="bg-gray-600 text-white border-gray-600"
                        />
                      ) : (
                        <Badge
                          value={order.status}
                          className="bg-amber-600 text-white border-amber-600"
                        />
                      )}
                    </td>
                    <ExtendableTd data={order.comment || ''} />
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <NoData text="No Orders Found!" type={Type.danger} />
          ))}
      </div>

      <style jsx>
        {`
          th,
          td {
            padding: 2.5px 10px;
          }
        `}
      </style>
    </>
  );
};

export default Table;
