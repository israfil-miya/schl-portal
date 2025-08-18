import User from '@/models/Users';
import { NextRequest } from 'next/server';

export async function handleGetUserById(
  req: NextRequest,
): Promise<{ data: string | Object; status: number }> {
  try {
    const { _id } = await req.json();
    const resData = await User.findById(_id).lean();
    if (resData) return { data: resData, status: 200 };
    return { data: 'User not found', status: 400 };
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
}
