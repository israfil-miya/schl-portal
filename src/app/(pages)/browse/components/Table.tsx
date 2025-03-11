'use client';

import Badge from '@/components/Badge';
import ClickToCopy from '@/components/CopyText';
import { cn, fetchApi } from '@/lib/utils';
import { ClientDataType } from '@/models/Clients';
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
import { useRouter } from 'nextjs-toploader/app';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { OrderDataType, validationSchema } from '../schema';
import DeleteButton from './Delete';
import EditButton from './Edit';
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
    fromDate: '',
    toDate: '',
    folder: '',
    clientCode: '',
    task: '',
    type: '',
    generalSearchString: '',
  });

  async function getAllOrders() {
    try {
      // setLoading(true);

      let url: string =
        process.env.NEXT_PUBLIC_BASE_URL + '/api/order?action=get-all-orders';
      let options: {} = {
        method: 'POST',
        headers: {
          filtered: false,
          paginated: true,
          items_per_page: itemPerPage,
          page: page,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          staleClient: true,
          regularClient: false,
          test: false,
        }),
      };

      let response = await fetchApi(url, options);

      if (response.ok) {
        setOrders(response.data as OrdersState);
      } else {
        toast.error(response.data as string);
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while retrieving orders data');
    } finally {
      setLoading(false);
    }
  }

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
          page: !isFiltered ? 1 : page,
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

  async function deleteOrder(orderId: string, reqBy: string) {
    try {
      let url: string =
        process.env.NEXT_PUBLIC_BASE_URL + '/api/approval?action=new-request';
      let options: {} = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          req_type: 'Task Delete',
          req_by: reqBy,
          id: orderId,
        }),
      };

      let response = await fetchApi(url, options);

      if (response.ok) {
        toast.success('Request sent for approval');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while sending request for approval');
    }
    return;
  }

  const finishOrder = async (orderData: OrderDataType) => {
    try {
      let url: string =
        process.env.NEXT_PUBLIC_BASE_URL + '/api/order?action=finish-order';
      let options: {} = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order_id: orderData._id,
        }),
      };

      if (
        orderData.production >= orderData.quantity &&
        orderData.qc1 >= orderData.quantity
      ) {
        const response = await fetchApi(url, options);

        if (response.ok) {
          toast.success('Changed the status to FINISHED');
          if (!isFiltered) await getAllOrders();
          else await getAllOrdersFiltered();
        } else {
          toast.error('Unable to change status');
        }
      } else {
        if (orderData.production < orderData.quantity) {
          toast.error('Production is not completed');
        } else if (orderData.qc1 < orderData.quantity) {
          toast.error('QC1 is not completed');
        } else {
          toast.error('Unable to change status');
        }
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while changing the status');
    }
    return;
  };

  const redoOrder = async (orderData: OrderDataType) => {
    try {
      let url: string =
        process.env.NEXT_PUBLIC_BASE_URL + '/api/order?action=redo-order';
      let options: {} = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order_id: orderData._id,
        }),
      };

      const response = await fetchApi(url, options);

      if (response.ok) {
        toast.success('Changed the status to CORRECTION');
        if (!isFiltered) await getAllOrders();
        else await getAllOrdersFiltered();
      } else {
        toast.error('Unable to change status');
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while changing the status');
    }
    return;
  };

  async function editOrder(editedOrderData: OrderDataType) {
    try {
      setLoading(true);
      const parsed = validationSchema.safeParse(editedOrderData);

      if (!parsed.success) {
        console.error(parsed.error.issues.map(issue => issue.message));
        toast.error('Invalid form data');
        return;
      }

      let url: string =
        process.env.NEXT_PUBLIC_BASE_URL + '/api/order?action=edit-order';
      let options: {} = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          updated_by: session?.user.real_name,
        },
        body: JSON.stringify(parsed.data),
      };

      const response = await fetchApi(url, options);

      if (response.ok) {
        toast.success('Updated the order data');

        if (!isFiltered) await getAllOrders();
        else await getAllOrdersFiltered();
      } else {
        toast.error(response.data as string);
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while updating the order');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getAllOrders();
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
      if (orders?.pagination?.pageCount == 1) return;
      if (!isFiltered) getAllOrders();
      else getAllOrdersFiltered();
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

    if (!isFiltered) getAllOrders();
    else getAllOrdersFiltered();
  }, [itemPerPage]);

  return (
    <>
      <div
        className={cn(
          'flex flex-col sm:flex-row justify-between mb-4 gap-2',
          userRole !== 'super' &&
            userRole !== 'admin' &&
            'justify-center sm:flex-row sm:justify-end',
        )}
      >
        {(userRole == 'super' || userRole == 'admin') && (
          <button
            onClick={() =>
              router.push(process.env.NEXT_PUBLIC_BASE_URL + '/admin/tasks')
            }
            className="flex justify-between items-center gap-2 rounded-md bg-primary hover:opacity-90 hover:ring-4 hover:ring-primary transition duration-200 delay-300 hover:text-opacity-100 text-white px-3 py-2"
          >
            Add new task
            <CirclePlus size={18} />
          </button>
        )}
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
            <option value={30}>30</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <FilterButton
            loading={loading}
            submitHandler={getAllOrdersFiltered}
            setFilters={setFilters}
            filters={filters}
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
                  <th>Client Code</th>
                  {(userRole == 'super' || userRole == 'admin') && (
                    <th>Client Name</th>
                  )}
                  <th>Folder</th>
                  <th>NOF</th>
                  <th>Download Date</th>
                  <th>Delivery Time</th>
                  <th>Task(s)</th>
                  <th>E.T.</th>
                  <th>Production</th>
                  <th>QC1</th>
                  <th>Folder Location</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders?.items?.map((order, index) => (
                  <tr key={String(order._id)}>
                    <td>{index + 1 + itemPerPage * (page - 1)}</td>
                    <td className="text-wrap">{order.client_code}</td>

                    {(userRole == 'admin' || userRole == 'super') && (
                      <td className="text-wrap">{order.client_name}</td>
                    )}

                    <td className="text-wrap">{order.folder}</td>
                    <td className="text-wrap">{order.quantity}</td>
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
                    <td className="text-wrap">
                      <ClickToCopy text={order.folder_path} />
                    </td>
                    <td
                      className="uppercase text-wrap"
                      style={{ verticalAlign: 'middle' }}
                    >
                      <Badge value={order.type} />
                    </td>
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
                    <td
                      className="text-center"
                      style={{ verticalAlign: 'middle' }}
                    >
                      <div className="inline-block">
                        <div className="flex gap-2">
                          {(userRole == 'super' || userRole == 'admin') && (
                            <>
                              <DeleteButton
                                orderData={order}
                                submitHandler={deleteOrder}
                              />
                              {order.status?.trim().toLocaleLowerCase() ==
                              'finished' ? (
                                <button
                                  onClick={() => redoOrder(order)}
                                  className="rounded-md bg-amber-600 hover:opacity-90 hover:ring-2 hover:ring-amber-600 transition duration-200 delay-300 hover:text-opacity-100 text-white p-2 items-center"
                                >
                                  <Redo2 size={18} />
                                </button>
                              ) : (
                                <button
                                  onClick={() => finishOrder(order)}
                                  className="rounded-md bg-green-600 hover:opacity-90 hover:ring-2 hover:ring-green-600 transition duration-200 delay-300 hover:text-opacity-100 text-white p-2 items-center"
                                >
                                  <BookCheck size={18} />
                                </button>
                              )}
                            </>
                          )}

                          <EditButton
                            orderData={order}
                            submitHandler={editOrder}
                            loading={loading}
                            clientsData={props.clientsData}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="table border table-bordered table-striped">
              <tbody>
                <tr key={0}>
                  <td className="align-center text-center text-wrap">
                    No Orders To Show.
                  </td>
                </tr>
              </tbody>
            </table>
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
