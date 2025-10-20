import { fetchApi } from '@/lib/utils';
import { ClientDataType } from '@/models/Clients';
import { PopulatedByEmployeeUserType, UserDataType } from '@/models/Users';
import moment from 'moment-timezone';
import React, { Suspense } from 'react';
import InputForm from './components/Form';

let marketerNames: string[] = [];

async function getAllMarketers() {
  try {
    let url: string =
      process.env.NEXT_PUBLIC_BASE_URL + '/api/user?action=get-all-marketers';
    let options: {} = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    let response = await fetchApi(url, options);

    if (response.ok) {
      let marketers = response.data as PopulatedByEmployeeUserType[];
      marketerNames = marketers.map(
        marketer => marketer.employee_id.company_provided_name,
      );
    } else {
      console.error('Unable to fetch marketers');
    }
  } catch (e) {
    console.error(e);
    console.log('An error occurred while fetching marketer names');
  }
}

const CreateClientPage = async () => {
  await getAllMarketers();
  return (
    <>
      <div className="px-4 mt-8 mb-4 flex flex-col justify-center md:w-[70vw] mx-auto">
        <h1 className="text-2xl font-semibold text-left mb-8 underline underline-offset-4 uppercase">
          Add a new client
        </h1>
        <Suspense fallback={<p className="text-center">Loading...</p>}>
          <InputForm marketerNames={marketerNames} />
        </Suspense>
      </div>
    </>
  );
};

export default CreateClientPage;
