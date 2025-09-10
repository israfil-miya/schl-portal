import Invoice, { InvoiceDataType } from '@/models/Invoices';
import { NextRequest, NextResponse } from 'next/server';

export const handleDeleteInvoice = async (
  req: NextRequest,
): Promise<{
  data: string;
  status: number;
}> => {
  try {
    const { invoice_number } = await req.json();

    if (!invoice_number) {
      return { data: 'Invoice number is required', status: 400 };
    }

    let resData = await Invoice.findOneAndDelete({
      invoice_number: invoice_number,
    });

    if (resData) {
      return { data: 'Deleted the invoice successfully', status: 200 };
    } else {
      return {
        data: 'Unable to delete the invoice',
        status: 400,
      };
    }
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
};
