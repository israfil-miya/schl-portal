import Client, { ClientDataType } from '@/models/Clients';
import Report, { ReportDataType } from '@/models/Reports';
import { getTodayDate } from '@/utility/date';
import { startSession } from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';

export const handleConvertToPermanent = async (
  req: NextRequest,
): Promise<{
  data: string | Record<string, number>;
  status: number;
}> => {
  const session = await startSession();
  session.startTransaction();

  try {
    const data: ClientDataType = await req.json();
    console.log('Received data:', data);

    const existingClientCount = await Client.countDocuments(
      { client_code: data.client_code },
      { session },
    );

    if (existingClientCount > 0) {
      await session.abortTransaction();
      session.endSession();
      return { data: 'Client with the same code already exists', status: 400 };
    }

    const clientData = await Client.create([data], { session });

    if (clientData) {
      const reportData = await Report.findOneAndUpdate(
        { company_name: data.client_name, is_lead: false },
        { client_status: 'approved', onboard_date: getTodayDate() },
        { new: true, session },
      );

      if (reportData) {
        await session.commitTransaction();
        session.endSession();
        console.log('Added the client successfully', reportData);
        return { data: 'Added the client successfully', status: 200 };
      } else {
        await session.abortTransaction();
        session.endSession();
        return {
          data: 'Unable to change the status of the report',
          status: 400,
        };
      }
    } else {
      await session.abortTransaction();
      session.endSession();
      return { data: 'Unable to add new client', status: 400 };
    }
  } catch (e) {
    await session.abortTransaction();
    session.endSession();
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
};
