'use client';

import { LoginDataType, validationSchema } from '@/app/login/schema';
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

import { generatePassword } from '@/lib/utils';
import { EmployeeDataType } from '@/models/Employees';
import { KeySquare } from 'lucide-react';
import { permanentRedirect } from 'next/navigation';
import { toast } from 'sonner';

interface PropsType {
  redirect_path: string;
}

const Form: React.FC<PropsType> = props => {
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
  } = useForm<LoginDataType>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      name: '',
      password: '',
    },
  });

  async function verifyCreds(loginData: LoginDataType) {
    try {
      setLoading(true);
      const parsed = validationSchema.safeParse(loginData);

      if (!parsed.success) {
        console.error(parsed.error.issues.map(issue => issue.message));
        toast.error('Invalid form data');
        return;
      }

      let url: string =
        process.env.NEXT_PUBLIC_BASE_URL + '/api/user?action=verify-user';
      let options: {} = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          redirect_path: props.redirect_path,
        },
        body: JSON.stringify(parsed.data),
      };

      const response = await fetchApi(url, options);

      if (response.ok) {
        let redirect_path = response.data?.redirect_path as string;
        permanentRedirect(redirect_path);
      } else {
        toast.error(response.data as string);
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while verifying the credentials');
    } finally {
      setLoading(false);
    }
  }

  const onSubmit = async (data: LoginDataType) => {
    await verifyCreds(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid grid-cols-1 gap-x-3 mb-4 gap-y-4">
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
          <label className="tracking-wide text-gray-700 text-sm font-bold block mb-2 ">
            <span className="uppercase">Password*</span>
            <span className="text-red-700 text-wrap block text-xs">
              {errors.password && errors.password.message}
            </span>
          </label>
          <input
            {...register('password')}
            className="appearance-none block w-full bg-gray-50 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
          />
        </div>
      </div>

      <button
        disabled={loading}
        className="rounded-md bg-primary text-white hover:opacity-90 hover:ring-4 hover:ring-primary transition duration-200 delay-300 hover:text-opacity-100 text-primary-foreground px-10 py-2 mt-6 uppercase"
        type="submit"
      >
        {loading ? 'Verifying...' : 'Verify'}
      </button>
    </form>
  );
};

export default Form;
