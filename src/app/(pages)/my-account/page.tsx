import { auth } from '@/auth';
import { generateAvatar, rethrowIfRedirectError } from '@/lib/utils';
import { Session } from 'inspector';
import Cookies from 'js-cookie';
import jwt from 'jsonwebtoken';
import { redirect } from 'next/navigation';
import React from 'react';
import { toast } from 'sonner';
import Profile from './components/Profile';

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
  let verify_token = Cookies.get('verify-token.tmp')?.trim();

  // Wait for 5 seconds until verify_token has a value
  const waitTime = 5000; // 5 seconds in milliseconds
  const interval = 100; // Check every 100 milliseconds
  let elapsedTime = 0;

  const intervalId = setInterval(() => {
    verify_token = Cookies.get('verify-token.tmp')?.trim();
    if (verify_token || elapsedTime >= waitTime) {
      clearInterval(intervalId); // Stop the interval once verify_token has a value or timeout occurs
      if (!verify_token) {
        console.log('Timeout: verify_token not received within 5 seconds.');
        return; // Return or handle the timeout scenario
      }
      verifyTokenAndRedirect(verify_token, session!); // Proceed with verifying the token
    }
    elapsedTime += interval;
  }, interval);
}

async function MyAccountPage() {
  const session = await auth();
  const avatarURI = generateAvatar(session?.user.email || '');
  verifyUser(session);

  return (
    <div className="px-4 mt-8 mb-4 flex flex-col justify-center md:w-[70vw] mx-auto">
      <Profile avatarURI={avatarURI} />
    </div>
  );
}

export default MyAccountPage;
