import { auth } from '@/auth';
import { dbConnect, getQuery } from '@/lib/utils';
import Employee, { EmployeeDataType } from '@/models/Employees';
import {
  addBooleanField,
  addIfDefined,
  addRegexField,
} from '@/utility/filterHelpers';
import moment from 'moment-timezone';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

dbConnect();

export interface RegexQuery {
  $regex: string;
  $options: string;
}

export interface Query {
  country?: RegexQuery;
  company_name?: RegexQuery;
  category?: RegexQuery;
  marketer_name?:
    | RegexQuery
    | { [key: string]: RegexQuery | string | undefined };
  // is_test?: boolean;
  is_prospected?: boolean;
  is_lead?: boolean;
  followup_done?: boolean;
  regular_client?: boolean;
  permanent_client?: boolean;
  onboard_date?: string | { [key: string]: RegexQuery | string | undefined };
  prospect_status?: RegexQuery;
  calling_date_history?: { [key: string]: any };
  test_given_date_history?: { [key: string]: any };
  $or?: { [key: string]: RegexQuery }[];
}

export type BooleanFields = Extract<
  keyof Query,
  | 'is_test'
  | 'is_prospected'
  | 'is_lead'
  | 'followup_done'
  | 'regular_client'
  | 'permanent_client'
>;
export type RegexFields = Extract<
  keyof Query,
  'country' | 'company_name' | 'category' | 'marketer_name' | 'prospect_status'
>;

async function handleGetAllEmployees(req: Request): Promise<{
  data: string | Object;
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

    const { generalSearchString } = filters;

    const query: Query = {};

    //   addIfDefined(query, 'role', filters.role);

    const searchQuery: Query = { ...query };

    let sortQuery: Record<string, 1 | -1> = {
      createdAt: -1,
    };

    if (!query && isFilter == true && !generalSearchString) {
      return { data: 'No filter applied', status: 400 };
    } else {
      const skip = (page - 1) * ITEMS_PER_PAGE;

      if (generalSearchString) {
        searchQuery['$or'] = [
          { real_name: { $regex: generalSearchString, $options: 'i' } },
          { name: { $regex: generalSearchString, $options: 'i' } },
        ];
      }

      const count: number = await Employee.countDocuments(searchQuery);
      let employees: any;

      if (paginated) {
        employees = await Employee.aggregate([
          { $match: searchQuery },
          { $sort: sortQuery },
          { $skip: skip },
          { $limit: ITEMS_PER_PAGE },
          {
            $project: {
              hasFollowupDate: 0, // Remove the added field from the final output
            },
          },
        ]);
      } else {
        employees = (await Employee.find(
          searchQuery,
        ).lean()) as EmployeeDataType[];
      }

      const pageCount: number = Math.ceil(count / ITEMS_PER_PAGE);

      if (!employees) {
        return { data: 'Unable to retrieve employees', status: 400 };
      } else {
        let employeesData = {
          pagination: {
            count,
            pageCount,
          },
          items: employees,
        };

        return { data: employeesData, status: 200 };
      }
    }
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
}

async function handleGetEmployeeById(req: Request): Promise<{
  data: string | Object;
  status: number;
}> {
  try {
    const { _id } = await req.json();

    const resData = await Employee.findById(_id).lean();

    if (resData) {
      return { data: resData, status: 200 };
    } else {
      return { data: 'Employee not found', status: 400 };
    }
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
}

export async function POST(req: Request) {
  let res: { data: string | Object | number; status: number };

  switch (getQuery(req).action) {
    case 'get-all-employees':
      res = await handleGetAllEmployees(req);
      return NextResponse.json(res.data, { status: res.status });
    default:
      return NextResponse.json({ response: 'OK' }, { status: 200 });
  }
}

export async function GET(req: Request) {
  let res: { data: string | Object | number; status: number };

  switch (getQuery(req).action) {
    case 'get-employee-by-id':
      res = await handleGetEmployeeById(req);
      return NextResponse.json(res.data, { status: res.status });
    default:
      return NextResponse.json({ response: 'OK' }, { status: 200 });
  }
}
