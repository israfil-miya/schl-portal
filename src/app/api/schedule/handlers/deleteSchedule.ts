import Schedule from '@/models/Schedule';
import { NextRequest, NextResponse } from 'next/server';

export const handleDeleteSchedule = async (
  req: NextRequest,
): Promise<{
  data: string | Object;
  status: number;
}> => {
  try {
    const { schedule_id }: { schedule_id: string } = await req.json();
    const resData = await Schedule.findByIdAndDelete(schedule_id);
    if (resData) {
      return { data: 'Deleted the schedule successfully', status: 200 };
    } else {
      return { data: 'Unable to delete the schedule', status: 400 };
    }
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
};
