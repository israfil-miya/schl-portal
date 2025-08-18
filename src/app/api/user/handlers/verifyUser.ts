import { auth } from '@/auth';
import User from '@/models/Users';
import jwt from 'jsonwebtoken';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export const handleVerifyUser = async (
  req: NextRequest,
): Promise<{
  data: string | { token: string; redirect_path: string };
  status: number;
}> => {
  const { name, password } = await req.json();
  const headersList = await headers();
  const redirect_path = headersList.get('redirect_path') || '/';
  const session = await auth();

  try {
    const userData = await User.findOne({
      name,
      password,
    });

    if (userData) {
      if (userData.name === session?.user?.cred_name) {
        const token = jwt.sign(
          { userId: userData._id, exp: Date.now() + 10 * 1000 },
          process.env.AUTH_SECRET as string,
        );

        return { data: { token, redirect_path }, status: 200 };
      }
    }
    return { data: 'Invalid username or password', status: 400 };
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
};
