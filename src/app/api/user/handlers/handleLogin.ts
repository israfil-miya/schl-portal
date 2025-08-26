import { PermissionValue } from '@/app/(pages)/admin/roles/create-role/components/Form';
import { hasAnyPerm, hasPerm } from '@/lib/utils';
import Role from '@/models/Roles';
import User, { UserDataType, UserDocType } from '@/models/Users';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

interface PopulatedUser extends Omit<UserDocType, 'role_id'> {
  role_id: {
    name: string;
    permissions: PermissionValue[];
  };
}

export const handleLogin = async (
  req: NextRequest,
): Promise<{
  data: string | Object;
  status: number;
}> => {
  const Headers = await headers();
  const username = Headers.get('username')?.trim();
  const password = Headers.get('password')?.trim();

  try {
    // find and populate role_id
    const userData = await User.findOne({ name: username, password: password })
      .populate('role_id', 'name permissions')
      .lean<PopulatedUser>()
      .exec();

    if (userData) {
      if (!hasPerm('login:portal', userData.role_id.permissions)) {
        return {
          data: 'You are not authorized to login here',
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
};
