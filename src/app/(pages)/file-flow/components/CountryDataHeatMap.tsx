'use client';

import { OrderData } from '@/app/api/order/route';
import BarChart from '@/components/Charts/Bar.chart';
import { transparentize } from '@/utility/chart';
import moment from 'moment-timezone';
import React, { useEffect, useState } from 'react';
import { FiltersContext } from '../FiltersContext';
import { CountryData } from './Graphs';

interface CountryDataHeatMapProps {
  isLoading: boolean;
  data: CountryData;
  className?: string;
}

const generateColor = (orderQuantity: number, fileQuantity: number): string => {
  const maxValue = 500; // Define maximum value for scaling
  const value = orderQuantity + fileQuantity;
  const intensity = Math.min(value / maxValue, 1) * 255;
  return `rgb(${255 - intensity}, ${255 - intensity}, ${intensity})`;
};

const FlowHeatmap: React.FC<CountryDataHeatMapProps> = ({
  data: heatmapData,
}) => {
  const countries = Object.keys(heatmapData);
  const dates = heatmapData.Australia.map(item => item.date); // Assuming all countries have the same dates

  // Calculate totals for each column (total per date)
  const dateTotals = dates.map(date => {
    return countries.reduce((total, country) => {
      const countryData = heatmapData[country].find(item => item.date === date);
      return (
        total +
        (countryData?.orderQuantity ?? 0) +
        (countryData?.fileQuantity ?? 0)
      );
    }, 0);
  });

  // Calculate totals for each row (total per country)
  const countryTotals = countries.map(country => {
    return heatmapData[country].reduce((total, data) => {
      return total + data.orderQuantity + data.fileQuantity;
    }, 0);
  });

  return (
    <div>
      <h2>Flow Heatmap</h2>
      <table>
        <thead>
          <tr>
            <th>Country / Date</th>
            {dates.map(date => (
              <th key={date}>{date}</th>
            ))}
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {countries.map((country, rowIndex) => (
            <tr key={country}>
              <td>{country}</td>
              {heatmapData[country].map((data, idx) => (
                <td
                  key={idx}
                  style={{
                    backgroundColor: generateColor(
                      data.orderQuantity,
                      data.fileQuantity,
                    ),
                    color:
                      data.orderQuantity + data.fileQuantity > 100
                        ? 'white'
                        : 'black',
                  }}
                >
                  {`${data.orderQuantity}/${data.fileQuantity}`}
                </td>
              ))}
              <td>{countryTotals[rowIndex]}</td>
            </tr>
          ))}
          <tr>
            <td>Total</td>
            {dateTotals.map((total, idx) => (
              <td key={idx}>{total}</td>
            ))}
            <td>
              {countryTotals.reduce(
                (total, countryTotal) => total + countryTotal,
                0,
              )}
            </td>
          </tr>
        </tbody>
      </table>

      <style jsx>{`
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th,
        td {
          padding: 10px;
          text-align: center;
          border: 1px solid #ddd;
        }
        th {
          background-color: #f4f4f4;
        }
        tr:nth-child(even) {
          background-color: #f9f9f9;
        }
      `}</style>
    </div>
  );
};

export default FlowHeatmap;
