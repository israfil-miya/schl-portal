'use client';

import '@/app/globals.css';
import moment from 'moment-timezone';
import React from 'react';
import { toast } from 'sonner';
import LoginForm from './Form';

const Login: React.FC = () => {
  toast.info('Welcome to Studio Click House Ltd.', { id: 'welcome' });
  return (
    <>
      <div className="main-wrapper min-h-[100vh] flex flex-col justify-center items-center align-middle">
        <div className="md:w-[60%] lg:w-[60ex] sm:w-[80vw] m-4">
          <div className="card-header text-center px-2 py-12 relative">
            <h1 className="font-bold text-3xl relative z-50 uppercase text-white">
              STUDIO CLICK HOUSE LTD.
            </h1>
          </div>

          <div className="my-2">
            <LoginForm />
          </div>
        </div>
        <p className="text-center text-white">
          &copy; {moment().format('YYYY')} Studio Click House Ltd. All rights
          reserved.
        </p>
      </div>

      <style jsx>
        {`
          .main-wrapper {
            background: linear-gradient(to bottom, #7ba541, #5b8032);
          }
          .card-header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.3);
          }
        `}
      </style>
    </>
  );
};
export default Login;
