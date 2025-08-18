import Client from '@/models/Clients';
import { headers } from 'next/headers';
import { NextRequest } from 'next/server';

export async function handleGetClientById(req: NextRequest): Promise<{
  data: string | Object;
  status: number;
}> {
  try {
    const headersList = await headers();
    let client_id = headersList.get('client_id');
    const client = await Client.findById(client_id).lean();
    if (client) {
      return { data: client, status: 200 };
    } else {
      return { data: 'No client found with the id', status: 400 };
    }
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
}
