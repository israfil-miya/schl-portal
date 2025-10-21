'use client';

import moment from 'moment-timezone';
import { useEffect } from 'react';
import { Toaster, toast } from 'sonner';
import LoginForm from './LoginForm';

const Login = () => {
  useEffect(() => {
    toast.info('Welcome to Studio Click House Ltd.', { id: 'welcome' });
  }, []);

  return (
    <>
      <Toaster richColors position="top-center" />
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#7ba541] to-[#5b8032] p-4">
        <div className="w-full max-w-xl">
          <div className="relative px-4 py-10 text-center text-white">
            <h1 className="relative z-10 text-3xl font-bold uppercase">
              STUDIO CLICK HOUSE LTD.
            </h1>
            <span className="absolute inset-0 bg-black/30" aria-hidden />
          </div>
          <div className="rounded-lg bg-white/95 p-6 shadow-lg">
            <LoginForm />
          </div>
        </div>
        <p className="mt-12 text-center text-sm text-white/90">
          &copy; {moment().format('YYYY')} Studio Click House Ltd. All rights
          reserved.
        </p>
      </div>
    </>
  );
};

export default Login;
