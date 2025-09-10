import { auth } from '@/auth';
import Role from '@/models/Roles';
import User from '@/models/Users';
import { NextRequest } from 'next/server';

export const handleCreateUser = async (
  req: NextRequest,
): Promise<{
  data: string | Object;
  status: number;
}> => {
  try {
    const session = await auth();
    if (!session) return { data: 'Unauthorized', status: 401 };

    if (!session.user.permissions.includes('admin:create_user')) {
      return { data: "You don't have permission to create users", status: 403 };
    }

    const data = await req.json();

    // Validate role and enforce permission boundaries
    const role = await Role.findById(data.role_id).select('permissions');
    if (!role) return { data: 'Invalid role', status: 400 };

    const editorPerms = new Set(session.user.permissions);
    const rolePerms: string[] = Array.isArray((role as any).permissions)
      ? ((role as any).permissions as string[])
      : [];

    if (
      rolePerms.includes('settings:the_super_admin') &&
      !editorPerms.has('settings:the_super_admin')
    ) {
      return {
        data: "You can't assign a super admin role",
        status: 403,
      };
    }

    const invalid = rolePerms.filter(p => !editorPerms.has(p as any));
    if (invalid.length > 0) {
      return {
        data: `You tried to assign permissions you don't have: ${invalid.join(', ')}`,
        status: 403,
      };
    }
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
};
