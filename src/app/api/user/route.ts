import { dbConnect, getQuery } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';

dbConnect();

import { handleChangePassword } from './handlers/changePassword';
import { handleCreateUser } from './handlers/createUser';
import { handleDeleteUser } from './handlers/deleteUser';
import { handleEditUser } from './handlers/editUser';
import { handleGetAllMarketers } from './handlers/getAllMarketers';
import { handleGetAllUsers } from './handlers/getAllUsers';
import { handleGetUserById } from './handlers/getUserById';
import { handleLogin } from './handlers/handleLogin';
import { handleVerifyUser } from './handlers/verifyUser';

export async function GET(req: NextRequest) {
  let res: { data: string | Object; status: number };
  switch (getQuery(req).action) {
    case 'handle-login':
      res = await handleLogin(req);
      return NextResponse.json(res.data, { status: res.status });
    case 'get-all-marketers':
      res = await handleGetAllMarketers(req);
      return NextResponse.json(res.data, { status: res.status });
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
    case 'change-password':
      res = await handleChangePassword(req);
      return NextResponse.json(res.data, { status: res.status });
    case 'delete-user':
      res = await handleDeleteUser(req);
      return NextResponse.json(res.data, { status: res.status });
    case 'edit-user':
      res = await handleEditUser(req);
      return NextResponse.json(res.data, { status: res.status });
    case 'create-user':
      res = await handleCreateUser(req);
      return NextResponse.json(res.data, { status: res.status });
    case 'get-all-users':
      res = await handleGetAllUsers(req);
      return NextResponse.json(res.data, { status: res.status });
    case 'get-user-by-id':
      res = await handleGetUserById(req);
      return NextResponse.json(res.data, { status: res.status });
    case 'verify-user':
      res = await handleVerifyUser(req);
      if (
        res.status === 200 &&
        typeof res.data === 'object' &&
        'token' in res.data
      ) {
        return NextResponse.json(res.data, {
          status: res.status,
          headers: {
            'Set-Cookie': `verify-token.tmp=${res.data.token}; Path=/; HttpOnly; Max-Age=10`,
          },
        });
      }

      return NextResponse.json({ message: res.data }, { status: res.status });
    default:
      return NextResponse.json({ response: 'OK' }, { status: 200 });
  }
}
