import { fetchApi } from '@/lib/utils';
import { ClientDataType } from '@/models/Clients';
import { UserDataType } from '@/models/Users';
import moment from 'moment-timezone';
import React, { Suspense } from 'react';
import { getAllEmployees } from '../page';
import InputForm from './components/Form';

const CreateClientPage = async () => {
  let employees = await getAllEmployees();
  return (
    <>
      <div className="px-4 mt-8 mb-4 flex flex-col justify-center md:w-[70vw] mx-auto">
        <h1 className="text-2xl font-semibold text-left mb-8 underline underline-offset-4 uppercase">
          Add a new user
        </h1>
        <Suspense fallback={<p className="text-center">Loading...</p>}>
          <InputForm employeesData={employees || []} />
        </Suspense>
      </div>
    </>
  );
};

export default CreateClientPage;
