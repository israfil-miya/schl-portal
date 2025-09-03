'use client';

import { auth } from '@/auth';
import { hasPerm } from '@/lib/utils';
import 'flowbite';
import { initFlowbite } from 'flowbite';
import { ArrowDown } from 'lucide-react';
import { useSession } from 'next-auth/react';
import React, { useEffect, useMemo } from 'react';
import RunningTasksTable from './RunningTasks';
import TestAndCorrectionTable from './TestAndCorrection';
import WaitingForQC from './WaitingForQC';

const Table = () => {
  const { data: session } = useSession();

  const userPermissions = useMemo(
    () => session?.user.permissions || [],
    [session?.user.permissions],
  );

  useEffect(() => {
    initFlowbite();
  }, []);

  return (
    <>
      <div className="gap-8 flex flex-col">
        {hasPerm('task:test_and_correction_tasks', userPermissions) && (
          <div>
            <h3 className="text-lg uppercase tracking-wider font-semibold underline flex justify-start mb-2">
              Test & Correction
            </h3>
            <TestAndCorrectionTable />
          </div>
        )}
        {hasPerm('task:qc_waitlist', userPermissions) && (
          <div>
            <h3 className="text-lg uppercase tracking-wider font-semibold underline flex justify-start mb-2">
              Waiting For QC
            </h3>
            <WaitingForQC />
          </div>
        )}
        {hasPerm('task:running_tasks', userPermissions) && (
          <div>
            <h3 className="text-lg uppercase tracking-wider font-semibold underline flex justify-start mb-2">
              Running Tasks
            </h3>
            <RunningTasksTable />
          </div>
        )}
      </div>
    </>
  );
};

export default Table;
