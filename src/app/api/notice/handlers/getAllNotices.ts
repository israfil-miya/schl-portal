import Notice, { NoticeDataType } from '@/models/Notices';
import { toISODate } from '@/utility/date';
import { addRegexField, createRegexQuery } from '@/utility/filterHelpers';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export interface RegexQuery {
  $regex: string;
  $options: string;
}

export interface Query {
  channel?: RegexQuery;
  title?: RegexQuery;
  notice_no?: RegexQuery;
  createdAt?: { $gte?: string; $lte?: string };
}

export type RegexFields = Extract<
  keyof Query,
  'channel' | 'title' | 'notice_no'
>;

interface PaginatedData<ItemsType> {
  pagination: { count: number; pageCount: number };
  items: ItemsType;
}

export const handleGetAllNotices = async (
  req: NextRequest,
): Promise<{
  data: string | PaginatedData<NoticeDataType[]>;
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

    const { channel, title, noticeNo, fromDate, toDate } = filters;

    let query: Query = {};

    if (fromDate || toDate) {
      query.createdAt = {};
      query.createdAt = {
        ...(fromDate && { $gte: toISODate(fromDate) }),
        ...(toDate && { $lte: toISODate(toDate, 23, 59, 59, 999) }),
      };
    }

    if (!fromDate && !toDate) {
      delete query.createdAt;
    }

    addRegexField(query, 'channel', channel, true);
    addRegexField(query, 'notice_no', noticeNo, true);
    addRegexField(query, 'title', title);

    console.log(query);

    const searchQuery: Query = { ...query };

    let sortQuery: Record<string, 1 | -1> = {
      createdAt: -1,
    };

    if (!query && isFilter == true) {
      return { data: 'No filter applied', status: 400 };
    } else {
      const skip = (page - 1) * ITEMS_PER_PAGE;

      const count: number = await Notice.countDocuments(searchQuery);
      let notices: any[];

      if (paginated) {
        notices = (await Notice.aggregate([
          { $match: searchQuery },
          { $sort: sortQuery },
          { $skip: skip },
          { $limit: ITEMS_PER_PAGE },
        ])) as NoticeDataType[];
      } else {
        notices = await Notice.find(searchQuery)
          .sort({
            createdAt: -1,
          })
          .lean();
      }

      console.log('SEARCH Query:', searchQuery);

      const pageCount: number = Math.ceil(count / ITEMS_PER_PAGE);

      if (!notices) {
        return { data: 'Unable to retrieve notices', status: 400 };
      } else {
        let noticesData = {
          pagination: {
            count,
            pageCount,
          },
          items: notices,
        };

        return { data: noticesData, status: 200 };
      }
    }
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
};
