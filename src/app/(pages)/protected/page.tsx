import { auth } from '@/auth';
import { verifyCookie } from '@/lib/utils';
import { useSession } from 'next-auth/react';
import { cookies } from 'next/headers';
import { permanentRedirect, useSearchParams } from 'next/navigation';
import React from 'react';
import InputForm from './components/Form';

export default async function Protected({
  searchParams,
}: {
  searchParams: { redirect: string };
}) {
  const redirect_path = searchParams.redirect || '/';
  const session = await auth();

  const cookieStore = cookies();
  const token = cookieStore.get('verify-token.tmp')?.value;
  const verified = verifyCookie(token, session?.user.db_id || '');

  if (verified) {
    permanentRedirect(redirect_path.trim());
  }

  return (
    <>
      <section className="lg:h-[80vh] lg:flex lg:flex-col justify-center items-center">
        <div className="text-center mx-4 mt-10 lg:mt-0 py-4 px-3.5 md:mx-auto md:w-[40em] md:flex justify-center bg-gray-200">
          <span>The route</span>
          <code className="text-red-800 font-semibold px-2 font-mono">
            {redirect_path.trim()}
          </code>
          <span>is protected. Enter your credentials to access the page!</span>
        </div>

        <div className="container lg:w-[60em] md:mt-14 mt-20">
          <InputForm redirect_path={redirect_path.trim()} />
        </div>
      </section>
    </>
  );
}
