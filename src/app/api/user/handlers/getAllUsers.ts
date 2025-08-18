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

      const count: number = await User.countDocuments(searchQuery);
      let users: any;

      if (paginated) {
        users = await User.aggregate([
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
        ]);
      } else {
        users = await User.find(searchQuery)
          .populate('role_id', 'name description permissions')
          .lean();
      }

      const pageCount: number = Math.ceil(count / ITEMS_PER_PAGE);

      if (!users) {
        return { data: 'Unable to retrieve users', status: 400 };
      } else {
        let usersData = {
          pagination: {
            count,
            pageCount,
          },
          items: users,
        };

        return { data: usersData, status: 200 };
      }
    }
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
};
