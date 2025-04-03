'use client';

import {
  bloodGroupOptions,
  departmentOptions,
  statusOptions,
} from '@/app/(pages)/admin/employees/components/Form';
import {
  EmployeeDataType,
  validationSchema,
} from '@/app/(pages)/admin/employees/schema';
import { cn } from '@/lib/utils';
import {
  setCalculatedZIndex,
  setClassNameAndIsDisabled,
  setMenuPortalTarget,
} from '@/utility/selectHelpers';
import { zodResolver } from '@hookform/resolvers/zod';
import 'flowbite';
import { initFlowbite } from 'flowbite';
import { SquarePen, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import Select from 'react-select';

const baseZIndex = 50; // 52

interface PropsType {
  loading: boolean;
  employeeData: EmployeeDataType;
  submitHandler: (
    editedEmployeeData: EmployeeDataType,
    previousEmployeeData: EmployeeDataType,
  ) => Promise<void>;
}

const EditButton: React.FC<PropsType> = props => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const popupRef = useRef<HTMLElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleClickOutside = (e: React.MouseEvent<HTMLDivElement>) => {
    if (
      popupRef.current &&
      !popupRef.current.contains(e.target as Node) &&
      !popupRef.current.querySelector('input:focus, textarea:focus') &&
      !popupRef.current.querySelector('button:focus')
    ) {
      setIsOpen(false);
    }
  };

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
      ...props.employeeData,
    },
  });

  useEffect(() => {
    initFlowbite();
  }, []);

  const onSubmit = async (data: EmployeeDataType) => {
    await props.submitHandler(data, props.employeeData);
  };

  useEffect(() => {
    if (isOpen) {
      reset(props.employeeData);
    }
    console.log(props.employeeData);
  }, [isOpen]);

  return (
    <>
      <button
        onClick={() => {
          setIsOpen(true);
        }}
        className="rounded-md bg-blue-600 hover:opacity-90 hover:ring-2 hover:ring-blue-600 transition duration-200 delay-300 hover:text-opacity-100 text-white p-2 items-center"
      >
        <SquarePen size={18} />
      </button>

      <section
        onClick={handleClickOutside}
        className={`fixed z-${baseZIndex} inset-0 flex justify-center items-center transition-colors ${isOpen ? 'visible bg-black/20 disable-page-scroll' : 'invisible'} `}
      >
        <article
          ref={popupRef}
          onClick={e => e.stopPropagation()}
          className={`${isOpen ? 'scale-100 opacity-100' : 'scale-125 opacity-0'} bg-white rounded-sm shadow relative md:w-[60vw] lg:w-[40vw]  text-wrap`}
        >
          <header className="flex items-center align-middle justify-between px-4 py-2 border-b rounded-t">
            <h3 className="text-gray-900 text-base lg:text-lg font-semibold uppercase">
              Edit Employee
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              type="button"
              className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center "
            >
              <X size={18} />
            </button>
          </header>

          <form
            ref={formRef}
            className="overflow-x-hidden overflow-y-scroll max-h-[70vh] p-4 text-start"
            onSubmit={handleSubmit(onSubmit)}
          >
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
                  placeholder="Enter employee ID"
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
                  placeholder="Enter full name"
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
                  placeholder="Select joining date"
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
                  placeholder="Enter phone number"
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
                  placeholder="Enter email address"
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
                  type="number"
                  placeholder="Enter NID number"
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
                  placeholder="Select birth date"
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
                  placeholder="Enter designation"
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
                  placeholder="Enter branch"
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
                  placeholder="Enter division"
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
                  placeholder="Enter gross salary"
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
                  placeholder="Enter PF percentage"
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
                  placeholder="Select PF start date"
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
                      {...field}
                      {...setClassNameAndIsDisabled(isOpen)}
                      styles={setCalculatedZIndex(baseZIndex)}
                      options={statusOptions}
                      closeMenuOnSelect={true}
                      placeholder="Select status"
                      classNamePrefix="react-select"
                      menuPortalTarget={setMenuPortalTarget}
                      menuPlacement="auto"
                      menuPosition="fixed"
                      value={
                        statusOptions.find(
                          option => option.value === field.value,
                        ) || null
                      }
                      onChange={option =>
                        field.onChange(option ? option.value : '')
                      }
                    />
                  )}
                />
              </div>

              <div>
                <label className="tracking-wide text-gray-700 text-sm font-bold block mb-2 ">
                  <span className="uppercase">Bonus (Eid-ul-Fitr)</span>
                  <span className="text-red-700 text-wrap block text-xs">
                    {errors.bonus_eid_ul_fitr &&
                      errors.bonus_eid_ul_fitr.message}
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
                  placeholder="Enter Eid-ul-Fitr bonus amount"
                />
              </div>
              <div>
                <label className="tracking-wide text-gray-700 text-sm font-bold block mb-2 ">
                  <span className="uppercase">Bonus (Eid-ul-Adha)</span>
                  <span className="text-red-700 text-wrap block text-xs">
                    {errors.bonus_eid_ul_adha &&
                      errors.bonus_eid_ul_adha.message}
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
                  placeholder="Enter Eid-ul-Adha bonus amount"
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
                      {...field}
                      {...setClassNameAndIsDisabled(isOpen)}
                      styles={setCalculatedZIndex(baseZIndex)}
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
                      onChange={option =>
                        field.onChange(option ? option.value : '')
                      }
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
                      {...field}
                      {...setClassNameAndIsDisabled(isOpen)}
                      styles={setCalculatedZIndex(baseZIndex)}
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
                      onChange={option =>
                        field.onChange(option ? option.value : '')
                      }
                    />
                  )}
                />
              </div>
              {/* Company Provided Name */}
              {watch('department') === 'Marketing' && (
                <div>
                  <label className="tracking-wide text-gray-700 text-sm font-bold block mb-2 ">
                    <span className="uppercase">Company Provided Name</span>
                    <span className="text-red-700 text-wrap block text-xs">
                      {errors.company_provided_name &&
                        errors.company_provided_name?.message}
                    </span>
                  </label>
                  <input
                    {...register('company_provided_name')}
                    className="appearance-none block w-full bg-gray-50 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    type="text"
                    placeholder="Enter company provided name"
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
          </form>

          <footer className="flex space-x-2 items-center px-4 py-2 border-t justify-end border-gray-200 rounded-b">
            <div className="space-x-2 justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-md bg-gray-600 text-white hover:opacity-90 hover:ring-2 hover:ring-gray-600 transition duration-200 delay-300 hover:text-opacity-100 px-4 py-1"
                type="button"
                disabled={props.loading}
              >
                Close
              </button>
              <button
                disabled={props.loading}
                onClick={handleSubmit(onSubmit, errors =>
                  console.log('Validation errors:', errors),
                )}
                className="rounded-md bg-blue-600 text-white  hover:opacity-90 hover:ring-2 hover:ring-blue-600 transition duration-200 delay-300 hover:text-opacity-100 px-4 py-1"
                type="button"
              >
                {props.loading ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </footer>
        </article>
      </section>
    </>
  );
};

export default EditButton;
