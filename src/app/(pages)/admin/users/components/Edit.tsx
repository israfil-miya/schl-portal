'use client';

import { cn, generatePassword } from '@/lib/utils';
import { EmployeeDataType } from '@/models/Employees';
import {
  setCalculatedZIndex,
  setClassNameAndIsDisabled,
  setMenuPortalTarget,
} from '@/utility/selectHelpers';
import { zodResolver } from '@hookform/resolvers/zod';
import 'flowbite';
import { initFlowbite } from 'flowbite';
import { KeySquare, SquarePen, X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import Select from 'react-select';
import { toast } from 'sonner';
import { roleOptions } from '../create-user/components/Form';
import { UserDataType, validationSchema } from '../schema';

const baseZIndex = 50; // 52

interface PropsType {
  loading: boolean;
  userData: UserDataType;
  employeesData: EmployeeDataType[];
  submitHandler: (editedOrderData: UserDataType) => Promise<void>;
}

const EditButton: React.FC<PropsType> = props => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const popupRef = useRef<HTMLElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const { data: session } = useSession();

  const filteredRoleOptions = useMemo(() => {
    if (session?.user.role === 'admin') {
      return roleOptions.filter(
        option => option.value !== 'admin' && option.value !== 'super',
      );
    }
    return roleOptions;
  }, [session?.user.role]);

  const employeeIds = props.employeesData?.map(employee => employee.e_id);

  let employeeIdOptions = (employeeIds || []).map(employeeId => ({
    value: employeeId,
    label: employeeId,
  }));

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

  const [employeeId, setEmployeeId] = useState<string>('');

  const getEmployeeNameOnFocus = () => {
    try {
      const e_id: string = employeeId;

      if (e_id === '') return;

      const employee = props.employeesData.find(
        employee => employee.e_id === e_id,
      );

      if (employee) {
        setValue('real_name', employee.real_name);
      } else {
        toast.info('No employee found with the code provided');
      }
    } catch (e) {
      console.error(
        'An error occurred while retrieving employee name on input focus',
      );
    } finally {
      return;
    }
  };

  const getEmployeeProvidedNameOnFocus = () => {
    try {
      const e_id: string = employeeId;

      if (e_id === '') return;

      const employee = props.employeesData.find(
        employee => employee.e_id === e_id,
      );

      if (employee) {
        setValue('provided_name', employee.company_provided_name || '');
      } else {
        toast.info('No employee found with the code provided');
      }
    } catch (e) {
      console.error(
        'An error occurred while retrieving employee provided name on input focus',
      );
    } finally {
      return;
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
  } = useForm<UserDataType>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      ...props.userData,
    },
  });

  useEffect(() => {
    initFlowbite();
  }, []);

  const onSubmit = async (data: UserDataType) => {
    await props.submitHandler(data);
  };

  useEffect(() => {
    if (isOpen) {
      reset(props.userData);
    }
    console.log(props.userData);
  }, [isOpen]);

  return (
    <>
      <button
        onClick={() => {
          setIsOpen(true);
        }}
        className={cn(
          'rounded-md disabled:cursor-not-allowed bg-blue-600 hover:opacity-90 hover:ring-2 hover:ring-blue-600 transition duration-200 delay-300 hover:text-opacity-100 text-white p-2 items-center',
          session?.user.role === 'admin' &&
            (props.userData.role === 'admin' ||
              props.userData.role === 'super') &&
            'hidden',
        )}
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
              Edit User
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
                  <span className="uppercase">Employee Id</span>
                  <span className="text-red-700 text-wrap block text-xs">
                    {/* {errors.type && errors.type?.message} */}
                  </span>
                </label>
                <Select
                  {...setClassNameAndIsDisabled(isOpen)}
                  options={employeeIdOptions}
                  closeMenuOnSelect={true}
                  placeholder="Select id"
                  classNamePrefix="react-select"
                  menuPortalTarget={setMenuPortalTarget}
                  styles={setCalculatedZIndex(baseZIndex)}
                  value={
                    employeeIdOptions.find(
                      option => option.value === employeeId,
                    ) || null
                  }
                  onChange={option => setEmployeeId(option ? option.value : '')}
                />
              </div>

              <div>
                <label className="tracking-wide text-gray-700 text-sm font-bold block mb-2 ">
                  <span className="uppercase">Real Name*</span>
                  <span className="text-red-700 text-wrap block text-xs">
                    {errors.real_name && errors.real_name.message}
                  </span>
                </label>
                <input
                  onFocus={getEmployeeNameOnFocus}
                  {...register('real_name')}
                  className="appearance-none block w-full bg-gray-50 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                />
              </div>

              <div>
                <label className="tracking-wide text-gray-700 text-sm font-bold block mb-2 ">
                  <span className="uppercase">Username*</span>
                  <span className="text-red-700 text-wrap block text-xs">
                    {errors.name && errors.name.message}
                  </span>
                </label>
                <input
                  {...register('name')}
                  className="appearance-none block w-full bg-gray-50 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                />
              </div>

              <div>
                <label className="tracking-wide text-gray-700 text-sm font-bold block mb-2">
                  <span className="uppercase">Password*</span>
                  <span className="text-red-700 text-wrap block text-xs">
                    {errors.password && errors.password.message}
                  </span>
                </label>
                <div className="flex items-center">
                  <input
                    {...register('password')}
                    className="appearance-none block w-full bg-gray-50 text-gray-700 border border-gray-200 rounded-l py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                  />
                  <button
                    onClick={() => {
                      setValue(
                        'password',
                        generatePassword(
                          watch('real_name').split(' ')[
                            watch('real_name').split(' ').length - 1
                          ],
                          watch('name'),
                        ),
                      );
                    }}
                    type="button"
                    className="bg-gray-200 hover:bg-gray-300 text-black py-3.5 px-4 rounded-r focus:outline-none transition duration-100 delay-100"
                  >
                    <KeySquare size={18} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-x-3 gap-y-4 mb-4">
                <div>
                  <label className="block uppercase tracking-wide text-gray-700 text-sm font-bold mb-2">
                    Role
                  </label>
                  <Controller
                    name="role"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        {...setClassNameAndIsDisabled(isOpen)}
                        options={filteredRoleOptions}
                        closeMenuOnSelect={true}
                        placeholder="Select role"
                        classNamePrefix="react-select"
                        menuPortalTarget={setMenuPortalTarget}
                        styles={setCalculatedZIndex(baseZIndex)}
                        value={
                          filteredRoleOptions.find(
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
              </div>

              {watch('role') === 'marketer' && (
                <div>
                  <label className="tracking-wide text-gray-700 text-sm font-bold block mb-2 ">
                    <span className="uppercase">Provided Name*</span>
                    <span className="text-red-700 text-wrap block text-xs">
                      {errors.provided_name && errors.provided_name.message}
                    </span>
                  </label>
                  <input
                    onFocus={getEmployeeProvidedNameOnFocus}
                    {...register('provided_name')}
                    className="appearance-none block w-full bg-gray-50 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                  />
                </div>
              )}
            </div>
            <div>
              <label className="tracking-wide text-gray-700 text-sm font-bold block mb-2 ">
                <span className="uppercase">Comment</span>
                <span className="text-red-700 text-wrap block text-xs">
                  {errors.comment && errors.comment?.message}
                </span>
              </label>
              <textarea
                {...register('comment')}
                rows={5}
                className="appearance-none block w-full bg-gray-50 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                placeholder="Write any note about the user"
              />
            </div>
          </form>

          <footer
            className={cn(
              'flex items-center px-4 py-2 border-t justify-end gap-6 border-gray-200 rounded-b',
            )}
          >
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
                onClick={() => {
                  formRef.current?.requestSubmit();
                }}
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
