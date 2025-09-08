import { auth } from '@/auth';
import User from '@/models/Users';
import { NextRequest } from 'next/server';

export async function handleGetUserById(
  req: NextRequest,
): Promise<{ data: string | Object; status: number }> {
  try {
    const session = await auth();
    if (!session) return { data: 'Unauthorized', status: 401 };
    const viewerPerms = new Set(session.user.permissions || []);
    const viewerIsSuper = viewerPerms.has('settings:the_super_admin' as any);
    // allow users with edit permission to view passwords (non-super editors)
    const viewerCanViewPassword =
      viewerIsSuper || viewerPerms.has('admin:edit_user' as any);
    const { _id } = await req.json();
    const resData: any = await User.findById(_id)
      .populate('role_id', 'permissions name')
      .lean();
    if (resData) {
      const targetIsSuper = Array.isArray(resData?.role_id?.permissions)
        ? resData.role_id.permissions.includes('settings:the_super_admin')
        : false;
      if (targetIsSuper && !viewerIsSuper) {
        return { data: 'Forbidden', status: 403 };
      }
      if (!viewerCanViewPassword && 'password' in resData)
        resData.password = '******';
      return { data: resData, status: 200 };
    }
    return { data: 'User not found', status: 400 };
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
}
