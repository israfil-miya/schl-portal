import Invoice, { InvoiceDataType } from '@/models/Invoices';
import { toISODate } from '@/utility/date';
import { addRegexField } from '@/utility/filterHelpers';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

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

export const handleGetAllInvoices = async (
  req: NextRequest,
): Promise<{
  data: string | PaginatedData<InvoiceDataType[]>;
  status: number;
}> => {
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
          { $match: searchQuery },
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
};
