'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import React, { useEffect } from 'react';
import TestAndCorrectionTable from './TestAndCorrection';

const Table = () => {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="test-and-correction">
        <AccordionTrigger className="flex items-center justify-between w-full py-2 font-medium gap-3 text-gray-700 hover:text-gray-800">
          Test & Correction Tasks
        </AccordionTrigger>
        <AccordionContent>
          <TestAndCorrectionTable />
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="running-tasks">
        <AccordionTrigger className="flex items-center justify-between w-full py-2 font-medium gap-3 text-gray-700 hover:text-gray-800">
          Running Tasks
        </AccordionTrigger>
        <AccordionContent>
          <TestAndCorrectionTable />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default Table;
