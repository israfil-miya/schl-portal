import { permanentRedirect, useSearchParams } from 'next/navigation';
import React from 'react';

function page({ searchParams }: { searchParams: { c: string; d: string } }) {
  const country = decodeURIComponent(searchParams.c);
  const date = decodeURIComponent(searchParams.d);

  if (!country || !date) {
    console.error('Invalid query params', searchParams);
    permanentRedirect('/file-flow');
  }

  return (
    <div>
      page {date} {country}
    </div>
  );
}

export default page;
