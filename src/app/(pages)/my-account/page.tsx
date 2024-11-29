import { auth } from '@/auth';
import { fetchApi, generateAvatar, rethrowIfRedirectError } from '@/lib/utils';
import { EmployeeDataType } from '@/models/Employees';
import { Session } from 'inspector';
import Cookies from 'js-cookie';
import jwt from 'jsonwebtoken';
import { redirect } from 'next/navigation';
import React from 'react';
import { toast } from 'sonner';
// import Profile from './components/Profile';

interface DecodedToken {
  userId: string;
  exp: number; // Expiry time in milliseconds since epoch
}

const verifyTokenAndRedirect = (
  token: string,
  session: { user?: { db_id?: string } } | null,
) => {
  try {
    const decoded = jwt.verify(
      token,
      process.env.AUTH_SECRET as string,
    ) as DecodedToken;

    const userIdFromToken = decoded.userId;
    const sessionUserId = session?.user?.db_id || null;

    if (userIdFromToken !== sessionUserId || Date.now() >= decoded.exp) {
      redirect('/protected?redirect=/my-account');
    }
  } catch (error) {
    toast.error('Token verification failed!');
    rethrowIfRedirectError(error);
    console.error('Token verification failed:', error);
  }
};

function verifyUser(session: { user?: { db_id?: string } } | null) {
  try {
    console.log('verifyUser');

    let verify_token = Cookies.get('verify-token.tmp')?.trim();

    // Define a short wait time for cases like accessing "/my-account" directly
    const shortWaitTime = 100; // 100 milliseconds
    const maxWaitTime = 5000; // Maximum 5 seconds for longer checks
    const interval = 100; // Check every 100 milliseconds
    let elapsedTime = 0;

    const intervalId = setInterval(() => {
      verify_token = Cookies.get('verify-token.tmp')?.trim();

      if (verify_token) {
        clearInterval(intervalId); // Stop the interval
        verifyTokenAndRedirect(verify_token, session!); // Proceed with verifying the token
        return;
      }

      elapsedTime += interval;

      // If the token is not found within shortWaitTime and "/my-account" is accessed
      if (
        elapsedTime >= shortWaitTime &&
        window.location.pathname === '/my-account'
      ) {
        clearInterval(intervalId); // Stop the interval
        console.log('Short wait time elapsed: verify_token not found.');
        redirect('/protected?redirect=/my-account'); // Redirect immediately
      }

      // If the token is not found within maxWaitTime in general
      if (elapsedTime >= maxWaitTime) {
        clearInterval(intervalId); // Stop the interval
        console.log('Max wait time elapsed: verify_token not found.');
        redirect('/protected?redirect=/my-account'); // Redirect after timeout
      }
    }, interval);
  } catch (error) {
    console.error('Error in verifyUser:', error);
    rethrowIfRedirectError(error);
  }
}

const getEmployeeInfo = async () => {
  const session = await auth();
  try {
    let url: string =
      process.env.NEXT_PUBLIC_BASE_URL +
      '/api/employee?action=get-employee-by-id';
    let options: {} = {
      method: 'POST',
      headers: {
        paginated: false,
        filtered: false,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ _id: session?.user.db_id }),
    };

    const response = await fetchApi(url, options);
    if (response.ok) {
      return response.data as EmployeeDataType;
    } else {
      toast.error(response.data as string);
    }
  } catch (e) {
    console.error(e);
    console.log('An error occurred while fetching employee data');
  }
};

async function MyAccountPage() {
  const session = await auth();
  const avatarURI = generateAvatar(session?.user.email || '');
  const employeeInfo = await getEmployeeInfo();
  // verifyUser(session);

  return (
    <div className="px-4 mt-8 mb-4 flex flex-col justify-center md:w-[70vw] mx-auto">
      {/* <Profile avatarURI={avatarURI} /> */}
    </div>
  );
}

export default MyAccountPage;
