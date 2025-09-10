import Client from '@/models/Clients';
import { headers } from 'next/headers';
import { NextRequest } from 'next/server';

export async function handleGetClientByCode(req: NextRequest): Promise<{
  data: string | Object;
  status: number;
}> {
  try {
    const headersList = await headers();
    let client_code = headersList.get('client_code');
    const client = await Client.findOne({ client_code }).lean();
    if (client) {
      return { data: client, status: 200 };
    } else {
      return { data: 'No client found with the code', status: 400 };
    }
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
}
