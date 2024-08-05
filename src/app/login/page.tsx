import React from 'react';
import { auth } from '@/auth';

import Login from './components/Login';

import { redirect } from 'next/navigation';

const LoginPage = async () => {
  let session = await auth();

  if (session && session.user) {
    redirect('/');
  }

  return (
    <>
      <Login />
    </>
  );
};

export default LoginPage;