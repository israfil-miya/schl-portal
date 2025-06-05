import { dbConnect, getQuery } from '@/lib/utils';
import Approval, { ApprovalDataType } from '@/models/Approvals';
import Client from '@/models/Clients';
import Employee from '@/models/Employees';
import Order from '@/models/Orders';
import Report from '@/models/Reports';
import Schedule from '@/models/Schedule';
import User from '@/models/Users';
import { toISODate } from '@/utility/date';
import { createRegexQuery } from '@/utility/filterHelpers';
import mongoose from 'mongoose';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

dbConnect();

interface PaginatedData<ItemsType> {
  pagination: { count: number; pageCount: number };
  items: ItemsType;
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

    // Find user ID for reqBy filter (since reqBy is always a string)
    let reqById: mongoose.Types.ObjectId | null = null;
    if (reqBy) {
      const user = (await User.findOne({
        real_name: createRegexQuery(reqBy),
      }).select('_id')) as {
        _id: mongoose.Types.ObjectId;
      } | null;
      reqById = user ? user._id : null;
    }

    let query: Record<string, any> = {};

    if (fromDate || toDate) {
      query.createdAt = {
        ...(fromDate && { $gte: toISODate(fromDate) }),
        ...(toDate && { $lte: toISODate(toDate, 23, 59, 59, 999) }),
      };
    }

    if (!fromDate && !toDate) {
      delete query.createdAt;
    }

    const orConditions: any[] = [];

    if (approvedCheck) {
      orConditions.push({ status: 'approved' });
    }
    if (rejectedCheck) {
      orConditions.push({ status: 'rejected' });
    }
    if (waitingCheck) {
      orConditions.push({ status: 'pending' });
    }

    if (orConditions.length > 0) {
      query.$or = orConditions;
    }

    if (reqType) {
      const action = reqType.split(' ')[1].toLowerCase();
      const model = reqType.split(' ')[0];
      query.target_model = model;
      query.action = action;
    }

    if (reqBy && reqById) {
      query.req_by = reqById;
    } else if (reqBy && !reqById) {
      // If reqBy is provided but no user is found, force no matches
      query.req_by = null;
    }

    const searchQuery: Record<string, any> = { ...query };

    let sortQuery: Record<string, 1 | -1> = {
      sortPriority: 1,
      createdAt: -1,
    };

    if (Object.keys(searchQuery).length === 0 && isFilter) {
      return { data: 'No filter applied', status: 400 };
    }

    const skip = (page - 1) * ITEMS_PER_PAGE;
    const count: number = await Approval.countDocuments(searchQuery);
    let approvals: any[];

