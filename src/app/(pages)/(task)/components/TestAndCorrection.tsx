import Badge from '@/components/Badge';
import ClickToCopy from '@/components/copyText';
import ExtendableTd from '@/components/ExtendableTd';
import { OrderDataType } from '@/models/Orders';
import { formatDate, formatTime } from '@/utility/date';
import fetchData from '@/utility/fetch';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

function TestAndCorrection() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<OrderDataType[]>([]);

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

      let response = await fetchData(url, options);

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
      <div className="table-responsive text-lg px-2">
        <table className="table table-hover border table-bordered">
          <thead>
            <tr className="bg-gray-50">
              <th>S/N</th>
              <th>Client Code</th>
              <th>Folder</th>
              <th>NOF</th>
              <th>Download Date</th>
              <th>Delivery Time</th>
              <th>Task</th>
              <th>E.T</th>
              <th>Production</th>
              <th>QC1</th>
              <th>Comments</th>
              <th>Folder Location</th>
              <th>Type</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {!loading ? (
              <>
                {orders?.map((order, index) => {
                  return (
                    <tr key={String(order._id)}>
                      <td>{index + 1}</td>
                      <td>{order.client_code}</td>

                      <td>{order.folder}</td>
                      <td>{order.quantity}</td>
                      <td>
                        {order.download_date
                          ? formatDate(order.download_date)
                          : null}
                      </td>
                      <td>
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
                      <ExtendableTd data={order.comment} />
                      <td>
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
                        <Badge value={order.status} />
                      </td>
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

export default TestAndCorrection;
