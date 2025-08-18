import User from '@/models/Users';
import { NextRequest } from 'next/server';

export async function handleGetAllMarketers(
  req: NextRequest,
): Promise<{ data: string | Object; status: number }> {
  try {
    const marketersData = await User.find({ role: 'marketer' }).lean();
    if (marketersData.length) return { data: marketersData, status: 200 };
    return { data: 'Unable to retrieve marketers data', status: 400 };
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
}
