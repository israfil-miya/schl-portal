import { Badge } from '@/components/ui/badge';
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
      const diff = targetDate.diff(now); // Difference in milliseconds
      setDiff(diff);

      if (diff <= 0) {
        setTimeRemaining('Over');
      } else {
        const duration = moment.duration(diff); // Get the duration object
        const days = duration.days(); // Extract days
        const hours = duration.hours(); // Extract hours
        const minutes = duration.minutes(); // Extract minutes
        const seconds = duration.seconds(); // Extract seconds

        setTimeRemaining(`${days}d : ${hours}h : ${minutes}m : ${seconds}s`);
      }
    };

    calculateTimeRemaining(); // Calculate initially
    const interval = setInterval(calculateTimeRemaining, 1000); // Update every second

    return () => clearInterval(interval); // Clear interval on unmount
  }, [props.data.delivery_date, props.data.delivery_bd_time]);

  if (diff <= 0) {
    return (
      <Badge className="bg-gray-800 text-white hover:bg-gray-800">
        {timeRemaining}
      </Badge>
    );
  } else if (diff <= 30 * 60 * 1000) {
    return (
      <Badge className="bg-red-800 text-white hover:bg-red-800">
        {timeRemaining}
      </Badge>
    );
  } else if (diff <= 60 * 60 * 1000) {
    return (
      <Badge className="bg-orange-800 text-white hover:bg-orange-800">
        {timeRemaining}
      </Badge>
    );
  } else
    return (
      <Badge className="bg-green-800 text-white hover:bg-green-800">
        {timeRemaining}
      </Badge>
    );
};

export default TimeRemainingRenderer;
