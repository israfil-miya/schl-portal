import Client from '@/models/Clients';
import { NextRequest } from 'next/server';

export async function handleDeleteClient(req: NextRequest): Promise<{
  data: string | Object;
  status: number;
}> {
  let { client_id }: { client_id: string } = await req.json();
  try {
    const resData = await Client.findByIdAndDelete(client_id);
    if (resData) {
      return { data: 'Deleted the client successfully', status: 200 };
    } else {
      return { data: 'Unable to delete the client', status: 400 };
    }
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
}
