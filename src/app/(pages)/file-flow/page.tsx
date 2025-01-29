'use client';

import React from 'react';
import { FiltersContextProvider } from './FiltersContext';
import Graphs from './components/Graphs';

function FileFlowPage() {
  return (
    <FiltersContextProvider>
      {/* <div className="uppercase text-center h-[100vh] flex justify-center items-center text-xl">
        <p className="p-10 border-2 border-dashed border-orange-600 font-mono">
          !!! This page is under construction !!!
        </p>
      </div> */}
      <div className="px-4 mt-8 mb-4">
        <Graphs />
      </div>
    </FiltersContextProvider>
  );
}

export default FileFlowPage;
