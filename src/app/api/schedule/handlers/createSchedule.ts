import Schedule from '@/models/Schedule';
import { NextRequest, NextResponse } from 'next/server';

export const handleCreateSchedule = async (
  req: NextRequest,
): Promise<{
  data: string | Object;
  status: number;
}> => {
  try {
    const scheduleData = await req.json();
    const resData = await Schedule.create(scheduleData);

    if (resData) {
      return { data: 'Created the schedule successfully', status: 200 };
    } else {
      return { data: 'Unable to create new schedule', status: 400 };
    }
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
};
