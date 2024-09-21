import { auth } from '@/auth';
import Header from '@/components/Header';
import { SessionProvider } from 'next-auth/react';
import Link from 'next/link';
import React from 'react';
import Cards from './components/card/Cards';
import Graphs from './components/graph/Graphs';
import DailyStatusTable from './components/table/DailyStatusTable';

const Statistics = async () => {
  const session = await auth();
  return (
    <>
      <DailyStatusTable />
      <Cards />
      <Graphs />
    </>
  );
};

export default Statistics;
