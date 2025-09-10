import Report, { ReportDataType } from '@/models/Reports';
import { NextRequest, NextResponse } from 'next/server';

export const handleRejectClient = async (
  req: NextRequest,
): Promise<{
  data: string | Object;
  status: number;
}> => {
  try {
    let { id } = await req.json();

    const resData = await Report.findByIdAndUpdate(
      id,
      { client_status: 'none' },
      {
        new: true,
      },
    );

    if (resData) {
      return { data: 'Rejected regular client request', status: 200 };
    } else {
      return { data: 'Unable reject regular client request', status: 400 };
    }
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
};
