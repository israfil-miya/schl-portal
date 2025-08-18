import Notice, { NoticeDataType } from '@/models/Notices';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export const handleGetNotice = async (
  req: NextRequest,
): Promise<{
  data: string | Object;
  status: number;
}> => {
  try {
    const headersList = await headers();
    const notice_no: string | null = headersList.get('notice_no');
    if (!notice_no) {
      return { data: 'Notice number not provided', status: 400 };
    }
    const notice = await Notice.findOne({ notice_no }).lean();
    if (!notice) {
      return { data: 'Notice not found', status: 404 };
    } else {
      return { data: notice, status: 200 };
    }
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
};
