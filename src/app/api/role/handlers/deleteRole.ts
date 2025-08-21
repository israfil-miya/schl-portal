import { auth } from '@/auth';
import Role from '@/models/Roles';
import User from '@/models/Users';
import { NextRequest } from 'next/server';

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
    const session = await auth();
    if (!session) return { data: 'Unauthorized', status: 401 };
    if (!session.user.permissions.includes('admin:delete_role')) {
      return { data: "You don't have permission to delete roles", status: 403 };
    }
    const resData = await Role.findById(_id);
    if (resData) {
      // Prevent deleting super admin role without permission
      if (
        resData.permissions.includes('settings:the_super_admin') &&
        !session.user.permissions.includes('settings:the_super_admin')
      ) {
        return {
          data: "You can't delete this role",
          status: 403,
        };
      }
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
