import { auth } from '@/auth';
import Role from '@/models/Roles';
import User from '@/models/Users';
import { NextRequest } from 'next/server';

export const handleEditUser = async (
  req: NextRequest,
): Promise<{
  data: string | Object;
  status: number;
}> => {
  try {
    const session = await auth();
    if (!session) return { data: 'Unauthorized', status: 401 };
    if (!session.user.permissions.includes('admin:edit_user'))
      return { data: "You don't have permission to edit users", status: 403 };

    const data = await req.json();

    // Fetch current user with role permissions
    const current = await User.findById(data._id).populate(
      'role_id',
      'permissions',
    );
    if (!current) return { data: 'User not found', status: 404 };

    const editorPerms = new Set(session.user.permissions);
    const currentPerms: string[] = Array.isArray(
      (current as any).role_id?.permissions,
    )
      ? ((current as any).role_id.permissions as string[])
      : [];

    // Disallow editing a super admin user unless editor is super admin
    if (
      currentPerms.includes('settings:the_super_admin') &&
      !editorPerms.has('settings:the_super_admin')
    )
      return { data: "You can't edit this user", status: 403 };

    // If role_id is changing, validate target role
    if (data.role_id) {
      const targetRole = await Role.findById(data.role_id).select(
        'permissions',
      );
      if (!targetRole) return { data: 'Invalid role', status: 400 };
      const targetPerms: string[] = Array.isArray(
        (targetRole as any).permissions,
      )
        ? ((targetRole as any).permissions as string[])
        : [];
      if (
        targetPerms.includes('settings:the_super_admin') &&
        !editorPerms.has('settings:the_super_admin')
      )
        return { data: "You can't assign a super admin role", status: 403 };
      const invalid = targetPerms.filter(p => !editorPerms.has(p as any));
      if (invalid.length > 0)
        return {
          data: `You tried to assign permissions you don't have: ${invalid.join(', ')}`,
          status: 403,
        };
    }

    const resData = await User.findByIdAndUpdate(data._id, data, { new: true });

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
};
