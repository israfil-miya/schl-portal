import { dbConnect, getQuery } from '@/lib/utils';
import User, { UserDataType } from '@/models/Users';
import { addIfDefined } from '@/utility/filterHelpers';
import jwt from 'jsonwebtoken';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
dbConnect();

export interface RegexQuery {
  $regex: string;
  $options: string;
}

export interface Query {
  role?: string;
  $or?: { [key: string]: RegexQuery }[];
}

async function handleLogin(req: NextRequest): Promise<{
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

async function handleCreateUser(req: NextRequest): Promise<{
  data: string | Object;
  status: number;
}> {
  try {
    const data = await req.json();
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

async function handleGetUserById(req: NextRequest): Promise<{
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

async function handleGetAllMarketers(req: NextRequest): Promise<{
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

async function handleGetAllUsers(req: NextRequest): Promise<{
  data: string | Object;
  status: number;
}> {
  try {
    const headersList = await headers();
    const page: number = Number(headersList.get('page')) || 1;
    const ITEMS_PER_PAGE: number =
      Number(headersList.get('items_per_page')) || 30;
    const isFilter: boolean = headersList.get('filtered') === 'true';
    const paginated: boolean = headersList.get('paginated') === 'true';

    const filters = await req.json();

    const { generalSearchString } = filters;

    const query: Query = {};

    addIfDefined(query, 'role', filters.role);

    const searchQuery: Query = { ...query };

    let sortQuery: Record<string, 1 | -1> = {
      createdAt: -1,
    };

    if (!query && isFilter == true && !generalSearchString) {
      return { data: 'No filter applied', status: 400 };
    } else {
      const skip = (page - 1) * ITEMS_PER_PAGE;

      if (generalSearchString) {
        searchQuery['$or'] = [
          { real_name: { $regex: generalSearchString, $options: 'i' } },
          { name: { $regex: generalSearchString, $options: 'i' } },
        ];
      }

      const count: number = await User.countDocuments(searchQuery);
      let users: any;

      if (paginated) {
        users = await User.aggregate([
          { $match: searchQuery },
          { $sort: sortQuery },
          { $skip: skip },
          { $limit: ITEMS_PER_PAGE },
          {
            $project: {
              hasFollowupDate: 0, // Remove the added field from the final output
            },
          },
        ]);
      } else {
        users = (await User.find(searchQuery).lean()) as UserDataType[];
      }

      const pageCount: number = Math.ceil(count / ITEMS_PER_PAGE);

      if (!users) {
        return { data: 'Unable to retrieve users', status: 400 };
      } else {
        let usersData = {
          pagination: {
            count,
            pageCount,
          },
          items: users,
        };

        return { data: usersData, status: 200 };
      }
    }
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
}

async function handleChangePassword(req: NextRequest): Promise<{
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

async function handleDeleteUser(req: NextRequest): Promise<{
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

async function handleEditUser(req: NextRequest): Promise<{
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

async function handleVerifyUser(req: NextRequest): Promise<{
  data: string | { token: string; redirect_path: string };
  status: number;
}> {
  const { name, password } = await req.json();
  const headersList = await headers();
  const redirect_path = headersList.get('redirect_path') || '/';

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
