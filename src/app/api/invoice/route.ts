import { dbConnect, getQuery, incrementInvoiceNumber } from '@/lib/utils';
import Client from '@/models/Clients';
import Invoice, { InvoiceDataType } from '@/models/Invoices';
import { toISODate } from '@/utility/date';
import { addRegexField } from '@/utility/filterHelpers';
import { startSession } from 'mongoose';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
dbConnect();

export interface RegexQuery {
  $regex: string;
  $options: string;
}

export interface Query {
  client_code?: RegexQuery;
  invoice_number?: RegexQuery;
  createdAt?: { $gte?: string; $lte?: string };
  $or?: { [key: string]: RegexQuery }[];
}

export type RegexFields = Extract<
  keyof Query,
  'client_code' | 'invoice_number'
>;

interface PaginatedData<ItemsType> {
  pagination: { count: number; pageCount: number };
  items: ItemsType;
}

async function handleGetAllInvoices(req: NextRequest): Promise<{
  data: string | PaginatedData<InvoiceDataType[]>;
  status: number;
}> {
  try {
    const headersList = await headers();
    const page: number = Number(headersList.get('page')) || 1;
    const ITEMS_PER_PAGE: number =
      Number(headersList.get('items_per_page')) || 30;
    const isFilter: boolean = headersList.get('filtered') === 'true';
    const paginated: boolean = headersList.get('paginated') === 'true';

    const filters = await req.json();

    const { invoiceNumber, clientCode, fromDate, toDate } = filters;

    let query: Query = {};

    if (fromDate || toDate) {
      query.createdAt = {};
      query.createdAt = {
        ...(fromDate && { $gte: toISODate(fromDate) }),
        ...(toDate && {
          $lte: toISODate(toDate, 23, 59, 59, 999),
        }),
      };
    }

    if (!fromDate && !toDate) {
      delete query.createdAt;
    }

    addRegexField(query, 'invoice_number', invoiceNumber);
    addRegexField(query, 'client_code', clientCode);

    console.log(query);

    const searchQuery: Query = { ...query };

    let sortQuery: Record<string, 1 | -1> = {
      createdAt: -1,
    };

    if (!query && isFilter == true) {
      return { data: 'No filter applied', status: 400 };
    } else {
      const skip = (page - 1) * ITEMS_PER_PAGE;

      const count: number = await Invoice.countDocuments(searchQuery);
      let invoices: any[];

      if (paginated) {
        invoices = (await Invoice.aggregate([
          { $match: query },
          { $sort: sortQuery },
          { $skip: skip },
          { $limit: ITEMS_PER_PAGE },
        ])) as InvoiceDataType[];
      } else {
        invoices = await Invoice.find(searchQuery)
          .sort({
            createdAt: -1,
          })
          .lean();
      }

      console.log('SEARCH Query:', searchQuery);

      const pageCount: number = Math.ceil(count / ITEMS_PER_PAGE);

      if (!invoices) {
        return { data: 'Unable to retrieve invoices', status: 400 };
      } else {
        let invoicesData = {
          pagination: {
            count,
            pageCount,
          },
          items: invoices,
        };

        return { data: invoicesData, status: 200 };
      }
    }
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
}

async function handleStoreInvoice(
  req: NextRequest,
): Promise<{ data: any; status: number }> {
  const session = await startSession(); // Start a session
  session.startTransaction(); // Start a transaction

  try {
    const data = await req.json();

    // Pass the session to the operation
    const resData = await Invoice.create([data], { session });
    const updatedClientData = await Client.findByIdAndUpdate(
      data.client_id,
      { last_invoice_number: incrementInvoiceNumber(data.invoice_number) }, // Increment the invoice number
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
}

async function handleDeleteInvoice(req: NextRequest): Promise<{
  data: string;
  status: number;
}> {
  try {
    const headersList = await headers();
    const invoice_number = headersList.get('invoice_number');

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
}

export async function POST(req: NextRequest) {
  let res: { data: any; status: number };

  switch (getQuery(req).action) {
    case 'get-all-invoices':
      res = await handleGetAllInvoices(req);
      return NextResponse.json(res.data, { status: res.status });
    case 'delete-invoice':
      res = await handleDeleteInvoice(req);
      return NextResponse.json(res.data, { status: res.status });
    case 'store-invoice':
      res = await handleStoreInvoice(req);
      return NextResponse.json(res.data, { status: res.status });
    default:
      return NextResponse.json({ response: 'OK' }, { status: 200 });
  }
}

export async function GET(req: NextRequest) {
  let res: { data: any; status: number };

  switch (getQuery(req).action) {
    default:
      return NextResponse.json({ response: 'OK' }, { status: 200 });
  }
}
