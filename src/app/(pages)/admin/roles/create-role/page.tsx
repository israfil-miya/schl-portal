import { fetchApi } from '@/lib/utils';
import { ClientDataType } from '@/models/Clients';
import { UserDataType } from '@/models/Users';
import { Undo2 } from 'lucide-react';
import moment from 'moment-timezone';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import React, { Suspense } from 'react';
import InputForm from './components/Form';

const CreateClientPage = async () => {
  return (
    <>
      <div className="px-4 mt-8 mb-4 flex flex-col justify-center md:w-[70vw] mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold text-left mb-8 underline underline-offset-4 uppercase">
            Create a new role
          </h1>
          <Link
            href="/admin/roles"
            className="flex justify-between items-center gap-2 rounded-md bg-blue-600 hover:opacity-90 hover:ring-4 hover:ring-blue-600 transition duration-200 delay-300 hover:text-opacity-100 text-white px-3 py-2"
          >
            Show all roles
            <Undo2 size={18} />
          </Link>
        </div>
        <Suspense fallback={<p className="text-center">Loading...</p>}>
          <InputForm />
        </Suspense>
      </div>
    </>
  );
};

export default CreateClientPage;
