import Order, { OrderDataType } from '@/models/Orders';
import {
  addIfDefined,
  addPlusSeparatedContainsAllField,
  addRegexField,
  createRegexQuery,
} from '@/utility/filterHelpers';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export interface RegexQuery {
  $regex: string;
  $options: string;
}

export interface Query {
  type?: RegexQuery;
  task?: RegexQuery;
  status?: RegexQuery;
  folder?: RegexQuery;
  client_code?: RegexQuery;
  download_date?: { $gte?: string; $lte?: string };
  $or?: { [key: string]: RegexQuery }[];
}

export type RegexFields = Extract<
  keyof Query,
  'type' | 'task' | 'folder' | 'client_code' | 'status'
>;

interface PaginatedData<ItemsType> {
  pagination: { count: number; pageCount: number };
  items: ItemsType;
}

export const handleGetAllOrders = async (
  req: NextRequest,
): Promise<{
  data: string | PaginatedData<OrderDataType[]>;
  status: number;
}> => {
  try {
    const headersList = await headers();
    const page: number = Number(headersList.get('page')) || 1;
    const ITEMS_PER_PAGE: number =
      Number(headersList.get('items_per_page')) || 30;
    const isFilter: boolean = headersList.get('filtered') === 'true';
    const paginated: boolean = headersList.get('paginated') === 'true';

    const isForInvoice: boolean = headersList.get('for_invoice') === 'true';

    const filters = await req.json();

    const {
      folder,
      clientCode,
      task,
      type,
      status,
      fromDate,
      toDate,
      generalSearchString,
    } = filters;

    let query: Query = {};

    if (fromDate || toDate) {
      query.download_date = {};
      query.download_date = {
        ...(fromDate && { $gte: fromDate }),
        ...(toDate && { $lte: toDate }),
      };
    }

    if (!fromDate && !toDate) {
      delete query.download_date;
    }

    addRegexField(query, 'folder', folder);
    addRegexField(query, 'client_code', clientCode, isForInvoice ?? false);
    // For tasks like "A+B+C" we want to match records containing all tokens in any order, possibly with extra tokens
    if (task && task.includes('+')) {
      addPlusSeparatedContainsAllField(query, 'task', task);
    } else {
      addRegexField(query, 'task', task);
    }
    addRegexField(query, 'type', type, true);
    addRegexField(query, 'status', status, true);

    console.log(query);

    const searchQuery: Query = { ...query };

    let sortQuery: Record<string, 1 | -1> = {
      customSortField: 1,
      download_date: -1,
    };

    if (!query && isFilter == true && !generalSearchString) {
      return { data: 'No filter applied', status: 400 };
    } else {
      const skip = (page - 1) * ITEMS_PER_PAGE;

      if (generalSearchString) {
        const searchPattern = createRegexQuery(generalSearchString);

        searchQuery['$or'] = [
          { client_code: searchPattern! },
          { client_name: searchPattern! },
          { folder: searchPattern! },
          { task: searchPattern! },
          // { folder_path: searchPattern! },
        ];
      }

      const count: number = await Order.countDocuments(searchQuery);
      let orders: any[];

      if (paginated) {
        orders = (await Order.aggregate([
          { $match: searchQuery },
          {
            $addFields: {
              customSortField: {
                $cond: {
                  if: {
                    $or: [
                      {
                        $and: [
                          { $eq: ['$status', 'Correction'] },
                          { $ne: ['$status', 'Finished'] },
                        ],
                      },
                      {
                        $and: [
                          { $eq: ['$type', 'Test'] },
                          { $ne: ['$status', 'Finished'] },
                        ],
                      },
                    ],
                  },
                  then: 0,
                  else: {
                    $cond: {
                      if: { $ne: ['$status', 'Finished'] },
                      then: 1,
                      else: {
                        $cond: {
                          if: {
                            $and: [
                              { $eq: ['$status', 'Finished'] },
                              { $eq: ['$type', 'Test'] },
                            ],
                          },
                          then: 2,
                          else: 3,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          { $sort: sortQuery },
          { $skip: skip },
          { $limit: ITEMS_PER_PAGE },
        ])) as OrderDataType[];
      } else {
        orders = await Order.find(searchQuery)
          .sort({
            download_date: 1,
          })
          .lean();
      }

      console.log('SEARCH Query:', searchQuery);

      const pageCount: number = Math.ceil(count / ITEMS_PER_PAGE);

      if (!orders) {
        return { data: 'Unable to retrieve orders', status: 400 };
      } else {
        let ordersData = {
          pagination: {
            count,
            pageCount,
          },
          items: orders,
        };

        return { data: ordersData, status: 200 };
      }
    }
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
};
