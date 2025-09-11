'use client';

import Badge from '@/components/Badge';
import NoData, { Type } from '@/components/NoData';
import Pagination from '@/components/Pagination';
import { usePaginationManager } from '@/hooks/usePaginationManager';
import {
  cn,
  constructFileName,
  fetchApi,
  hasAnyPerm,
  hasPerm,
} from '@/lib/utils';
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
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { toast } from 'sonner';
import { NoticeDataType, validationSchema } from '../../admin/notices/schema';
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

  const { data: session } = useSession();

  const userPermissions = useMemo(
    () => session?.user.permissions || [],
    [session?.user.permissions],
  );

  const router = useRouter();

  const [isFiltered, setIsFiltered] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [pageCount, setPageCount] = useState<number>(0);
  const [itemPerPage, setItemPerPage] = useState<number>(30);
  const [loading, setIsLoading] = useState<boolean>(true);
  const [searchVersion, setSearchVersion] = useState<number>(0);

  const [filters, setFilters] = useState({
    fromDate: '',
    toDate: '',
    noticeNo: '',
    title: '',
    channel: '',
  });

  const getAllNotices = useCallback(
    async (page: number, itemPerPage: number) => {
      try {
        // setIsLoading(true);

        let url: string =
          process.env.NEXT_PUBLIC_BASE_URL +
          '/api/notice?action=get-all-notices';
        let options: {} = {
          method: 'POST',
          headers: {
            filtered: false,
            paginated: true,
            item_per_page: itemPerPage,
            page,
            'Content-Type': 'application/json',
          },

          // show only production notices to users with permission to send production notices
          // show only marketers notices to users with permission to send marketers notices
          // show both if user has both permissions
          // show only production notices if user has none of the permissions
          body: JSON.stringify(
            hasPerm('notice:send_notice_production', userPermissions) &&
              hasPerm('notice:send_notice_marketers', userPermissions)
              ? {}
              : hasPerm('notice:send_notice_production', userPermissions)
                ? { channel: 'production' }
                : hasPerm('notice:send_notice_marketers', userPermissions)
                  ? { channel: 'marketers' }
                  : { channel: 'production' },
          ),
        };

        let response = await fetchApi(url, options);

        if (response.ok) {
          setNotices(response.data);
          setIsFiltered(false);
          setPageCount((response.data as NoticesState).pagination.pageCount);
        } else {
          toast.error(response.data);
        }
      } catch (error) {
        console.error(error);
        toast.error('An error occurred while retrieving notices data');
      } finally {
        setIsLoading(false);
      }
    },
    [userPermissions],
  );

  const getAllNoticesFiltered = useCallback(
    async (page: number, itemPerPage: number) => {
      try {
        // setIsLoading(true);

        let url: string =
          process.env.NEXT_PUBLIC_BASE_URL +
          '/api/notice?action=get-all-notices';
        let options: {} = {
          method: 'POST',
          headers: {
            filtered: true,
            paginated: true,
            item_per_page: itemPerPage,
            page: page,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(filters),
        };

        let response = await fetchApi(url, options);

        if (response.ok) {
          setNotices(response.data as NoticesState);
          setIsFiltered(true);
          setPageCount((response.data as NoticesState).pagination.pageCount);
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
    },
    [filters],
  );

  const deleteNotice = async (noticeData: NoticeDataType) => {
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
        await fetchNotices();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while deleting the notice');
    }
    return;
  };

  const editNotice = async (editedNoticeData: NoticeDataType) => {
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

        await fetchNotices();
      } else {
        toast.error(response.data as string);
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while updating the notice');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNotices = useCallback(async () => {
    if (!isFiltered) {
      await getAllNotices(page, itemPerPage);
    } else {
      await getAllNoticesFiltered(page, itemPerPage);
    }
  }, [isFiltered, getAllNotices, getAllNoticesFiltered, page, itemPerPage]);

  usePaginationManager({
    page,
    itemPerPage,
    pageCount,
    setPage,
    triggerFetch: fetchNotices,
  });

  useEffect(() => {
    if (searchVersion > 0 && isFiltered && page === 1) {
      fetchNotices();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchVersion, isFiltered, page]);

  const handleSearch = useCallback(() => {
    setIsFiltered(true);
    setPage(1);
    setSearchVersion(v => v + 1);
  }, [setIsFiltered, setPage]);

  return (
    <>
      <div
        className={cn(
          'flex flex-col mb-4 gap-2',
          hasAnyPerm(
            ['notice:send_notice_marketers', 'notice:send_notice_production'],
            userPermissions,
          )
            ? 'sm:flex-row sm:justify-between'
            : 'sm:justify-end sm:flex-row',
        )}
      >
        {hasAnyPerm(
          ['notice:send_notice_marketers', 'notice:send_notice_production'],
          userPermissions,
        ) && (
          <button
            onClick={() =>
              router.push(
                process.env.NEXT_PUBLIC_BASE_URL +
                  '/admin/notices/create-notice',
              )
            }
            className="flex justify-between items-center gap-2 rounded-md bg-primary hover:opacity-90 hover:ring-4 hover:ring-primary transition duration-200 delay-300 hover:text-opacity-100 text-white px-3 py-2"
          >
            Send new notice
            <CirclePlus size={18} />
          </button>
        )}

        <div className="items-center flex gap-2">
          <Pagination
            page={page}
            pageCount={pageCount}
            setPage={setPage}
            isLoading={loading}
          />

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
            isLoading={loading}
            submitHandler={handleSearch}
            setFilters={setFilters}
            filters={filters}
            className="w-full justify-between sm:w-auto"
          />
        </div>
      </div>

      {loading ? <p className="text-center">Loading...</p> : <></>}

      <div className="table-responsive text-nowrap text-base">
        {!loading &&
          (notices?.items?.length !== 0 ? (
            <table className="table table-bordered table-striped">
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>Date</th>
                  <th>Notice No</th>
                  <th>Title</th>
                  {hasAnyPerm(
                    [
                      'notice:send_notice_marketers',
                      'notice:send_notice_production',
                    ],
                    userPermissions,
                  ) && <th>Channel</th>}
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
                      <td className="text-wrap">{notice.title}</td>
                      {hasAnyPerm(
                        [
                          'notice:send_notice_marketers',
                          'notice:send_notice_production',
                        ],
                        userPermissions,
                      ) && (
                        <td
                          className="uppercase text-wrap"
                          style={{ verticalAlign: 'middle' }}
                        >
                          <Badge value={notice.channel} />
                        </td>
                      )}
                      <td
                        className="text-center"
                        style={{ verticalAlign: 'middle' }}
                      >
                        <div className="inline-block">
                          <div className="flex gap-2">
                            {hasAnyPerm(
                              [
                                'notice:send_notice_marketers',
                                'notice:send_notice_production',
                              ],
                              userPermissions,
                            ) && (
                              <>
                                <DeleteButton
                                  noticeData={notice}
                                  submitHandler={deleteNotice}
                                />
                                <EditButton
                                  isLoading={loading}
                                  submitHandler={editNotice}
                                  noticeData={notice}
                                />
                              </>
                            )}

                            <button
                              onClick={() => {
                                window.open(
                                  process.env.NEXT_PUBLIC_BASE_URL +
                                    `/notices/${encodeURIComponent(notice.notice_no)}`,
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
          ) : (
            <NoData text="No Notices Found" type={Type.danger} />
          ))}
      </div>
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
