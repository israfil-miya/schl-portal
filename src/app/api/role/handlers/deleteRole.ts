import Role from '@/models/Roles';
import User from '@/models/Users';
import { NextRequest, NextResponse } from 'next/server';

export async function handleDeleteRole(req: NextRequest): Promise<{
  data: string | Object;
  status: number;
}> {
  const { _id } = await req.json();

  if (!_id) {
    return { data: 'Role ID is required', status: 400 };
  }

  console.log('Delete role', _id);

  try {
    const resData = await Role.findById(_id);
    if (resData) {
      const users = await User.countDocuments({ role_id: _id });
      if (users > 0) {
        return { data: 'Role is assigned to at least one user', status: 400 };
      }

      await resData.deleteOne();
      return { data: 'Role deleted successfully', status: 200 };
    } else {
      return { data: 'Role not found', status: 400 };
    }
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
}
