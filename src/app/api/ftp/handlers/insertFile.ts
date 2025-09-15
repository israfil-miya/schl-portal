import { FtpConnection, getConnection, releaseConnection } from '@/lib/ftp';
import { NextRequest } from 'next/server';

export async function handleInsertFile(
  req: NextRequest,
): Promise<{ data: string; status: number }> {
  let ftp: FtpConnection | null = null;
  try {
    const rawFolderName = req.headers.get('folder_name');
    if (!rawFolderName)
      return { data: 'folder_name header required', status: 400 };

    // Basic sanitization: trim whitespace & slashes, forbid path traversal
    const folder_name = rawFolderName
      .trim()
      .replace(/^\/+|\/+$|\\+$/g, '') // remove leading/trailing slashes or backslashes
      .replace(/\s+/g, '_'); // spaces to underscore (optional)

    if (!folder_name || /\.\./.test(folder_name)) {
      return { data: 'Invalid folder_name', status: 400 };
    }
    ftp = await getConnection();
    if (!ftp) return { data: 'Failed to connect to FTP server', status: 500 };
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) return { data: 'File blob is required', status: 400 };
    const buffer = Buffer.from(await file.arrayBuffer());
    // const fileType = mime.getExtension(file.type);
    const fileName = file.name;
    const targetDir = `./${folder_name}`;

    // Ensure directory exists (recursive). Ignore "exists" errors.
    try {
      // promise-ftp mkdir has signature (path, recursive?)
      await ftp.mkdir?.(targetDir, true);
    } catch (err: any) {
      const msg = String(err?.message || err || '').toLowerCase();
      if (!msg.includes('exist')) {
        console.error('Failed to ensure directory on FTP:', err);
        return { data: 'Failed to prepare directory on FTP', status: 500 };
      }
    }

    await ftp.put(buffer, `${targetDir}/${fileName}`);
    // console.log("File uploaded to FTP.");
    return { data: 'File uploaded to FTP', status: 200 };
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  } finally {
    if (ftp) releaseConnection(ftp);
  }
}
