import Badge from '@/components/Badge';
import ClickToCopy from '@/components/CopyText';
import ExtendableTd from '@/components/ExtendableTd';
import { fetchApi } from '@/lib/utils';
import { OrderDataType } from '@/models/Orders';
import { formatDate, formatTime } from '@/utility/date';
import 'flowbite';
import { initFlowbite } from 'flowbite';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

function TestAndCorrection() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<OrderDataType[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      initFlowbite();
    }
  }, []);

  const { data: session } = useSession();

  async function getAllOrders() {
    try {
      setLoading(true);

      let url: string =
        process.env.NEXT_PUBLIC_BASE_URL + '/api/order?action=get-redo-orders';
      let options: {} = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      };

      let response = await fetchApi(url, options);

      if (response.ok) {
        setOrders(response.data as OrderDataType[]);
        console.log(response.data);
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
          <table className="table table-hover border table-bordered">
            <thead>
              <tr className="bg-gray-50 text-nowrap">
                <th>S/N</th>
                <th>Client Code</th>
                <th>Folder</th>
                <th>NOF</th>
                <th>Download</th>
                <th>Delivery</th>
                <th>Task</th>
                <th>E.T</th>
                <th>Production</th>
                <th>QC1</th>
                <th>Folder Location</th>
                <th>Priority</th>
                <th>Type</th>
                <th>Status</th>
                <th>Comments</th>
              </tr>
            </thead>
            <tbody className="text-base">
              {orders?.map((order, index) => {
                return (
                  <tr key={String(order._id)}>
                    <td>{index + 1}</td>
                    <td>
                      {['super', 'admin', 'manager'].includes(
                        session?.user.role || '',
                      ) ? (
                        <Link
                          className="hover:underline cursor-pointer"
                          href={
                            '/browse/single-task?id=' +
                            encodeURIComponent(String(order._id))
                          }
                        >
                          {order.client_code}
                        </Link>
                      ) : (
                        order.client_code
                      )}
                    </td>

                    <td className="text-nowrap">{order.folder}</td>
                    <td>{order.quantity}</td>
                    <td className="text-nowrap">
                      {order.download_date
                        ? formatDate(order.download_date)
                        : null}
                    </td>
                    <td className="text-nowrap">
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
                    <td>{order.et}</td>
                    <td>{order.production}</td>
                    <td>{order.qc1}</td>
                    <td>
                      <ClickToCopy text={order.folder_path} />
                    </td>

                    <td
                      className="uppercase text-nowrap"
                      style={{ verticalAlign: 'middle' }}
                    >
                      {order.priority != '' && (
                        <Badge
                          value={order.priority}
                          className={
                            order.priority == 'High'
                              ? 'bg-orange-600 text-white border-orange-600'
                              : order.priority == 'Medium'
                                ? 'bg-yellow-600 text-white border-yellow-600'
                                : 'bg-green-600 text-white border-green-600'
                          }
                        />
                      )}
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
                      <Badge
                        value={order.status}
                        className="bg-amber-600 text-white border-amber-600"
                      />
                    </td>
                    <ExtendableTd data={order.comment} />
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <table className="table border">
            <tbody>
              <tr key={0}>
                <td className="align-center text-center text-wrap">
                  No Test or Correction To Show.
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
            padding: 8px 6px;
          }
        `}
      </style>
    </>
  );
}

export default TestAndCorrection;
