import Report, { ReportDataType } from '@/models/Reports';
import { NextRequest, NextResponse } from 'next/server';

export const handleMarkDuplicateClient = async (
  req: NextRequest,
): Promise<{
  data: string | Object;
  status: number;
}> => {
  try {
    let { id } = await req.json();

    const resData = await Report.findByIdAndUpdate(
      id,
      {
        client_status: 'approved',
      },
      {
        new: true,
      },
    );

    if (resData) {
      return { data: 'Marked the request as duplicate client', status: 200 };
    } else {
      return { data: 'Unable mark the request as duplicate', status: 400 };
    }
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
};
