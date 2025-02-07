'use client';

import { constructFileName, fetchApi } from '@/lib/utils';
import { formatDate } from '@/utility/date';
import moment from 'moment-timezone';
import { useSession } from 'next-auth/react';
import { useRouter } from 'nextjs-toploader/app';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

import 'react-quill/dist/quill.snow.css';

interface ViewNoticeProps {
  notice_no: string;
}

interface Notice {
  channel: string;
  notice_no: string;
  title: string;
  description: string;
  file_name: string;
  updatedAt: string;
  createdAt: string;
  [key: string]: any;
}

const ViewNotice: React.FC<ViewNoticeProps> = props => {
  const notice_no = decodeURIComponent(props.notice_no);
  const [notice, setNotice] = useState<Notice>({
    channel: '',
    notice_no: '',
    title: '',
    description: '',
    file_name: '',
    updatedAt: '',
    createdAt: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();
  const userRole = session?.user?.role;

  async function getNotice() {
    try {
      setIsLoading(true);

      let url: string =
        process.env.NEXT_PUBLIC_BASE_URL + '/api/notice?action=get-notice';
      let options: {} = {
        method: 'GET',
        headers: {
          notice_no: notice_no,
          'Content-Type': 'application/json',
        },
      };

      let response = await fetchApi(url, options);

      if (response.ok) {
        if (response.data?.channel != 'production') {
          if (userRole !== 'admin' && userRole !== 'super') {
            toast.error("The notice doesn't belong to this channel", {
              id: 'notice-channel',
            });
            router.push('/');
          } else {
            toast.info(
              `The notice belongs to ${response.data?.channel} channel`,
              {
                id: 'notice-channel',
              },
            );
          }
        }
        setNotice(response.data);
      } else {
        toast.error(response.data as string, { id: 'notice-error' });
        router.push(process.env.NEXT_PUBLIC_BASE_URL + '/admin/notices');
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while retrieving the notice');
      router.push(process.env.NEXT_PUBLIC_BASE_URL + '/admin/notices');
    } finally {
      setIsLoading(false);
    }
  }

  const handleFileDownload = async () => {
    try {
      const url: string =
        process.env.NEXT_PUBLIC_BASE_URL + '/api/ftp?action=download-file';

      const options = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          folder_name: 'notice',
          file_name: constructFileName(notice.file_name, notice.notice_no),
        },
      };

      const response = await fetchApi(url, options);

      if (response.ok) {
        // Create a blob from the response and download it
        const blob = await response.data.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = notice.file_name;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        console.error(response.data);
        toast.error('Error downloading the file');
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while downloading the file');
    }
  };

  useEffect(() => {
    if (notice_no) {
      getNotice();
    } else {
      setIsLoading(false);
      router.push(process.env.NEXT_PUBLIC_BASE_URL + '/admin/notices');
    }
  }, []);

  return (
    <>
      {isLoading ? <p className="text-center">Loading...</p> : null}

      {!isLoading && (
        <div className="notice container mt-10 md:mt-20 mb-3">
          <div className="notice-header mb-6">
            <h2 className="mb-0 font-semibold text-4xl">{notice.title}</h2>
            <p className="text-md font-medium text-gray-600">
              {notice.createdAt ? formatDate(notice?.createdAt) : null}
            </p>
          </div>
          <div
            className="ql-editor" // Quill's default class for editor content
            dangerouslySetInnerHTML={{ __html: notice.description }}
          />

          {notice.file_name && (
            <div className="file-download text-lg font-semibold font-sans">
              <span className="font-semibold">Downloads: </span>{' '}
              <span
                onClick={handleFileDownload}
                className="underline font-mono downloadable-file hover:cursor-pointer has-tooltip"
              >
                {notice.file_name}
                <span className="tooltip italic font-medium rounded-md text-xs shadow-lg p-1 px-2 bg-gray-100 ml-2">
                  Click to download
                </span>
              </span>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ViewNotice;
