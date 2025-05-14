import Role from '@/models/Roles';
import { addIfDefined, createRegexQuery } from '@/utility/filterHelpers';
import { headers } from 'next/headers';
import { NextRequest } from 'next/server';

export interface Query {
  name?: string;
}

export async function handleGetAllRoles(req: NextRequest): Promise<{
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

    const query: Query = {};

    addIfDefined(query, 'name', createRegexQuery(filters.name));

    const searchQuery: Query = { ...query };

    let sortQuery: Record<string, 1 | -1> = {
      createdAt: -1,
    };

    if (!query && isFilter == true) {
      return { data: 'No filter applied', status: 400 };
    } else {
      const skip = (page - 1) * ITEMS_PER_PAGE;

      const count: number = await Role.countDocuments(searchQuery);
      let roles: any;

      if (paginated) {
        roles = await Role.aggregate([
          { $match: searchQuery },
          { $sort: sortQuery },
          { $skip: skip },
          { $limit: ITEMS_PER_PAGE },
        ]);
      } else {
        roles = await Role.find(searchQuery).lean();
      }

      const pageCount: number = Math.ceil(count / ITEMS_PER_PAGE);

      if (!roles) {
        return { data: 'Unable to retrieve roles', status: 400 };
      } else {
        let rolesData = {
          pagination: {
            count,
            pageCount,
          },
          items: roles,
        };

        return { data: rolesData, status: 200 };
      }
    }
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
}
