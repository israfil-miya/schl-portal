import Badge from '@/components/Badge';
import ClickToCopy from '@/components/CopyText';
import ExtendableTd from '@/components/ExtendableTd';
import { fetchApi } from '@/lib/utils';
import { OrderDataType } from '@/models/Orders';
import { formatDate, formatTime } from '@/utility/date';
import 'flowbite';
import { initFlowbite } from 'flowbite';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import OrderRenderer from './OrderRenderer';

function RunningTasks() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<OrderDataType[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      initFlowbite();
    }
  }, []);

  async function getAllOrders() {
    try {
      setLoading(true);
      const url =
        process.env.NEXT_PUBLIC_BASE_URL +
        '/api/order?action=get-unfinished-orders';
      const options = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      };
      const response = await fetchApi(url, options);

      console.log(response.data);
      if (response.ok) {
        setOrders(response.data as OrderDataType[]);
      } else {
        toast.error(response.data as string);
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while retrieving orders');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getAllOrders();
  }, []);

  if (loading) {
    return <p className="text-center">Loading...</p>;
  }

  return (
    <>
      <div className="table-responsive text-md">
        {orders?.length !== 0 ? (
          <table className="table border table-bordered">
            <thead>
              <tr className="bg-gray-50 text-nowrap">
                <th>S/N</th>
                <th>Client Code</th>
                <th>Folder</th>
                <th>NOF</th>
                <th>Download</th>
                <th>Delivery</th>
                <th>Remaining</th>
                <th>Task</th>
                <th>E.T</th>
                <th>Production</th>
                <th>QC1</th>
                <th>Folder Location</th>
                <th>Priority</th>
                <th>Type</th>
                <th>Comments</th>
              </tr>
            </thead>
            <tbody className="text-base">
              {orders?.map((order, index) => (
                <OrderRenderer
                  order={order}
                  index={index}
                  key={String(order._id)}
                />
              ))}
            </tbody>
          </table>
        ) : (
          <table className="table border">
            <tbody>
              <tr key={0}>
                <td className="align-center text-center text-wrap">
                  No Running Tasks To Show.
                </td>
              </tr>
            </tbody>
          </table>
        )}
      </div>
      <style jsx>
        {`
          .table {
            font-size: 15px;
          }

          th,
          td {
            padding: 3px 6px;
          }
        `}
      </style>
    </>
  );
}

export default RunningTasks;
