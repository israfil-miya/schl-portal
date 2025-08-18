import Notice, { NoticeDataType } from '@/models/Notices';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

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
      return { data: 'Updated the notice data successfully', status: 200 };
    } else {
      return { data: 'Notice not found', status: 400 };
    }
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
};
