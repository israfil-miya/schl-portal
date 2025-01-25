import { permanentRedirect, useSearchParams } from 'next/navigation';
import React from 'react';
import Table from './components/Table';

function page({ searchParams }: { searchParams: { c: string; d: string } }) {
  const country = decodeURIComponent(searchParams.c);
  const date = decodeURIComponent(searchParams.d);

  if (!country || !date) {
    console.error('Invalid query params', searchParams);
    permanentRedirect('/file-flow');
  }

  return (
    <div className="px-4 mt-8 mb-4 container">
      <Table country={country} date={date} />
    </div>
  );
}

export default page;
