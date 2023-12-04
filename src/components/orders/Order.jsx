"use client"

import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge"



const OrderTimeRemaining = ({ initialOrders, orderIndex }) => {
  const [orders, setOrders] = useState(initialOrders);
  const [countdowns, setCountdowns] = useState(getCurrentTimes(initialOrders));

  function getCurrentTimes(orders) {
    const timesNow = orders?.map((order) =>
      order.timeDifference <= 0 ? 'Over' : calculateCountdown(order.timeDifference)
    );
    return timesNow;
  }

  function calculateCountdown(timeDifferenceMs) {
    const totalSeconds = Math.floor(timeDifferenceMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  const getAllOrdersTime = async () => {
    try {
      const response = await fetch(
        process.env.NEXT_PUBLIC_BASE_URL + '/api/order/gettimeremainingfororders',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      return response.json();
    } catch (error) {
      throw new Error(`Error fetching orders time: ${error.message}`);
    }
  };

  useEffect(() => {
    if (orders?.length) {
      const countdownIntervalId = setInterval(() => {
        getAllOrdersTime()
          .then((updatedOrders) => {
            setOrders(updatedOrders);
            const updatedCountdowns = getCurrentTimes(updatedOrders);
            setCountdowns(updatedCountdowns);
          })
          .catch((e) => {
            console.error(e);
          });
      }, process.env.NEXT_PUBLIC_UPDATE_DELAY);

      return () => {
        clearInterval(countdownIntervalId); // Clear countdown interval
      };
    }
  }, [orders]);

  let priorityColor = '';
  const countdownTime = countdowns[orderIndex];
  const [hours, minutes, seconds] = countdownTime.split(':');
  const totalSeconds =
    parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds);

  if (totalSeconds > 0) {
    if (totalSeconds <= 1800) {
      priorityColor = 'bg-red text-white';
    } else if (totalSeconds <= 3600) {
      priorityColor = 'bg-yellow text-white';
    }
  }
  if (countdownTime === 'Over') priorityColor = 'bg-foreground text-white';

  return (
    <TableCell className="break-normal">
      <Badge variant={"outline"} className={priorityColor}> {countdowns[orderIndex]}</Badge>
    </TableCell>
  );
};

export default OrderTimeRemaining;