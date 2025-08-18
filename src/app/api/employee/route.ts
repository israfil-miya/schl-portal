import { dbConnect, getQuery } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';
import { handleCreateEmployee } from './handlers/createEmployee';
import { handleEditEmployee } from './handlers/editEmployee';
import { handleGetAllEmployees } from './handlers/getAllEmployees';
import { handleGetAllMarketers } from './handlers/getAllMarketers';
import { handleGetEmployeeByName } from './handlers/getEmployeeByName';

dbConnect();

export interface RegexQuery {
  $regex: string;
  $options: string;
}

export interface Query {
  joining_date?: { $gte?: string; $lte?: string; $lt?: string; $gt?: string };
  blood_group?: string;
  $or?: { [key: string]: RegexQuery }[];
}

// export type BooleanFields = Extract<
//   keyof Query,
//   | 'is_test'
//   | 'is_prospected'
//   | 'is_lead'
//   | 'followup_done'
//   | 'regular_client'
//   | 'permanent_client'
// >;
// export type RegexFields = Extract<
//   keyof Query,
//   'country' | 'company_name' | 'category' | 'marketer_name' | 'prospect_status'
// >;

export async function POST(req: NextRequest) {
  let res: { data: string | Object | number; status: number };

  switch (getQuery(req).action) {
    case 'get-all-employees':
      res = await handleGetAllEmployees(req);
      return NextResponse.json(res.data, { status: res.status });
    case 'create-employee':
      res = await handleCreateEmployee(req);
      return NextResponse.json(res.data, { status: res.status });
    case 'edit-employee':
      res = await handleEditEmployee(req);
      return NextResponse.json(res.data, { status: res.status });
    case 'get-employee-by-name':
      res = await handleGetEmployeeByName(req);
      return NextResponse.json(res.data, { status: res.status });
    default:
      return NextResponse.json({ response: 'OK' }, { status: 200 });
  }
}

export async function GET(req: NextRequest) {
  let res: { data: string | Object | number; status: number };

  switch (getQuery(req).action) {
    case 'get-all-marketers':
      res = await handleGetAllMarketers(req);
      return NextResponse.json(res.data, { status: res.status });
    default:
      return NextResponse.json({ response: 'OK' }, { status: 200 });
  }
}
