'use client';

import ExtendableTd from '@/components/ExtendableTd';
import { cn, fetchApi } from '@/lib/utils';
import { UserDataType } from '@/models/Users';

import {
  EmployeeDataType,
  validationSchema,
} from '@/app/(pages)/admin/employees/schema';
import { OrderDetails } from '@/app/api/order/route';
import Badge from '@/components/Badge';
import HiddenText from '@/components/HiddenText';
import { formatDate, formatTime, getTodayDate } from '@/utility/date';
import { ChevronLeft, ChevronRight, CirclePlus, Undo2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'nextjs-toploader/app';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import FilterButton from './Filter';

const Table: React.FC<{ country: string; date: string }> = props => {
  const [orderDetails, setOrderDetails] = useState<OrderDetails>({
    details: [],
    totalFiles: 0,
  });

  const { data: session } = useSession();

  const router = useRouter();

  const [loading, setLoading] = useState<boolean>(true);

  const [filters, setFilters] = useState({
    fromDate: props.date ?? getTodayDate(),
    toDate: props.date ?? getTodayDate(),
    country: props.country ?? 'Others',
  });

  const getOrderDetails = async () => {
    try {
      // setLoading(true);

      console.log('filters --> ', filters);

      let url: string =
        process.env.NEXT_PUBLIC_BASE_URL +
        '/api/order?action=get-orders-by-country';
      let options: {} = {
        method: 'GET',
        headers: {
          Accept: '*/*',
          from_date: filters.fromDate,
          to_date: filters.toDate,
          country: filters.country,
          'Content-Type': 'application/json',
        },
      };

      let response = await fetchApi(url, options);

      if (response.ok) {
        setOrderDetails(response.data as OrderDetails);
      } else {
        toast.error(response.data as string);
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while retrieving orders data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getOrderDetails();
  }, []);

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between mb-4 gap-2">
        <button
          onClick={() => router.back()}
          className="flex justify-between items-center gap-2 rounded-md bg-primary hover:opacity-90 hover:ring-4 hover:ring-primary transition duration-200 delay-300 hover:text-opacity-100 text-white px-3 py-2"
        >
          Go Back
          <Undo2 size={18} />
        </button>
        <div className="items-center flex gap-2">
          {/* pagination controls removed for this page */}

          <FilterButton
            loading={loading}
            submitHandler={getOrderDetails}
            setFilters={setFilters}
            filters={filters}
            className="w-full justify-between sm:w-auto"
          />
        </div>
      </div>

      {loading ? <p className="text-center">Loading...</p> : <></>}

      <div className="table-responsive text-nowrap text-base">
        {!loading &&
          (orderDetails.details?.length !== 0 ? (
            <table className="table border table-bordered">
              <thead className="table-dark">
                <tr>
                  <th>S/N</th>
                  <th>Client Name</th>
                  <th>Folder</th>
                  <th>Country</th>
                  <th>Order Date</th>
                  <th>Delivery</th>
                  <th>Task(s)</th>
                  <th>NOF</th>
                </tr>
              </thead>
              <tbody>
                {orderDetails.details?.map((order, index) => (
                  <tr key={String(order._id)}>
                    <td>{index + 1}</td>
                    <td className="text-wrap">{order.client_name}</td>
                    <td className="text-wrap">{order.folder}</td>
                    <td className="text-wrap">{order.country}</td>
                    <td className="text-wrap">
                      {order.createdAt ? formatDate(order.createdAt) : null}
                    </td>
                    <td>
                      {order.delivery_date
                        ? formatDate(order.delivery_date)
                        : null}
                      {' | '}
                      {order.delivery_bd_time
                        ? formatTime(order.delivery_bd_time)
                        : null}
                    </td>
                    <td
                      className="uppercase text-wrap"
                      style={{ verticalAlign: 'middle' }}
                    >
                      {order.task?.split('+').map((task, index) => {
                        return <Badge key={index} value={task} />;
                      })}
                    </td>
                    <td className="text-wrap">
                      {order.quantity.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td className="font-bold uppercase text-nowrap">
                    {orderDetails.totalFiles.toLocaleString()}{' '}
                    <small>(total)</small>
                  </td>
                </tr>
              </tfoot>
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
