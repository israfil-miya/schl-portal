import { getQuery } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';

import { handleDeleteFile } from './handlers/deleteFile';
import { handleDownloadFile } from './handlers/downloadFile';
import { handleInsertFile } from './handlers/insertFile';

export async function POST(req: NextRequest) {
  switch (getQuery(req).action) {
    case 'insert-file': {
      const res = await handleInsertFile(req);
      return NextResponse.json(res.data, { status: res.status });
    }
    default:
      return NextResponse.json({ response: 'OK' }, { status: 200 });
  }
}

export async function GET(req: NextRequest) {
  switch (getQuery(req).action) {
    case 'delete-file': {
      const res = await handleDeleteFile(req);
      return NextResponse.json(res.data, { status: res.status });
    }
    case 'download-file': {
      const res = await handleDownloadFile(req);
      if (res.status === 200 && typeof res.data !== 'string') {
        return new Response(res.data as any, {
          headers: {
            'Content-Disposition': `attachment; filename="${res.fileName}"`,
            'Content-Type': 'application/octet-stream',
          },
        });
      }
      return NextResponse.json(res.data, { status: res.status });
    }
    default:
      return NextResponse.json({ response: 'OK' }, { status: 200 });
  }
}

export const runtime = 'nodejs';
