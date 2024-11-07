'use client';

import 'moment-timezone';
import React, { useEffect, useState } from 'react';
import Moment from 'react-moment';

interface PropsType {
  timezones: string[];
  className?: string;
}

const Timecards: React.FC<PropsType> = ({ timezones, className }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <div>
      <ul className={`flex flex-row gap-2 ${className}`}>
        {timezones.map((timezone, index) => (
          <li
            className="border-2 shadow-md w-32 rounded-tl-lg rounded-br-3xl text-center"
            key={index}
          >
            <p className="font-light text-white bg-primary py-0.5 rounded-tl-lg">
              {timezone
                .split('/')[1]
                .replace('_', ' ')
                .replace('Paris', 'CET')
                .replace('Riyadh', 'GULF')
                .replace('Canberra', 'Australia')}
            </p>
            <Moment
              className="bg-white font-medium"
              format="hh:mm A"
              interval={1000}
              tz={timezone}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Timecards;
