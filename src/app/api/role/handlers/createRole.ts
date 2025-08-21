import { PermissionValue } from '@/app/(pages)/admin/roles/create-role/components/Form';
import { auth } from '@/auth';
import Role from '@/models/Roles';
import { NextRequest } from 'next/server';

export async function handleCreateRole(req: NextRequest): Promise<{
  data: string | Object;
  status: number;
}> {
  try {
    const session = await auth();
    if (!session) {
      return { data: 'Unauthorized', status: 401 };
    }

    if (!session.user.permissions.includes('admin:create_role')) {
      return { data: "You don't have permission to create roles", status: 403 };
    }

    const data = await req.json();

    // Security: user can only assign permissions they possess
    const requestedPermissions: PermissionValue[] = Array.isArray(
      data.permissions,
    )
      ? (data.permissions as PermissionValue[])
      : [];
    const userPerms = new Set<PermissionValue>(session.user.permissions);
    const invalid = requestedPermissions.filter(
      p => !userPerms.has(p as PermissionValue),
    );
    if (invalid.length > 0) {
      return {
        data: `You tried to assign permissions you don't have: ${invalid.join(', ')}`,
        status: 403,
      };
    }
    if (
      requestedPermissions.includes('settings:the_super_admin') &&
      !userPerms.has('settings:the_super_admin')
    ) {
      return {
        data: "You can't assign the super admin permission",
        status: 403,
      };
    }
    const docCount = await Role.countDocuments({ name: data.name });

    if (docCount > 0) {
      return { data: 'Role with this name already exists', status: 400 };
    } else {
      const roleData = await Role.create(data);
      if (roleData) {
        return { data: roleData, status: 200 };
      } else {
        return { data: 'Unable to create role', status: 400 };
      }
    }
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
}
