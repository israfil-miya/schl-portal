import { ColDef, GridOptions, GridReadyEvent } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import Badge from '@/components/Badge';
import ClickToCopy from '@/components/copyText';
import ExtendableTd from '@/components/ExtendableTd';
import { fetchApi } from '@/lib/utils';
import { OrderDataType } from '@/models/Orders';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

type ExtendedOrderDataType = OrderDataType & { delivery: string };

function TestAndCorrection() {
  const [loading, setLoading] = useState(true);
  const gridRef = useRef<AgGridReact>(null);
  const [orders, setOrders] = useState<ExtendedOrderDataType[]>([]);
  const [colDefs] = useState<ColDef<ExtendedOrderDataType>[]>([
    {
      field: 'client_code',
      headerName: 'Client Code',
      pinned: 'left',
      filter: 'agTextColumnFilter',
    },
    { field: 'folder', headerName: 'Folder', filter: 'agTextColumnFilter' },
    { field: 'quantity', headerName: 'NOF' },
    { field: 'download_date', headerName: 'Download Date' },
    {
      field: 'delivery',
      headerName: 'Delivery Time',
      valueGetter: (params: any) => ({
        date: params.data.delivery_date,
        time: params.data.delivery_bd_time,
      }),
      cellRenderer: (props: any) => (
        <span>
          {props.value.date} | {props.value.time}
        </span>
      ),
    },
    { field: 'task', headerName: 'Task' },
    { field: 'et', headerName: 'E.T' },
    { field: 'production', headerName: 'Production' },
    { field: 'qc1', headerName: 'QC1' },
    { field: 'comment', headerName: 'Comments' },
    {
      field: 'folder_path',
      headerName: 'Folder Location',
      cellRenderer: (props: any) => <ClickToCopy text={props.value} />,
    },
    { field: 'type', headerName: 'Type', filter: 'agTextColumnFilter' },
    { field: 'status', headerName: 'Status', filter: 'agTextColumnFilter' },
  ]);

  const defaultColDef = useMemo<ColDef>(() => {
    return {
      sortable: true,
      resizable: true,
      suppressMovable: true,
      enableCellTextSelection: true,
    };
  }, []);

  const gridOptions = useMemo<GridOptions>(() => {
    return {
      copyHeadersToClipboard: true,
      enableCellTextSelection: true,
    };
  }, []);

  async function getAllOrders() {
    try {
      setLoading(true);
      const url =
        process.env.NEXT_PUBLIC_BASE_URL + '/api/order?action=get-redo-orders';
      const options = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      };
      const response = await fetchApi(url, options);

      if (response.ok) {
        setOrders(response.data as ExtendedOrderDataType[]);
        console.log(response.data);
      } else {
        toast.error(response.data as string);
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while retrieving orders');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getAllOrders();
  }, []);

  const onGridReady = (params: GridReadyEvent) => {
    if (gridRef.current && gridRef.current.api) {
      gridRef.current.api.sizeColumnsToFit();
      gridRef.current.api.autoSizeAllColumns();
    }
  };

  if (loading) {
    return <p className="text-center">Loading...</p>;
  }

  return (
    <div className="ag-theme-quartz" style={{ height: '100%', width: '100%' }}>
      <AgGridReact<ExtendedOrderDataType>
        ref={gridRef}
        rowData={orders}
        columnDefs={colDefs}
        defaultColDef={defaultColDef}
        gridOptions={gridOptions}
        domLayout="autoHeight"
        onGridReady={onGridReady}
      />
    </div>
  );
}

export default TestAndCorrection;
