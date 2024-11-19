import { dbConnect, getQuery } from '@/lib/utils';
import User from '@/models/Users';
import jwt from 'jsonwebtoken';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
dbConnect();

async function handleLogin(req: Request): Promise<{
  data: string | Object;
  status: number;
}> {
  const Headers = await headers();
  const username = Headers.get('username')?.trim();
  const password = Headers.get('password')?.trim();

  try {
    const userData = await User.findOne({ name: username, password: password });

    if (userData) {
      if (userData.role === 'marketer') {
        return {
          data: 'You are not authorized to login here, You may login at https://crm.studioclickhouse.com/',
          status: 400,
        };
      }
      return { data: userData, status: 200 };
    } else {
      return { data: 'Invalid username or password', status: 400 };
    }
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
}

async function handleNewUser(req: Request): Promise<{
  data: string | Object;
  status: number;
}> {
  const data = await req.json();

  try {
    const docCount = await User.countDocuments({ name: data.name });

    if (docCount > 0) {
      return { data: 'User with this name already exists', status: 400 };
    } else {
      const userData = await User.create(data);
      if (userData) {
        return { data: userData, status: 200 };
      } else {
        return { data: 'Unable to create account', status: 400 };
      }
    }
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
}

async function handleGetUserById(req: Request): Promise<{
  data: string | Object;
  status: number;
}> {
  try {
    const { _id } = await req.json();

    const resData = await User.findById(_id).lean();

    if (resData) {
      return { data: resData, status: 200 };
    } else {
      return { data: 'User not found', status: 400 };
    }
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
}

async function handleGetAllMarketers(req: Request): Promise<{
  data: string | Object;
  status: number;
}> {
  try {
    const marketersData = await User.find({
      role: 'marketer',
    });

    if (marketersData.length) {
      return { data: marketersData, status: 200 };
    } else {
      return { data: 'Unable to retrieve marketers data', status: 400 };
    }
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
}

async function handleChangePassword(req: Request): Promise<{
  data: string | Object;
  status: number;
}> {
  const { username, oldPassword, newPassword } = await req.json();

  try {
    const userData = await User.findOne({
      name: username,
      password: oldPassword,
    });

    if (userData) {
      userData.password = newPassword;
      await userData.save();
      return { data: 'Password changed successfully', status: 200 };
    } else {
      return { data: 'Invalid username or password', status: 400 };
    }
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
}

async function handleDeleteUser(req: Request): Promise<{
  data: string | Object;
  status: number;
}> {
  const { _id } = await req.json();

  try {
    const resData = await User.findByIdAndDelete(_id);
    if (resData) {
      return { data: 'User deleted successfully', status: 200 };
    } else {
      return { data: 'User not found', status: 400 };
    }
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
}

async function handleEditUser(req: Request): Promise<{
  data: string | Object;
  status: number;
}> {
  try {
    const data = await req.json();
    const resData = await User.findByIdAndUpdate(data._id, data, {
      new: true,
    });

    if (resData) {
      return { data: 'Updated the user data successfully', status: 200 };
    } else {
      return { data: 'User not found', status: 400 };
    }
  } catch (e: any) {
    console.error(e);
    if (e.code === 11000)
      return { data: 'User with this name already exists', status: 400 };
    else return { data: 'An error occurred', status: 500 };
  }
}

async function handleVerifyUser(req: Request): Promise<{
  data: string | { token: string; redirect_path: string };
  status: number;
}> {
  const { name, password } = await req.json();
  const Headers = await headers();
  const redirect_path = Headers.get('referer') || '/';

  try {
    const userData = await User.findOne({
      name,
      password,
    });

    if (userData) {
      const token = jwt.sign(
        { userId: userData._id, exp: Date.now() + 10 * 1000 },
        process.env.AUTH_SECRET as string,
      );

      return { data: { token, redirect_path }, status: 200 };
    } else {
      return { data: 'Invalid username or password', status: 400 };
    }
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
}

export async function GET(req: Request) {
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

export async function POST(req: Request) {
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
    case 'verify-user':
      res = await handleVerifyUser(req);
      return NextResponse.json(res.data, {
        status: res.status,
        headers: {
          'Set-Cookie': `verify-token.tmp=${res.data.token}; Path=${res.data.redirect_path}`,
        },
      });
    default:
      return NextResponse.json({ response: 'OK' }, { status: 200 });
  }
}
