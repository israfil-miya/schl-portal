import Notice, { NoticeDataType } from '@/models/Notices';
import { NextRequest, NextResponse } from 'next/server';

export const handleDeleteNotice = async (
  req: NextRequest,
): Promise<{
  data: string;
  status: number;
}> => {
  try {
    const { notice_id } = await req.json();

    if (!notice_id) {
      return { data: 'Notice ID not provided', status: 400 };
    }

    let resData = await Notice.findByIdAndDelete(notice_id);

    if (resData) {
      return { data: 'Deleted the notice successfully', status: 200 };
    } else {
      return { data: 'Unable to delete the notice', status: 400 };
    }
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
};
