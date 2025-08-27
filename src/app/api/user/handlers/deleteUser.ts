import { auth } from '@/auth';
import User from '@/models/Users';
import { NextRequest } from 'next/server';

export const handleDeleteUser = async (
  req: NextRequest,
): Promise<{
  data: string | Object;
  status: number;
}> => {
  const { _id } = await req.json();

  try {
    const session = await auth();
    if (!session) return { data: 'Unauthorized', status: 401 };
    if (!session.user.permissions.includes('admin:delete_user_approval'))
      return { data: "You don't have permission to delete users", status: 403 };

    // Load target user with role perms
    const target = await User.findById(_id).populate('role_id', 'permissions');
    if (!target) return { data: 'User not found', status: 400 };
    const targetPerms: string[] = Array.isArray(
      (target as any).role_id?.permissions,
    )
      ? ((target as any).role_id.permissions as string[])
      : [];
    if (
      targetPerms.includes('settings:the_super_admin') &&
      !session.user.permissions.includes('settings:the_super_admin')
    )
      return { data: "You can't delete this user", status: 403 };

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
};
