import User from '@/models/Users';
import { NextRequest, NextResponse } from 'next/server';

export const handleCreateUser = async (
  req: NextRequest,
): Promise<{
  data: string | Object;
  status: number;
}> => {
  try {
    const data = await req.json();
    const docCount = await User.countDocuments({ name: data.name });

    if (docCount > 0) {
      return { data: 'User with this name already exists', status: 400 };
    } else {
      const userData = await User.create(data);
      if (userData) {
        return { data: userData, status: 200 };
      } else {
        return { data: 'Unable to create account', status: 400 };
      }
    }
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
};
