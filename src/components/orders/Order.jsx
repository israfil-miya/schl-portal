"use client"

import { useEffect, useState } from 'react';

const UseOrders = ({ initialOrders }) => {
  const [orders, setOrders] = useState(initialOrders);
  const [countdowns, setCountdowns] = useState(getCurrentTimes(initialOrders));


  function getCurrentTimes(orders) {
    console.log(orders);
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

  const getAllOrdersTime = () => {
    return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/api/order/gettimeremainingfororders', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((res) => res.json());
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
            // Handle the error
          });
      }, process.env.NEXT_PUBLIC_UPDATE_DELAY);

      return () => {
        clearInterval(countdownIntervalId); // Clear countdown interval
      };
    }
  }, [orders]);

  return { orders, countdowns };
};

export default UseOrders;