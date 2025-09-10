import Client from '@/models/Clients';
import { headers } from 'next/headers';
import { NextRequest } from 'next/server';

export async function handleEditClient(req: NextRequest): Promise<{
  data: string | Object;
  status: number;
}> {
  let data = await req.json();
  const headersList = await headers();
  const updated_by = headersList.get('updated_by');
  data = { ...data, updated_by };

  try {
    const resData = await Client.findByIdAndUpdate(data._id, data, {
      new: true,
    });

    if (resData) {
      return { data: 'Updated the client successfully', status: 200 };
    } else {
      return { data: 'Unable to update the client', status: 400 };
    }
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
}
