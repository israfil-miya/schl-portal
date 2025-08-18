import Client, { ClientDataType } from '@/models/Clients';
import { NextRequest } from 'next/server';

export async function handleCreateClient(req: NextRequest): Promise<{
  data: string | Record<string, number>;
  status: number;
}> {
  try {
    const data: ClientDataType = await req.json();
    const docCount = await Client.countDocuments({
      client_code: data.client_code.trim(),
    });

    if (docCount > 0) {
      return { data: 'Client with the same code already exists', status: 400 };
    }

    const resData = await Client.create(data);

    if (resData) {
      return { data: 'Added the client successfully', status: 200 };
    } else {
      return { data: 'Unable to add new client', status: 400 };
    }
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
}