    if (paginated) {
      approvals = await Approval.aggregate([
        { $match: searchQuery },
        {
          $lookup: {
            from: 'users',
            let: { reqById: '$req_by' },
            pipeline: [
              { $match: { $expr: { $eq: ['$_id', '$$reqById'] } } },
              { $project: { _id: 0, real_name: 1 } },
            ],
            as: 'req_by',
          },
        },
        {
          $unwind: {
            path: '$req_by',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'users',
            let: { revById: '$rev_by' },
            pipeline: [
              { $match: { $expr: { $eq: ['$_id', '$$revById'] } } },
              { $project: { _id: 0, real_name: 1 } },
            ],
            as: 'rev_by',
          },
        },
        {
          $unwind: {
            path: '$rev_by',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $addFields: {
            sortPriority: {
              $cond: {
                if: { $eq: ['$status', 'pending'] },
                then: 0,
                else: 1,
              },
            },
          },
        },
        { $sort: sortQuery },
        { $skip: skip },
        { $limit: ITEMS_PER_PAGE },
      ]);
    } else {
      approvals = await Approval.find(searchQuery)
        .populate('req_by', 'name -_id')
        .populate('rev_by', 'name -_id')
        .sort({ createdAt: -1 })
        .lean();
    }

    if (!approvals) {
      return { data: 'Unable to retrieve approvals', status: 400 };
    }

    const pageCount: number = Math.ceil(count / ITEMS_PER_PAGE);
    const approvalsData = {
      pagination: { count, pageCount },
      items: approvals,
    };

    return { data: approvalsData, status: 200 };
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
}

async function handleNewRequest(
  req: NextRequest,
): Promise<{ data: string | Object; status: number }> {
  try {
    const data = await req.json();

    const allowedModels = [
      'User',
      'Report',
      'Employee',
      'Order',
      'Client',
      'Schedule',
    ];
    if (!data.target_model || !allowedModels.includes(data.target_model)) {
      return { data: 'Invalid or missing target model', status: 400 };
    }

    console.log('APPROVAL REQUEST:', data);

    // Create a new approval request using the revised field names
    const resData = await Approval.create(data);

    if (resData) {
      console.log('Created Approval Request:', resData);
      return { data: resData, status: 200 };
    } else {
      return { data: 'Unable to create new approval request', status: 400 };
    }
  } catch (e) {
    console.error('Error creating approval request:', e);
    return { data: 'An error occurred', status: 500 };
  }
}

async function handleSingleResponse(req: NextRequest): Promise<{
  data: string | Object;
  status: number;
}> {
  try {
    const {
      _id,
      response,
      rev_by,
    }: {
      _id: string;
      response: 'reject' | 'approve';
      rev_by: string;
    } = await req.json();

    // Input validation
    if (!response || !rev_by || !_id) {
      return { data: 'Invalid body data', status: 400 };
    }

    if (response === 'reject') {
      return handleRejectResponse({
        checked_by: rev_by,
        approval_id: _id,
      });
    }

    if (response === 'approve') {
      return handleApproveResponse({
        checked_by: rev_by,
        approval_id: _id,
      });
    }

    return { data: 'Invalid response type', status: 400 };
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
      _ids,
      response,
      rev_by,
    }: {
      _ids: string[];
      response: 'reject' | 'approve';
      rev_by: string;
    } = await req.json();

    // Input validation
    if (
      !response ||
      !rev_by ||
      !_ids ||
      !Array.isArray(_ids) ||
      _ids.length === 0
    ) {
      return { data: 'Invalid body data', status: 400 };
    }

    // Separate logic for reject and approve
    if (response === 'reject') {
      return handleRejectResponse({ checked_by: rev_by, approval_ids: _ids });
    }

    if (response === 'approve') {
      return handleApproveResponse({
        checked_by: rev_by,
        approval_ids: _ids,
      });
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

    // Validate ObjectIds
    if (!ids.every(id => mongoose.Types.ObjectId.isValid(id))) {
      return { data: 'Invalid approval id format', status: 400 };
    }
    if (!mongoose.Types.ObjectId.isValid(data.checked_by)) {
      return { data: 'Invalid revised by id format', status: 400 };
    }

    const updatedApprovals = await Approval.updateMany(
      { _id: { $in: ids } },
      {
        status: 'rejected',
        rev_by: data.checked_by,
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

    // Validate ObjectIds
    if (!ids.every(id => mongoose.Types.ObjectId.isValid(id))) {
      return { data: 'Invalid approval id format', status: 400 };
    }
    if (!mongoose.Types.ObjectId.isValid(data.checked_by)) {
      return { data: 'Invalid revised by id format', status: 400 };
    }

    const results = await Promise.allSettled(
      ids.map(async (approval_ID: string) => {
        const approvalData = await Approval.findById(approval_ID).lean();

        if (!approvalData) {
          throw new Error(`Approval request not found for ID: ${approval_ID}`);
        }

        let resData;
        switch (approvalData.target_model) {
          case 'User':
            if (approvalData.action === 'create') {
              resData = await User.create(approvalData.new_data);
            } else if (approvalData.action === 'delete') {
              resData = await User.findByIdAndDelete(approvalData.object_id);
            }
            break;
          case 'Order':
            if (approvalData.action === 'delete') {
              resData = await Order.findByIdAndDelete(approvalData.object_id);
            }
            break;
          case 'Client':
            if (approvalData.action === 'delete') {
              resData = await Client.findByIdAndDelete(approvalData.object_id);
            }
            break;
          case 'Schedule':
            if (approvalData.action === 'delete') {
              resData = await Schedule.findByIdAndDelete(
                approvalData.object_id,
              );
            }
            break;
          case 'Report':
            if (approvalData.action === 'delete') {
              resData = await Report.findByIdAndDelete(approvalData.object_id);
            } else if (approvalData.action === 'update') {
              resData = await Report.findByIdAndUpdate(
                approvalData.object_id,
                approvalData.changes?.reduce<Record<string, any>>(
                  (acc, change) => {
                    acc[change.field] = change.newValue;
                    return acc;
                  },
                  {},
                ),
                {
                  new: true,
                },
              );
            }
            break;
          case 'Employee':
            if (approvalData.action === 'delete') {
              resData = await Employee.findByIdAndDelete(
                approvalData.object_id,
              );
            }
            break;
          default:
            throw new Error(
              `Unsupported request type: ${approvalData.target_model} ${approvalData.action}`,
            );
        }

        if (!resData) {
          return {
            data: `Failed to process ${approvalData.target_model} ${approvalData.action}`,
            status: 400,
          };
        }

        console.log('APPROVAL RESPONSE: ', resData);

        // Actually await the update and return the updated approval
        const updatedApproval = await Approval.findByIdAndUpdate(
          approval_ID,
          {
            status: 'approved',
            rev_by: data.checked_by,
          },
          { new: true },
        );

        return updatedApproval;
      }),
    );

    const successful = results
      .filter(r => r.status === 'fulfilled')
      .map(r => r.value);
    const errors = results.filter(
      r =>
        r.status === 'rejected' ||
        (r.status === 'fulfilled' && r.value && 'error' in r.value),
    );

    if (successful.length === 0) {
      return {
        data: errors.map(e => (e.status === 'fulfilled' ? e.value : e.reason)),
        status: 400,
      };
    }

    return {
      data: {
        successful,
        errors: errors.map(e =>
          e.status === 'fulfilled' ? e.value : e.reason,
        ),
      },
      status: errors.length ? 207 : 200,
    }; // 207 for partial success
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
      return NextResponse.json(res.data, {
        status: res.status,
      });
    case 'single-response':
      res = await handleSingleResponse(req);
      return NextResponse.json(res.data, { status: res.status });
    case 'multiple-response':
      res = await handleMultipleResponse(req);
      return NextResponse.json(res.data, { status: res.status });
    case 'get-all-approvals':
      res = await handleGetAllApprovals(req);
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
