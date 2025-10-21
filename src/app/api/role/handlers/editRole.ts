import { auth } from '@/auth';
import Role from '@/models/Roles';
import { PermissionValue } from '@/permissions';
import { NextRequest } from 'next/server';

export async function handleEditRole(req: NextRequest): Promise<{
  data: string | Object;
  status: number;
}> {
  try {
    const session = await auth();
    if (!session) return { data: 'Unauthorized', status: 401 };

    const body = await req.json();
    const { _id } = body;
    if (!_id) return { data: 'Role ID is required', status: 400 };

    const existing = await Role.findById(_id);
    if (!existing) return { data: 'Role not found', status: 404 };

    const userPerms = new Set<PermissionValue>(session.user.permissions);
    const canManageAny = userPerms.has('admin:create_role');

    // Cannot edit a role containing super admin perm unless you have it
    // Protect super admin roles: require 'settings:the_super_admin' to edit/assign it
    const isSuperAdminRole = existing.permissions.includes(
      'settings:the_super_admin',
    );
    if (isSuperAdminRole && !userPerms.has('settings:the_super_admin')) {
      return { data: "You can't edit this role", status: 403 };
    }

    const requestedPermissions: PermissionValue[] = Array.isArray(
      body.permissions,
    )
      ? (body.permissions as PermissionValue[])
      : [];
    if (!canManageAny) {
      const invalid = requestedPermissions.filter(p => !userPerms.has(p));
      if (invalid.length > 0) {
        return {
          data: `You tried to assign permissions you don't have: ${invalid.join(', ')}`,
          status: 403,
        };
      }
      // Guard super admin assignment if editor doesn't have it
      if (
        requestedPermissions.includes('settings:the_super_admin') &&
        !userPerms.has('settings:the_super_admin')
      ) {
        return {
          data: "You can't assign the super admin permission",
          status: 403,
        };
      }
    }
    // Even if canManageAny, still block adding/removing super admin unless editor has it
    if (
      canManageAny &&
      requestedPermissions.includes('settings:the_super_admin') &&
      !userPerms.has('settings:the_super_admin')
    ) {
      return {
        data: "You can't assign the super admin permission",
        status: 403,
      };
    }

    existing.name = body.name ?? existing.name;
    existing.description = body.description ?? existing.description;
    existing.permissions = requestedPermissions.length
      ? requestedPermissions
      : existing.permissions;

    await existing.save();
    return { data: 'Updated the role data successfully', status: 200 };
  } catch (e: any) {
    console.error(e);
    if (e.code === 11000)
      return { data: 'Role with this name already exists', status: 400 };
    else return { data: 'An error occurred', status: 500 };
  }
}
