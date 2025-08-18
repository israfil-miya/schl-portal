import { dbConnect, getQuery } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';

dbConnect();

import { handleCreateClient } from './handlers/createClient';
import { handleDeleteClient } from './handlers/deleteClient';
import { handleEditClient } from './handlers/editClient';
import { handleGetAllClients } from './handlers/getAllClients';
import { handleGetClientByCode } from './handlers/getClientByCode';
import { handleGetClientById } from './handlers/getClientById';

export async function POST(req: NextRequest) {
  let res: { data: string | Object | number; status: number };

  switch (getQuery(req).action) {
    case 'create-client':
      res = await handleCreateClient(req);
      return NextResponse.json(res.data, { status: res.status });
    case 'get-all-clients':
      res = await handleGetAllClients(req);
      return NextResponse.json(res.data, { status: res.status });
    case 'edit-client':
      res = await handleEditClient(req);
      return NextResponse.json(res.data, { status: res.status });
    case 'delete-client':
      res = await handleDeleteClient(req);
      return NextResponse.json(res.data, { status: res.status });
    default:
      return NextResponse.json({ response: 'OK' }, { status: 200 });
  }
}

export async function GET(req: NextRequest) {
  let res: { data: string | Object | number; status: number };

  switch (getQuery(req).action) {
    case 'get-client-by-code':
      res = await handleGetClientByCode(req);
      return NextResponse.json(res.data, { status: res.status });
    case 'get-client-by-id':
      res = await handleGetClientById(req);
      return NextResponse.json(res.data, { status: res.status });
    default:
      return NextResponse.json({ response: 'OK' }, { status: 200 });
  }
}
