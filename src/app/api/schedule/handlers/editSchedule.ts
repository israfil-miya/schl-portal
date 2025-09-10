import Schedule from '@/models/Schedule';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export const handleEditSchedule = async (
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

    const resData = await Schedule.findByIdAndUpdate(
      _id,
      {
        ...data,
        updated_by: updatedBy,
      },
      {
        new: true,
        upsert: true,
      },
    );

    if (resData) {
      return { data: 'Updated the schedule successfully', status: 200 };
    } else {
      return { data: 'Unable to update the schedule', status: 400 };
    }
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
};
