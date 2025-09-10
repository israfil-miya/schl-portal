import Notice, { NoticeDataType } from '@/models/Notices';
import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

type TokenShape = {
  permissions?: string[];
};

export const handleCreateNotice = async (
  req: NextRequest,
): Promise<{
  data: string | Object;
  status: number;
}> => {
  try {
    const data = await req.json();
    // validate user permissions from next-auth token
    const token = (await (getToken as any)({
      req,
      secret: process.env.AUTH_SECRET as string,
    })) as TokenShape | null;

    const permissions = token?.permissions || [];

    // Block creation if user lacks permission for the requested channel
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
    const docCount = await Notice.countDocuments({ notice_no: data.notice_no });

    if (docCount > 0) {
      return {
        data: { message: 'Notice with the same notice number already exists' },
        status: 400,
      };
    } else {
      const noticeData = await Notice.create(data);
      if (noticeData) {
        return { data: noticeData, status: 200 };
      } else {
        return { data: { message: 'Unable to create notice' }, status: 400 };
      }
    }
  } catch (e) {
    console.error(e);
    return { data: { message: 'An error occurred' }, status: 500 };
  }
};
