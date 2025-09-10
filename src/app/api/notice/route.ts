import { dbConnect, getQuery } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';

dbConnect();

import { handleCreateNotice } from './handlers/createNotice';
import { handleDeleteNotice } from './handlers/deleteNotice';
import { handleEditNotice } from './handlers/editNotice';
import { handleGetAllNotices } from './handlers/getAllNotices';
import { handleGetNotice } from './handlers/getNotice';

export async function POST(req: NextRequest) {
  let res: { data: string | Object; status: number };
  switch (getQuery(req).action) {
    case 'get-all-notices':
      res = await handleGetAllNotices(req);
      return NextResponse.json(res.data, { status: res.status });
    case 'edit-notice':
      res = await handleEditNotice(req);
      return NextResponse.json(res.data, { status: res.status });
    case 'delete-notice':
      res = await handleDeleteNotice(req);
      return NextResponse.json(res.data, { status: res.status });
    case 'create-notice':
      res = await handleCreateNotice(req);
      return NextResponse.json(res.data, { status: res.status });
    default:
      return NextResponse.json({ response: 'OK' }, { status: 200 });
  }
}

export async function GET(req: NextRequest) {
  let res: { data: string | Object; status: number };
  switch (getQuery(req).action) {
    case 'get-notice':
      res = await handleGetNotice(req);
      return NextResponse.json(res.data, { status: res.status });
    default:
      return NextResponse.json({ response: 'OK' }, { status: 200 });
  }
}
