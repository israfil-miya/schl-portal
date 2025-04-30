import Header from '@/components/Header';
import { fetchApi } from '@/lib/utils';
import { UserDataType } from '@/models/Users';
import React from 'react';
import Table from './components/Table';

type UsersResponseState = {
  pagination: {
    count: number;
    pageCount: number;
  };
  items: UserDataType[];
};

export const getAllUsers = async () => {
  try {
    let url: string =
      process.env.NEXT_PUBLIC_BASE_URL + '/api/employee?action=get-all-users';
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
      let data: UsersResponseState = response.data as UsersResponseState;
      return data.items;
    } else {
      console.error('Unable to fetch users');
    }
  } catch (e) {
    console.error(e);
    console.log('An error occurred while fetching users');
  }
};

const BrowsePage = async () => {
  let users = await getAllUsers();

  return (
    <>
      <div className="px-4 mt-8 mb-4 container">
        <Table usersData={users || []} />
      </div>
    </>
  );
};

export default BrowsePage;
