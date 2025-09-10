'use client';

import { OrderData } from '@/app/api/order/handlers/getOrdersQP';
import BarChart from '@/components/Charts/Bar.chart';
import moment from 'moment-timezone';
import React, { useEffect, useState } from 'react';
import { FiltersContext } from '../FiltersContext';

interface FlowDataGraphProps {
  isLoading: boolean;
  data: OrderData[];
  className?: string;
}

interface BarChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string[];
    borderColor: string;
    borderWidth: number;
    type: 'bar';
    order: number;
  }[];
}

const FlowDataGraph: React.FC<FlowDataGraphProps> = ({
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
    if (!data || data.length === 0) return;

    // Extract unique months and assign alternating colors
    const uniqueMonths = [
      ...new Set(data.map(d => new Date(d.date).getMonth())),
    ];
    const colors: Record<number, string> = {};

    uniqueMonths.forEach((month, index) => {
      colors[month] = index % 2 === 0 ? '#4169e1' : '#ffad33'; // Blue and orange
    });

    const dataLabels = data.map(d => moment(d.date).format('MMMM DD'));
    const datasetData = data.map(d =>
      filtersCtx?.filters.flowType === 'files'
        ? d.fileQuantity
        : filtersCtx?.filters.flowType === 'orders'
          ? d.orderQuantity
          : 0,
    );

    const backgroundColors = data.map(d => {
      const month = new Date(d.date).getMonth();
      return colors[month] || '#efa438'; // Default color if not in colors
    });

    setGraphData({
      labels: dataLabels,
      datasets: [
        {
          label:
            filtersCtx?.filters.flowType === 'files'
              ? 'File Quantity'
              : 'Order Quantity',
          data: datasetData,
          backgroundColor: backgroundColors,
          borderColor: 'black',
          borderWidth: 2,
          type: 'bar',
          order: 0,
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
          showLegend={false}
        />
      )}
    </div>
  );
};

export default FlowDataGraph;
