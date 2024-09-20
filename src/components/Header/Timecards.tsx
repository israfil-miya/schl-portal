'use client';

import 'moment-timezone';
import React from 'react';
import Moment from 'react-moment';

interface propsType {
  timezones: string[];
  className?: string | undefined;
}

const Timecards: React.FC<propsType> = props => {
  return (
    <>
      <div suppressHydrationWarning>
        <ul className={`flex flex-row gap-2 ${props?.className}`}>
          {props.timezones.map((timezone: string, index: number) => (
            <li
              className="border-2 shadow-md w-32 rounded-tl-lg rounded-br-3xl text-center"
              key={index}
            >
              <p className="font-light text-lg text-white bg-primary py-0.5 rounded-tl-lg">
                {timezone
                  .split('/')[1]
                  .replace('_', ' ')
                  .replace('Paris', 'CET')
                  .replace('Riyadh', 'GULF')
                  .replace('Canberra', 'Australia')}
              </p>
              <Moment
                className="bg-white text-lg font-medium"
                format="hh:mm A"
                interval={1000}
                tz={timezone}
              />
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default Timecards;
