import Order, { OrderDataType } from '@/models/Orders';
import { NextRequest, NextResponse } from 'next/server';

export const handleFinishOrder = async (
  req: NextRequest,
): Promise<{
  data: string | Object;
  status: number;
}> => {
  try {
    const { order_id }: { order_id: string } = await req.json();
    const resData = await Order.findByIdAndUpdate(
      order_id,
      { status: 'Finished' },
      {
        new: true,
      },
    );
    if (resData) {
      return {
        data: 'Changed the status of the order successfully',
        status: 200,
      };
    } else {
      return { data: 'Unable to change the status of the order', status: 400 };
    }
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
};
