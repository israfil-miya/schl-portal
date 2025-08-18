import User from '@/models/Users';
import { NextRequest, NextResponse } from 'next/server';

export const handleEditUser = async (
  req: NextRequest,
): Promise<{
  data: string | Object;
  status: number;
}> => {
  try {
    const data = await req.json();
    const resData = await User.findByIdAndUpdate(data._id, data, {
      new: true,
    });

    if (resData) {
      return { data: 'Updated the user data successfully', status: 200 };
    } else {
      return { data: 'User not found', status: 400 };
    }
  } catch (e: any) {
    console.error(e);
    if (e.code === 11000)
      return { data: 'User with this name already exists', status: 400 };
    else return { data: 'An error occurred', status: 500 };
  }
};
