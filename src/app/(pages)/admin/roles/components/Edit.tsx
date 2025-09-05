'use client';

import { cn } from '@/lib/utils';
import {
  setCalculatedZIndex,
  setClassNameAndIsDisabled,
  setMenuPortalTarget,
} from '@/utility/selectHelpers';
import { zodResolver } from '@hookform/resolvers/zod';
import { SquarePen, X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import Select from 'react-select';
import { toast } from 'sonner';
import { permissionOptions } from '../../../../../permissions';
import { PermissionValue } from '../create-role/components/Form';
import { RoleDataType, validationSchema } from '../schema';

const baseZIndex = 50;

interface PropsType {
  loading: boolean;
  roleData: RoleDataType;
  submitHandler: (
    editedRoleData: RoleDataType,
    previousRoleData: RoleDataType,
  ) => Promise<void>;
}

type FlatOption = { value: string; label: string };

const EditRoleButton: React.FC<PropsType> = ({
  loading,
  roleData,
  submitHandler,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const popupRef = useRef<HTMLElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const { data: session } = useSession();

  const userPermissions = useMemo(
    () => session?.user.permissions || [],
    [session?.user.permissions],
  );
  const isSuperAdminRole = roleData.permissions.includes(
    'settings:the_super_admin',
  );
  const hasSuperAdmin = userPermissions.includes('settings:the_super_admin');
  const canEditBase = userPermissions.includes('admin:create_role'); // using create_role permission as edit authority
  const canEdit = canEditBase;

  const filteredPermissionGroups = useMemo(() => {
    const groups = permissionOptions.map(group => ({
      label: group.label,
      options: group.options.map(opt => ({
        value: opt.value,
        label: opt.label,
      })),
    }));
    const hasSuper = userPermissions.includes('settings:the_super_admin');
    const sanitized = groups.map(g => ({
      label: g.label,
      options: g.options.filter(
        opt => hasSuper || opt.value !== 'settings:the_super_admin',
      ),
    }));
    if (canEditBase) return sanitized;
    return sanitized
      .map(g => ({
        label: g.label,
        options: g.options.filter(opt => userPermissions.includes(opt.value)),
      }))
      .filter(g => g.options.length > 0);
  }, [canEditBase, userPermissions]);

  const flatOptions = useMemo<FlatOption[]>(
    () =>
      filteredPermissionGroups.flatMap(g =>
        g.options.map(opt => ({ value: opt.value, label: opt.label })),
      ),
    [filteredPermissionGroups],
  );

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<RoleDataType>({
    resolver: zodResolver(validationSchema),
    defaultValues: { ...roleData },
  });

  // Reset when opened
  useEffect(() => {
    if (isOpen) reset(roleData);
  }, [isOpen, roleData, reset]);

  const onSubmit = async (data: RoleDataType) => {
    if (!canEdit) return;
    // Guard super admin assignment unless editor has it
    if (
      data.permissions.includes('settings:the_super_admin') &&
      !hasSuperAdmin
    ) {
      toast.error("You can't assign the super admin permission");
      return;
    }
    await submitHandler(data, roleData);
    setIsOpen(false);
  };

  const handleClickOutside = (e: React.MouseEvent<HTMLDivElement>) => {
    if (
      popupRef.current &&
      !popupRef.current.contains(e.target as Node) &&
      !popupRef.current.querySelector(
        'input:focus, textarea:focus, button:focus',
      )
    ) {
      setIsOpen(false);
    }
  };

  if (!canEdit) {
    return (
      <button
        disabled
        title={
          !canEditBase
            ? "You don't have permission to edit roles"
            : isSuperAdminRole && !hasSuperAdmin
              ? 'You cannot edit a super admin role'
              : undefined
        }
        className={cn(
          'rounded-md bg-blue-600/40 text-white/70 cursor-not-allowed p-2',
        )}
        type="button"
      >
        <SquarePen size={18} />
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          'rounded-md bg-blue-600 hover:opacity-90 hover:ring-2 hover:ring-blue-600 transition duration-200 delay-150 text-white p-2',
        )}
        type="button"
      >
        <SquarePen size={18} />
      </button>
      {isOpen && (
        <section
          onClick={handleClickOutside}
          className={`fixed z-${baseZIndex} inset-0 flex justify-center items-center transition-colors bg-black/20 disable-page-scroll`}
        >
          <article
            ref={popupRef}
            onClick={e => e.stopPropagation()}
            className="scale-100 opacity-100 bg-white rounded-sm shadow relative md:w-[60vw] lg:w-[40vw] text-wrap"
          >
            <header className="flex items-center justify-between px-4 py-2 border-b rounded-t">
              <h3 className="text-gray-900 text-base lg:text-lg font-semibold uppercase">
                Edit Role
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                type="button"
                className="text-gray-400 hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
              >
                <X size={18} />
              </button>
            </header>
            <form
              ref={formRef}
              onSubmit={handleSubmit(onSubmit)}
              className="overflow-x-hidden overflow-y-auto max-h-[70vh] p-4 text-start space-y-4"
            >
              <div>
                <label className="tracking-wide text-gray-700 text-sm font-bold block mb-2">
                  <span className="uppercase">Role Name*</span>
                  <span className="text-red-700 text-xs block">
                    {errors.name && errors.name.message}
                  </span>
                </label>
                <input
                  {...register('name')}
                  className="appearance-none block w-full bg-gray-50 text-gray-700 border border-gray-200 rounded py-2.5 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                  placeholder="Enter role name"
                />
              </div>
              <div>
                <label className="tracking-wide text-gray-700 text-sm font-bold block mb-2">
                  <span className="uppercase">Description</span>
                  <span className="text-red-700 text-xs block">
                    {errors.description && errors.description.message}
                  </span>
                </label>
                <textarea
                  {...register('description')}
                  rows={2}
                  className="appearance-none block w-full bg-gray-50 text-gray-700 border border-gray-200 rounded py-2.5 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                  placeholder="Enter role description"
                />
              </div>
              <div>
                <label className="tracking-wide text-gray-700 text-sm font-bold block mb-2">
                  <span className="uppercase">Permissions*</span>
                  <span className="text-red-700 text-xs block">
                    {errors.permissions && errors.permissions.message}
                  </span>
                </label>
                <Controller
                  name="permissions"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      isMulti
                      isSearchable
                      options={filteredPermissionGroups}
                      closeMenuOnSelect={false}
                      placeholder="Select permission(s)"
                      classNamePrefix="react-select"
                      menuPortalTarget={setMenuPortalTarget}
                      styles={setCalculatedZIndex(baseZIndex)}
                      value={flatOptions.filter(o =>
                        field.value?.includes(o.value),
                      )}
                      onChange={selected =>
                        field.onChange(selected?.map((o: any) => o.value) || [])
                      }
                    />
                  )}
                />
              </div>
            </form>
            <footer className="flex items-center px-4 py-2 border-t justify-end gap-4 border-gray-200 rounded-b">
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-md bg-gray-600 text-white hover:opacity-90 hover:ring-2 hover:ring-gray-600 transition px-4 py-1"
                type="button"
                disabled={loading}
              >
                Close
              </button>
              <button
                disabled={loading}
                onClick={() => formRef.current?.requestSubmit()}
                className="rounded-md bg-blue-600 text-white hover:opacity-90 hover:ring-2 hover:ring-blue-600 transition px-4 py-1"
                type="button"
              >
                {loading ? 'Submitting...' : 'Submit'}
              </button>
            </footer>
          </article>
        </section>
      )}
    </>
  );
};

export default EditRoleButton;
