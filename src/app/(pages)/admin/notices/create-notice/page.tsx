import React, { Suspense } from 'react';
// import InputForm from './components/Form';

const CreateNoticePage = async () => {
  // return (
  //   <>
  //     <div className="px-4 mt-8 mb-4 flex flex-col justify-center md:w-[70vw] mx-auto">
  //       <h1 className="text-2xl font-semibold text-left mb-8 underline underline-offset-4 uppercase">
  //         Add a new notice
  //       </h1>
  //       <Suspense fallback={<p className="text-center">Loading...</p>}>
  //         <InputForm />
  //       </Suspense>
  //     </div>
  //   </>
  // );
  return (
    <div className="uppercase text-center h-[100vh] flex justify-center items-center text-xl">
      <p className="p-10 border-2 border-dashed border-orange-600 font-mono">
        !!! This page is under construction !!! WOW !!!
      </p>
    </div>
  );
};

export default CreateNoticePage;
