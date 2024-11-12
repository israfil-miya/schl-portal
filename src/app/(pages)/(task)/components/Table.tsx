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
          <span className="text-2xl font-semibold underline flex justify-center mb-4">
            Test & Correction
          </span>
          <TestAndCorrectionTable />
        </div>
        <div>
          <span className="text-2xl font-semibold underline flex justify-center mb-4">
            Running Tasks
          </span>
          <RunningTasksTable />
        </div>
      </div>
    </>
  );
};

export default Table;
