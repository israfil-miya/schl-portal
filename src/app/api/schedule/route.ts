import { dbConnect, getQuery } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';

dbConnect();

import { handleCreateSchedule } from './handlers/createSchedule';
import { handleDeleteSchedule } from './handlers/deleteSchedule';
import { handleEditSchedule } from './handlers/editSchedule';
import { handleGetAllSchedules } from './handlers/getAllSchedules';

export async function POST(req: NextRequest) {
  let res: { data: string | Object | number; status: number };

  switch (getQuery(req).action) {
    case 'get-all-schedules':
      res = await handleGetAllSchedules(req);
      return NextResponse.json(res.data, { status: res.status });
    case 'create-schedule':
      res = await handleCreateSchedule(req);
      return NextResponse.json(res.data, { status: res.status });
    case 'delete-schedule':
      res = await handleDeleteSchedule(req);
      return NextResponse.json(res.data, { status: res.status });
    case 'edit-schedule':
      res = await handleEditSchedule(req);
      return NextResponse.json(res.data, { status: res.status });
    default:
      return NextResponse.json({ response: 'OK' }, { status: 200 });
  }
}
