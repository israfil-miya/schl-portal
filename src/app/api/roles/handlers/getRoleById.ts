import Role from '@/models/Roles';
import { headers } from 'next/headers';
import { NextRequest } from 'next/server';

export async function handleGetRoleById(req: NextRequest): Promise<{
  data: string | Object;
  status: number;
}> {
  try {
    const headersList = await headers();
    const roleId: string = headersList.get('role_id') || '';

    const role = await Role.findById(roleId).lean();

    if (!role) {
      return { data: 'Role not found', status: 404 };
    } else {
      return { data: role, status: 200 };
    }
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
}
