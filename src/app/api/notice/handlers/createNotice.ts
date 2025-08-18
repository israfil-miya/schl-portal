import Notice, { NoticeDataType } from '@/models/Notices';
import { NextRequest, NextResponse } from 'next/server';

export const handleCreateNotice = async (
  req: NextRequest,
): Promise<{
  data: string | Object;
  status: number;
}> => {
  try {
    const data = await req.json();
    const docCount = await Notice.countDocuments({ notice_no: data.notice_no });

    if (docCount > 0) {
      return {
        data: 'Notice with the same notice number already exists',
        status: 400,
      };
    } else {
      const noticeData = await Notice.create(data);
      if (noticeData) {
        return { data: noticeData, status: 200 };
      } else {
        return { data: 'Unable to create notice', status: 400 };
      }
    }
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
};
