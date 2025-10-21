'use client';

import { cn, generatePassword, hasPerm } from '@/lib/utils';
import { EmployeeDataType } from '@/models/Employees';
import { RoleDataType } from '@/models/Roles';
import { FullyPopulatedUserType } from '@/models/Users';
import { PermissionValue } from '@/permissions';
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
import React, {
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Controller, useForm } from 'react-hook-form';
import Select from 'react-select';
import { toast } from 'sonner';
import { ZodPopulatedUserDataType, populatedUserSchema } from '../schema';

const baseZIndex = 50; // 52

interface PropsType {
  loading: boolean;
  userData: ZodPopulatedUserDataType;
  employeesData: EmployeeDataType[];
  rolesData: RoleDataType[];
  submitHandler: (
    editedUserData: ZodPopulatedUserDataType,
    previousUserData: ZodPopulatedUserDataType,
  ) => Promise<void>;
}

const EditButton: React.FC<PropsType> = props => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const popupRef = useRef<HTMLElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const { data: session } = useSession();

  const userPermissions = useMemo(
    () => session?.user.permissions || [],
    [session?.user.permissions],
  );

  let employeeIdOptions = (props.employeesData || []).map(employee => ({
    value: employee.e_id,
    label: employee.e_id,
  }));

  const editorPerms = useMemo(
    () => new Set(session?.user.permissions || []),
    [session?.user.permissions],
  );

  const allowedRoles = useMemo(() => {
    return (props.rolesData || []).filter(role => {
      const perms = role.permissions || [];
      if (
        perms.includes('settings:the_super_admin' as PermissionValue) &&
        !editorPerms.has('settings:the_super_admin' as PermissionValue)
      )
        return false;
      return perms.every(p => editorPerms.has(p as PermissionValue));
    });
  }, [props.rolesData, editorPerms]);

  let roleOptions = allowedRoles.map(role => ({
    value: role._id,
    label: role.name,
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

  // const getEmployeeProvidedNameOnFocus = () => {
  //   try {
  //     const e_id: string = employeeId;

  //     if (e_id === '') return;

  //     const employee = props.employeesData.find(
  //       employee => employee.e_id === e_id,
  //     );

  //     if (employee) {
  //       setValue('provided_name', employee.company_provided_name || '');
  //     } else {
  //       toast.info('No employee found with the code provided');
  //     }
  //   } catch (e) {
  //     console.error(
  //       'An error occurred while retrieving employee provided name on input focus',
  //     );
  //   } finally {
  //     return;
  //   }
  // };

  const {
    watch,
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ZodPopulatedUserDataType>({
    resolver: zodResolver(populatedUserSchema),
    defaultValues: {
      ...props.userData,
    },
  });

  const fillEmployeeData = useCallback(() => {
    try {
      const e_id: string = employeeId;

      if (e_id === '') return;

      const employee = props.employeesData.find(
        employee => employee.e_id === e_id,
      );

      if (employee) {
        setValue('employee_id.real_name', employee.real_name || '');
        setValue('employee_id._id', employee._id.toString() || '');
        setValue(
          'employee_id.company_provided_name',
          employee.company_provided_name || '',
        );
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
  }, [employeeId, props.employeesData, setValue]);

  const onSubmit = async (data: ZodPopulatedUserDataType) => {
    await props.submitHandler(data, props.userData);
  };

  useEffect(() => {
    if (isOpen) {
      reset(props.userData);
    }
    console.log(props.userData);
  }, [isOpen, props.userData, reset]);

  useEffect(() => {
    fillEmployeeData();
  }, [employeeId, fillEmployeeData]);

  return (
    <>
      <button
        onClick={() => {
          setIsOpen(true);
        }}
        className={cn(
          'rounded-md disabled:cursor-not-allowed bg-blue-600 hover:opacity-90 hover:ring-2 hover:ring-blue-600 transition duration-200 delay-300 hover:text-opacity-100 text-white p-2 items-center',
          session?.user.permissions.includes('admin:edit_user'),
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
                    {errors.employee_id?.real_name &&
                      errors.employee_id?.real_name.message}
                  </span>
                </label>
                <input
                  {...register('employee_id.real_name')}
                  className="appearance-none block w-full bg-gray-50 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                  placeholder="Enter employee real name"
                  disabled={true}
                />
              </div>

              <div>
                <label className="tracking-wide text-gray-700 text-sm font-bold block mb-2 ">
                  <span className="uppercase">Username*</span>
                  <span className="text-red-700 text-wrap block text-xs">
                    {errors.username && errors.username.message}
                  </span>
                </label>
                <input
                  {...register('username')}
                  className="appearance-none block w-full bg-gray-50 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                  placeholder="Enter username"
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
                    placeholder="Enter password"
                    type="text"
                  />
                  <button
                    onClick={() => {
                      setValue(
                        'password',
                        generatePassword(
                          watch('employee_id.real_name').split(' ')[
                            watch('employee_id.real_name').split(' ').length - 1
                          ],
                          watch('username'),
                        ),
                      );
                    }}
                    type="button"
                    className="bg-gray-100 disabled:cursor-not-allowed border-gray-200 border enabled:hover:bg-gray-200 text-gray-600 py-[0.75rem] px-4 rounded-r enabled:focus:outline-none enabled:transition duration-100 delay-100"
                  >
                    <KeySquare size={18} />
                  </button>
                </div>
              </div>

              {hasPerm('admin:assign_role', userPermissions) && (
                <div className={cn('grid grid-cols-1 gap-x-3 gap-y-4 mb-4')}>
                  <div>
                    <label className="tracking-wide text-gray-700 text-sm font-bold block mb-2 ">
                      <span className="uppercase">Role*</span>
                      <span className="text-red-700 text-wrap block text-xs">
                        {errors.role_id && errors.role_id?.message}
                      </span>
                    </label>
                    <Controller
                      name="role_id"
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          {...setClassNameAndIsDisabled(isOpen)}
                          options={roleOptions}
                          closeMenuOnSelect={true}
                          placeholder="Select role"
                          classNamePrefix="react-select"
                          menuPortalTarget={setMenuPortalTarget}
                          styles={setCalculatedZIndex(baseZIndex)}
                          value={
                            roleOptions.find(
                              option =>
                                String(option.value) === String(field.value),
                            ) || null
                          }
                          onChange={option => {
                            field.onChange(option ? option.value : '');
                            setValue(
                              'role_id.permissions',
                              props.rolesData.find(
                                role => role._id === option?.value,
                              )?.permissions || [],
                            );
                          }}
                        />
                      )}
                    />
                  </div>
                </div>
              )}

              {watch('role_id.permissions')?.includes('login:crm') && (
                <div>
                  <label className="tracking-wide text-gray-700 text-sm font-bold block mb-2 ">
                    <span className="uppercase">Provided Name*</span>
                    <span className="text-red-700 text-wrap block text-xs">
                      {errors.employee_id?.company_provided_name &&
                        errors.employee_id.company_provided_name.message}
                    </span>
                  </label>
                  <input
                    {...register('employee_id.company_provided_name')}
                    className="appearance-none block w-full bg-gray-50 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    placeholder="Enter employee provided name"
                    disabled={true}
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
