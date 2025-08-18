import { dbConnect, getQuery } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';

dbConnect();

import { handleDeleteInvoice } from './handlers/deleteInvoice';
import { handleGetAllInvoices } from './handlers/getAllInvoices';
import { handleStoreInvoice } from './handlers/storeInvoice';

export async function POST(req: NextRequest) {
  let res: { data: any; status: number };

  switch (getQuery(req).action) {
    case 'get-all-invoices':
      res = await handleGetAllInvoices(req);
      return NextResponse.json(res.data, { status: res.status });
    case 'delete-invoice':
      res = await handleDeleteInvoice(req);
      return NextResponse.json(res.data, { status: res.status });
    case 'store-invoice':
      res = await handleStoreInvoice(req);
      return NextResponse.json(res.data, { status: res.status });
    default:
      return NextResponse.json({ response: 'OK' }, { status: 200 });
  }
}

export async function GET(req: NextRequest) {
  let res: { data: any; status: number };

  switch (getQuery(req).action) {
    default:
      return NextResponse.json({ response: 'OK' }, { status: 200 });
  }
}
