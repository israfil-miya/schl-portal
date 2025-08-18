import Schedule, { ScheduleDataType } from '@/models/Schedule';
import {
  addIfDefined,
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
  task?: RegexQuery;
  client_code?: RegexQuery;
  receive_date?: { $gte?: string; $lte?: string };
  delivery_date?: { $gte?: string; $lte?: string };
  $or?: { [key: string]: RegexQuery }[];
}

export type RegexFields = Extract<keyof Query, 'task' | 'client_code'>;

interface PaginatedData<ItemsType> {
  pagination: { count: number; pageCount: number };
  items: ItemsType;
}

export const handleGetAllSchedules = async (
  req: NextRequest,
): Promise<{
  data: string | PaginatedData<ScheduleDataType[]>;
  status: number;
}> => {
  try {
    const headersList = await headers();
    const page: number = Number(headersList.get('page')) || 1;
    const ITEMS_PER_PAGE: number =
      Number(headersList.get('items_per_page')) || 30;
    const isFilter: boolean = headersList.get('filtered') === 'true';
    const paginated: boolean = headersList.get('paginated') === 'true';

    // const isForInvoice: boolean = headersList.get('for_invoice') === 'true';

    const filters = await req.json();

    const {
      clientCode,
      task,
      receiveFromDate,
      receiveToDate,
      deliveryFromDate,
      deliveryToDate,
      generalSearchString,
    } = filters;

    let query: Query = {};

    // for receive date filtering
    if (receiveFromDate || receiveToDate) {
      query.receive_date = {};
      query.receive_date = {
        ...(receiveFromDate && { $gte: receiveFromDate }),
        ...(receiveToDate && { $lte: receiveToDate }),
      };
    }

    if (!receiveFromDate && !receiveToDate) {
      delete query.receive_date;
    }

    // for deliveey date filtering
    if (deliveryFromDate || deliveryToDate) {
      query.delivery_date = {};
      query.delivery_date = {
        ...(deliveryFromDate && { $gte: deliveryFromDate }),
        ...(deliveryToDate && { $lte: deliveryToDate }),
      };
    }

    if (!deliveryFromDate && !deliveryToDate) {
      delete query.delivery_date;
    }

    // addRegexField(query, 'client_code', clientCode, isForInvoice ?? false);
    addRegexField(query, 'client_code', clientCode);
    addRegexField(query, 'task', task);

    console.log(query);

    const searchQuery: Query = { ...query };

    let sortQuery: Record<string, 1 | -1> = {
      receive_date: -1,
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
          { task: searchPattern! },
          // { folder_path: searchPattern! },
        ];
      }

      const count: number = await Schedule.countDocuments(searchQuery);
      let schedule: any[];

      if (paginated) {
        schedule = (await Schedule.aggregate([
          { $match: searchQuery },
          { $sort: sortQuery },
          { $skip: skip },
          { $limit: ITEMS_PER_PAGE },
        ])) as ScheduleDataType[];
      } else {
        schedule = await Schedule.find(searchQuery)
          .sort({
            receive_date: 1,
          })
          .lean();
      }

      console.log('SEARCH Query:', searchQuery);

      const pageCount: number = Math.ceil(count / ITEMS_PER_PAGE);

      if (!schedule) {
        return { data: 'Unable to retrieve schedules', status: 400 };
      } else {
        let scheduleData = {
          pagination: {
            count,
            pageCount,
          },
          items: schedule,
        };

        return { data: scheduleData, status: 200 };
      }
    }
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
};
