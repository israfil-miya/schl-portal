'use client';

import 'flowbite';
import { initFlowbite } from 'flowbite';
import { ArrowDown } from 'lucide-react';
import React, { useEffect } from 'react';
import RunningTasksTable from './RunningTasks';
import TestAndCorrectionTable from './TestAndCorrection';
import WaitingForQC from './WaitingForQC';

const Table = () => {
  useEffect(() => {
    initFlowbite();
  }, []);

  return (
    <>
      <div className="gap-8 flex flex-col">
        <div>
          <h3 className="text-lg uppercase tracking-wider font-semibold underline flex justify-start mb-2">
            Test & Correction
          </h3>
          <TestAndCorrectionTable />
        </div>
        <div>
          <h3 className="text-lg uppercase tracking-wider font-semibold underline flex justify-start mb-2">
            Waiting For QC
          </h3>
          <WaitingForQC />
        </div>
        <div>
          <h3 className="text-lg uppercase tracking-wider font-semibold underline flex justify-start mb-2">
            Running Tasks
          </h3>
          <RunningTasksTable />
        </div>
      </div>
    </>
  );
};

export default Table;
