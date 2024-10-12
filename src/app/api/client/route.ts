import Client, { ClientDataType } from '@/models/Clients';
import Report from '@/models/Reports';
import dbConnect from '@/utility/dbConnect';
import {
  addBooleanField,
  addIfDefined,
  addRegexField,
} from '@/utility/filterHelpers';
import getQuery from '@/utility/getApiQuery';
import moment from 'moment-timezone';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
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
}

export type RegexFields = Extract<
  keyof Query,
  'country' | 'client_code' | 'contact_person' | 'marketer'
>;

async function handleCreateNewClient(req: Request): Promise<{
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
        { company_name: data.client_name },
        { permanent_client: true },
        {
          new: true,
          upsert: true,
        },
      );

      if (reportData) {
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

async function handleGetAllClients(req: Request): Promise<{
  data: string | Object;
  status: number;
}> {
  try {
    const page: number = Number(headers().get('page')) || 1;
    const ITEMS_PER_PAGE: number = Number(headers().get('item_per_page')) || 30;
    const isFilter: boolean = headers().get('filtered') === 'true';
    const paginated: boolean = headers().get('paginated') === 'true';

    const filters = await req.json();

    const { countryName, clientCode, contactPerson, marketerName } = filters;

    let query: Query = {};

    addIfDefined(query, 'country', countryName);
    addIfDefined(query, 'client_code', clientCode);
    addIfDefined(query, 'contact_person', contactPerson);
    addIfDefined(query, 'marketer', marketerName);

    console.log(query);

    const searchQuery: Query = { ...query };

    let sortQuery: Record<string, 1 | -1> = {
      createdAt: -1,
    };

    if (!query && isFilter == true) {
      return { data: 'No filter applied', status: 400 };
    } else {
      const skip = (page - 1) * ITEMS_PER_PAGE;
      const count: number = await Client.countDocuments(searchQuery);
      let clients: ClientDataType[];

      if (paginated) {
        clients = (await Client.aggregate([
          { $match: searchQuery },
          { $sort: sortQuery },
          { $skip: skip },
          { $limit: ITEMS_PER_PAGE },
        ])) as ClientDataType[];
      } else {
        clients = await Client.find(searchQuery).lean();
      }

      console.log('SEARCH Query:', searchQuery);

      const pageCount: number = Math.ceil(count / ITEMS_PER_PAGE);

      if (!clients) {
        return { data: 'Unable to retrieve reports', status: 400 };
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

async function handleEditClient(req: Request): Promise<{
  data: string | Object;
  status: number;
}> {
  let data = await req.json();
  const updated_by = Number(headers().get('name'));
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

async function handleGetClientByCode(req: Request): Promise<{
  data: string | Object;
  status: number;
}> {
  try {
    let client_code = headers().get('client_code');

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

async function handleGetClientById(req: Request): Promise<{
  data: string | Object;
  status: number;
}> {
  try {
    let client_id = headers().get('client_id');

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

async function handleDeleteClient(req: Request): Promise<{
  data: string | Object;
  status: number;
}> {
  let { client_id }: { client_id: string } = await req.json();

  try {
    const resData = await Client.findByIdAndDelete(client_id);
    if (resData) {
      return { data: 'Deleted the client successfully', status: 200 };
    } else {
      return { data: 'Unable to delete the client', status: 400 };
    }
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
}

export async function POST(req: Request) {
  let res: { data: string | Object | number; status: number };

  switch (getQuery(req).action) {
    case 'create-new-client':
      res = await handleCreateNewClient(req);
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

export async function GET(req: Request) {
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
