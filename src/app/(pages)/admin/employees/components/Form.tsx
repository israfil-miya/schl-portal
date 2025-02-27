'use client';
import { fetchApi } from '@/lib/utils';
import { setMenuPortalTarget } from '@/utility/selectHelpers';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import Select from 'react-select';
import { EmployeeDataType, validationSchema } from '../schema';

import { toast } from 'sonner';

export const bloodGroupOptions = [
  { value: 'A+', label: 'A+' },
  { value: 'A-', label: 'A-' },
  { value: 'B+', label: 'B+' },
  { value: 'B-', label: 'B-' },
  { value: 'AB+', label: 'AB+' },
  { value: 'AB-', label: 'AB-' },
  { value: 'O+', label: 'O+' },
  { value: 'O-', label: 'O-' },
];

export const departmentOptions = [
  { value: 'Production', label: 'Production' },
  { value: 'Marketing', label: 'Marketing' },
  { value: 'Software', label: 'Software' },
  { value: 'Accounting', label: 'Accounting' },
  { value: 'Management', label: 'Management' },
  { value: 'HR', label: 'HR' },
  { value: 'Administration', label: 'Administration' },
  { value: 'Others', label: 'Others' },
];

export const statusOptions = [
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
  { value: 'Resigned', label: 'Resigned' },
  { value: 'Fired', label: 'Fired' },
];

