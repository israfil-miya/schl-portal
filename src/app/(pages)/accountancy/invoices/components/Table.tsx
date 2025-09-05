'use client';

import Badge from '@/components/Badge';
import ExtendableTd from '@/components/ExtendableTd';
import { fetchApi, hasPerm } from '@/lib/utils';
import { EmployeeDataType } from '@/models/Employees';

import NoData, { Type } from '@/components/NoData';
import Pagination from '@/components/Pagination';
import { usePaginationManager } from '@/hooks/usePaginationManager';
import { cn } from '@/lib/utils';
import { formatDate } from '@/utility/date';
import { has } from 'lodash';
import {
  ChevronLeft,
  ChevronRight,
  CirclePlus,
  CloudDownload,
} from 'lucide-react';
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
import { InvoiceDataType, validationSchema } from '../schema';
import DeleteButton from './Delete';
import FilterButton from './Filter';

type InvoicesState = {
  pagination: {
    count: number;
    pageCount: number;
  };
  items: InvoiceDataType[];
};

const Table: React.FC = props => {
  const [invoices, setInvoices] = useState<InvoicesState>({
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
  const [loading, setLoading] = useState<boolean>(true);
  const [searchVersion, setSearchVersion] = useState<number>(0);

  const [filters, setFilters] = useState({
    clientCode: '',
    invoiceNumber: '',
    fromDate: '',
    toDate: '',
  });

  const getAllInvoices = useCallback(
    async (page: number, itemPerPage: number) => {
      try {
        // setLoading(true);

        let url: string =
          process.env.NEXT_PUBLIC_BASE_URL +
          '/api/invoice?action=get-all-invoices';
        let options: {} = {
          method: 'POST',
          headers: {
            filtered: false,
            paginated: true,
            items_per_page: itemPerPage,
            page: page,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            staleInvoice: true,
            regularInvoice: false,
            test: false,
          }),
        };

        let response = await fetchApi(url, options);

        if (response.ok) {
          setInvoices(response.data as InvoicesState);
          setPageCount((response.data as InvoicesState).pagination.pageCount);
        } else {
          toast.error(response.data as string);
        }
      } catch (error) {
        console.error(error);
        toast.error('An error occurred while retrieving invoices data');
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const getAllInvoicesFiltered = useCallback(
    async (page: number, itemPerPage: number) => {
      try {
        // setLoading(true);

        let url: string =
          process.env.NEXT_PUBLIC_BASE_URL +
          '/api/invoice?action=get-all-invoices';
        let options: {} = {
          method: 'POST',
          headers: {
            filtered: true,
            paginated: true,
            items_per_page: itemPerPage,
            page: page,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...filters,
          }),
        };

        let response = await fetchApi(url, options);

        if (response.ok) {
          setInvoices(response.data as InvoicesState);
          setIsFiltered(true);
          setPageCount((response.data as InvoicesState).pagination.pageCount);
        } else {
          toast.error(response.data as string);
        }
      } catch (error) {
        console.error(error);
        toast.error('An error occurred while retrieving invoices data');
      } finally {
        setLoading(false);
      }
      return;
    },
    [filters],
  );

  async function deleteInvoice(invoiceNumber: string) {
    try {
      let url: string =
        process.env.NEXT_PUBLIC_BASE_URL + '/api/invoice?action=delete-invoice';
      let options: {} = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoice_number: invoiceNumber,
        }),
      };

      let response = await fetchApi(url, options);

      if (response.ok) {
        const ftpDeleteConfirmation = confirm(
          'Delete from the FTP server too?',
        );
        if (ftpDeleteConfirmation) {
          let ftp_url: string =
            process.env.NEXT_PUBLIC_BASE_URL + '/api/ftp?action=delete-file';
          let ftp_options: {} = {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              folder_name: 'invoice',
              file_name: 'invoice_studioclickhouse_' + invoiceNumber + '.xlsx',
            },
          };

          let ftp_response = await fetchApi(ftp_url, ftp_options);
          if (ftp_response.ok) {
            toast.success('Deleted the invoice from FTP server');
          } else {
            toast.error(ftp_response.data as string);
          }
        } else {
          toast.success(response.data as string);
        }
        await fetchInvoices();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while deleting the invoice');
    }
    return;
  }

  async function downloadFile(invoiceNumber: string) {
    const toastId = toast.loading('Triggering the download...');
    try {
      const fileName = 'invoice_studioclickhouse_' + invoiceNumber + '.xlsx';

      let url: string =
        process.env.NEXT_PUBLIC_BASE_URL + '/api/ftp?action=download-file';
      let options: {} = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          folder_name: 'invoice',
          file_name: fileName,
        },
      };

      let response = await fetch(url, options);

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success('Download triggered successfully', {
          id: toastId,
        });
      } else {
        toast.error('Error downloading the invoice');
        toast.error('Unable to trigger the download', {
          id: toastId,
        });
      }
    } catch (error) {
      console.error(error);
      toast.dismiss(toastId);
      toast.error('An error occurred while initializing the download');
    }
  }

  const fetchInvoices = useCallback(async () => {
    if (!isFiltered) {
      await getAllInvoices(page, itemPerPage);
    } else {
      await getAllInvoicesFiltered(page, itemPerPage);
    }
  }, [isFiltered, getAllInvoices, getAllInvoicesFiltered, page, itemPerPage]);

  usePaginationManager({
    page,
    itemPerPage,
    pageCount,
    setPage,
    triggerFetch: fetchInvoices,
  });

  useEffect(() => {
    if (searchVersion > 0 && isFiltered && page === 1) {
      fetchInvoices();
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
          hasPerm('accountancy:create_invoice', userPermissions)
            ? 'sm:flex-row sm:justify-between'
            : 'sm:justify-end sm:flex-row',
        )}
      >
        {hasPerm('accountancy:create_invoice', userPermissions) && (
          <button
            onClick={() =>
              router.push(
                process.env.NEXT_PUBLIC_BASE_URL +
                  '/accountancy/invoices/create-invoice',
              )
            }
            className="flex justify-between items-center gap-2 rounded-md bg-primary hover:opacity-90 hover:ring-4 hover:ring-primary transition duration-200 delay-300 hover:text-opacity-100 text-white px-3 py-2"
          >
            Create new invoice
            <CirclePlus size={18} />
          </button>
        )}

        <div className="items-center flex gap-2">
          <Pagination
            pageCount={pageCount}
            page={page}
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
            loading={loading}
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
          (invoices?.items?.length !== 0 ? (
            <table className="table border table-bordered table-striped">
              <thead className="table-dark">
                <tr>
                  <th>Date</th>
                  <th>Invoice No.</th>
                  <th>Client Code</th>
                  <th>Creator</th>
                  <th>Time Period</th>
                  <th>Orders</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {invoices?.items?.map((invoice, index) => (
                  <tr key={String(invoice._id)}>
                    <td className="text-wrap">
                      {formatDate(invoice.createdAt!)}
                    </td>
                    <td
                      // className="text-center"
                      style={{ verticalAlign: 'middle' }}
                    >
                      <Badge
                        value={invoice.invoice_number}
                        className="text-sm uppercase"
                      />
                    </td>
                    <td
                      // className="text-center"
                      style={{ verticalAlign: 'middle' }}
                    >
                      <Badge
                        value={invoice.client_code}
                        className="text-sm uppercase"
                      />
                    </td>
                    <td className="text-wrap">{invoice.created_by}</td>
                    <td className="text-wrap">
                      <div className="flex gap-2">
                        <span>
                          {invoice.time_period?.fromDate
                            ? formatDate(invoice.time_period.fromDate)
                            : 'X'}
                        </span>
                        <span className="font-bold">—</span>{' '}
                        <span>
                          {invoice.time_period?.toDate
                            ? formatDate(invoice.time_period.toDate)
                            : 'X'}
                        </span>
                      </div>
                    </td>
                    <td className="text-wrap">{invoice.total_orders}</td>

                    <td
                      className="text-center"
                      style={{ verticalAlign: 'middle' }}
                    >
                      <div className="inline-block">
                        <div className="flex gap-2">
                          {hasPerm(
                            'accountancy:delete_invoice',
                            userPermissions,
                          ) && (
                            <DeleteButton
                              invoiceData={invoice}
                              submitHandler={deleteInvoice}
                            />
                          )}

                          {hasPerm(
                            'accountancy:download_invoice',
                            userPermissions,
                          ) && (
                            <button
                              onClick={() =>
                                downloadFile(invoice.invoice_number)
                              }
                              className="rounded-md bg-sky-600 hover:opacity-90 hover:ring-2 hover:ring-sky-600 transition duration-200 delay-300 hover:text-opacity-100 text-white p-2 items-center"
                            >
                              <CloudDownload size={18} />
                            </button>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <NoData text="No Invoices Found" type={Type.danger} />
          ))}
      </div>
      <style jsx>
        {`
          th,
          td {
            padding: 2.5px 10px;
          }
        `}
      </style>
    </>
  );
};

export default Table;
