import React from 'react';
import { FiltersContextProvider } from './FiltersContext';

function FileFlowPage() {
  return (
    <FiltersContextProvider>
      <div className="uppercase text-center h-[100vh] flex justify-center items-center text-xl">
        <p className="p-10 border-2 border-dashed border-orange-600 font-mono">
          !!! This page is under construction !!!
        </p>
      </div>
    </FiltersContextProvider>
  );
}

export default FileFlowPage;
