import { cn } from '@/lib/utils';
import { ChartData, ChartOptions } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import React from 'react';
import { Bar } from 'react-chartjs-2';

// Registering the datalabels plugin
import { Chart as ChartJS } from 'chart.js/auto';
ChartJS.register(ChartDataLabels);

interface BarChartProps {
  chartData: ChartData<'bar'>;
  showLegend?: boolean;
  className?: string;
}

const BarChart: React.FC<BarChartProps> = ({
  chartData,
  showLegend,
  className,
}) => {
  const options: ChartOptions<'bar'> = {
    plugins: {
      datalabels: {
        anchor: 'end',
        align: 'top',
        // formatter: (value) => Math.round(value as number),
        formatter: value => {
          if (typeof value === 'number') {
            if (value % 1 === 0) {
              return value.toFixed(0); // Display as integer (no decimal)
            } else {
              return value.toFixed(1); // Display with one decimal place
            }
          }
          return value; // Return the value as-is if it's not a number
        },
        font: {
          weight: 'bold',
        },
      },
      legend: {
        position: 'bottom',
        display: showLegend === undefined ? true : showLegend,
        labels: {
          font: {
            weight: 'bold',
            size: 15,
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        // ticks: {
        //   callback: (value) => Math.round(value as number),
        // },
        ticks: {
          callback: value => {
            if (typeof value === 'number') {
              if (value % 1 === 0) {
                return value.toFixed(0); // Display as integer (no decimal)
              } else {
                return value.toFixed(1); // Display with one decimal place
              }
            }
            return value; // Return the value as-is if it's not a number
          },
        },
      },
    },
    layout: {
      padding: {
        top: 50,
      },
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  return (
    <div className={cn(`h-96`, className)}>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default BarChart;
