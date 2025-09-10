import Notice, { NoticeDataType } from '@/models/Notices';
import { getToken } from 'next-auth/jwt';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

type TokenShape = {
  permissions?: string[];
};

export const handleEditNotice = async (
  req: NextRequest,
): Promise<{
  data: string | Object;
  status: number;
}> => {
  try {
    const headersList = await headers();
    let data = await req.json();
    const updatedBy = headersList.get('updated_by');

    // verify token permissions
    const token = (await (getToken as any)({
      req,
      secret: process.env.AUTH_SECRET as string,
    })) as TokenShape | null;
    const permissions = token?.permissions || [];

    // If channel is being changed/updated, ensure user has permission
    if (
      data.channel === 'production' &&
      !permissions.includes('notice:send_notice_production')
    ) {
      return {
        data: {
          message: 'Forbidden: insufficient permissions for production channel',
        },
        status: 403,
      };
    }

    if (
      data.channel === 'marketers' &&
      !permissions.includes('notice:send_notice_marketers')
    ) {
      return {
        data: {
          message: 'Forbidden: insufficient permissions for marketers channel',
        },
        status: 403,
      };
    }
    const { _id } = data;
    delete data._id;

    console.log(data);

    const resData = await Notice.findByIdAndUpdate(
      _id,
      {
        ...data,
        updated_by: updatedBy,
      },
      {
        new: true,
      },
    );

    if (resData) {
      return {
        data: { message: 'Updated the notice data successfully' },
        status: 200,
      };
    } else {
      return { data: { message: 'Notice not found' }, status: 400 };
    }
  } catch (e) {
    console.error(e);
    return { data: { message: 'An error occurred' }, status: 500 };
  }
};
