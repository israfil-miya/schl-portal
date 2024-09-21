'use client';

import React from 'react';

import Card from './Card';

import { useRouter } from 'next/navigation';

const Cards = () => {
  const router = useRouter();

  return (
    <div className="sm:flex grid grid-cols-2 gap-4 mb-4 justify-between px-2">
      <Card
        title="Trial Clients"
        description="Clients that placed test orders but haven't converted to regular customers."
        onClick={() =>
          router.push(process.env.NEXT_PUBLIC_BASE_URL + '/trial-clients')
        }
        icon={
          <svg
            className="fill-primary"
            width={32}
            height={32}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 640 512"
          >
            <path d="M175 389.4c-9.8 16-15 34.3-15 53.1c-10 3.5-20.8 5.5-32 5.5c-53 0-96-43-96-96V64C14.3 64 0 49.7 0 32S14.3 0 32 0H96h64 64c17.7 0 32 14.3 32 32s-14.3 32-32 32V309.9l-49 79.6zM96 64v96h64V64H96zM352 0H480h32c17.7 0 32 14.3 32 32s-14.3 32-32 32V214.9L629.7 406.2c6.7 10.9 10.3 23.5 10.3 36.4c0 38.3-31.1 69.4-69.4 69.4H261.4c-38.3 0-69.4-31.1-69.4-69.4c0-12.8 3.6-25.4 10.3-36.4L320 214.9V64c-17.7 0-32-14.3-32-32s14.3-32 32-32h32zm32 64V224c0 5.9-1.6 11.7-4.7 16.8L330.5 320h171l-48.8-79.2c-3.1-5-4.7-10.8-4.7-16.8V64H384z" />
          </svg>
        }
      />
      <Card
        title="Pending Prospects"
        description="Prospects contacted over 2 months ago who haven't converted to regular customers and didn't give any test."
        onClick={() =>
          router.push(process.env.NEXT_PUBLIC_BASE_URL + '/stale-clients')
        }
        icon={
          <svg
            className="fill-primary"
            width={32}
            height={32}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
          >
            <path d="M464 256A208 208 0 1 0 48 256a208 208 0 1 0 416 0zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zm224-72V328c0 13.3-10.7 24-24 24s-24-10.7-24-24V184c0-13.3 10.7-24 24-24s24 10.7 24 24zm112 0V328c0 13.3-10.7 24-24 24s-24-10.7-24-24V184c0-13.3 10.7-24 24-24s24 10.7 24 24z" />
          </svg>
        }
      />
      {/* Here leads doesn't actually mean leads, it shows call reports with high conversion potential. in short, prospects */}
      <Card
        title="Potential Leads"
        description="Leads with high conversion potential."
        onClick={() =>
          router.push(process.env.NEXT_PUBLIC_BASE_URL + '/ideal-prospects')
        }
        icon={
          <svg
            className="fill-primary"
            width={32}
            height={32}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 384 512"
          >
            <path d="M297.2 248.9C311.6 228.3 320 203.2 320 176c0-70.7-57.3-128-128-128S64 105.3 64 176c0 27.2 8.4 52.3 22.8 72.9c3.7 5.3 8.1 11.3 12.8 17.7l0 0c12.9 17.7 28.3 38.9 39.8 59.8c10.4 19 15.7 38.8 18.3 57.5H109c-2.2-12-5.9-23.7-11.8-34.5c-9.9-18-22.2-34.9-34.5-51.8l0 0 0 0c-5.2-7.1-10.4-14.2-15.4-21.4C27.6 247.9 16 213.3 16 176C16 78.8 94.8 0 192 0s176 78.8 176 176c0 37.3-11.6 71.9-31.4 100.3c-5 7.2-10.2 14.3-15.4 21.4l0 0 0 0c-12.3 16.8-24.6 33.7-34.5 51.8c-5.9 10.8-9.6 22.5-11.8 34.5H226.4c2.6-18.7 7.9-38.6 18.3-57.5c11.5-20.9 26.9-42.1 39.8-59.8l0 0 0 0 0 0c4.7-6.4 9-12.4 12.7-17.7zM192 128c-26.5 0-48 21.5-48 48c0 8.8-7.2 16-16 16s-16-7.2-16-16c0-44.2 35.8-80 80-80c8.8 0 16 7.2 16 16s-7.2 16-16 16zm0 384c-44.2 0-80-35.8-80-80V416H272v16c0 44.2-35.8 80-80 80z" />
          </svg>
        }
      />
      <Card
        title="Regular Clients"
        description="Clients that consistently place orders."
        onClick={() =>
          router.push(process.env.NEXT_PUBLIC_BASE_URL + '/regular-clients')
        }
        icon={
          <svg
            className="fill-primary"
            width={32}
            height={32}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
          >
            <path d="M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-111 111-47-47c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l64 64c9.4 9.4 24.6 9.4 33.9 0L369 209z" />
          </svg>
        }
      />
    </div>
  );
};

export default Cards;
