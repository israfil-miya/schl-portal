'use client';
import { fetchApi } from '@/lib/utils';
import { EmployeeDataType } from '@/models/Employees';
import { formatDate } from '@/utility/date';
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
        '/api/employee?action=get-all-marketers';
      let options: {} = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      };

      let response = await fetchApi(url, options);

      if (response.ok) {
        setMarketers(response.data as EmployeeDataType[]);
      } else {
        toast.error(response.data as string);
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
    <div className="table-responsive text-lg px-2">
      {marketers.length !== 0 ? (
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
          <tbody className="text-base">
            {marketers.map((marketer, index) => (
              <tr key={marketer.e_id}>
                <td>{index + 1}</td>
                <td>{marketer.company_provided_name}</td>
                <td>{marketer.real_name}</td>
                <td>
                  {marketer.joining_date
                    ? formatDate(marketer.joining_date)
                    : null}
                </td>
                <td>{marketer.phone ? marketer.phone : 'N/A'}</td>
                <td>{marketer.email ? marketer.email : 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <table className="table border table-bordered table-striped">
          <tbody>
            <tr key={0}>
              <td className="align-center text-center text-wrap">
                No Marketers To Show.
              </td>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
};

export default DailyStatusTable;
