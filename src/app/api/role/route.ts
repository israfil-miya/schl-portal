import { dbConnect, getQuery } from '@/lib/utils';
import Role from '@/models/Roles';
import { NextRequest, NextResponse } from 'next/server';
dbConnect();

import { handleCreateRole } from './handlers/createRole';
import { handleDeleteRole } from './handlers/deleteRole';
import { handleEditRole } from './handlers/editRole';
import { handleGetAllRoles } from './handlers/getAllRoles';
import { handleGetRoleById } from './handlers/getRoleById';

export async function GET(req: NextRequest) {
  let res: { data: string | Object; status: number };
  switch (getQuery(req).action) {
    default:
      return NextResponse.json({ response: 'OK' }, { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  let res: {
    data: any;
    status: number;
  };
  switch (getQuery(req).action) {
    case 'get-all-roles':
      res = await handleGetAllRoles(req);
      return NextResponse.json(res.data, { status: res.status });
    case 'create-role':
      res = await handleCreateRole(req);
      return NextResponse.json(res.data, { status: res.status });
    case 'edit-role':
      res = await handleEditRole(req);
      return NextResponse.json(res.data, { status: res.status });
    case 'delete-role':
      res = await handleDeleteRole(req);
      return NextResponse.json(res.data, { status: res.status });
    case 'get-role-by-id':
      res = await handleGetRoleById(req);
      return NextResponse.json(res.data, { status: res.status });
    default:
      return NextResponse.json({ response: 'OK' }, { status: 200 });
  }
}
