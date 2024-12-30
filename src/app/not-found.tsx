'use client';

import '@/app/globals.css';
import { useRouter } from 'nextjs-toploader/app';
import React from 'react';

const NotFound = () => {
  const router = useRouter();

  return (
    <>
      <div className="flex flex-col justify-center min-h-[100vh] items-center align-middle">
        <div className="flex flex-col items-center leading-[4.5rem] mb-5">
          <p className="text-[5rem]">Uh...oh!</p>
          <p className="text-xl">Looks like you are lost.</p>
        </div>

        <div className="flex flex-row gap-3">
          <button
            className="bg-cyan-500 rounded-md hover:opacity-90 hover:ring-4 hover:ring-cyan-500 transition duration-200 delay-300 hover:text-opacity-100 text-white px-4 py-2"
            onClick={() => router.back()}
          >
            Go back
          </button>
          <button
            className="bg-primary text-white rounded-md hover:opacity-90 hover:ring-4 hover:ring-primary transition duration-200 delay-300 hover:text-opacity-100 text-primary-foreground px-4 py-2"
            onClick={() => router.replace('/')}
          >
            Go home
          </button>
        </div>
      </div>
    </>
  );
};

export default NotFound;
