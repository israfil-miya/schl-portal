'use client';

import ExtendableTd from '@/components/ExtendableTd';
import { cn, fetchApi, getObjectChanges } from '@/lib/utils';
import { UserDataType } from '@/models/Users';

import {
  validationSchema,
  EmployeeDataType as zod_EmployeeDataType,
} from '@/app/(pages)/admin/employees/schema';
import Badge from '@/components/Badge';
import HiddenText from '@/components/HiddenText';
import NoData, { Type } from '@/components/NoData';
import { EmployeeDataType } from '@/models/Employees';
import { formatDate } from '@/utility/date';
import { ChevronLeft, ChevronRight, CirclePlus } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'nextjs-toploader/app';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import DeleteButton from './Delete';
import EditButton from './Edit';
import FilterButton from './Filter';

type EmployeesState = {
  pagination: {
    count: number;
    pageCount: number;
  };
  items: EmployeeDataType[];
};

const Table = () => {
  const [employees, setEmployees] = useState<EmployeesState>({
    pagination: {
      count: 0,
      pageCount: 0,
    },
    items: [] as EmployeeDataType[],
  });

  const { data: session } = useSession();

  const router = useRouter();
  const [totalPayOut, setTotalPayOut] = useState({
    salary_gross: 0,
    bonus_eid_ul_fitr: 0,
    bonus_eid_ul_adha: 0,
  });

  const [loading, setLoading] = useState<boolean>(true);

  const [filters, setFilters] = useState({
    bloodGroup: '',
    serviceTime: '',
    generalSearchString: '',
  });

  const getTotalPayOut = (employees: EmployeeDataType[]) => {
    let totalPayOut = {
      salary_gross: 0,
      bonus_eid_ul_fitr: 0,
      bonus_eid_ul_adha: 0,
    };

    employees.forEach((employee: EmployeeDataType) => {
      if (employee.status === 'Active') {
        totalPayOut.salary_gross += employee.gross_salary;
        totalPayOut.bonus_eid_ul_fitr += employee.bonus_eid_ul_fitr;
        totalPayOut.bonus_eid_ul_adha += employee.bonus_eid_ul_adha;
      }
    });

    return totalPayOut;
  };

  const [isFiltered, setIsFiltered] = useState<boolean>(false);

  const getAllEmployees = useCallback(async () => {
    try {
      // setLoading(true);

      let url: string =
        process.env.NEXT_PUBLIC_BASE_URL +
        '/api/employee?action=get-all-employees';
      let options: {} = {
        method: 'POST',
        headers: {
          Accept: '*/*',
          filtered: false,
          paginated: false,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
        cache: 'no-store',
      };

      let response = await fetchApi(url, options);

      if (response.ok) {
        setIsFiltered(false);
        const employees = response.data as EmployeesState;
        setEmployees(employees);

        setTotalPayOut(getTotalPayOut(employees.items));
      } else {
        toast.error(response.data as string);
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while retrieving employees data');
    } finally {
      setLoading(false);
    }
  }, []);

  const getAllEmployeesFiltered = useCallback(async () => {
    try {
      // setLoading(true);

      let url: string =
        process.env.NEXT_PUBLIC_BASE_URL +
        '/api/employee?action=get-all-employees';
      let options: {} = {
        method: 'POST',
        headers: {
          Accept: '*/*',
          filtered: true,
          paginated: false,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...filters,
        }),
        cache: 'no-store',
      };

      let response = await fetchApi(url, options);

      if (response.ok) {
        const employees = response.data as EmployeesState;
        setEmployees(employees);
        setTotalPayOut(getTotalPayOut(employees.items));
        setIsFiltered(true);
      } else {
        toast.error(response.data as string);
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while retrieving employees data');
    } finally {
      setLoading(false);
    }
    return;
  }, [filters]);

  async function deleteEmployee(employeeData: EmployeeDataType) {
    try {
      let url: string =
        process.env.NEXT_PUBLIC_BASE_URL + '/api/approval?action=new-request';
      let options: {} = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          target_model: 'Employee',
          action: 'delete',
          object_id: employeeData._id,
          deleted_data: employeeData,
          req_by: session?.user.db_id,
        }),
      };

      let response = await fetchApi(url, options);

      if (response.ok) {
        toast.success('Request sent for approval');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while sending request for approval');
    }
    return;
  }

  async function editEmployee(
    editedEmployeeData: zod_EmployeeDataType,
    previousEmployeeData: zod_EmployeeDataType,
  ) {
    try {
      console.log('EMPLOYEE DATA: ', editedEmployeeData);

      setLoading(true);
      const parsed = validationSchema.safeParse(editedEmployeeData);

      if (!parsed.success) {
        console.error(parsed.error.issues.map(issue => issue.message));
        toast.error('Invalid form data');
        return;
      }

      let url: string =
        process.env.NEXT_PUBLIC_BASE_URL + '/api/employee?action=edit-employee';
      let options: {} = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          updated_by: session?.user.real_name,
        },
        body: JSON.stringify(parsed.data),
      };

      const response = await fetchApi(url, options);

      if (response.ok) {
        toast.success('Updated the employee data');

        if (!isFiltered) await getAllEmployees();
        else await getAllEmployeesFiltered();
      } else {
        toast.error(response.data as string);
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while updating the employee');
    } finally {
      setLoading(false);
    }
  }

  const fetchEmployees = useCallback(async () => {
    if (!isFiltered) {
      await getAllEmployees();
    } else {
      await getAllEmployeesFiltered();
    }
  }, [isFiltered, getAllEmployees, getAllEmployeesFiltered]);

  useEffect(() => {
    fetchEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between mb-4 gap-2">
        <button
          onClick={() =>
            router.push(process.env.NEXT_PUBLIC_BASE_URL + '/admin/employees')
          }
          className="flex justify-between items-center gap-2 rounded-md bg-primary hover:opacity-90 hover:ring-4 hover:ring-primary transition duration-200 delay-300 hover:text-opacity-100 text-white px-3 py-2"
        >
          Add new employee
          <CirclePlus size={18} />
        </button>
        <div className="items-center flex gap-2">
          {/* pagination controls removed for this page */}

          <FilterButton
            loading={loading}
            submitHandler={getAllEmployeesFiltered}
            setFilters={setFilters}
            filters={filters}
            className="w-full justify-between sm:w-auto"
          />
        </div>
      </div>

      {loading ? <p className="text-center">Loading...</p> : <></>}

      <div className="table-responsive text-nowrap text-base">
        {!loading &&
          (employees?.items?.length !== 0 ? (
            <table className="table border table-bordered table-striped">
              <thead className="table-dark">
                <tr>
                  <th>S/N</th>
                  <th>EID</th>
                  <th>Full Name</th>
                  <th>Joining Date</th>
                  <th>Blood Group</th>
                  <th>Designation</th>
                  <th>Department</th>
                  <th>Gross Salary</th>
                  <th>Status</th>
                  <th>Note</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {employees?.items?.map((employee, index) => (
                  <tr key={String(employee._id)}>
                    <td>{index + 1}</td>
                    <td className="text-wrap">{employee.e_id}</td>
                    <td className="text-wrap">
                      <Link
                        className="hover:underline underline-offset-2"
                        href={`/accountancy/employees/employee-profile/?name=${encodeURIComponent(String(employee.real_name))}`}
                      >
                        {employee.real_name}
                      </Link>
                    </td>
                    <td className="text-wrap">
                      {formatDate(employee.joining_date)}
                    </td>
                    <td className="text-wrap">{employee.blood_group}</td>
                    <td className="text-wrap">{employee.designation}</td>
                    <td className="text-wrap">{employee.department}</td>
                    <td className="text-wrap">
                      <HiddenText>
                        {employee.gross_salary.toLocaleString()} BDT
                      </HiddenText>
                    </td>
                    <td
                      className="uppercase text-wrap"
                      style={{ verticalAlign: 'middle' }}
                    >
                      <Badge
                        value={employee.status}
                        className={cn(
                          employee.status == 'Active'
                            ? 'bg-green-100 text-green-800 border-green-400'
                            : 'bg-red-100 text-red-800 border-red-400',
                        )}
                      />
                    </td>
                    <ExtendableTd data={employee.note} />

                    <td
                      className="text-center"
                      style={{ verticalAlign: 'middle' }}
                    >
                      <div className="inline-block">
                        <div className="flex gap-2">
                          <DeleteButton
                            employeeData={employee}
                            submitHandler={deleteEmployee}
                          />

                          <EditButton
                            loading={loading}
                            employeeData={
                              employee as unknown as zod_EmployeeDataType
                            }
                            submitHandler={editEmployee}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="table-dark">
                <tr>
                  <td></td>
                  <td></td>
                  <td>
                    <div className="font-semibold flex gap-2 items-center">
                      <span>SALARY (GROSS):</span>
                      <HiddenText>
                        {totalPayOut.salary_gross.toLocaleString()} BDT
                      </HiddenText>
                    </div>
                  </td>
                  <td colSpan={2}></td>
                  <td>
                    <div className="font-semibold flex gap-2 items-center">
                      <span>BONUS (EID-UL-FITR):</span>
                      <HiddenText>
                        {totalPayOut.bonus_eid_ul_fitr.toLocaleString()} BDT
                      </HiddenText>
                    </div>
                  </td>
                  <td colSpan={3}></td>
                  <td>
                    <div className="font-semibold flex gap-2 items-center">
                      <span>BONUS (EID-UL-ADHA):</span>
                      <HiddenText>
                        {totalPayOut.bonus_eid_ul_adha.toLocaleString()} BDT
                      </HiddenText>
                    </div>
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          ) : (
            <NoData text="No Employees Found" type={Type.danger} />
          ))}
      </div>

      <style jsx>
        {`
          th,
          td {
            padding: 2.5px 10px;
            // border: 1px solid #9ca3af;
          }
        `}
      </style>
    </>
  );
};

export default Table;
