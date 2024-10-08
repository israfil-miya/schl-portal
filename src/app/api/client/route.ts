import Client, { ClientDataType } from '@/models/Clients';
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
  country?: RegexQuery;
  client_code?: RegexQuery;
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

    const resData = await Client.findOneAndUpdate(
      { client_code: data.client_code },
      data,
      {
        new: true,
        upsert: true,
      },
    );

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

async function handleGetAllClients(req: Request): Promise<{
  data: string | Record<string, number>;
  status: number;
}> {
  try {
    const page: number = Number(headers().get('page')) || 1;
    const ITEMS_PER_PAGE: number = Number(headers().get('item_per_page')) || 30;
    const isFilter: boolean = headers().get('filtered') === 'true';
    const paginated: boolean = headers().get('paginated') === 'true';

    const filters = await req.json();

    const { countryName, clientCode, contactPerson, marketerName } = filters;

    let query = {};
    if (country) query.country = { $regex: country, $options: 'i' };
    if (clientcode) query.client_code = { $regex: clientcode, $options: 'i' };
    if (contactperson)
      query.contact_person = { $regex: contactperson, $options: 'i' };
    if (marketer) query.marketer = { $regex: marketer, $options: 'i' };

    console.log(query);

    if (
      Object.keys(query).length === 0 &&
      query.constructor === Object &&
      req.headers.isfilter == true
    )
      sendError(res, 400, 'No filter applied');
    else {
      const skip = (page - 1) * ITEMS_PER_PAGE;

      const count = await Client.countDocuments(query);

      let clients;

      if (req.headers.notpaginated) clients = await Client.find({});
      else clients = await Client.find(query).skip(skip).limit(ITEMS_PER_PAGE);

      const pageCount = Math.ceil(count / ITEMS_PER_PAGE); // Calculate the total number of pages

      res.status(200).json({
        pagination: {
          count,
          pageCount,
        },
        items: clients,
      });
    }
  } catch (e) {
    console.error(e);
    sendError(res, 500, 'An error occurred');
  }
}

async function handleEditClient(req: Request) {
  let data = req.body;
  const updated_by = req.headers.name;
  data = { ...data, updated_by };

  // console.log("Received edit request with data:", data);

  try {
    const resData = await Client.findByIdAndUpdate(data._id, data, {
      new: true,
    });

    if (resData) {
      res.status(200).json(resData);
    } else {
      sendError(res, 400, 'No client found');
    }
  } catch (e) {
    console.error(e);
    sendError(res, 500, 'An error occurred');
  }
}

async function handleGetClientByCode(req: Request) {
  try {
    let data = req.headers;

    const client = await Client.findOne({
      client_code: data.client_code,
    }).lean();

    if (!client) sendError(res, 400, 'No client found with the code');
    else res.status(200).json(client);
  } catch (e) {
    console.error(e);
    sendError(res, 500, 'An error occurred');
  }
}

async function handleGetClientById(req: Request) {
  try {
    let data = req.headers;

    const client = await Client.findById(data.id).lean();

    if (!client) sendError(res, 400, 'No client found with the id');
    else res.status(200).json(client);
  } catch (e) {
    console.error(e);
    sendError(res, 500, 'An error occurred');
  }
}

async function handleDeleteClient(req: Request) {
  let data = req.headers;

  try {
    const resData = await Client.findByIdAndDelete(data.id);
    res.status(200).json(resData);
  } catch (e) {
    console.error(e);
    sendError(res, 500, 'An error occurred');
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
