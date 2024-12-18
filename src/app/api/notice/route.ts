import { dbConnect, getQuery } from '@/lib/utils';
import Notice, { NoticeDataType } from '@/models/Notices';
import { toISODate } from '@/utility/date';
import { addRegexField } from '@/utility/filterHelpers';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
dbConnect();

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

async function handleGetAllNotices(req: NextRequest): Promise<{
  data: string | PaginatedData<NoticeDataType[]>;
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
          { $match: query },
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
}

async function handleGetNotice(req: Request): Promise<{
  data: string | Object;
  status: number;
}> {
  try {
    const headersList = await headers();
    const notice_no: string | null = headersList.get('notice_no');
    if (!notice_no) {
      return { data: 'Notice number not provided', status: 400 };
    }
    const notice = await Notice.findOne({ notice_no }).lean();
    if (!notice) {
      return { data: 'Notice not found', status: 404 };
    } else {
      return { data: notice, status: 200 };
    }
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
}

async function handleCreateNotice(req: NextRequest): Promise<{
  data: string | Object;
  status: number;
}> {
  try {
    const data = await req.json();
    const docCount = await Notice.countDocuments({ notice_no: data.notice_no });

    if (docCount > 0) {
      return {
        data: 'Notice with the same notice number already exists',
        status: 400,
      };
    } else {
      const noticeData = await Notice.create(data);
      if (noticeData) {
        return { data: noticeData, status: 200 };
      } else {
        return { data: 'Unable to create notice', status: 400 };
      }
    }
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
}

async function handleDeleteNotice(req: NextRequest): Promise<{
  data: string;
  status: number;
}> {
  try {
    const { notice_id } = await req.json();

    if (!notice_id) {
      return { data: 'Notice ID not provided', status: 400 };
    }

    let resData = await Notice.findByIdAndDelete(notice_id);

    if (resData) {
      return { data: 'Deleted the notice successfully', status: 200 };
    } else {
      return { data: 'Unable to delete the notice', status: 400 };
    }
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
}

async function handleEditNotice(req: NextRequest): Promise<{
  data: string | Object;
  status: number;
}> {
  try {
    const headersList = await headers();
    let data = await req.json();
    const updatedBy = headersList.get('updated_by');
    const { _id } = data;
    delete data._id;

    console.log(data);

    const resData = await Notice.findByIdAndUpdate(
      _id,
      {
        ...data,
        updated_by: updatedBy,
      },
      {
        new: true,
      },
    );

    if (resData) {
      return { data: 'Updated the notice data successfully', status: 200 };
    } else {
      return { data: 'Notice not found', status: 400 };
    }
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
}

export async function POST(req: NextRequest) {
  let res: { data: string | Object; status: number };
  switch (getQuery(req).action) {
    case 'get-all-notices':
      res = await handleGetAllNotices(req);
      return NextResponse.json(res.data, { status: res.status });
    case 'edit-notice':
      res = await handleEditNotice(req);
      return NextResponse.json(res.data, { status: res.status });
    case 'delete-notice':
      res = await handleDeleteNotice(req);
      return NextResponse.json(res.data, { status: res.status });
    case 'create-notice':
      res = await handleCreateNotice(req);
      return NextResponse.json(res.data, { status: res.status });
    default:
      return NextResponse.json({ response: 'OK' }, { status: 200 });
  }
}

export async function GET(req: NextRequest) {
  let res: { data: string | Object; status: number };
  switch (getQuery(req).action) {
    case 'get-notice':
      res = await handleGetNotice(req);
      return NextResponse.json(res.data, { status: res.status });
    default:
      return NextResponse.json({ response: 'OK' }, { status: 200 });
  }
}
