import { auth } from '@/auth';
import { fetchApi, verifyCookie } from '@/lib/utils';
import { useSession } from 'next-auth/react';
import { cookies } from 'next/headers';
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

export default async function Protected({
  searchParams,
}: {
  searchParams: { id: string };
}) {
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

  return (
    <div className="px-4 mt-8 mb-4 flex flex-col justify-center md:w-[70vw] mx-auto">
      <h1 className="text-2xl font-semibold text-left mb-8 underline underline-offset-4 uppercase">
        Manage task
      </h1>
      <Suspense fallback={<p className="text-center">Loading...</p>}>
        <InputForm orderData={orderData} />
      </Suspense>
    </div>
  );
}
