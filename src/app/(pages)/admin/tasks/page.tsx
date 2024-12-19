import { fetchApi } from '@/lib/utils';
import { ClientDataType } from '@/models/Clients';
import moment from 'moment-timezone';
import React, { Suspense } from 'react';
import InputForm from './components/Form';

type ClientsResponseState = {
  pagination: {
    count: number;
    pageCount: number;
  };
  items: ClientDataType[];
};

let clients: ClientDataType[];

const getAllClients = async () => {
  try {
    let url: string =
      process.env.NEXT_PUBLIC_BASE_URL + '/api/client?action=get-all-clients';
    let options: {} = {
      method: 'POST',
      headers: {
        Accept: '*/*',
        paginated: false,
        filtered: false,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
      cache: 'no-store',
    };

    const response = await fetchApi(url, options);
    if (response.ok) {
      let data: ClientsResponseState = response.data as ClientsResponseState;
      clients = data.items;
    } else {
      console.error('Unable to fetch clients');
    }
  } catch (e) {
    console.error(e);
    console.log('An error occurred while fetching clients');
  }
};

const CreateTaskPage = async () => {
  await getAllClients();
  return (
    <>
      <div className="px-4 mt-8 mb-4 flex flex-col justify-center md:w-[70vw] mx-auto">
        <h1 className="text-2xl font-semibold text-left mb-8 underline underline-offset-4 uppercase">
          Add a new task
        </h1>
        <Suspense fallback={<p className="text-center">Loading...</p>}>
          <InputForm clientsData={clients} />
        </Suspense>
      </div>
    </>
  );
};

export default CreateTaskPage;
