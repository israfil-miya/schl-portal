'use client';

import BarChart from '@/components/Charts/Bar.chart';
import {
  generateBackgroundColors as generateGraphColors,
  transparentize,
} from '@/utility/chart';
import React, { useEffect, useState } from 'react';

interface TestOrdersTrendGraphProps {
  isLoading: boolean;
  data: { [key: string]: number };
  className?: string;
}

interface BarChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string[];
    borderColor: string[];
    borderWidth: number;
    type: 'bar';
    order: number;
  }[];
}

const TestOrdersTrendGraph: React.FC<TestOrdersTrendGraphProps> = ({
  isLoading,
  data,
  className,
}) => {
  const [graphData, setGraphData] = useState<BarChartData>({
    labels: [],
    datasets: [],
  });

  useEffect(() => {
    const dataLabels: string[] = Object.keys(data).map(
      monthName =>
        monthName.charAt(0).toUpperCase() +
        monthName.replace('_', ' ').slice(1),
    );

    // alternating colors
    const evenYearColor = transparentize('#4169e1'); // Blue for even years
    const oddYearColor = transparentize('#ffad33'); // Orange for odd years

    const evenYearBorderColor = '#1c318f';
    const oddYearBorderColor = '#a96500';

    const graphColors = generateGraphColors(
      data,
      evenYearColor,
      oddYearColor,
      evenYearBorderColor,
      oddYearBorderColor,
    );

    setGraphData({
      labels: dataLabels,
      datasets: [
        {
          label: 'Test Orders',
          data: Object.values(data),
          backgroundColor: graphColors.bgColors, // array of colors
          borderColor: graphColors.borderColors,
          borderWidth: 2,
          type: 'bar',
          order: 0,
        },
      ],
    });
  }, [data]);

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

export default TestOrdersTrendGraph;
