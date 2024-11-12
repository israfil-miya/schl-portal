'use client';

import CallingStatusTd from '@/components/ExtendableTd';
import Linkify from '@/components/Linkify';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import CollapsibleCell from '@/components/CollapsibleCell';
import { formatDate } from '@/lib/date';
import { fetchApi } from '@/lib/utils';
import { ReportDataType } from '@/models/Reports';
import {
  ColDef,
  GridOptions,
  GridReadyEvent,
  RowStyle,
} from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { AgGridReact } from 'ag-grid-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import moment from 'moment-timezone';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import DeleteButton from './Delete';
import FilterButton from './Filter';

type ReportsState = {
  pagination: {
    count: number;
    pageCount: number;
  };
  items: ReportDataType[];
};

const Table = () => {
  const [reports, setReports] = useState<ReportsState>({
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
  const [loading, setLoading] = useState<boolean>(true);

  const prevPageCount = useRef<number>(0);
  const prevPage = useRef<number>(1);

  const { data: session } = useSession();

  const [filters, setFilters] = useState({
    country: '',
    companyName: '',
    category: '',
    fromDate: '',
    toDate: '',
    prospect: false,
    generalSearchString: '',
  });

  async function getAllReports() {
    try {
      // setLoading(true);

      let url: string =
        process.env.NEXT_PUBLIC_BASE_URL + '/api/report?action=get-all-reports';
      let options: {} = {
        method: 'POST',
        headers: {
          filtered: false,
          paginated: true,
          item_per_page: itemPerPage,
          page,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          staleClient: true,
          regularClient: false,
          test: false,
        }),
      };

      let response = await fetchApi(url, options);

      if (response.ok) {
        setReports(response.data as ReportsState);
      } else {
        toast.error(response.data as string);
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while retrieving reports data');
    } finally {
      setLoading(false);
    }
  }

  async function getAllReportsFiltered() {
    try {
      // setLoading(true);

      let url: string =
        process.env.NEXT_PUBLIC_BASE_URL + '/api/report?action=get-all-reports';
      let options: {} = {
        method: 'POST',
        headers: {
          filtered: true,
          paginated: true,
          item_per_page: itemPerPage,
          page,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...filters,
          staleClient: true,
          regularClient: false,
          test: false,
        }),
      };

      let response = await fetchApi(url, options);

      if (response.ok) {
        setReports(response.data as ReportsState);
        setIsFiltered(true);
      } else {
        toast.error(response.data as string);
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while retrieving reports data');
    } finally {
      setLoading(false);
    }
    return;
  }

  async function deleteReport(reportId: string, reqBy: string) {
    try {
      let url: string = process.env.NEXT_PUBLIC_PORTAL_URL + '/api/approval';
      let options: {} = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          req_type: 'Report Delete',
          req_by: reqBy,
          id: reportId,
        }),
      };

      let response = await fetchApi(url, options);

      if (response.ok) {
        toast.success('Request sent for approval');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while sending request for approval');
    }
    return;
  }

  useEffect(() => {
    getAllReports();
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
      if (reports?.pagination?.pageCount == 1) return;
      if (!isFiltered) getAllReports();
      else getAllReportsFiltered();
    }
    prevPage.current = page;
  }, [page]);

  useEffect(() => {
    if (reports?.pagination?.pageCount !== undefined) {
      setPage(1);
      if (prevPageCount.current !== 0) {
        if (!isFiltered) getAllReportsFiltered();
      }
      if (reports) setPageCount(reports?.pagination?.pageCount);
      prevPageCount.current = reports?.pagination?.pageCount;
      prevPage.current = 1;
    }
  }, [reports?.pagination?.pageCount]);

  useEffect(() => {
    // Reset to first page when itemPerPage changes
    prevPageCount.current = 0;
    prevPage.current = 1;
    setPage(1);

    if (!isFiltered) getAllReports();
    else getAllReportsFiltered();
  }, [itemPerPage]);

  const gridRef = useRef<AgGridReact>(null);

  const defaultColDef = useMemo<ColDef>(() => {
    return {
      sortable: true,
      resizable: true,
      suppressMovable: false,
    };
  }, []);

  const gridOptions = useMemo<GridOptions>(() => {
    return {
      copyHeadersToClipboard: true,
      enableCellTextSelection: true,
    };
  }, []);

  const [colDefs] = useState<ColDef<ReportDataType>[]>([
    {
      headerName: 'S/N',
      valueGetter: 'node.rowIndex + 1',
      sortable: false,
      filter: false,
      pinned: 'left',
    },
    {
      field: 'calling_date',
      headerName: 'Calling Date',
    },
    {
      field: 'followup_date',
      headerName: 'Folder',
    },
    { field: 'country', headerName: 'Country' },
    {
      field: 'website',
      headerName: 'Website',
      cellRenderer: (props: any) =>
        props.value.length ? (
          <Linkify coverText="Click here to visit" data={props.value} />
        ) : (
          'No link provided'
        ),
    },
    { field: 'category', headerName: 'Category' },
    { field: 'company_name', headerName: 'Company Name' },
    { field: 'contact_person', headerName: 'Contact Person' },
    { field: 'designation', headerName: 'Designation' },
    { field: 'contact_number', headerName: 'Contact Number' },
    { field: 'email_address', headerName: 'Email' },
    { field: 'country', headerName: 'Country' },

    {
      field: 'linkedin',
      headerName: 'Linkedin',
      cellRenderer: (props: any) =>
        props.value.length ? (
          <Linkify coverText="Click here to visit" data={props.value} />
        ) : (
          'No link provided'
        ),
    },
    {
      field: 'test_given_date_history',
      headerName: 'Test',
      cellRenderer: (props: any) => {
        return props.value?.length ? 'Yes' : 'No';
      },
    },
    {
      field: 'is_prospected',
      headerName: 'Prospect',
      cellRenderer: (props: any) => {
        return props.value
          ? `Yes (${props.data.followup_done ? 'Dealt' : 'Pending'})`
          : 'No';
      },
    },

    {
      headerName: 'Action',
      cellRenderer: (props: any) => {
        return (
          <DeleteButton reportData={props.data} submitHandler={deleteReport} />
        );
      },
    },
  ]);

  const onGridReady = (params: GridReadyEvent) => {
    if (gridRef.current && gridRef.current.api) {
      gridRef.current.api.autoSizeAllColumns();
    }
  };

  const getRowStyle = (params: any): RowStyle | undefined => {
    if (params.data.is_prospected) {
      if (params.data.prospect_status == 'high_interest') {
        return {
          backgroundColor: 'rgb(22 163 74)',
          color: 'white',
        };
      } else if (params.data.prospect_status == 'low_interest') {
        return {
          backgroundColor: 'rgb(234 88 12)',
          color: 'white',
        };
      }
    } else {
      return {
        backgroundColor: 'rgb(220 38 38)',
        color: 'white',
      };
    }

    return undefined;
  };

  return (
    <>
      <div className="flex flex-col justify-center sm:flex-row sm:justify-end mb-4 gap-2">
        <div className="items-center flex gap-2">
          <div className="inline-flex rounded-md" role="group">
            <Button
              onClick={handlePrevious}
              disabled={page === 1 || pageCount === 0 || loading}
              variant="outline"
              size="sm"
              className="rounded-r-none"
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </Button>
            <button
              disabled={true}
              className="hidden sm:visible sm:inline-flex items-center px-4 py-2 text-sm text-nowrap font-medium border"
            >
              <label>
                Page <b>{reports?.items?.length !== 0 ? page : 0}</b> of{' '}
                <b>{pageCount}</b>
              </label>
            </button>
            <Button
              onClick={handleNext}
              disabled={page === pageCount || pageCount === 0 || loading}
              variant="outline"
              size="sm"
              className="rounded-l-none"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <Select
            value={itemPerPage.toString()}
            onValueChange={(value: string) => setItemPerPage(parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="30" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>

          <FilterButton
            loading={loading}
            submitHandler={getAllReportsFiltered}
            setFilters={setFilters}
            filters={filters}
            className="w-full justify-between sm:w-auto"
          />
        </div>
      </div>

      {loading ? <p className="text-center">Loading...</p> : <></>}

      {!loading && (
        <div className="ag-theme-quartz" style={{ width: '100%' }}>
          <AgGridReact<ReportDataType>
            ref={gridRef}
            rowData={reports.items}
            columnDefs={colDefs}
            defaultColDef={defaultColDef}
            gridOptions={gridOptions}
            domLayout="autoHeight"
            onGridReady={onGridReady}
            getRowStyle={getRowStyle}
          />
        </div>
      )}
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
