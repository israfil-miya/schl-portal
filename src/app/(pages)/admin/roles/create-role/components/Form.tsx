'use client';

import { fetchApi } from '@/lib/utils';
import {
  setClassNameAndIsDisabled,
  setMenuPortalTarget,
} from '@/utility/selectHelpers';
import { zodResolver } from '@hookform/resolvers/zod';
import moment from 'moment-timezone';
import { useSession } from 'next-auth/react';
import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import Select from 'react-select';
import { toast } from 'sonner';
import { RoleDataType, validationSchema } from '../../schema';

export const permissionOptions = [
  {
    label: 'Login',
    options: [
      { value: 'login:portal', label: 'login:task' },
      { value: 'login:crm', label: 'login:crm' },
    ],
  },

  {
    label: 'Task',
    options: [
      { value: 'task:view_page', label: 'task:view_page' },
      { value: 'task:running_tasks', label: 'task:running_tasks' },
      {
        value: 'task:test_and_correction_tasks',
        label: 'task:test_and_correction_tasks',
      },
    ],
  },

  {
    label: 'Browse',
    options: [
      { value: 'browse:view_page', label: 'browse:view_page' },
      { value: 'browse:client_name', label: 'browse:client_name' },
      { value: 'browse:edit_task', label: 'browse:edit_task' },
      {
        value: 'browse:edit_task_approval',
        label: 'browse:edit_task_approval',
      },
      { value: 'browse:delete_task', label: 'browse:delete_task' },
      {
        value: 'browse:delete_task_approval',
        label: 'browse:delete_task_approval',
      },
    ],
  },

  {
    label: 'FileFlow',
    options: [{ value: 'fileflow:view_page', label: 'fileflow:view_page' }],
  },

  {
    label: 'Notice',
    options: [
      { value: 'notice:view_notice', label: 'notice:view_notice' },
      {
        value: 'notice:send_notice_production',
        label: 'notice:send_notice_production',
      },
      {
        value: 'notice:send_notice_marketers',
        label: 'notice:send_notice_marketers',
      },
    ],
  },

  {
    label: 'CRM',
    options: [
      { value: 'crm:create_report', label: 'crm:create_report' },
      {
        value: 'crm:delete_report_approval',
        label: 'crm:delete_report_approval',
      },
      { value: 'crm:send_client_request', label: 'crm:send_client_request' },
    ],
  },

  {
    label: 'Admin',
    options: [
      { value: 'admin:create_employee', label: 'admin:create_employee' },
      { value: 'admin:manage_employee', label: 'admin:manage_employee' },
      { value: 'admin:create_client', label: 'admin:create_client' },
      { value: 'admin:manage_client', label: 'admin:manage_client' },
      { value: 'admin:create_invoice', label: 'admin:create_invoice' },
      { value: 'admin:download_invoice', label: 'admin:download_invoice' },
      { value: 'admin:delete_invoice', label: 'admin:delete_invoice' },
      { value: 'admin:check_approvals', label: 'admin:check_approvals' },
      {
        value: 'admin:check_client_request',
        label: 'admin:check_client_request',
      },
      { value: 'admin:view_reports', label: 'admin:view_reports' },
      {
        value: 'admin:delete_report_approval',
        label: 'admin:delete_report_approval',
      },
      { value: 'admin:view_crm_stats', label: 'admin:view_crm_stats' },
      { value: 'admin:create_role', label: 'admin:create_role' },
      { value: 'admin:delete_role', label: 'admin:delete_role' },
      { value: 'admin:assign_role', label: 'admin:assign_role' },
      { value: 'admin:create_user', label: 'admin:create_user' },
      {
        value: 'admin:delete_user_approval',
        label: 'admin:delete_user_approval',
      },
    ],
  },
] as const;

type PermissionOptions = typeof permissionOptions;
export type PermissionValue =
  PermissionOptions[number]['options'][number]['value'];

type FlatOption = {
  value: PermissionValue;
  label: string;
};

const Form: React.FC = props => {
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
  } = useForm<RoleDataType>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      name: '',
      description: '',
      permissions: [],
    },
  });

  const flatOptions = useMemo<FlatOption[]>(
    () =>
      permissionOptions.flatMap(group =>
        group.options.map(option => ({
          value: option.value,
          label: option.label,
        })),
      ),
    [],
  );

  async function createRole(roleData: RoleDataType) {
    try {
      const parsed = validationSchema.safeParse(roleData);

      if (!parsed.success) {
        console.error(parsed.error.issues.map(issue => issue.message));
        toast.error('Invalid form data');
        return;
      }

      if (!session?.user.permissions.includes('admin:create_role')) {
        toast.error("You don't have the permission to create roles");
        return;
      }

      setLoading(true);

      let url: string =
        process.env.NEXT_PUBLIC_BASE_URL + '/api/role?action=create-role';
      let options: {} = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(parsed.data),
      };

      const response = await fetchApi(url, options);

      if (response.ok) {
        toast.success('Created new role successfully');
        reset();
        // reset the form after successful submission
      } else {
        toast.error(response.data as string);
      }

      console.log('data', parsed.data, roleData);
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while creating new role');
    } finally {
      setLoading(false);
    }
  }

  const onSubmit = async (data: RoleDataType) => {
    await createRole(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-3 mb-4 gap-y-4">
        <div>
          <label className="tracking-wide text-gray-700 text-sm font-bold block mb-2 ">
            <span className="uppercase">Role Name*</span>
            <span className="text-red-700 text-wrap block text-xs">
              {errors.name && errors.name.message}
            </span>
          </label>
          <input
            {...register('name')}
            className="appearance-none block w-full bg-gray-50 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            placeholder="Enter role name"
          />
        </div>
        <div>
          <label className="tracking-wide text-gray-700 text-sm font-bold block mb-2 ">
            <span className="uppercase">Description</span>
            <span className="text-red-700 text-wrap block text-xs">
              {errors.description && errors.description?.message}
            </span>
          </label>
          <textarea
            {...register('description')}
            rows={1}
            className="appearance-none block w-full bg-gray-50 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            placeholder="Write any information about this role"
          />
        </div>
      </div>
      <div>
        <label className="tracking-wide text-gray-700 text-sm font-bold block mb-2 ">
          <span className="uppercase">Permissions*</span>
          <span className="text-red-700 text-wrap block text-xs">
            {errors.permissions && errors.permissions?.message}
          </span>
        </label>

        <Controller
          name="permissions"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              isSearchable={true}
              isMulti={true}
              options={permissionOptions}
              closeMenuOnSelect={false}
              placeholder="Select permission(s)"
              classNamePrefix="react-select"
              menuPortalTarget={setMenuPortalTarget}
              menuPlacement="auto"
              menuPosition="fixed" // Prevent clipping by parent containers
              value={
                flatOptions.filter(option =>
                  field.value?.includes(option.value),
                ) || null
              }
              onChange={selectedOptions =>
                field.onChange(
                  selectedOptions?.map(option => option.value) || '',
                )
              }
            />
          )}
        />
      </div>
      <button
        disabled={loading}
        className="rounded-md bg-primary text-white hover:opacity-90 hover:ring-4 hover:ring-primary transition duration-200 delay-300 hover:text-opacity-100 text-primary-foreground px-10 py-2 mt-6 uppercase"
        type="submit"
      >
        {loading ? 'Creating...' : 'Create this role'}
      </button>
    </form>
  );
};

export default Form;
