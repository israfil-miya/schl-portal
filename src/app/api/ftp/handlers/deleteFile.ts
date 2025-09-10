import { FtpConnection, getConnection, releaseConnection } from '@/lib/ftp';
import { NextRequest } from 'next/server';

export async function handleDeleteFile(
  req: NextRequest,
): Promise<{ data: string; status: number }> {
  let ftp: FtpConnection | null = null;
  try {
    ftp = await getConnection();
    if (!ftp) return { data: 'Failed to connect to FTP server', status: 500 };
    const file_name = req.headers.get('file_name');
    const folder_name = req.headers.get('folder_name');
    // console.error('Missing file_name or folder_name')
    if (!file_name || !folder_name)
      return { data: 'Missing file_name or folder_name', status: 400 };
    await ftp.delete(`./${folder_name}/${file_name}`);
    return { data: 'File deleted successfully', status: 200 };
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  } finally {
    if (ftp) releaseConnection(ftp);
  }
}
