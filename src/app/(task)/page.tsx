import React from 'react';
import Header from '@/components/Header';
import Table from './components/Table';
import { SessionProvider } from 'next-auth/react';
import { auth } from '@/auth';

const TasksPage = async () => {
  const session = await auth();
  return (
    <>
      <Header />
      <div className="px-4 mt-8 mb-4">
        <SessionProvider session={session}>
          <Table />
        </SessionProvider>
      </div>
    </>
  );
};

export default TasksPage;
