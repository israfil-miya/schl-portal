import { auth } from '@/auth';
import Linkify from '@/components/Linkify';
import { fetchApi, hasPerm, verifyCookie } from '@/lib/utils';
import { useSession } from 'next-auth/react';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { redirect, useSearchParams } from 'next/navigation';
import React, { Suspense } from 'react';
import { OrderDataType } from '../schema';
import InputForm from './components/Form';

const getOrderData = async (orderId: string) => {
  try {
    let url: string =
      process.env.NEXT_PUBLIC_BASE_URL + '/api/order?action=get-order-by-id';
    let options: {} = {
      method: 'GET',
      headers: {
        id: orderId,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    };

    const response = await fetchApi(url, options);
    if (response.ok) {
      return response.data as OrderDataType;
    } else {
      console.error(response.data);
      return null;
    }
  } catch (e) {
    console.error(e);
    console.log('An error occurred while fetching order data');
    return null;
  }
};

const EditSingleTask = async ({
  searchParams,
}: {
  searchParams: { id: string };
}) => {
  const orderid = decodeURIComponent(searchParams.id);

  if (!orderid) {
    console.error('Order id is null');
    redirect('/');
  }

  const orderData = await getOrderData(orderid);

  if (orderData === null) {
    console.error('Order data is null');
    redirect('/');
  }

  const session = await auth();
  const userPermissions = session?.user.permissions || [];

  return (
    <div className="px-4 mt-8 mb-4 flex flex-col justify-center md:w-[70vw] mx-auto">
      <h1 className="text-2xl font-semibold text-left underline underline-offset-4 uppercase">
        TASK DETAILS
      </h1>

      {hasPerm('browse:view_page', userPermissions) && (
        <span className="text-sm font-mono text-gray-400 flex flex-row gap-2 mt-1">
          (for updating client code/name update from
          <Link
            href={'/browse'}
            className="block hover:cursor-pointer hover:underline hover:opacity-100 text-blue-700"
          >
            Browse
          </Link>{' '}
          page)
        </span>
      )}
      <Suspense fallback={<p className="text-center">Loading...</p>}>
        <InputForm orderData={orderData} />
      </Suspense>
    </div>
  );
};

export default EditSingleTask;
export const dynamic = 'force-dynamic';
