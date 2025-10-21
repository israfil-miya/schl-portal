import User from '@/models/Users';
import { NextRequest } from 'next/server';

export async function handleGetAllMarketers(
  req: NextRequest,
): Promise<{ data: string | Object; status: number }> {
  try {
    const marketersData = await User.aggregate([
      {
        $lookup: {
          from: 'roles',
          localField: 'role_id',
          foreignField: '_id',
          as: 'role',
        },
      },
      { $match: { 'role.permissions': 'login:crm' } },
      { $project: { role: 0 } }, // remove role field
    ]);

    console.log('marketersData', marketersData);
    if (marketersData.length) return { data: marketersData, status: 200 };
    return { data: 'Unable to retrieve marketers data', status: 400 };
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
}
