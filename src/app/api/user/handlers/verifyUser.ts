import { auth } from '@/auth';
import User, { PopulatedByEmployeeUserType } from '@/models/Users';
import jwt from 'jsonwebtoken';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export const handleVerifyUser = async (
  req: NextRequest,
): Promise<{
  data: string | { token: string; redirect_path: string };
  status: number;
}> => {
  const { username, password } = await req.json();
  const headersList = await headers();
  const redirect_path = headersList.get('redirect_path') || '/';
  const session = await auth();

  try {
    const userData = await User.findOne({
      username,
      password,
    })
      .populate('employee_id', 'real_name e_id company_provided_name _id')
      .lean<PopulatedByEmployeeUserType>()
      .exec();

    if (userData) {
      if (userData.employee_id.e_id === session?.user?.e_id) {
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
