'use client';

import { fetchApi, hasPerm } from '@/lib/utils';
import {
  setClassNameAndIsDisabled,
  setMenuPortalTarget,
} from '@/utility/selectHelpers';
import { zodResolver } from '@hookform/resolvers/zod';
import moment from 'moment-timezone';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import Select from 'react-select';
import { ZodPopulatedUserDataType, populatedUserSchema } from '../../schema';

import { PermissionValue } from '@/app/(pages)/admin/roles/create-role/components/Form';
import { generatePassword } from '@/lib/utils';
import { EmployeeDataType } from '@/models/Employees';
import { RoleDataType } from '@/models/Roles';
import { KeySquare } from 'lucide-react';
import mongoose from 'mongoose';
import { useMemo } from 'react';
import { toast } from 'sonner';
interface PropsType {
  employeesData: EmployeeDataType[];
  rolesData: RoleDataType[];
}

const Form: React.FC<PropsType> = props => {
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();

  let employeeIdOptions = (props.employeesData || []).map(employee => ({
    value: employee.e_id,
    label: employee.e_id,
  }));

  const userPermissions = useMemo(
    () => session?.user.permissions || [],
    [session?.user.permissions],
  );

  const allowedRoles = useMemo(() => {
    // If the current user can create users (directly or via approval), they should be
    // allowed to assign any role. However, roles that include the super-admin
    // permission must still be blocked unless the assigner also has that permission.
    const canAssignAnyRole =
      hasPerm('admin:create_user' as PermissionValue, userPermissions) ||
      hasPerm('admin:create_user_approval' as PermissionValue, userPermissions);

    return (props.rolesData || []).filter(role => {
      const perms = role.permissions || [];

      // Always block roles that grant the super-admin permission unless the
      // current user also has that permission.
      if (
        perms.includes('settings:the_super_admin' as PermissionValue) &&
        !hasPerm('settings:the_super_admin' as PermissionValue, userPermissions)
      ) {
        return false;
      }

      if (canAssignAnyRole) {
        return true;
      }

      // Otherwise ensure editor can only assign roles whose permissions are subset of their own
      return perms.every(p => hasPerm(p as PermissionValue, userPermissions));
    });
  }, [props.rolesData, userPermissions]);

  let roleOptions = allowedRoles.map(role => ({
    value: role._id,
    label: role.name,
  }));

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
      username: '',
      password: '',
      comment: '',
      role_id: {
        _id: '',
        name: '',
        permissions: [],
      },
      employee_id: {
        _id: '',
        e_id: '',
        company_provided_name: '',
        real_name: '',
      },
    },
  });

  const [employeeId, setEmployeeId] = useState<string>('');

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

  async function createUser(userData: ZodPopulatedUserDataType) {
    try {
      const parsed = populatedUserSchema.safeParse(userData);

      if (!parsed.success) {
        console.error(parsed.error.issues.map(issue => issue.message));
        toast.error('Invalid form data');
        return;
      }

      setLoading(true);

      const userCreateData = {
        username: parsed.data.username,
        password: parsed.data.password,
        employee_id: new mongoose.Types.ObjectId(parsed.data.employee_id._id),
        role_id: new mongoose.Types.ObjectId(parsed.data.role_id._id),
        comment: parsed.data.comment,
      };

      console.log('Edited user data to submit:', userCreateData);

      // if (hasPerm('admin:create_user', userPermissions)) {
      //   let url: string =
      //     process.env.NEXT_PUBLIC_BASE_URL + '/api/user?action=create-user';
      //   let options: {} = {
      //     method: 'POST',
      //     headers: {
      //       'Content-Type': 'application/json',
      //     },
      //     body: JSON.stringify(parsed.data),
      //   };

      //   const response = await fetchApi(url, options);

      //   if (response.ok) {
      //     toast.success('Created new user successfully');
      //     reset();
      //     // reset the form after successful submission
      //   } else {
      //     toast.error(response.data as string);
      //   }
      // } else if (hasPerm('admin:create_user_approval', userPermissions)) {
      //   let url: string =
      //     process.env.NEXT_PUBLIC_BASE_URL + '/api/approval?action=new-request';
      //   let options: {} = {
      //     method: 'POST',
      //     headers: {
      //       'Content-Type': 'application/json',
      //     },
      //     body: JSON.stringify({
      //       action: 'create',
      //       target_model: 'User',
      //       new_data: parsed.data,
      //       req_by: session?.user.db_id,
      //     }),
      //   };

      //   let response = await fetchApi(url, options);

      //   if (response.ok) {
      //     toast.success('Request sent for approval');
      //   } else {
      //     toast.error(response.data.message);
      //   }
      // } else {
      //   toast.error('You do not have permission to create users');
      //   return;
      // }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while creating new user');
    } finally {
      setLoading(false);
    }
  }

  const onSubmit = async (data: ZodPopulatedUserDataType) => {
    await createUser(data);
  };

  useEffect(() => {
    fillEmployeeData();
  }, [employeeId, fillEmployeeData]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-3 mb-4 gap-y-4">
        <div>
          <label className="tracking-wide text-gray-700 text-sm font-bold block mb-2 ">
            <span className="uppercase">Employee Id</span>
            <span className="text-red-700 text-wrap block text-xs">
              {/* {errors.type && errors.type?.message} */}
            </span>
          </label>
          <Select
            options={employeeIdOptions}
            closeMenuOnSelect={true}
            placeholder="Select id"
            classNamePrefix="react-select"
            menuPortalTarget={setMenuPortalTarget}
            value={
              employeeIdOptions.find(option => option.value === employeeId) ||
              null
            }
            onChange={option => setEmployeeId(option ? option.value : '')}
          />
        </div>

        <div>
          <label className="tracking-wide text-gray-700 text-sm font-bold block mb-2 ">
            <span className="uppercase">Real Name*</span>
            <span className="text-red-700 text-wrap block text-xs">
              {errors.employee_id?.real_name &&
                errors.employee_id.real_name.message}
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
            render={({ field }) => {
              return (
                <Select
                  {...field}
                  options={roleOptions}
                  closeMenuOnSelect={true}
                  placeholder="Select role"
                  classNamePrefix="react-select"
                  menuPortalTarget={setMenuPortalTarget}
                  value={
                    roleOptions.find(
                      option => String(option.value) === String(field.value),
                    ) || null
                  }
                  onChange={option => {
                    field.onChange(option ? option.value : '');
                    setValue(
                      'role_id.permissions',
                      props.rolesData.find(role => role._id === option?.value)
                        ?.permissions || [],
                    );
                  }}
                />
              );
            }}
          />
        </div>

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

      <button
        disabled={loading}
        className="rounded-md bg-primary text-white hover:opacity-90 hover:ring-4 hover:ring-primary transition duration-200 delay-300 hover:text-opacity-100 text-primary-foreground px-10 py-2 mt-6 uppercase"
        type="submit"
      >
        {loading ? 'Creating...' : 'Create this user'}
      </button>
    </form>
  );
};

export default Form;
