import { fetchApi } from '@/lib/utils';
import { ClientDataType } from '@/models/Clients';
import React from 'react';
import Table from './components/Table';

type ClientsResponseState = {
  pagination: {
    count: number;
    pageCount: number;
  };
  items: ClientDataType[];
};

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
      return data.items;
    } else {
      console.error('Unable to fetch clients');
    }
  } catch (e) {
    console.error(e);
    console.log('An error occurred while fetching clients');
  }
};

const BrowsePage = async () => {
  let clients = await getAllClients();

  return (
    <>
      <div className="px-4 mt-8 mb-4">
        <Table clientsData={clients || []} />
      </div>
    </>
  );
};

export default BrowsePage;
