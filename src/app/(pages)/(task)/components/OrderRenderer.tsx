import Badge from '@/components/Badge';
import ClickToCopy from '@/components/CopyText';
import ExtendableTd from '@/components/ExtendableTd';
import { OrderDataType } from '@/models/Orders';
import { formatDate, formatTime } from '@/utility/date';
import moment from 'moment-timezone';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

interface OrderRendererProps {
  order: OrderDataType;
  index: number;
  key: string;
}

const OrderRenderer: React.FC<OrderRendererProps> = props => {
  const [timeRemaining, setTimeRemaining] = useState('');
  const [diff, setDiff] = useState(0);
  const [statusColor, setStatusColor] = useState('');

  const { data: session } = useSession();

  useEffect(() => {
    // console.log('>>> ' + diff + ' <<<');
    if (diff <= 0) {
      setStatusColor('bg-orange-600 text-white border-orange-600');
    } else if (diff <= 30 * 60 * 1000)
      setStatusColor('bg-yellow-300 text-black border-yellow-300');
    else setStatusColor('');
  }, [diff]);

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const targetDate = moment.tz(
        `${props.order.delivery_date} ${props.order.delivery_bd_time}`,
        'YYYY-MM-DD HH:mm',
        'Asia/Dhaka',
      );
      const now = moment().tz('Asia/Dhaka');

      const diffMs = targetDate.diff(now); // Difference in milliseconds
      setDiff(diffMs);

      if (diffMs <= 0) {
        setTimeRemaining('Over');
      } else {
        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        );
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

        setTimeRemaining(`${days}d : ${hours}h : ${minutes}m : ${seconds}s`);
      }
    };

    // Run the function initially and then every second
    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);

    // Cleanup on component unmount
    return () => clearInterval(interval);
  }, [props.order.delivery_date, props.order.delivery_bd_time]);

  // rendering the order data
  return (
    <>
      <tr key={props.key} className={statusColor}>
        <td className="text-center">{props.index + 1}</td>
        <td>
          {['super', 'admin', 'manager'].includes(session?.user.role || '') ? (
            <Link
              className="hover:underline cursor-pointer"
              href={
                '/browse/single-task?id=' +
                encodeURIComponent(String(props.order._id))
              }
            >
              {props.order.client_code}
            </Link>
          ) : (
            props.order.client_code
          )}
        </td>

        <td className="text-nowrap">{props.order.folder}</td>
        <td>{props.order.quantity}</td>
        <td className="text-nowrap">
          {props.order.download_date
            ? formatDate(props.order.download_date)
            : null}
        </td>
        <td className="text-nowrap">
          {props.order.delivery_date
            ? formatDate(props.order.delivery_date)
            : null}
          {' | '}
          {props.order.delivery_bd_time
            ? formatTime(props.order.delivery_bd_time)
            : null}
        </td>

        <td className="capitalize text-nowrap ">{timeRemaining}</td>

        <td className="capitalize text-wrap">
          {props.order.task?.split('+').map((task, index) => {
            // return <Badge key={index} value={task} />;
            return (
              `${task}` +
              (index !== props.order.task.split('+').length - 1 ? ' + ' : '')
            );
          })}
        </td>
        <td>{props.order.et}</td>
        <td>{props.order.production}</td>
        <td>{props.order.qc1}</td>
        <td>{props.order.qc2}</td>
        <td>
          <ClickToCopy text={props.order.folder_path} />
        </td>
        <td className="capitalize text-nowrap">
          {
            props.order.priority != '' && props.order.priority
            // <Badge
            //   value={props.order.priority}
            //   className={
            //     props.order.priority == 'High'
            //       ? 'bg-orange-600 text-white border-orange-600'
            //       : props.order.priority == 'Medium'
            //         ? 'bg-yellow-600 text-white border-yellow-600'
            //         : 'bg-green-600 text-white border-green-600'
            //   }
            // />
          }
        </td>
        <td className="capitalize text-wrap">
          {/* <Badge value={props.order.type} /> */}
          {props.order.type}
        </td>

        <ExtendableTd data={props.order.comment} />
      </tr>

      <style jsx>
        {`
          .table {
            font-size: 15px;
          }

          th,
          td {
            padding: 8px 6px;
            // border: 1px solid #9ca3af;
          }
        `}
      </style>
    </>
  );
};

export default OrderRenderer;
