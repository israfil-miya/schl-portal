import Approval from '@/models/Approvals';
import { NextRequest } from 'next/server';

export async function handleNewRequest(
  req: NextRequest,
): Promise<{ data: string | object; status: number }> {
  try {
    const data = await req.json();
    const allowedModels = [
      'User',
      'Report',
      'Employee',
      'Order',
      'Client',
      'Schedule',
    ];
    if (!data.target_model || !allowedModels.includes(data.target_model)) {
      return { data: 'Invalid or missing target model', status: 400 };
    }
    const resData = await Approval.create(data);
    if (resData) return { data: resData, status: 200 };
    return { data: 'Unable to create new approval request', status: 400 };
  } catch (e) {
    console.error('Error creating approval request:', e);
    return { data: 'An error occurred', status: 500 };
  }
}
