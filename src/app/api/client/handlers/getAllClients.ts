import Client, { ClientDataType } from '@/models/Clients';
import { addIfDefined, createRegexQuery } from '@/utility/filterHelpers';
import { headers } from 'next/headers';
import { NextRequest } from 'next/server';

export interface RegexQuery {
  $regex: string;
  $options: string;
}

export interface Query {
  client_code?: RegexQuery;
  country?: RegexQuery;
  contact_person?: RegexQuery;
  marketer?: RegexQuery;
  category?: RegexQuery;
  $or?: { [key: string]: RegexQuery }[];
}

export type RegexFields = Extract<
  keyof Query,
  'country' | 'client_code' | 'contact_person' | 'marketer' | 'category'
>;

interface PaginatedData<ItemsType> {
  pagination: { count: number; pageCount: number };
  items: ItemsType;
}

export async function handleGetAllClients(req: NextRequest): Promise<{
  data: string | PaginatedData<ClientDataType[]>;
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
      countryName,
      clientCode,
      contactPerson,
      marketerName,
      category,
      generalSearchString,
    } = filters;

    let query: Query = {};

    addIfDefined(query, 'country', createRegexQuery(countryName));
    addIfDefined(query, 'client_code', createRegexQuery(clientCode));
    addIfDefined(query, 'contact_person', createRegexQuery(contactPerson));
    addIfDefined(query, 'marketer', createRegexQuery(marketerName));
    addIfDefined(query, 'category', createRegexQuery(category));

    const searchQuery: Query = { ...query };

    if (!query && isFilter == true && !generalSearchString) {
      return { data: 'No filter applied', status: 400 };
    } else {
      const skip = (page - 1) * ITEMS_PER_PAGE;

      if (generalSearchString) {
        const searchPattern = createRegexQuery(generalSearchString);

        searchQuery['$or'] = [
          { client_code: searchPattern! },
          { country: searchPattern! },
          { marketer: searchPattern! },
          { category: searchPattern! },
          { client_name: searchPattern! },
          { contact_person: searchPattern! },
          { email: searchPattern! },
        ];
      }

      const count: number = await Client.countDocuments(searchQuery);
      let clients: any[];

      if (paginated) {
        clients = (await Client.aggregate([
          { $match: searchQuery },
          {
            $addFields: {
              clientNumber: {
                $convert: {
                  input: { $substr: ['$client_code', 0, 4] },
                  to: 'int',
                  onError: 0,
                  onNull: 0,
                },
              },
            },
          },
          { $sort: { clientNumber: 1 } },
          { $skip: skip },
          { $limit: ITEMS_PER_PAGE },
          { $unset: 'clientNumber' },
        ])) as any[];
      } else {
        clients = await Client.aggregate([
          { $match: searchQuery },
          {
            $addFields: {
              clientNumber: {
                $convert: {
                  input: { $substr: ['$client_code', 0, 4] },
                  to: 'int',
                  onError: 0,
                  onNull: 0,
                },
              },
            },
          },
          { $sort: { clientNumber: 1 } },
          { $unset: 'clientNumber' },
        ]);
      }

      const pageCount: number = Math.ceil(count / ITEMS_PER_PAGE);

      if (!clients) {
        return { data: 'Unable to retrieve clients', status: 400 };
      } else {
        let clientsData = {
          pagination: {
            count,
            pageCount,
          },
          items: clients,
        };

        return { data: clientsData, status: 200 };
      }
    }
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
}
