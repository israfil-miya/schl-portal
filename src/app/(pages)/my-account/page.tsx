import { auth } from '@/auth';
import { fetchApi, generateAvatar, verifyCookie } from '@/lib/utils';
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
  const session = await auth();
  const avatarURI = await generateAvatar(session?.user.db_id || '');
  const employeeInfo = await getEmployeeInfo();

  if (employeeInfo === null) {
    console.error('Employee info is null');
    redirect('/');
  }

  const cookieStore = await cookies();
  const verified = await verifyCookie(cookieStore, session?.user.db_id || '');

  if (!verified) {
    redirect('/protected?redirect=' + '/my-account');
  }

  return (
    <div className="px-4 mt-8 mb-4 flex flex-col justify-center md:w-[70vw] mx-auto">
      <Profile avatarURI={avatarURI} employeeInfo={employeeInfo} />
    </div>
  );
}

export default MyAccountPage;