const Form: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();

  const {
    watch,
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<EmployeeDataType>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      e_id: '',
      real_name: '',
      joining_date: '',
      phone: '',
      email: '',
      birth_date: '',
      nid: '',
      blood_group: '',
      designation: '',
      department: 'Production',
      gross_salary: 0,
      bonus_eid_ul_fitr: 0,
      bonus_eid_ul_adha: 0,
      status: 'Active',
      provident_fund: 0,
      pf_start_date: '',
      pf_history: [],
      branch: '',
      division: '',
      company_provided_name: null,
      note: '',
    },
  });
  async function createClient(employeeData: EmployeeDataType) {
    try {
      setLoading(true);
      const parsed = validationSchema.safeParse(employeeData);

      if (!parsed.success) {
        console.error(parsed.error.issues.map(issue => issue.message));
        toast.error('Invalid form data');
        return;
      }

      let url: string =
        process.env.NEXT_PUBLIC_BASE_URL +
        '/api/employee?action=create-employee';
      let options: {} = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(parsed.data),
      };

      const response = await fetchApi(url, options);

      if (response.ok) {
        toast.success('Created new employee successfully');
        reset();
        // reset the form after successful submission
      } else {
        toast.error(response.data as string);
      }

      console.log('data', parsed.data, employeeData);
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while creating new employee');
    } finally {
      setLoading(false);
    }
  }

  const onSubmit = async (data: EmployeeDataType) => {
    await createClient(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-3 mb-4 gap-y-4">
        <div>
          <label className="tracking-wide text-gray-700 text-sm font-bold block mb-2 ">
            <span className="uppercase">Employee ID*</span>
            <span className="text-red-700 text-wrap block text-xs">
              {errors.e_id && errors.e_id.message}
            </span>
          </label>
          <input
            {...register('e_id')}
            className="appearance-none block w-full bg-gray-50 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            type="text"
            placeholder='Enter employee ID e.g. "0001"'
          />
        </div>
        <div>
          <label className="tracking-wide text-gray-700 text-sm font-bold block mb-2 ">
            <span className="uppercase">Full Name*</span>
            <span className="text-red-700 text-wrap block text-xs">
              {errors.real_name && errors.real_name.message}
            </span>
          </label>
          <input
            {...register('real_name')}
            className="appearance-none block w-full bg-gray-50 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            type="text"
            placeholder="Enter employee full name"
          />
        </div>
        <div>
          <label className="tracking-wide text-gray-700 text-sm font-bold block mb-2 ">
            <span className="uppercase">Joining Date*</span>
            <span className="text-red-700 text-wrap block text-xs">
              {errors.joining_date && errors.joining_date.message}
            </span>
          </label>
          <input
            {...register('joining_date')}
            className="appearance-none block w-full bg-gray-50 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            type="date"
          />
        </div>
        <div>
          <label className="tracking-wide text-gray-700 text-sm font-bold block mb-2 ">
            <span className="uppercase">Phone*</span>
            <span className="text-red-700 text-wrap block text-xs">
              {errors.phone && errors.phone.message}
            </span>
          </label>
          <input
            {...register('phone')}
            className="appearance-none block w-full bg-gray-50 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            type="text"
            placeholder="Enter employee phone number"
          />
        </div>
        <div>
          <label className="tracking-wide text-gray-700 text-sm font-bold block mb-2 ">
            <span className="uppercase">Email</span>
            <span className="text-red-700 text-wrap block text-xs">
              {errors.email && errors.email.message}
            </span>
          </label>
          <input
            {...register('email')}
            className="appearance-none block w-full bg-gray-50 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            type="email"
            placeholder="Enter employee email"
          />
        </div>
        <div>
          <label className="tracking-wide text-gray-700 text-sm font-bold block mb-2 ">
            <span className="uppercase">NID Number*</span>
            <span className="text-red-700 text-wrap block text-xs">
              {errors.nid && errors.nid.message}
            </span>
          </label>
          <input
            {...register('nid')}
            className="appearance-none block w-full bg-gray-50 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            type="string"
            placeholder="Enter employee NID number"
          />
        </div>
        <div>
          <label className="tracking-wide text-gray-700 text-sm font-bold block mb-2 ">
            <span className="uppercase">Birth Date*</span>
            <span className="text-red-700 text-wrap block text-xs">
              {errors.birth_date && errors.birth_date.message}
            </span>
          </label>
          <input
            {...register('birth_date')}
            className="appearance-none block w-full bg-gray-50 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            type="date"
          />
        </div>
        <div>
          <label className="tracking-wide text-gray-700 text-sm font-bold block mb-2 ">
            <span className="uppercase">Designation</span>
            <span className="text-red-700 text-wrap block text-xs">
              {errors.designation && errors.designation.message}
            </span>
          </label>
          <input
            {...register('designation')}
            className="appearance-none block w-full bg-gray-50 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            type="text"
            placeholder="Enter employee designation"
          />
        </div>
        <div>
          <label className="tracking-wide text-gray-700 text-sm font-bold block mb-2 ">
            <span className="uppercase">Branch*</span>
            <span className="text-red-700 text-wrap block text-xs">
              {errors.designation && errors.designation.message}
            </span>
          </label>
          <input
            {...register('branch')}
            className="appearance-none block w-full bg-gray-50 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            type="text"
            placeholder="Enter employee branch"
          />
        </div>
        <div>
          <label className="tracking-wide text-gray-700 text-sm font-bold block mb-2 ">
            <span className="uppercase">Division</span>
            <span className="text-red-700 text-wrap block text-xs">
              {errors.division && errors.division.message}
            </span>
          </label>
          <input
            {...register('division')}
            className="appearance-none block w-full bg-gray-50 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            type="text"
            placeholder="Enter employee division"
          />
        </div>
        <div>
          <label className="tracking-wide text-gray-700 text-sm font-bold block mb-2 ">
            <span className="uppercase">Gross Salary</span>
            <span className="text-red-700 text-wrap block text-xs">
              {errors.gross_salary && errors.gross_salary.message}
            </span>
          </label>
          <input
            {...register('gross_salary', { valueAsNumber: true })}
            className="appearance-none block w-full bg-gray-50 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            type="number"
            placeholder="Enter employee gross salary"
          />
        </div>
        <div>
          <label className="tracking-wide text-gray-700 text-sm font-bold block mb-2 ">
            <span className="uppercase">PF (%)</span>
            <span className="text-red-700 text-wrap block text-xs">
              {errors.provident_fund && errors.provident_fund.message}
            </span>
          </label>
          <input
            {...register('provident_fund', { valueAsNumber: true })}
            className="appearance-none block w-full bg-gray-50 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            type="number"
            step="0.1"
            placeholder="Enter employee PF percentage"
          />
        </div>
        <div>
          <label className="tracking-wide text-gray-700 text-sm font-bold block mb-2 ">
            <span className="uppercase">PF Start Date</span>
            <span className="text-red-700 text-wrap block text-xs">
              {errors.pf_start_date && errors.pf_start_date.message}
            </span>
          </label>
          <input
            {...register('pf_start_date')}
            className="appearance-none block w-full bg-gray-50 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            type="date"
          />
        </div>

        <div>
          <label className="tracking-wide text-gray-700 text-sm font-bold block mb-2 ">
            <span className="uppercase">Status*</span>
            <span className="text-red-700 text-wrap block text-xs">
              {errors.status && errors.status?.message}
            </span>
          </label>

          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select
                options={statusOptions}
                closeMenuOnSelect={true}
                placeholder="Select status"
                classNamePrefix="react-select"
                menuPortalTarget={setMenuPortalTarget}
                menuPlacement="auto"
                menuPosition="fixed"
                value={
                  statusOptions.find(option => option.value === field.value) ||
                  null
                }
                onChange={option => field.onChange(option ? option.value : '')}
              />
            )}
          />
        </div>

        <div>
          <label className="tracking-wide text-gray-700 text-sm font-bold block mb-2 ">
            <span className="uppercase">Bonus - 1</span>
            <span className="text-red-700 text-wrap block text-xs">
              {errors.bonus_eid_ul_fitr && errors.bonus_eid_ul_fitr.message}
            </span>
          </label>
          <input
            {...register('bonus_eid_ul_fitr', { valueAsNumber: true })}
            className="appearance-none block w-full bg-gray-50 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            type="number"
            onFocus={() =>
              watch('gross_salary') !== 0 &&
              setValue('bonus_eid_ul_fitr', watch('gross_salary') * 0.5)
            }
            step={0.1}
            placeholder="Enter employee Eid-ul-Fitr bonus"
          />
        </div>
        <div>
          <label className="tracking-wide text-gray-700 text-sm font-bold block mb-2 ">
            <span className="uppercase">Bonus - 2</span>
            <span className="text-red-700 text-wrap block text-xs">
              {errors.bonus_eid_ul_adha && errors.bonus_eid_ul_adha.message}
            </span>
          </label>
          <input
            {...register('bonus_eid_ul_adha', { valueAsNumber: true })}
            className="appearance-none block w-full bg-gray-50 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            type="number"
            onFocus={() =>
              watch('gross_salary') !== 0 &&
              setValue('bonus_eid_ul_adha', watch('gross_salary') * 0.5)
            }
            step={0.1}
            placeholder="Enter employee Eid-ul-Adha bonus"
          />
        </div>
        <div>
          <label className="tracking-wide text-gray-700 text-sm font-bold block mb-2 ">
            <span className="uppercase">Blood Group</span>
            <span className="text-red-700 text-wrap block text-xs">
              {errors.blood_group && errors.blood_group?.message}
            </span>
          </label>

          <Controller
            name="blood_group"
            control={control}
            render={({ field }) => (
              <Select
                options={bloodGroupOptions}
                closeMenuOnSelect={true}
                placeholder="Select blood group"
                classNamePrefix="react-select"
                menuPortalTarget={setMenuPortalTarget}
                menuPlacement="auto"
                menuPosition="fixed"
                value={
                  bloodGroupOptions.find(
                    option => option.value === field.value,
                  ) || null
                }
                onChange={option => field.onChange(option ? option.value : '')}
              />
            )}
          />
        </div>
        <div>
          <label className="tracking-wide text-gray-700 text-sm font-bold block mb-2 ">
            <span className="uppercase">Department</span>
            <span className="text-red-700 text-wrap block text-xs">
              {errors.department && errors.department?.message}
            </span>
          </label>

          <Controller
            name="department"
            control={control}
            render={({ field }) => (
              <Select
                options={departmentOptions}
                closeMenuOnSelect={true}
                placeholder="Select department"
                classNamePrefix="react-select"
                menuPortalTarget={setMenuPortalTarget}
                menuPlacement="auto"
                menuPosition="fixed"
                value={
                  departmentOptions.find(
                    option => option.value === field.value,
                  ) || null
                }
                onChange={option => field.onChange(option ? option.value : '')}
              />
            )}
          />
        </div>
        {/* Company Provided Name */}
        {watch('department') === 'Marketing' && (
          <div>
            <label className="tracking-wide text-gray-700 text-sm font-bold block mb-2 ">
              <span className="uppercase">Company Provided Name*</span>
              <span className="text-red-700 text-wrap block text-xs">
                {errors.company_provided_name &&
                  errors.company_provided_name?.message}
              </span>
            </label>
            <input
              {...register('company_provided_name')}
              className="appearance-none block w-full bg-gray-50 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
              type="text"
              placeholder="Enter employee company provided name"
            />
          </div>
        )}
      </div>

      <div>
        <label className="tracking-wide text-gray-700 text-sm font-bold block mb-2 ">
          <span className="uppercase">Note</span>
          <span className="text-red-700 text-wrap block text-xs">
            {errors.note && errors.note?.message}
          </span>
        </label>
        <textarea
          {...register('note')}
          rows={5}
          className="appearance-none block w-full bg-gray-50 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
          placeholder="Write any note about the employee"
        />
      </div>

      <button
        disabled={loading}
        className="rounded-md bg-primary text-white hover:opacity-90 hover:ring-4 hover:ring-primary transition duration-200 delay-300 hover:text-opacity-100 text-primary-foreground px-10 py-2 mt-6 uppercase"
        type="submit"
      >
        {loading ? 'Creating...' : 'Create this employee'}
      </button>
    </form>
  );
};

export default Form;
