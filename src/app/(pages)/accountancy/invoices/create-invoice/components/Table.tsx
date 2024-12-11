'use client';

import Badge from '@/components/Badge';
import ExtendableTd from '@/components/ExtendableTd';
import { fetchApi } from '@/lib/utils';
import { ClientDataType } from '@/models/Clients';

import { OrderDataType, validationSchema } from '@/app/(pages)/browse/schema';
import { formatDate, formatTime } from '@/utility/date';
import {
  ChevronLeft,
  ChevronRight,
  CirclePlus,
  ClipboardCopy,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
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

const Table: React.FC<{ clientsData: ClientDataType[] }> = props => {
  const [orders, setOrders] = useState<OrdersState>({
    pagination: {
      count: 0,
      pageCount: 0,
    },
    items: [],
  });

  const router = useRouter();

  const [isFiltered, setIsFiltered] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [pageCount, setPageCount] = useState<number>(0);
  const [itemPerPage, setItemPerPage] = useState<number>(10);
  const [loading, setLoading] = useState<boolean>(true);

  const prevPageCount = useRef<number>(0);
  const prevPage = useRef<number>(1);

  const { data: session } = useSession();

  const [filters, setFilters] = useState({
    folder: '',
    clientCode: props.clientsData?.[0].client_code || '',
    task: '',
    status: '',
    fromDate: '',
    toDate: '',
  });

  async function getAllOrdersFiltered() {
    try {
      // setLoading(true);

      let url: string =
        process.env.NEXT_PUBLIC_BASE_URL + '/api/order?action=get-all-orders';
      let options: {} = {
        method: 'POST',
        headers: {
          filtered: true,
          paginated: true,
          items_per_page: itemPerPage,
          page,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...filters,
        }),
      };

      let response = await fetchApi(url, options);

      if (response.ok) {
        setOrders(response.data as OrdersState);
        setIsFiltered(true);
      } else {
        toast.error(response.data as string);
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while retrieving orders data');
    } finally {
      setLoading(false);
    }
    return;
  }

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
      if (orders?.pagination?.pageCount == 1) return;
      if (isFiltered) getAllOrdersFiltered();
    }
    prevPage.current = page;
  }, [page]);

  useEffect(() => {
    if (orders?.pagination?.pageCount !== undefined) {
      setPage(1);
      if (prevPageCount.current !== 0) {
        if (!isFiltered) getAllOrdersFiltered();
      }
      if (orders) setPageCount(orders?.pagination?.pageCount);
      prevPageCount.current = orders?.pagination?.pageCount;
      prevPage.current = 1;
    }
  }, [orders?.pagination?.pageCount]);

  useEffect(() => {
    // Reset to first page when itemPerPage changes
    prevPageCount.current = 0;
    prevPage.current = 1;
    setPage(1);

    if (isFiltered) getAllOrdersFiltered();
  }, [itemPerPage]);

  return (
    <>
      <div className="flex flex-col sm:items-center sm:flex-row justify-between mb-4 gap-2">
        <p className="text-lg text-center bg-gray-100 w-full sm:w-fit border-2 px-3.5 py-2 rounded-md">
          Client selected:
          <span className="px-1.5 font-semibold">{filters.clientCode}</span>
        </p>
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
                Page <b>{orders?.items?.length !== 0 ? page : 0}</b> of{' '}
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
            onChange={e => setItemPerPage(parseInt(e.target.value))}
            // defaultValue={30}
            required
            className="appearance-none cursor-pointer px-4 py-2 bg-gray-50 text-gray-700 border border-gray-200 rounded-md leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={30}>30</option>
          </select>
          <FilterButton
            loading={loading}
            submitHandler={getAllOrdersFiltered}
            setFilters={setFilters}
            filters={filters}
            clientsData={props.clientsData}
            className="w-full justify-between sm:w-auto"
          />
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

                    {/* <td
                      className="text-center"
                      style={{ verticalAlign: 'middle' }}
                    >
                      <div className="inline-block">
                        <div className="flex gap-2">
                          <DeleteButton
                            orderData={order}
                            submitHandler={deleteUser}
                          />

                          <EditButton
                            orderData={order}
                            employeesData={props.employeesData}
                            submitHandler={editUser}
                            loading={loading}
                          />

                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(
                                `${order.name} ${order.password}`,
                              );
                              toast.info('Copied to clipboard', {
                                position: 'bottom-right',
                              });
                            }}
                            className="rounded-md bg-orange-600 hover:opacity-90 hover:ring-2 hover:ring-orange-600 transition duration-200 delay-300 hover:text-opacity-100 text-white p-2 items-center"
                          >
                            <ClipboardCopy size={18} />
                          </button>
                        </div>
                      </div>
                    </td> */}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="table border table-bordered table-striped">
              <tbody>
                <tr key={0}>
                  <td className="align-center text-center text-wrap">
                    No orders found!
                  </td>
                </tr>
              </tbody>
            </table>
          ))}
      </div>

      <Details clientCode={filters.clientCode} />

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
