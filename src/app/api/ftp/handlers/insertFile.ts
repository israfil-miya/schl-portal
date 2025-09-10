import { FtpConnection, getConnection, releaseConnection } from '@/lib/ftp';
import { NextRequest } from 'next/server';

export async function handleInsertFile(
  req: NextRequest,
): Promise<{ data: string; status: number }> {
  let ftp: FtpConnection | null = null;
  try {
    const folder_name = req.headers.get('folder_name');
    // console.log(req)
    if (!folder_name)
      return { data: 'folder_name header required', status: 400 };
    ftp = await getConnection();
    if (!ftp) return { data: 'Failed to connect to FTP server', status: 500 };
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) return { data: 'File blob is required', status: 400 };
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
    if (ftp) releaseConnection(ftp);
  }
}
