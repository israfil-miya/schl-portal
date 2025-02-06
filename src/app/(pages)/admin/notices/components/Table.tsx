'use client';

import { cn, constructFileName, fetchApi } from '@/lib/utils';
import { formatDate } from '@/utility/date';
import {
  ChevronLeft,
  ChevronRight,
  CirclePlus,
  SquareArrowOutUpRight,
} from 'lucide-react';
import moment from 'moment-timezone';
import { useSession } from 'next-auth/react';
import { useRouter } from 'nextjs-toploader/app';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { NoticeDataType, validationSchema } from '../schema';
import DeleteButton from './Delete';
import EditButton from './Edit';
import FilterButton from './Filter';

type NoticesState = {
  pagination: {
    count: number;
    pageCount: number;
  };
  items: NoticeDataType[];
};

const Table = () => {
  const [notices, setNotices] = useState<NoticesState>({
    pagination: {
      count: 0,
      pageCount: 0,
    },
    items: [],
  });

  const router = useRouter();

  const [isFiltered, setIsFiltered] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [pageCount, setPageCount] = useState<number>(0);
  const [itemPerPage, setItemPerPage] = useState<number>(30);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const { data: session } = useSession();
  const userRole = session?.user.role;

  const prevPageCount = useRef<number>(0);
  const prevPage = useRef<number>(1);

  const [filters, setFilters] = useState({
    fromDate: '',
    toDate: '',
    noticeNo: '',
    title: '',
  });

  async function getAllNotices() {
    try {
      // setIsLoading(true);

      let url: string =
        process.env.NEXT_PUBLIC_BASE_URL + '/api/notice?action=get-all-notices';
      let options: {} = {
        method: 'POST',
        headers: {
          filtered: false,
          paginated: true,
          item_per_page: itemPerPage,
          page,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          userRole !== 'admin' && userRole !== 'super'
            ? { channel: 'production' }
            : {},
        ),
      };

      let response = await fetchApi(url, options);

      if (response.ok) {
        setNotices(response.data);
        setIsFiltered(false);
      } else {
        toast.error(response.data);
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while retrieving notices data');
    } finally {
      setIsLoading(false);
    }
  }

  async function getAllNoticesFiltered() {
    try {
      // setIsLoading(true);

      let url: string =
        process.env.NEXT_PUBLIC_BASE_URL + '/api/notice?action=get-all-notices';
      let options: {} = {
        method: 'POST',
        headers: {
          filtered: true,
          paginated: true,
          item_per_page: itemPerPage,
          page: !isFiltered ? 1 : page,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...filters, channel: 'marketers' }),
      };

      let response = await fetchApi(url, options);

      if (response.ok) {
        setNotices(response.data);
        setIsFiltered(true);
      } else {
        toast.error(response.data);
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while retrieving notices data');
    } finally {
      setIsLoading(false);
    }
    return;
  }

  async function deleteNotice(noticeData: NoticeDataType) {
    try {
      const url: string =
        process.env.NEXT_PUBLIC_BASE_URL + '/api/notice?action=delete-notice';
      const options: {} = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notice_id: noticeData._id }),
      };
      const response = await fetchApi(url, options);

      if (response.ok) {
        if (noticeData.file_name) {
          console.log(
            'Deleting file from ftp server',
            constructFileName(noticeData.file_name, noticeData.notice_no),
            noticeData.file_name,
            noticeData.notice_no,
          );

          const ftpDeleteConfirmation = confirm(
            'Delete attached file from the FTP server?',
          );
          if (ftpDeleteConfirmation) {
            let ftp_url: string =
              process.env.NEXT_PUBLIC_BASE_URL + '/api/ftp?action=delete-file';
            let ftp_options: {} = {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                folder_name: 'notice',
                file_name: constructFileName(
                  noticeData.file_name,
                  noticeData.notice_no,
                ),
              },
            };

            let ftp_response = await fetchApi(ftp_url, ftp_options);
            if (ftp_response.ok) {
              toast.success('Deleted the attached file from FTP server');
            } else {
              toast.error(ftp_response.data as string);
            }
          } else {
            toast.success(response.data as string);
          }
        } else {
          toast.success('Successfully deleted the notice', {
            id: 'success',
          });
        }
        if (!isFiltered) await getAllNotices();
        else await getAllNoticesFiltered();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while deleting the notice');
    }
    return;
  }

  async function editNotice(editedNoticeData: NoticeDataType) {
    try {
      setIsLoading(true);
      const parsed = validationSchema.safeParse(editedNoticeData);

      if (!parsed.success) {
        console.error(parsed.error.issues.map(issue => issue.message));
        toast.error('Invalid form data');
        return;
      }

      let url: string =
        process.env.NEXT_PUBLIC_BASE_URL + '/api/notice?action=edit-notice';
      let options: {} = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          updated_by: session?.user.real_name,
        },
        body: JSON.stringify(parsed.data),
      };

      const response = await fetchApi(url, options);

      if (response.ok) {
        toast.success('Updated the notice data');

        if (!isFiltered) await getAllNotices();
        else await getAllNoticesFiltered();
      } else {
        toast.error(response.data as string);
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while updating the notice');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    getAllNotices();
  }, []);

  function handlePrevious() {
    setPage(p => {
      if (p === 1) return p;
      return p - 1;
    });
  }

  function handleNext() {
    setPage(p => {
      if (p === pageCount) return p;
      return p + 1;
    });
  }

  useEffect(() => {
    if (prevPage.current !== 1 || page > 1) {
      if (notices?.pagination?.pageCount == 1) return;
      if (!isFiltered) getAllNotices();
      else getAllNoticesFiltered();
    }
    prevPage.current = page;
  }, [page]);

  useEffect(() => {
    if (notices?.pagination?.pageCount !== undefined) {
      setPage(1);
      if (prevPageCount.current !== 0) {
        if (!isFiltered) getAllNoticesFiltered();
      }
      if (notices) setPageCount(notices?.pagination?.pageCount);
      prevPageCount.current = notices?.pagination?.pageCount;
      prevPage.current = 1;
    }
  }, [notices?.pagination?.pageCount]);

  useEffect(() => {
    // Reset to first page when itemPerPage changes
    prevPageCount.current = 0;
    prevPage.current = 1;
    setPage(1);

    if (!isFiltered) getAllNotices();
    else getAllNoticesFiltered();
  }, [itemPerPage]);

  return (
    <>
      <div
        className={cn(
          'flex flex-col sm:flex-row justify-between mb-4 gap-2',
          userRole !== 'super' &&
            userRole !== 'admin' &&
            'justify-center sm:flex-row sm:justify-end',
        )}
      >
        {(userRole == 'super' || userRole == 'admin') && (
          <button
            onClick={() =>
              router.push(
                process.env.NEXT_PUBLIC_BASE_URL +
                  '/admin/notices/create-notice',
              )
            }
            className="flex justify-between items-center gap-2 rounded-md bg-primary hover:opacity-90 hover:ring-4 hover:ring-primary transition duration-200 delay-300 hover:text-opacity-100 text-white px-3 py-2"
          >
            Add new notice
            <CirclePlus size={18} />
          </button>
        )}
        <div className="items-center flex gap-2">
          <div className="inline-flex rounded-md" role="group">
            <button
              onClick={handlePrevious}
              disabled={page === 1 || pageCount === 0 || isLoading}
              type="button"
              className="inline-flex items-center px-4 py-2 text-sm bg-gray-50 text-gray-700 border border-gray-200 rounded-s-md leading-tight focus:outline-none focus:bg-white focus:border-gray-500 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={18} className="stroke-gray-500" />
              Prev
            </button>
            <button
              disabled={true}
              className="hidden sm:visible sm:inline-flex items-center px-4 py-2 text-sm font-medium border"
            >
              <label>
                Page <b>{notices?.items?.length !== 0 ? page : 0}</b> of{' '}
                <b>{pageCount}</b>
              </label>
            </button>
            <button
              onClick={handleNext}
              disabled={page === pageCount || pageCount === 0 || isLoading}
              type="button"
              className="inline-flex items-center px-4 py-2 text-sm bg-gray-50 text-gray-700 border border-gray-200 rounded-e-md leading-tight focus:outline-none focus:bg-white focus:border-gray-500 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight size={18} className="stroke-gray-500" />
            </button>
          </div>

          <select
            value={itemPerPage}
            onChange={e => setItemPerPage(parseInt(e.target.value))}
            // defaultValue={30}
            required
            className="appearance-none cursor-pointer px-4 py-2 bg-gray-50 text-gray-700 border border-gray-200 rounded-md leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
          >
            <option value={30}>30</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <FilterButton
            isLoading={isLoading}
            submitHandler={getAllNoticesFiltered}
            setFilters={setFilters}
            filters={filters}
            className="w-full justify-between sm:w-auto"
          />
        </div>
      </div>

      {isLoading ? <p className="text-center">Loading...</p> : <></>}

      {!isLoading &&
        (notices?.items?.length !== 0 ? (
          <div className="table-responsive text-nowrap text-md">
            <table className="table table-bordered table-striped">
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>Date</th>
                  <th>Notice No</th>
                  <th>Title</th>
                  {(userRole == 'super' || userRole == 'admin') && (
                    <th>Channel</th>
                  )}
                  <th>Manage</th>
                </tr>
              </thead>
              <tbody>
                {notices?.items?.map((notice, index) => {
                  return (
                    <tr key={notice.notice_no}>
                      <td>{index + 1 + itemPerPage * (page - 1)}</td>
                      <td>
                        {notice.createdAt ? formatDate(notice.createdAt) : null}
                      </td>
                      <td>{notice.notice_no}</td>
                      <td>{notice.title}</td>
                      {(userRole == 'super' || userRole == 'admin') && (
                        <td>
                          {notice.channel.charAt(0).toUpperCase() +
                            notice.channel.slice(1)}
                        </td>
                      )}
                      <td
                        className="text-center"
                        style={{ verticalAlign: 'middle' }}
                      >
                        <div className="inline-block">
                          <div className="flex gap-2">
                            {(userRole == 'super' || userRole == 'admin') && (
                              <>
                                <DeleteButton
                                  noticeData={notice}
                                  submitHandler={deleteNotice}
                                />
                                <EditButton
                                  loading={isLoading}
                                  submitHandler={editNotice}
                                  noticeData={notice}
                                />
                              </>
                            )}

                            <button
                              onClick={() => {
                                window.open(
                                  process.env.NEXT_PUBLIC_BASE_URL +
                                    `/admin/notices/${encodeURIComponent(notice.notice_no)}`,
                                  '_blank',
                                );
                              }}
                              className="items-center gap-2 rounded-md bg-amber-600 hover:opacity-90 hover:ring-2 hover:ring-amber-600 transition duration-200 delay-300 hover:text-opacity-100 text-white p-2"
                            >
                              <SquareArrowOutUpRight size={16} />
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <tr key={0}>
            <td colSpan={5} className=" align-center text-center">
              No Notices To Show.
            </td>
          </tr>
        ))}
      <style jsx>
        {`
          th,
          td {
            padding: 1.5px 5px;
          }
        `}
      </style>
    </>
  );
};

export default Table;
