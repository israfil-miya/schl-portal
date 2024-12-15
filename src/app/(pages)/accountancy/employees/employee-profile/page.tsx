import { auth } from '@/auth';
import { delay, fetchApi, generateAvatar, verifyCookie } from '@/lib/utils';
import { EmployeeDataType } from '@/models/Employees';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import React from 'react';
import Profile from './components/Profile';

const getEmployeeInfo = async (employee_name: string) => {
  try {
    let url: string =
      process.env.NEXT_PUBLIC_BASE_URL +
      '/api/employee?action=get-employee-by-name';
    let options: {} = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ real_name: employee_name }),
    };

    const response = await fetchApi(url, options);
    if (response.ok) {
      return response.data as EmployeeDataType;
    } else {
      console.error(response.data);
      return null;
    }
  } catch (e) {
    console.error(e);
    console.log('An error occurred while fetching employee data');
    return null;
  }
};

async function AccountPage({
  searchParams,
}: {
  searchParams: { name: string };
}) {
  const employee_name = decodeURIComponent(searchParams.name);
  const session = await auth();
  const avatarURI = await generateAvatar(employee_name || '');
  const employeeInfo = await getEmployeeInfo(employee_name);

  if (employeeInfo === null) {
    console.error('Employee info is null');
    redirect('/');
  }

  return (
    <div className="max-w-5xl mx-auto p-10 space-y-6">
      <Profile avatarURI={avatarURI} employeeInfo={employeeInfo} />
    </div>
  );
}

export default AccountPage;
