'use client';

import React from 'react';
import { FiltersContextProvider } from './FiltersContext';
import Graphs from './components/Graphs';

function FileFlowPage() {
  return (
    <FiltersContextProvider>
      <div className="px-4 mt-8 mb-4">
        <Graphs />
      </div>
    </FiltersContextProvider>
  );
}

export default FileFlowPage;
