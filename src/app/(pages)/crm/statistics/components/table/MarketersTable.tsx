'use client';
import { EmployeeDataType } from '@/models/Employees';
import {
  YYYY_MM_DD_to_DD_MM_YY as convertDDMMYY,
  getTodayDate,
} from '@/utility/date';
import fetchData from '@/utility/fetch';
import moment from 'moment-timezone';
import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

const DailyStatusTable = () => {
  const [marketers, setMarketers] = useState<EmployeeDataType[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const { data: session } = useSession();

  async function getAllMarketers() {
    try {
      setLoading(true);

      let url: string =
        process.env.NEXT_PUBLIC_BASE_URL +
        '/api/report?action=get-all-marketers';
      let options: {} = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      };

      let response = await fetchData(url, options);

      if (response.ok) {
        setMarketers(response.data);
      } else {
        toast.error(response.data);
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while retrieving marketers data');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getAllMarketers();
  }, []);

  if (loading) {
    return <p className="text-center">Loading...</p>;
  }

  return (
    <>
      <div className="table-responsive text-lg px-2">
        <table className="table table-hover border table-bordered">
          <thead>
            <tr className="bg-gray-50">
              <th>S/N</th>
              <th>Marketer Name</th>
              <th>Real Name</th>
              <th>Joining Date</th>
              <th>Phone</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            {!loading ? (
              <>
                {marketers.map((marketer, index) => {
                  return (
                    <tr key={marketer.e_id}>
                      <td>{index + 1}</td>
                      <td>{marketer.company_provided_name}</td>
                      <td>{marketer.real_name}</td>
                      <td>
                        {marketer.joining_date
                          ? convertDDMMYY(marketer.joining_date)
                          : null}
                      </td>
                      <td>{marketer.phone ? marketer.phone : 'N/A'}</td>
                      <td>{marketer.email ? marketer.email : 'N/A'}</td>
                    </tr>
                  );
                })}
              </>
            ) : (
              <tr key={0}>
                <td colSpan={5} className="align-center text-center">
                  Loading...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default DailyStatusTable;
