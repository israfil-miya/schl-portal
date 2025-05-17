import Header from '@/components/Header';
import { fetchApi } from '@/lib/utils';
import { EmployeeDataType } from '@/models/Employees';
import { RoleDataType } from '@/models/Roles';
import React from 'react';
import Table from './components/Table';

type EmployeesResponseState = {
  pagination: {
    count: number;
    pageCount: number;
  };
  items: EmployeeDataType[];
};

type RolesResponseState = {
  pagination: {
    count: number;
    pageCount: number;
  };
  items: RoleDataType[];
};

export const getAllEmployees = async () => {
  try {
    let url: string =
      process.env.NEXT_PUBLIC_BASE_URL +
      '/api/employee?action=get-all-employees';
    let options: {} = {
      method: 'POST',
      headers: {
        Accept: '*/*',
        paginated: false,
        filtered: false,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
      cache: 'no-store',
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

export const getAllRoles = async () => {
  try {
    let url: string =
      process.env.NEXT_PUBLIC_BASE_URL + '/api/role?action=get-all-roles';
    let options: {} = {
      method: 'POST',
      headers: {
        Accept: '*/*',
        paginated: false,
        filtered: false,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
      cache: 'no-store',
    };

    const response = await fetchApi(url, options);
    if (response.ok) {
      let data: RolesResponseState = response.data as RolesResponseState;
      return data.items;
    } else {
      console.error('Unable to fetch roles');
    }
  } catch (e) {
    console.error(e);
    console.log('An error occurred while fetching roles');
  }
};

const BrowsePage = async () => {
  let employees = await getAllEmployees();
  let roles = await getAllRoles();

  return (
    <>
      <div className="px-4 mt-8 mb-4 container">
        <Table employeesData={employees || []} rolesData={roles || []} />
      </div>
    </>
  );
};

export default BrowsePage;
