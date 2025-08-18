import Order, { OrderDataType } from '@/models/Orders';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export const handleEditOrder = async (
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

    const resData = await Order.findByIdAndUpdate(
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
      return { data: 'Updated the order successfully', status: 200 };
    } else {
      return { data: 'Unable to update the order', status: 400 };
    }
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
};
