import {
  ColDef,
  GridOptions,
  GridReadyEvent,
  RowStyle,
} from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import moment from 'moment-timezone';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import ClickToCopy from '@/components/copyText';
import { Badge } from '@/components/ui/badge';
import { fetchApi } from '@/lib/utils';
import { OrderDataType } from '@/models/Orders';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import TimeRemainingRenderer from './TimeRemainingRenderer';

type ExtendedOrderDataType = OrderDataType & {
  delivery?: string;
  time_remaining?: string;
  time_difference: number;
};

function RunningTasks() {
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
    {
      field: 'download_date',
      headerName: 'Download Date',
      cellRenderer: (props: any) => (
        <Badge className="text-white bg-blue-800 hover:bg-blue-800">
          {props.value}
        </Badge>
      ),
    },
    {
      field: 'delivery',
      headerName: 'Delivery Time',
      valueGetter: (params: any) => ({
        date: params.data.delivery_date,
        time: params.data.delivery_bd_time,
      }),
      cellRenderer: (props: any) => (
        <Badge className="text-white bg-blue-800 hover:bg-blue-800">
          {props.value.date} | {props.value.time}
        </Badge>
      ),
    },
    {
      field: 'time_remaining',
      headerName: 'Time Remaining',
      cellRenderer: TimeRemainingRenderer,
      comparator: (_, __, nodeA: any, nodeB: any) => {
        // Custom sorting based on the `time_difference` field
        const diffA = nodeA.data.time_difference;
        const diffB = nodeB.data.time_difference;

        // Sort by time remaining in ascending order (closest time first)
        if (diffA < diffB) return -1;
        if (diffA > diffB) return 1;
        return 0;
      },
    },
    {
      field: 'task',
      headerName: 'Task',
      cellRenderer: (props: any) => {
        const tasks = props.value.split('+');

        return (
          <div className="grid-flow-row space-x-2 space-y-1">
            {tasks.map((task: string, index: number) => (
              <Badge
                key={index}
                className="text-white bg-blue-800 hover:bg-blue-800"
              >
                {task.trim()}
              </Badge>
            ))}
          </div>
        );
      },
    },
    { field: 'et', headerName: 'E.T' },
    { field: 'production', headerName: 'Production' },
    { field: 'qc1', headerName: 'QC1' },
    {
      field: 'folder_path',
      headerName: 'Folder Location',
      cellRenderer: (props: any) => <ClickToCopy text={props.value} />,
    },
    {
      field: 'type',
      headerName: 'Type',
      filter: 'agTextColumnFilter',
      cellRenderer: (props: any) => (
        <Badge className="text-white bg-blue-800 hover:bg-blue-800">
          {props.value}
        </Badge>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      filter: 'agTextColumnFilter',
      cellRenderer: (props: any) => (
        <Badge className="text-white bg-blue-800 hover:bg-blue-800">
          {props.value}
        </Badge>
      ),
    },
    { field: 'comment', headerName: 'Comments', filter: 'agTextColumnFilter' },
  ]);

  const defaultColDef = useMemo<ColDef>(() => {
    return {
      sortable: true,
      resizable: true,
      suppressMovable: true,
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
        process.env.NEXT_PUBLIC_BASE_URL +
        '/api/order?action=get-unfinished-orders';
      const options = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      };
      const response = await fetchApi(url, options);

      console.log(response.data);
      if (response.ok) {
        setOrders(response.data as ExtendedOrderDataType[]);
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
      const columnsToAutoSize = [
        'client_code',
        'folder',
        'task',
        'type',
        'status',
        'et',
        'production',
        'qc1',
        'download_date',
        'delivery',
        'time_remaining',
      ];
      gridRef.current.api.autoSizeColumns(columnsToAutoSize);
    }
  };

  const getRowStyle = (params: any): RowStyle | undefined => {
    const targetDate = moment.tz(
      `${params.data.delivery_date} ${params.data.delivery_bd_time}`,
      'YYYY-MM-DD HH:mm',
      'Asia/Dhaka',
    );
    const now = moment().tz('Asia/Dhaka');
    const diff = targetDate.diff(now, 'minutes');

    if (diff <= 0) {
      return {
        backgroundColor: 'rgb(30 41 59)',
        color: 'white',
      };
    } else if (diff <= 30) {
      return {
        backgroundColor: 'rgb(153 27 27)',
        color: 'white',
      };
    } else if (diff <= 60) {
      return {
        backgroundColor: 'rgb(154 52 18)',
        color: 'white',
      };
    }

    return undefined;
  };

  if (loading) {
    return <p className="text-center">Loading...</p>;
  }

  return (
    <div className="ag-theme-quartz" style={{ width: '100%' }}>
      <AgGridReact<ExtendedOrderDataType>
        ref={gridRef}
        rowData={orders}
        columnDefs={colDefs}
        defaultColDef={defaultColDef}
        gridOptions={gridOptions}
        domLayout="autoHeight"
        onGridReady={onGridReady}
        getRowStyle={getRowStyle}
      />
    </div>
  );
}

export default RunningTasks;
