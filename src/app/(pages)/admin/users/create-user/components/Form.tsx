'use client';

import { fetchApi } from '@/lib/utils';
import {
  setClassNameAndIsDisabled,
  setMenuPortalTarget,
} from '@/utility/selectHelpers';
import { zodResolver } from '@hookform/resolvers/zod';
import moment from 'moment-timezone';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import Select from 'react-select';
import { UserDataType, validationSchema } from '../../schema';

import { generatePassword } from '@/lib/utils';
import { EmployeeDataType } from '@/models/Employees';
import { KeySquare } from 'lucide-react';
import { useMemo } from 'react';
import { toast } from 'sonner';

interface PropsType {
  employeesData: EmployeeDataType[];
}

export let roleOptions = [
  { value: 'super', label: 'Super' },
  { value: 'admin', label: 'Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'user', label: 'User' },
  { value: 'marketer', label: 'Marketer' },
];

const Form: React.FC<PropsType> = props => {
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();

  const employeeIds = props.employeesData?.map(employee => employee.e_id);

  let employeeIdOptions = (employeeIds || []).map(employeeId => ({
    value: employeeId,
    label: employeeId,
  }));

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
      name: '',
      real_name: '',
      provided_name: null,
      password: '',
      comment: '',
    },
  });

  const filteredRoleOptions = useMemo(() => {
    if (session?.user.role === 'admin') {
      return roleOptions.filter(
        option => option.value !== 'admin' && option.value !== 'super',
      );
    }
    return roleOptions;
  }, [session?.user.role]);

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

  async function createUser(userData: UserDataType) {
    try {
      const parsed = validationSchema.safeParse(userData);

      if (!parsed.success) {
        console.error(parsed.error.issues.map(issue => issue.message));
        toast.error('Invalid form data');
        return;
      }

      if (
        session?.user.role == 'admin' &&
        (parsed.data.role == 'super' || parsed.data.role == 'admin')
      ) {
        toast.error("You don't have the permission to create this user");
        return;
      }

      setLoading(true);

      if (session?.user.role == 'super') {
        let url: string =
          process.env.NEXT_PUBLIC_BASE_URL + '/api/user?action=create-user';
        let options: {} = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(parsed.data),
        };

        const response = await fetchApi(url, options);

        if (response.ok) {
          toast.success('Created new user successfully');
          reset();
          // reset the form after successful submission
        } else {
          toast.error(response.data as string);
        }
      } else {
        let url: string =
          process.env.NEXT_PUBLIC_BASE_URL + '/api/approval?action=new-request';
        let options: {} = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            req_type: 'User Create',
            req_by: session?.user.real_name,
            ...parsed.data,
          }),
        };

        let response = await fetchApi(url, options);

        if (response.ok) {
          toast.success('Request sent for approval');
        } else {
          toast.error(response.data.message);
        }
      }

      console.log('data', parsed.data, userData);
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while creating new user');
    } finally {
      setLoading(false);
    }
  }

  const onSubmit = async (data: UserDataType) => {
    await createUser(data);
  };

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
              {errors.real_name && errors.real_name.message}
            </span>
          </label>
          <input
            onFocus={getEmployeeNameOnFocus}
            {...register('real_name')}
            className="appearance-none block w-full bg-gray-50 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            placeholder="Enter employee real name"
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

        <Controller
          name="role"
          control={control}
          render={({ field }) => {
            return (
              <Select
                {...field}
                options={filteredRoleOptions}
                closeMenuOnSelect={true}
                placeholder="Select role"
                classNamePrefix="react-select"
                menuPortalTarget={setMenuPortalTarget}
                value={
                  filteredRoleOptions.find(
                    option => option.value === field.value,
                  ) || null
                }
                onChange={option => field.onChange(option ? option.value : '')}
              />
            );
          }}
        />

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
              placeholder="Enter employee provided name"
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
