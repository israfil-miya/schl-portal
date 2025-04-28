import Role from '@/models/Users';
import { NextRequest, NextResponse } from 'next/server';

export async function handleCreateRole(req: NextRequest): Promise<{
  data: string | Object;
  status: number;
}> {
  try {
    const data = await req.json();
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
