import cors from '@/lib/cors';
import { dbConnect, getQuery } from '@/lib/utils';
import Approval, { ApprovalDataType } from '@/models/Approvals';
import Client from '@/models/Clients';
import Employee from '@/models/Employees';
import Order from '@/models/Orders';
import Report from '@/models/Reports';
import User from '@/models/Users';
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
  req_type?: RegexQuery;
  req_by?: RegexQuery;
  checked_by?: { $ne?: string | boolean; $eq?: string | boolean };
  is_rejected?: { $eq?: boolean | string; $ne?: boolean | string };
  createdAt?: { $gte?: string; $lte?: string };
}

export type RegexFields = Extract<keyof Query, 'req_by' | 'req_type'>;

interface PaginatedData<ItemsType> {
  pagination: { count: number; pageCount: number };
  items: ItemsType;
}

// enum for request types
enum RequestType {
  UserDelete = 'User Delete',
  UserCreate = 'User Create',
  TaskDelete = 'Task Delete',
  ClientDelete = 'Client Delete',
  ReportDelete = 'Report Delete',
  EmployeeDelete = 'Employee Delete',
  ReportEdit = 'Report Edit',
}

async function handleNewRequest(
  req: NextRequest,
): Promise<{ data: string | Object; status: number }> {
  try {
    const data = await req.json();

    const resData = await Approval.create(data);

    if (resData) {
      console.log(resData);
      return { data: resData, status: 200 };
    } else {
      return { data: 'Unable to create new approval request', status: 400 };
    }
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
}

async function handleSingleResponse(req: NextRequest): Promise<{
  data: string | Object;
  status: number;
}> {
  try {
    const { id, response, checked_by } = await req.json();

    // Input validation
    if (!response || !checked_by || !id) {
      return { data: 'Invalid body data', status: 400 };
    }

    // Separate logic for reject and approve
    if (response === 'reject') {
      return handleRejectResponse({ checked_by, approval_id: id });
    }

    if (response === 'approve') {
      return handleApproveResponse({ checked_by, approval_id: id });
    }

    return { data: 'Invalid response type', status: 400 };
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
}

async function handleGetAllApprovals(req: NextRequest): Promise<{
  data: string | PaginatedData<ApprovalDataType[]>;
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

    const {
      reqBy,
      reqType,
      approvedCheck,
      rejectedCheck,
      waitingCheck,
      fromDate,
      toDate,
    } = filters;

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

    addRegexField(query, 'req_by', reqBy, true);
    addRegexField(query, 'req_type', reqType, true);

    if (approvedCheck) {
      query.is_rejected = { $eq: false };
      query.checked_by = { $ne: 'None' };
    }
    if (rejectedCheck) {
      query.is_rejected = { $eq: true };
      query.checked_by = { $ne: 'None' };
    }
    if (waitingCheck) {
      query.checked_by = { $eq: 'None' };
    }

    console.log(query);

    const searchQuery: Query = { ...query };

    let sortQuery: Record<string, 1 | -1> = {
      sortPriority: 1,
      createdAt: -1,
    };

    if (!query && isFilter == true) {
      return { data: 'No filter applied', status: 400 };
    } else {
      const skip = (page - 1) * ITEMS_PER_PAGE;

      const count: number = await Approval.countDocuments(searchQuery);
      let approvals: ApprovalDataType[];

      if (paginated) {
        approvals = (await Approval.aggregate([
          { $match: query },
          {
            $addFields: {
              // Create a priority field for sorting
              sortPriority: {
                $cond: {
                  if: { $eq: ['$checked_by', 'None'] },
                  then: 0, // Highest priority for unchecked items
                  else: 1, // Lower priority for checked items
                },
              },
            },
          },
          { $sort: sortQuery },
          { $skip: skip },
          { $limit: ITEMS_PER_PAGE },
        ])) as ApprovalDataType[];
      } else {
        approvals = (await Approval.find(searchQuery)
          .sort({
            createdAt: -1,
          })
          .lean()) as ApprovalDataType[];
      }

      console.log('SEARCH Query:', searchQuery);

      const pageCount: number = Math.ceil(count / ITEMS_PER_PAGE);

      if (!approvals) {
        return { data: 'Unable to retrieve approvals', status: 400 };
      } else {
        let approvalsData = {
          pagination: {
            count,
            pageCount,
          },
          items: approvals,
        };

        return { data: approvalsData, status: 200 };
      }
    }
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
}

async function handleMultipleResponse(req: NextRequest): Promise<{
  data: string | Object;
  status: number;
}> {
  try {
    const {
      response,
      checked_by,
      approval_ids,
    }: {
      response: string;
      checked_by: string;
      approval_ids: string[];
    } = await req.json();

    // Input validation
    if (!response || !checked_by) {
      return { data: 'Invalid body data', status: 400 };
    }

    if (approval_ids.length === 0) {
      return { data: 'No approval IDs provided', status: 400 };
    }

    // Separate logic for reject and approve
    if (response === 'reject') {
      return handleRejectResponse({ checked_by, approval_ids });
    }

    if (response === 'approve') {
      return handleApproveResponse({ checked_by, approval_ids });
    }

    return { data: 'Invalid response type', status: 400 };
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
}

async function handleRejectResponse(data: {
  checked_by: string;
  approval_ids?: string[];
  approval_id?: string;
}): Promise<{
  data: string | Object;
  status: number;
}> {
  try {
    if (
      (!Array.isArray(data.approval_ids) || data.approval_ids.length === 0) &&
      !data.approval_id
    ) {
      return { data: 'No approval ID provided', status: 400 };
    }

    const ids = data.approval_ids?.length
      ? data.approval_ids
      : [data.approval_id!];

    const updatedApprovals = await Approval.updateMany(
      { _id: { $in: ids } },
      {
        checked_by: data.checked_by,
        is_rejected: true,
      },
    );

    if (updatedApprovals.modifiedCount > 0) {
      return { data: updatedApprovals, status: 200 };
    }

    return { data: 'No approvals were updated', status: 400 };
  } catch (e) {
    console.error('Error in handleRejectResponse:', e);
    return { data: `An error occurred`, status: 500 };
  }
}

async function handleApproveResponse(data: {
  checked_by: string;
  approval_ids?: string[];
  approval_id?: string;
  [key: string]: string | string[] | undefined | number;
}): Promise<{
  data: string | Object;
  status: number;
}> {
  try {
    if (
      (!Array.isArray(data.approval_ids) || data.approval_ids.length === 0) &&
      !data.approval_id
    ) {
      return { data: 'No approval ID provided', status: 400 };
    }

    const ids = data.approval_ids?.length
      ? data.approval_ids
      : [data.approval_id!];

    const approvalPromises = ids.map(async (approval_ID: string) => {
      const approvalData: ApprovalDataType | null =
        await Approval.findById(approval_ID).lean();

      if (!approvalData) {
        throw new Error(`Approval not found for ID: ${approval_ID}`);
      }

      let resData;
      switch (approvalData.req_type) {
        case RequestType.UserDelete:
          resData = await User.findByIdAndDelete(approvalData.id);
          break;
        case RequestType.UserCreate:
          resData = await User.findOneAndUpdate(
            { name: approvalData.name },
            {
              real_name: approvalData.real_name,
              name: approvalData.name,
              password: approvalData.password,
              role: approvalData.role,
              comment: approvalData.comment,
              provided_name: approvalData.provided_name,
            },
            { new: true, upsert: true },
          );
          break;
        case RequestType.TaskDelete:
          resData = await Order.findByIdAndDelete(approvalData.id);
          break;
        case RequestType.ClientDelete:
          resData = await Client.findByIdAndDelete(approvalData.id);
          break;
        case RequestType.ReportDelete:
          resData = await Report.findByIdAndDelete(approvalData.id);
          break;
        case RequestType.EmployeeDelete:
          resData = await Employee.findByIdAndDelete(approvalData.id);
          break;
        case RequestType.ReportEdit:
          const editData = {
            ...approvalData,
            _id: undefined,
            req_type: undefined,
            req_by: undefined,
            checked_by: undefined,
            is_rejected: undefined,
            id: undefined,
            createdAt: undefined,
            updatedAt: undefined,
          };
          resData = await Report.findByIdAndUpdate(approvalData.id, editData, {
            new: true,
          });
          break;
        default:
          throw new Error(`Unsupported request type: ${approvalData.req_type}`);
      }

      if (!resData) {
        throw new Error(
          `Failed to process ${approvalData.req_type} for ID: ${approvalData.id}`,
        );
      }

      // Update approval status
      return Approval.findByIdAndUpdate(
        data._id,
        {
          checked_by: data.checked_by,
          is_rejected: false,
        },
        { new: true },
      );
    });

    const results = await Promise.all(approvalPromises);
    return { data: results, status: 200 };
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
}

export async function POST(req: NextRequest) {
  let res: { data: any; status: number };

  switch (getQuery(req).action) {
    case 'new-request':
      res = await handleNewRequest(req);
      return NextResponse.json(res.data, { status: res.status });
    case 'single-response':
      res = await handleSingleResponse(req);
      return NextResponse.json(res.data, { status: res.status });
    case 'multiple-response':
      res = await handleMultipleResponse(req);
      return NextResponse.json(res.data, { status: res.status });
    default:
      return NextResponse.json({ response: 'OK' }, { status: 200 });
  }
}

export async function GET(req: NextRequest) {
  let res: { data: any; status: number };

  switch (getQuery(req).action) {
    case 'get-all-approvals':
      res = await handleGetAllApprovals(req);
      return NextResponse.json(res.data, { status: res.status });
    default:
      return NextResponse.json({ response: 'OK' }, { status: 200 });
  }
}

export async function OPTIONS(request: Request) {
  return cors(
    request,
    new Response(null, {
      status: 204,
    }),
  );
}
