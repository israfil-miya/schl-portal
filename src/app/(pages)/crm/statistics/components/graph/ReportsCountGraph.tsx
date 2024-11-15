'use client';

import LineChart from '@/components/Charts/Line.chart';
import { transparentize } from '@/utility/chart';
import React, { useEffect, useState } from 'react';

interface ReportsCountGraphProps {
  isLoading: boolean;
  data: { [key: string]: number };
  className?: string;
}

interface LineChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
    fill: boolean;
    tension: number;
    type: 'line';
    order: number;
  }[];
}

const ReportsCountGraph: React.FC<ReportsCountGraphProps> = ({
  isLoading,
  data,
  className,
}) => {
  const [graphData, setGraphData] = useState<LineChartData>({
    labels: [],
    datasets: [],
  });

  useEffect(() => {
    const dataLabels: string[] = Object.keys(data).map(
      monthName =>
        monthName.charAt(0).toUpperCase() +
        monthName.replace('_', ' ').slice(1),
    );

    setGraphData({
      labels: dataLabels,
      datasets: [
        {
          label: 'Reports Count',
          data: Object.values(data),
          backgroundColor: transparentize('#4169e1'),
          borderColor: '#1c318f',
          borderWidth: 2,
          fill: true, // Fill the area under the line
          tension: 0.3,
          type: 'line',
          order: 0,
        },
      ],
    });
  }, [data]);

  return (
    <div>
      {isLoading ? <p className="text-center">Loading...</p> : null}
      {!isLoading && (
        <LineChart
          className={className || ''}
          chartData={graphData}
          showLegend={false}
        />
      )}
    </div>
  );
};

export default ReportsCountGraph;
