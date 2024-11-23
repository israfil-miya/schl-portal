import Header from '@/components/Header';
import { fetchApi } from '@/lib/utils';
import { EmployeeDataType } from '@/models/Employees';
import React from 'react';
import Table from './components/Table';

type EmployeesResponseState = {
  pagination: {
    count: number;
    pageCount: number;
  };
  items: EmployeeDataType[];
};

export const getAllEmployees = async () => {
  try {
    let url: string =
      process.env.NEXT_PUBLIC_BASE_URL +
      '/api/employee?action=get-all-employees';
    let options: {} = {
      method: 'POST',
      headers: {
        paginated: false,
        filtered: false,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    };

    const response = await fetchApi(url, options);
    if (response.ok) {
      let data: EmployeesResponseState =
        response.data as EmployeesResponseState;
      return data.items;
    } else {
      console.error('Unable to fetch employees');
    }
  } catch (e) {
    console.error(e);
    console.log('An error occurred while fetching employees');
  }
};

const BrowsePage = async () => {
  let employees = await getAllEmployees();

  return (
    <>
      <div className="px-4 mt-8 mb-4">
        <Table employeesData={employees || []} />
      </div>
    </>
  );
};

export default BrowsePage;
