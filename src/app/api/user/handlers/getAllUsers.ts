import { auth } from '@/auth';
import User, { UserDataType } from '@/models/Users';
import { headers } from 'next/headers';
import { NextRequest } from 'next/server';

export interface RegexQuery {
  $regex: string;
  $options: string;
}

export interface Query {
  role?: string;
  $or?: { [key: string]: RegexQuery }[];
}

interface PaginatedData<ItemsType> {
  pagination: { count: number; pageCount: number };
  items: ItemsType;
}

export const handleGetAllUsers = async (
  req: NextRequest,
): Promise<{
  data: string | PaginatedData<UserDataType[]>;
  status: number;
}> => {
  try {
    const session = await auth();
    if (!session) return { data: 'Unauthorized', status: 401 };
    const viewerPerms = new Set(session.user.permissions || []);
    const viewerIsSuper = viewerPerms.has('settings:the_super_admin' as any);

    const headersList = await headers();
    const page: number = Number(headersList.get('page')) || 1;
    const ITEMS_PER_PAGE: number =
      Number(headersList.get('items_per_page')) || 30;
    const isFilter: boolean = headersList.get('filtered') === 'true';
    const paginated: boolean = headersList.get('paginated') === 'true';

    const filters = await req.json();

    const { generalSearchString } = filters;

    const query: Query = {};

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

      // Build aggregate-based count if we need to filter super-admin users
      let count: number;
      if (paginated) {
        const countPipeline: any[] = [
          { $match: searchQuery },
          {
            $lookup: {
              from: 'roles',
              localField: 'role_id',
              foreignField: '_id',
              as: 'role',
            },
          },
          { $unwind: '$role' },
        ];
        if (!viewerIsSuper) {
          countPipeline.push({
            $match: { 'role.permissions': { $ne: 'settings:the_super_admin' } },
          });
        }
        countPipeline.push({ $count: 'count' });
        const counted = await User.aggregate(countPipeline);
        count = counted[0]?.count || 0;
      } else {
        // Fallback count
        count = await User.countDocuments(searchQuery);
      }
      let users: any;

      if (paginated) {
        const pipeline: any[] = [
          { $match: searchQuery },
          { $sort: sortQuery },
          { $skip: skip },
          { $limit: ITEMS_PER_PAGE },
          {
            $lookup: {
              from: 'roles', // the MongoDB collection name, usually lowercase plural of the model
              localField: 'role_id',
              foreignField: '_id',
              as: 'role',
            },
          },
          { $unwind: '$role' }, // optional: flattens role array if only one role per user
        ];
        if (!viewerIsSuper) {
          pipeline.push({
            $match: { 'role.permissions': { $ne: 'settings:the_super_admin' } },
          });
        }
        users = await User.aggregate(pipeline);
      } else {
        users = await User.find(searchQuery)
          .populate('role_id', 'name description permissions')
          .lean();
        if (!viewerIsSuper) {
          users = users.filter(
            (u: any) =>
              !(u?.role_id?.permissions || []).includes(
                'settings:the_super_admin',
              ),
          );
        }
      }

      const pageCount: number = Math.ceil(count / ITEMS_PER_PAGE);

      if (!users) {
        return { data: 'Unable to retrieve users', status: 400 };
      } else {
        // Never leak raw passwords to non-super-admins
        const safeItems = users.map((u: any) => {
          if (!viewerIsSuper) {
            if ('password' in u) {
              // mask but keep shape
              return { ...u, password: '******' };
            }
          }
          return u;
        });

        let usersData = {
          pagination: {
            count,
            pageCount,
          },
          items: safeItems,
        };

        return { data: usersData, status: 200 };
      }
    }
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
};
