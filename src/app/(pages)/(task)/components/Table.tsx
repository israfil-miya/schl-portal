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
      <div
        id="test-and-correction"
        data-accordion="collapse"
        data-active-classes="text-gray-800 font-semibold"
        data-inactive-classes="text-gray-700"
      >
        <h2 id="test-and-correction-heading-1">
          <button
            type="button"
            className="flex items-center justify-between w-full py-2 font-medium gap-3"
            data-accordion-target="#accordion-flush-body-1"
            aria-expanded="true"
            aria-controls="accordion-flush-body-1"
          >
            <span>Test & Correction Tasks</span>
            <svg
              data-accordion-icon
              className="w-3 h-3 rotate-180 shrink-0"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 10 6"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5 5 1 1 5"
              />
            </svg>
          </button>
        </h2>
        <div
          id="test-and-correction-body-1"
          className="hidden"
          aria-labelledby="test-and-correction-heading-1"
        >
          <TestAndCorrectionTable />
        </div>
      </div>

      <div
        id="running-tasks"
        data-accordion="collapse"
        data-active-classes="text-gray-800 font-semibold"
        data-inactive-classes="text-gray-700"
      >
        <h2 id="running-tasks-heading-2">
          <button
            type="button"
            className="flex items-center justify-between w-full py-2 font-medium gap-3"
            data-accordion-target="#accordion-flush-body-2"
            aria-expanded="true"
            aria-controls="accordion-flush-body-2"
          >
            <span>Running Tasks</span>
            <svg
              data-accordion-icon
              className="w-3 h-3 rotate-180 shrink-0"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 10 6"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5 5 1 1 5"
              />
            </svg>
          </button>
        </h2>
        <div
          id="running-tasks-body-2"
          className="hidden"
          aria-labelledby="running-tasks-heading-2"
        >
          <TestAndCorrectionTable />
        </div>
      </div>
    </>
  );
};

export default Table;
