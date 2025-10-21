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
import { ChangePasswordInputsType, validationSchema } from '../schema';

import { generatePassword } from '@/lib/utils';
import { EmployeeDataType } from '@/models/Employees';
import { KeySquare } from 'lucide-react';
import { toast } from 'sonner';

const Form: React.FC = props => {
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();
  console.log(session);

  const {
    watch,
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordInputsType>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      current_password: '',
      new_password: '',
      confirm_password: '',
    },
  });

  async function changePassword(data: ChangePasswordInputsType) {
    try {
      setLoading(true);
      const parsed = validationSchema.safeParse(data);

      if (!parsed.success) {
        console.error(parsed.error.issues.map(issue => issue.message));
        toast.error('Invalid form data');
        return;
      }

      if (parsed.data.new_password !== parsed.data.confirm_password) {
        toast.error('Password does not match');
        return;
      }

      let url: string =
        process.env.NEXT_PUBLIC_BASE_URL + '/api/user?action=change-password';
      let options: {} = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(parsed.data),
      };

      const response = await fetchApi(url, options);

      if (response.ok) {
        toast.success(response.data as string);
        reset();
        // reset the form after successful submission
      } else {
        toast.error(response.data as string);
      }

      console.log('data', parsed.data, data);
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while creating new user');
    } finally {
      setLoading(false);
    }
  }

  const onSubmit = async (data: ChangePasswordInputsType) => {
    await changePassword(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid grid-cols-1 gap-x-3 mb-4 gap-y-4">
        {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-x-3 mb-4 gap-y-4"> */}
        <div>
          <label className="tracking-wide text-gray-700 text-sm font-bold block mb-2 ">
            <span className="uppercase">Current Password*</span>
            <span className="text-red-700 text-wrap block text-xs">
              {errors.current_password && errors.current_password.message}
            </span>
          </label>
          <input
            type="password"
            placeholder="Enter current password"
            {...register('current_password')}
            className="appearance-none block w-full bg-gray-50 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
          />
        </div>

        <div>
          <label
            className="uppercase tracking-wide text-gray-700 text-sm font-bold flex gap-2 mb-2"
            htmlFor="grid-password"
          >
            New password*
            <span className="cursor-pointer has-tooltip">
              &#9432;
              <span className="tooltip italic font-medium rounded-md text-xs shadow-lg p-1 px-2 bg-gray-100 ml-2">
                You can generate a new password by clicking the right button
              </span>
            </span>
            <span className="text-red-700 text-wrap block text-xs">
              {errors.new_password && errors.new_password.message}
            </span>
          </label>

          <div className="flex items-center">
            <input
              placeholder="Enter new password"
              type="text"
              {...register('new_password')}
              className="appearance-none block w-full bg-gray-50 text-gray-700 border border-gray-200 rounded-l py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            />
            <button
              onClick={() => {
                setValue(
                  'new_password',
                  generatePassword(session?.user.real_name ?? ''),
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
            <span className="uppercase">Confirm Password</span>
            <span className="text-red-700 text-wrap block text-xs">
              {errors.confirm_password && errors.confirm_password.message}
            </span>
          </label>
          <input
            placeholder="Confirm new password"
            type="text"
            {...register('confirm_password')}
            className="appearance-none block w-full bg-gray-50 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
          />
        </div>
      </div>

      <button
        disabled={loading}
        className="rounded-md bg-primary text-white hover:opacity-90 hover:ring-4 hover:ring-primary transition duration-200 delay-300 hover:text-opacity-100 text-primary-foreground px-10 py-2 mt-6 uppercase"
        type="submit"
      >
        {loading ? 'Changing...' : 'Change'}
      </button>
    </form>
  );
};

export default Form;
