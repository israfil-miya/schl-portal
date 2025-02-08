import { dbConnect, getQuery } from '@/lib/utils';
import Client, { ClientDataType } from '@/models/Clients';
import Report from '@/models/Reports';
import {
  addBooleanField,
  addIfDefined,
  addRegexField,
  createRegexQuery,
} from '@/utility/filterHelpers';
import moment from 'moment-timezone';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
dbConnect();

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
}

export type RegexFields = Extract<
  keyof Query,
  'country' | 'client_code' | 'contact_person' | 'marketer' | 'category'
>;

async function handleCreateClient(req: NextRequest): Promise<{
  data: string | Record<string, number>;
  status: number;
}> {
  try {
    const data: ClientDataType = await req.json();

    console.log('Received data:', data);

    const docCount = await Client.countDocuments({
      client_code: data.client_code.trim(),
    });

    if (docCount > 0) {
      return { data: 'Client with the same code already exists', status: 400 };
    }

    const resData = await Client.create(data);

    if (resData) {
      return { data: 'Added the client successfully', status: 200 };
    } else {
      return { data: 'Unable to add new client', status: 400 };
    }
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
}

async function handleConvertToPermanent(req: NextRequest): Promise<{
  data: string | Record<string, number>;
  status: number;
}> {
  try {
    const data: ClientDataType = await req.json();

    console.log('Received data:', data);

    const resData = await Client.findOneAndUpdate(
      { client_code: data.client_code },
      data,
      {
        new: true,
        upsert: true,
      },
    );

    if (resData) {
      const reportData = await Report.findOneAndUpdate(
        { company_name: data.client_name, is_lead: false },
        { $set: { permanent_client: true } },
        {
          new: true,
          upsert: true,
        },
      );

      if (reportData) {
        console.log('Added the client successfully', reportData);
        return { data: 'Added the client successfully', status: 200 };
      }
      return { data: 'Unable to add new client', status: 400 };
    } else {
      return { data: 'Unable to add new client', status: 400 };
    }
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
}

async function handleGetAllClients(req: NextRequest): Promise<{
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

    const { countryName, clientCode, contactPerson, marketerName, category } =
      filters;

    let query: Query = {};

    addIfDefined(query, 'country', countryName);
    addIfDefined(query, 'client_code', clientCode);
    addIfDefined(query, 'contact_person', contactPerson);
    addIfDefined(query, 'marketer', marketerName);
    addIfDefined(query, 'category', category);

    console.log(query);

    const searchQuery: Query = { ...query };

    if (!query && isFilter == true) {
      return { data: 'No filter applied', status: 400 };
    } else {
      const skip = (page - 1) * ITEMS_PER_PAGE;
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
                  onError: 0, // Defaults to 0 if conversion fails
                  onNull: 0, // Defaults to 0 if the input is null
                },
              },
            },
          },
          { $sort: { clientNumber: 1 } },
          { $skip: skip },
          { $limit: ITEMS_PER_PAGE },
          { $unset: 'clientNumber' },
        ])) as ClientDataType[];
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

      console.log('SEARCH Query:', searchQuery);

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

async function handleEditClient(req: NextRequest): Promise<{
  data: string | Object;
  status: number;
}> {
  let data = await req.json();
  const headersList = await headers();

  const updated_by = headersList.get('updated_by');
  data = { ...data, updated_by };

  console.log('Received edit request with data:', data);

  try {
    const resData = await Client.findByIdAndUpdate(data._id, data, {
      new: true,
    });

    if (resData) {
      return { data: 'Updated the client successfully', status: 200 };
    } else {
      return { data: 'Unable to update the client', status: 400 };
    }
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
}

async function handleGetClientByCode(req: NextRequest): Promise<{
  data: string | Object;
  status: number;
}> {
  try {
    const headersList = await headers();
    let client_code = headersList.get('client_code');

    const client = await Client.findOne({
      client_code,
    }).lean();

    if (client) {
      return { data: client, status: 200 };
    } else {
      return { data: 'No client found with the code', status: 400 };
    }
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
}

async function handleGetClientById(req: NextRequest): Promise<{
  data: string | Object;
  status: number;
}> {
  try {
    const headersList = await headers();
    let client_id = headersList.get('client_id');

    const client = await Client.findById(client_id).lean();

    if (client) {
      return { data: client, status: 200 };
    } else {
      return { data: 'No client found with the id', status: 400 };
    }
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
}

async function handleDeleteClient(req: NextRequest): Promise<{
  data: string | Object;
  status: number;
}> {
  let { client_id }: { client_id: string } = await req.json();

  try {
    const resData = await Client.findByIdAndDelete(client_id);
    if (resData) {
      const reportData = await Report.findOne({
        is_lead: false,
        company_name: createRegexQuery(resData.client_name.trim()),
      });

      if (reportData) {
        reportData.permanent_client = false;
        await reportData.save();
      }

      return { data: 'Deleted the client successfully', status: 200 };
    } else {
      return { data: 'Unable to delete the client', status: 400 };
    }
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
}

export async function POST(req: NextRequest) {
  let res: { data: string | Object | number; status: number };

  switch (getQuery(req).action) {
    case 'create-client':
      res = await handleCreateClient(req);
      return NextResponse.json(res.data, { status: res.status });
    case 'convert-to-permanent':
      res = await handleConvertToPermanent(req);
      return NextResponse.json(res.data, { status: res.status });
    case 'get-all-clients':
      res = await handleGetAllClients(req);
      return NextResponse.json(res.data, { status: res.status });
    case 'edit-client':
      res = await handleEditClient(req);
      return NextResponse.json(res.data, { status: res.status });
    case 'delete-client':
      res = await handleDeleteClient(req);
      return NextResponse.json(res.data, { status: res.status });
    default:
      return NextResponse.json({ response: 'OK' }, { status: 200 });
  }
}

export async function GET(req: NextRequest) {
  let res: { data: string | Object | number; status: number };

  switch (getQuery(req).action) {
    case 'get-client-by-code':
      res = await handleGetClientByCode(req);
      return NextResponse.json(res.data, { status: res.status });
    case 'get-client-by-id':
      res = await handleGetClientById(req);
      return NextResponse.json(res.data, { status: res.status });
    default:
      return NextResponse.json({ response: 'OK' }, { status: 200 });
  }
}
