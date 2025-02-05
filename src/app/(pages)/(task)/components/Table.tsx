'use client';

import 'flowbite';
import { initFlowbite } from 'flowbite';
import { ArrowDown } from 'lucide-react';
import React, { useEffect } from 'react';
import RunningTasksTable from './RunningTasks';
import TestAndCorrectionTable from './TestAndCorrection';

const Table = () => {
  useEffect(() => {
    initFlowbite();
  }, []);

  return (
    <>
      <div className="gap-8 flex flex-col">
        <div>
          <h3 className="text-2xl tracking-wider font-semibold underline flex justify-center mb-4">
            Test & Correction
          </h3>
          <TestAndCorrectionTable />
        </div>
        <div>
          <h3 className="text-2xl tracking-wider font-semibold underline flex justify-center mb-4">
            Running Tasks
          </h3>
          <RunningTasksTable />
        </div>
      </div>
    </>
  );
};

export default Table;
