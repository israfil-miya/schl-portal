import { SearchParams } from 'next/dist/server/request/search-params';
import React from 'react';
import InputForm from './components/Form';

export default async function ProtectedPage({
  searchParams,
}: {
  searchParams?: { redirect?: string };
}) {
  const redirect = searchParams?.['redirect'] || '/';

  return (
    <>
      <section className="lg:h-[80vh] lg:flex lg:flex-col justify-center items-center">
        <div className="text-center mx-4 mt-10 lg:mt-0 py-4 px-3.5 md:mx-auto md:w-[40em] md:flex justify-center bg-gray-200">
          <span>The route</span>
          <code className="text-red-800 font-semibold px-2 font-mono">
            {redirect.trim()}
          </code>
          <span>is protected. Enter your credentials to access the page!</span>
        </div>

        <div className="container lg:w-[60em] md:mt-14 mt-20">
          <InputForm redirect_path={redirect.trim()} />
        </div>
      </section>
    </>
  );
}
