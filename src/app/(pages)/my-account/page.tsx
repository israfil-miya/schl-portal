import { auth } from '@/auth';
import { delay, fetchApi, generateAvatar, verifyCookie } from '@/lib/utils';
import { EmployeeDataType } from '@/models/Employees';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import React from 'react';
import Profile from './components/Profile';

const getEmployeeInfo = async () => {
  const session = await auth();
  try {
    let url: string =
      process.env.NEXT_PUBLIC_BASE_URL +
      '/api/employee?action=get-employee-by-name';
    let options: {} = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ real_name: session?.user.real_name }),
      cache: 'no-store',
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

async function MyAccountPage() {
  console.log('My Account Page');
  const session = await auth();
  const avatarURI = await generateAvatar(session?.user.real_name || '');
  const employeeInfo = await getEmployeeInfo();

  if (employeeInfo === null) {
    console.error('Employee info is null');
    redirect('/');
  }

  const cookieStore = cookies();
  const token = cookieStore.get('verify-token.tmp')?.value;
  const verified = verifyCookie(token, session?.user.db_id || '');

  if (!verified) {
    redirect('/protected?redirect=' + '/my-account');
  }

  return (
    <div className="max-w-5xl mx-auto p-10 space-y-6">
      <Profile avatarURI={avatarURI} employeeInfo={employeeInfo} />
    </div>
  );
}

export default MyAccountPage;
