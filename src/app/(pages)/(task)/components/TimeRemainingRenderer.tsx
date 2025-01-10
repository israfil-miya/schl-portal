import Badge from '@/components/Badge';
import moment from 'moment-timezone';
import React, { useEffect, useState } from 'react';

const TimeRemainingRenderer = (props: any) => {
  const [timeRemaining, setTimeRemaining] = useState('');
  const [diff, setDiff] = useState(0);

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const targetDate = moment.tz(
        `${props.data.delivery_date} ${props.data.delivery_bd_time}`,
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
  }, [props.data.delivery_date, props.data.delivery_bd_time]);

  // Badge color rendering logic based on remaining time
  if (diff <= 0) {
    return (
      <Badge className="bg-gray-600 text-white border-gray-600" value="Over" />
    );
  } else if (diff <= 30 * 60 * 1000) {
    return (
      <Badge
        className="bg-red-600 text-white border-red-600"
        value={timeRemaining}
      />
    );
  } else if (diff <= 60 * 60 * 1000) {
    return (
      <Badge
        className="bg-amber-600 text-white border-amber-600"
        value={timeRemaining}
      />
    );
  } else {
    return (
      <Badge
        className="bg-green-600 text-white border-green-600"
        value={timeRemaining}
      />
    );
  }
};

export default TimeRemainingRenderer;
