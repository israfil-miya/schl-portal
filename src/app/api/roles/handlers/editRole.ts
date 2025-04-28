import Role from '@/models/Roles';
import { NextRequest, NextResponse } from 'next/server';

export async function handleEditRole(req: NextRequest): Promise<{
  data: string | Object;
  status: number;
}> {
  try {
    const data = await req.json();
    const resData = await Role.findByIdAndUpdate(data._id, data, {
      new: true,
    });

    if (resData) {
      return { data: 'Updated the role data successfully', status: 200 };
    } else {
      return { data: 'Role not found', status: 400 };
    }
  } catch (e: any) {
    console.error(e);
    if (e.code === 11000)
      return { data: 'Role with this name already exists', status: 400 };
    else return { data: 'An error occurred', status: 500 };
  }
}
