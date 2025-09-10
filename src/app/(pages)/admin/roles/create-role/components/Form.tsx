'use client';

import { fetchApi, hasPerm } from '@/lib/utils';
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
import { permissionOptions } from '../../../../../../permissions';
import { RoleDataType, validationSchema } from '../../schema';

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

  const userPermissions = useMemo(
    () => session?.user.permissions || [],
    [session?.user.permissions],
  );
  const canManageAny = useMemo(
    () => hasPerm('admin:create_role', userPermissions),
    [userPermissions],
  );

  // Build react-select compatible option groups
  const filteredPermissionOptions = useMemo(() => {
    const groups = permissionOptions.map(group => ({
      label: group.label,
      options: group.options.map(opt => ({
        value: opt.value,
        label: opt.label,
      })),
    }));
    const hasSuper = hasPerm('settings:the_super_admin', userPermissions);
    const sanitized = groups.map(g => ({
      label: g.label,
      options: g.options.filter(
        opt => hasSuper || opt.value !== 'settings:the_super_admin',
      ),
    }));
    if (canManageAny) return sanitized;
    return sanitized
      .map(g => ({
        label: g.label,
        options: g.options.filter(opt => hasPerm(opt.value, userPermissions)),
      }))
      .filter(g => g.options.length > 0);
  }, [canManageAny, userPermissions]);

  const flatOptions = useMemo<FlatOption[]>(
    () => filteredPermissionOptions.flatMap(group => group.options),
    [filteredPermissionOptions],
  );

  async function createRole(roleData: RoleDataType) {
    try {
      const parsed = validationSchema.safeParse(roleData);

      if (!parsed.success) {
        console.error(parsed.error.issues.map(issue => issue.message));
        toast.error('Invalid form data');
        return;
      }

      if (!hasPerm('admin:create_role', userPermissions)) {
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
              options={filteredPermissionOptions}
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
