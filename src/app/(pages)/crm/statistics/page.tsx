import { auth } from '@/auth';
import Header from '@/components/Header';
import Link from 'next/link';
import React from 'react';
import Cards from './components/card/Cards';
import Graphs from './components/graph/Graphs';
import DailyStatusTable from './components/table/DailyStatusTable';
import MarketersTable from './components/table/MarketersTable';

const Statistics = async () => {
  const session = await auth();
  return (
    <>
      <div className="container mx-auto space-y-6 my-8">
        <MarketersTable />
        <DailyStatusTable />
        <Cards />
        <Graphs />
      </div>
    </>
  );
};

export default Statistics;
