import Approval, { ApprovalDataType } from '@/models/Approvals';
import User from '@/models/Users';
import { toISODate } from '@/utility/date';
import { createRegexQuery } from '@/utility/filterHelpers';
import mongoose from 'mongoose';
import { headers } from 'next/headers';
import { NextRequest } from 'next/server';

interface PaginatedData<ItemsType> {
  pagination: { count: number; pageCount: number };
  items: ItemsType;
}

export const handleGetAllApprovals = async (
  req: NextRequest,
): Promise<{
  data: string | PaginatedData<ApprovalDataType[]>;
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
};
