'use client';

import 'flowbite';
import { initFlowbite } from 'flowbite';
import { ArrowDown } from 'lucide-react';
import React, { useEffect } from 'react';
import TestAndCorrectionTable from './TestAndCorrection';

const Table = () => {
  useEffect(() => {
    initFlowbite();
  }, []);

  return (
    <>
      <TestAndCorrectionTable />
    </>
  );
};

export default Table;
