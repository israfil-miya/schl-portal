import User from '@/models/Users';
import { NextRequest, NextResponse } from 'next/server';

export const handleDeleteUser = async (
  req: NextRequest,
): Promise<{
  data: string | Object;
  status: number;
}> => {
  const { _id } = await req.json();

  try {
    const resData = await User.findByIdAndDelete(_id);
    if (resData) {
      return { data: 'User deleted successfully', status: 200 };
    } else {
      return { data: 'User not found', status: 400 };
    }
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
};
