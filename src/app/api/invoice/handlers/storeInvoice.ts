import Client from '@/models/Clients';
import Invoice, { InvoiceDataType } from '@/models/Invoices';
import { startSession } from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';

export const handleStoreInvoice = async (
  req: NextRequest,
): Promise<{ data: any; status: number }> => {
  const session = await startSession(); // Start a session
  session.startTransaction(); // Start a transaction

  try {
    const data = await req.json();

    // Pass the session to the operation
    const resData = await Invoice.create([data], { session });
    const updatedClientData = await Client.findByIdAndUpdate(
      data.client_id,
      { last_invoice_number: data.invoice_number }, // Increment the invoice number
      { session, new: true }, // Pass the session here
    );

    if (resData && updatedClientData) {
      await session.commitTransaction(); // Commit the transaction
      return {
        data: { message: 'Successfully stored the invoice data' },
        status: 200,
      };
    } else {
      await session.abortTransaction(); // Rollback the transaction
      return {
        data: { message: 'Unable to store the invoice data' },
        status: 400,
      };
    }
  } catch (e) {
    console.error(e);
    await session.abortTransaction(); // Rollback the transaction in case of an error
    return { data: { message: 'An error occurred' }, status: 500 };
  } finally {
    session.endSession(); // End the session
  }
};
