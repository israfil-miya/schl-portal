import Badge from '@/components/Badge';
import ClickToCopy from '@/components/copyText';
import ExtendableTd from '@/components/ExtendableTd';
import { fetchApi } from '@/lib/utils';
import { OrderDataType } from '@/models/Orders';
import { formatDate, formatTime } from '@/utility/date';
import 'flowbite';
import { initFlowbite } from 'flowbite';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import TimeRemainingRenderer from './TimeRemainingRenderer';

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
      <div className="table-responsive text-lg">
        <table className="table table-hover border table-bordered">
          <thead>
            <tr className="bg-gray-50">
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
              <th>Type</th>
              <th>Comments</th>
            </tr>
          </thead>
          <tbody className="text-base">
            {!loading ? (
              <>
                {orders?.map((order, index) => {
                  return (
                    <tr key={String(order._id)}>
                      <td>{index + 1}</td>
                      <td>{order.client_code}</td>

                      <td className="text-pretty">{order.folder}</td>
                      <td>{order.quantity}</td>
                      <td>
                        {order.download_date
                          ? formatDate(order.download_date)
                          : null}
                      </td>
                      <td>
                        {order.download_date
                          ? formatDate(order.download_date)
                          : null}
                        {' | '}
                        {order.delivery_bd_time
                          ? formatTime(order.delivery_bd_time)
                          : null}
                      </td>

                      <td
                        className="uppercase text-nowrap"
                        style={{ verticalAlign: 'middle' }}
                      >
                        <TimeRemainingRenderer data={order} />
                      </td>

                      <td
                        className="uppercase text-wrap"
                        style={{ verticalAlign: 'middle' }}
                      >
                        {order.task?.split('+').map((task, index) => {
                          return <Badge key={index} value={task} />;
                        })}
                      </td>
                      <td>{order.et}</td>
                      <td>{order.production}</td>
                      <td>{order.qc1}</td>
                      <td>
                        <ClickToCopy text={order.folder_path} />
                      </td>
                      <td
                        className="uppercase text-wrap"
                        style={{ verticalAlign: 'middle' }}
                      >
                        <Badge value={order.type} />
                      </td>
                      <ExtendableTd data={order.comment} />
                    </tr>
                  );
                })}
              </>
            ) : (
              <tr key={0}>
                <td colSpan={5} className="align-center text-center">
                  Loading...
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
}

export default RunningTasks;
