import { FtpConnection, getConnection, releaseConnection } from '@/lib/ftp';
import { getQuery } from '@/lib/utils';
// import { Mime } from 'mime';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

async function handleInsertFile(req: NextRequest): Promise<{
  data: string;
  status: number;
}> {
  let ftp: FtpConnection | null = null;
  try {
    // const mime = new Mime();
    const headersList = await headers();
    const folder_name = headersList.get('folder_name');

    // console.log(req)
    ftp = await getConnection();

    if (!ftp) {
      console.error('Error connecting to FTP server');
      return { data: 'Failed to connect to FTP server', status: 500 };
    }

    const formData = await req.formData();

    const file = formData.get('file') as File | null;
    if (!file) {
      return { data: 'File blob is required', status: 400 };
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // const fileType = mime.getExtension(file.type);

    const fileName = file.name;

    await ftp.put(buffer, `./${folder_name}/${fileName}`);

    // console.log("File uploaded to FTP.");
    return { data: 'File uploaded to FTP', status: 200 };
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  } finally {
    if (ftp) {
      releaseConnection(ftp);
    }
  }
}

async function handleDeleteFile(req: NextRequest): Promise<{
  data: string;
  status: number;
}> {
  let ftp: FtpConnection | null = null;

  try {
    ftp = await getConnection();

    if (!ftp) {
      console.error('Error connecting to FTP server');
      return { data: 'Failed to connect to FTP server', status: 500 };
    }

    const headersList = await headers();
    const file_name = headersList.get('file_name');
    const folder_name = headersList.get('folder_name');

    if (!file_name || !folder_name) {
      console.error('Missing file_name or folder_name');
      return { data: 'Missing file_name or folder_name', status: 400 };
    }

    await ftp.delete(`./${folder_name}/${file_name}`);

    return { data: 'File deleted successfully', status: 200 };
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  } finally {
    if (ftp) {
      releaseConnection(ftp);
    }
  }
}

async function handleDownloadFile(req: NextRequest): Promise<{
  data: string | NodeJS.ReadableStream;
  status: number;
}> {
  let ftp: FtpConnection | null = null;

  try {
    ftp = await getConnection();

    if (!ftp) {
      console.error('Error connecting to FTP server');
      return { data: 'Failed to connect to FTP server', status: 500 };
    }

    const headersList = await headers();
    const file_name = headersList.get('file_name');
    const folder_name = headersList.get('folder_name');

    if (!file_name || !folder_name) {
      console.error('Missing file_name or folder_name');
      return { data: 'Missing file_name or folder_name', status: 400 };
    }

    const stream = await ftp.get(`./${folder_name}/${file_name}`);

    if (stream) {
      return { data: stream, status: 200 };
    } else {
      return { data: 'File not found', status: 404 };
    }
  } catch (error) {
    console.error(error);
    return { data: 'An error occurred', status: 500 };
  } finally {
    if (ftp) {
      releaseConnection(ftp);
    }
  }
}

export async function POST(req: NextRequest) {
  let res: { data: any; status: number };

  switch (getQuery(req).action) {
    case 'insert-file':
      res = await handleInsertFile(req);
      return NextResponse.json(res.data, { status: res.status });
    default:
      return NextResponse.json({ response: 'OK' }, { status: 200 });
  }
}

export async function GET(req: NextRequest) {
  let res: { data: any; status: number };

  switch (getQuery(req).action) {
    case 'delete-file':
      res = await handleDeleteFile(req);
      return NextResponse.json(res.data, { status: res.status });
    case 'download-file':
      res = await handleDownloadFile(req);

      if (res.status === 200) {
        const headersList = await headers();
        const file_name = headersList.get('file_name');
        const stream = res.data as BodyInit;

        return new Response(stream, {
          headers: {
            'Content-Disposition': `attachment; filename="${file_name}"`,
            'Content-Type': 'application/octet-stream',
          },
        });
      } else {
        return NextResponse.json(res.data, { status: res.status });
      }

    default:
      return NextResponse.json({ response: 'OK' }, { status: 200 });
  }
}

export const runtime = 'nodejs';
