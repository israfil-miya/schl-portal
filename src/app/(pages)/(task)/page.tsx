import Header from '@/components/Header';
import React from 'react';
import Table from './components/Table';

const TasksPage = async () => {
  return (
    <>
      <div className="px-4 mt-8 mb-4">
        <Table />
      </div>
    </>
  );
};

export default TasksPage;
