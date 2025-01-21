'use client';

import React from 'react';
import { FiltersContext } from '../FiltersContext';
import { CountryData } from './Graphs';

interface CountryDataHeatMapProps {
  isLoading: boolean;
  data: CountryData;
}

const FlowHeatmap: React.FC<CountryDataHeatMapProps> = ({
  data: flowData,
  isLoading,
}) => {
  const filtersCtx = React.useContext(FiltersContext); // { filters: { fromDate: string, toDate: string, flowType: 'files' | 'orders' } }
  const flowType = filtersCtx?.filters.flowType;

  const countries = Object.keys(flowData);
  const dates = flowData['Others']?.map(item => item.date); // all countries have the same dates

  // Calculate totals for each column (total per date)
  const dateTotals = dates?.map(date => {
    return countries.reduce((total, country) => {
      const countryData = flowData[country].find(item => item.date === date);
      return (
        total +
        (flowType === 'files'
          ? (countryData?.fileQuantity ?? 0)
          : (countryData?.orderQuantity ?? 0))
      );
    }, 0);
  });

  // Calculate totals for each row (total per country)
  const countryTotals = countries.map(country => {
    return flowData[country].reduce((total, data) => {
      return (
        total + (flowType === 'files' ? data.fileQuantity : data.orderQuantity)
      );
    }, 0);
  });

  return (
    <>
      {isLoading ? <p className="text-center">Loading...</p> : null}

      {!isLoading && (
        <div className="table-responsive">
          <table className="table table-bordered table-striped">
            <thead style={{ backgroundColor: '#7ba541', color: 'white' }}>
              <tr>
                <th></th>
                {dates?.map(date => <td key={date}>{date.split('-')[2]}</td>)}
                <th className="font-bold">Total</th>
              </tr>
            </thead>
            <tbody>
              {countries.map((country, rowIndex) => (
                <tr key={country}>
                  <td style={{ backgroundColor: '#7ba541', color: 'white' }}>
                    {country}
                  </td>
                  {dates?.map((date, idx) => {
                    const data = flowData[country].find(
                      item => item.date === date,
                    );
                    const value =
                      flowType === 'files'
                        ? (data?.fileQuantity ?? 0)
                        : (data?.orderQuantity ?? 0);

                    return <td key={idx}>{value}</td>;
                  })}
                  <td className="font-bold">{countryTotals[rowIndex]}</td>
                </tr>
              ))}
              <tr className="font-bold">
                <td style={{ backgroundColor: '#7ba541', color: 'white' }}>
                  Total
                </td>
                {dateTotals?.map((total, idx) => <td key={idx}>{total}</td>)}
                <td>
                  {countryTotals.reduce(
                    (total, countryTotal) => total + countryTotal,
                    0,
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};

export default FlowHeatmap;
