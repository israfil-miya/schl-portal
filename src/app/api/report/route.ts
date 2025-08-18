import { dbConnect, getQuery } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';

dbConnect();

import { handleConvertToPermanent } from './handlers/convertToPermanent';
import { handleGetAllReports } from './handlers/getAllReports';
import { handleGetClientsOnboard } from './handlers/getClientsOnboard';
import { handleGetReportsCount } from './handlers/getReportsCount';
import { handleGetReportsStatus } from './handlers/getReportsStatus';
import { handleGetTestOrdersTrend } from './handlers/getTestOrdersTrend';
import { handleMarkDuplicateClient } from './handlers/markDuplicateClient';
import { handleRejectClient } from './handlers/rejectClient';

export async function POST(req: NextRequest) {
  let res: { data: string | Object | number; status: number };

  switch (getQuery(req).action) {
    case 'get-reports-status':
      res = await handleGetReportsStatus(req);
      return NextResponse.json(res.data, { status: res.status });
    case 'get-all-reports':
      res = await handleGetAllReports(req);
      return NextResponse.json(res.data, { status: res.status });
    case 'convert-to-permanent':
      res = await handleConvertToPermanent(req);
      return NextResponse.json(res.data, { status: res.status });
    case 'reject-regular-client-request':
      res = await handleRejectClient(req);
      return NextResponse.json(res.data, { status: res.status });
    case 'mark-duplicate-client':
      res = await handleMarkDuplicateClient(req);
      return NextResponse.json(res.data, { status: res.status });
    default:
      return NextResponse.json({ response: 'OK' }, { status: 200 });
  }
}

export async function GET(req: NextRequest) {
  let res: { data: string | Object | number; status: number };

  switch (getQuery(req).action) {
    case 'get-reports-count':
      res = await handleGetReportsCount(req);
      return NextResponse.json(res.data, { status: res.status });
    case 'get-clients-onboard':
      res = await handleGetClientsOnboard(req);
      return NextResponse.json(res.data, { status: res.status });
    case 'get-test-orders-trend':
      res = await handleGetTestOrdersTrend(req);
      return NextResponse.json(res.data, { status: res.status });
    default:
      return NextResponse.json({ response: 'OK' }, { status: 200 });
  }
}
