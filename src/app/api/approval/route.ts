import { dbConnect, getQuery } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';

dbConnect();

import { handleGetAllApprovals } from './handlers/getAllApprovals';
import { handleMultipleResponse } from './handlers/multipleResponse';
import { handleNewRequest } from './handlers/newRequest';
import { handleSingleResponse } from './handlers/singleResponse';

export async function POST(req: NextRequest) {
  let res: { data: any; status: number };

  switch (getQuery(req).action) {
    case 'new-request':
      res = await handleNewRequest(req);
      return NextResponse.json(res.data, {
        status: res.status,
      });
    case 'single-response':
      res = await handleSingleResponse(req);
      return NextResponse.json(res.data, { status: res.status });
    case 'multiple-response':
      res = await handleMultipleResponse(req);
      return NextResponse.json(res.data, { status: res.status });
    case 'get-all-approvals':
      res = await handleGetAllApprovals(req);
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
