import Header from '@/components/Header';
import moment from 'moment-timezone';
import React, { Suspense } from 'react';
import InputForm from './components/Form';

const MakeACallPage = () => {
  return (
    <>
      <Header />
      <div className="px-4 mt-8 mb-4 flex flex-col justify-center md:w-[70vw] mx-auto">
        <h1 className="text-2xl font-semibold text-left mb-4 underline underline-offset-4 uppercase">
          Add a new report
        </h1>
        <Suspense fallback={<p className="text-center">Loading...</p>}>
          <InputForm />
        </Suspense>
      </div>
    </>
  );
};

export default MakeACallPage;
