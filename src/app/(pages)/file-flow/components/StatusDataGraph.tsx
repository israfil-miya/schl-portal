'use client';

import { OrderData } from '@/app/api/order/handlers/getOrdersQP';
import BarChart from '@/components/Charts/Bar.chart';
import moment from 'moment-timezone';
import React, { useEffect, useState } from 'react';
import { FiltersContext } from '../FiltersContext';

interface StatusDataGraphProps {
  isLoading: boolean;
  data: OrderData[];
  className?: string;
}

interface BarChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
    type: 'bar';
    order: number;
  }[];
}

const StatusDataGraph: React.FC<StatusDataGraphProps> = ({
  isLoading,
  data,
  className,
}) => {
  const filtersCtx = React.useContext(FiltersContext);

  const [graphData, setGraphData] = useState<BarChartData>({
    labels: [],
    datasets: [],
  });

  useEffect(() => {
    let quantityTotal = 0;
    let quantityPending = 0;

    const dataLabels = data.map(d => moment(d.date).format('MMMM DD'));

    // Calculate totals
    data.forEach(entry => {
      if (filtersCtx?.filters.flowType === 'files') {
        quantityTotal += entry.fileQuantity;
        quantityPending += entry.filePending;
      } else {
        quantityTotal += entry.orderQuantity;
        quantityPending += entry.orderPending;
      }
    });

    // Set chart data
    setGraphData({
      labels: dataLabels,
      datasets: [
        {
          label: `Total ${filtersCtx?.filters.flowType === 'files' ? 'Files' : 'Orders'} (${quantityTotal})`,
          data: data.map(entry =>
            filtersCtx?.filters.flowType === 'files'
              ? entry.fileQuantity
              : entry.orderQuantity,
          ),
          backgroundColor: '#efa438',
          borderColor: 'black',
          borderWidth: 2,
          type: 'bar',
          order: 0,
        },
        {
          label: `Pending ${filtersCtx?.filters.flowType === 'files' ? 'Files' : 'Orders'} (${quantityPending})`,
          data: data.map(entry =>
            filtersCtx?.filters.flowType === 'files'
              ? entry.filePending
              : entry.orderPending,
          ),
          backgroundColor: '#466cdb',
          borderColor: 'black',
          borderWidth: 2,
          type: 'bar',
          order: 1,
        },
      ],
    });
  }, [data, filtersCtx?.filters.flowType]);

  return (
    <div>
      {isLoading ? <p className="text-center">Loading...</p> : null}
      {!isLoading && (
        <BarChart
          className={className || ''}
          chartData={graphData}
          showLegend={true}
        />
      )}
    </div>
  );
};

export default StatusDataGraph;
