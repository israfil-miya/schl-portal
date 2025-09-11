'use client';

import { taskOptions } from '@/app/(pages)/browse/components/Edit';
import { cn, hasPerm } from '@/lib/utils';
import { ClientDataType } from '@/models/Clients';
import {
  setCalculatedZIndex,
  setClassNameAndIsDisabled,
  setMenuPortalTarget,
} from '@/utility/selectHelpers';
import { zodResolver } from '@hookform/resolvers/zod';
import 'flowbite';
import { initFlowbite } from 'flowbite';
import { SquarePen, X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import Select from 'react-select';
import { toast } from 'sonner';
import { ScheduleDataType, validationSchema } from '../../schema';

const baseZIndex = 50; // 52

interface PropsType {
  clientsData: ClientDataType[];
  loading: boolean;
  scheduleData: ScheduleDataType;
  submitHandler: (
    editedScheduleData: ScheduleDataType,
    previousScheduleData: ScheduleDataType,
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

  const clientNames = props.clientsData.map(client => client.client_name);
  const clientCodes = props.clientsData.map(client => client.client_code);

  let clientNameOptions = (clientNames || []).map(clientName => ({
    value: clientName,
    label: clientName,
  }));

  let clientCodeOptions = (clientCodes || []).map(clientCode => ({
    value: clientCode,
    label: clientCode,
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

  const {
    watch,
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ScheduleDataType>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      ...props.scheduleData,
    },
  });

  useEffect(() => {
    initFlowbite();
  }, []);

  const onSubmit = async (data: ScheduleDataType) => {
    await props.submitHandler(data, props.scheduleData);
  };

  useEffect(() => {
    if (isOpen) {
      reset(props.scheduleData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const customStyles = {
    control: (provided: any) => ({
      ...provided,
      borderTopRightRadius: 0,
      borderBottomRightRadius: 0,
      borderRight: 'none',
      width: '200px',
      paddingTop: '0.25rem' /* 12px */,
      paddingBottom: '0.25rem' /* 12px */,
      cursor: 'pointer',
      backgroundColor: '#f3f4f6',
      '&:hover': {
        borderColor: '#e5e7eb',
      },
    }),
    menu: (provided: any) => ({
      ...provided,
      width: '200px',
    }),
  };

  const getClientNameOnFocus = () => {
    try {
      const clientCode = watch('client_code');

      if (clientCode === '') return;

      const client = props.clientsData.find(
        client => client.client_code === clientCode,
      );

      if (client) {
        setValue('client_name', client.client_name);
      } else {
        toast.info('No client found with the code provided');
      }
    } catch (e) {
      console.error(
        'An error occurred while retrieving client name on input focus',
      );
    } finally {
      return;
    }
  };

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
              Edit Schedule
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
                  <span className="uppercase">Receive Date*</span>
                  <span className="text-red-700 text-wrap block text-xs">
                    {errors.receive_date && errors.receive_date.message}
                  </span>
                </label>
                <input
                  {...register('receive_date')}
                  className="appearance-none block w-full bg-gray-50 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                  type="date"
                />
              </div>
              <div>
                <label className="tracking-wide text-gray-700 text-sm font-bold block mb-2 ">
                  <span className="uppercase">Delivery Date*</span>
                  <span className="text-red-700 text-wrap block text-xs">
                    {errors.delivery_date && errors.delivery_date.message}
                  </span>
                </label>
                <input
                  {...register('delivery_date')}
                  className="appearance-none block w-full bg-gray-50 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                  type="date"
                />
              </div>

              <div>
                <label className="tracking-wide text-gray-700 text-sm font-bold block mb-2 ">
                  <span className="uppercase">Client Code*</span>
                  <span className="text-red-700 text-wrap block text-xs">
                    {errors.client_code && errors.client_code.message}
                  </span>
                </label>
                <div className="flex">
                  <Select
                    options={clientCodeOptions}
                    value={
                      clientCodeOptions.find(
                        (code?: { value: string; label: string }) =>
                          code?.value === watch('client_code'),
                      ) || null
                    }
                    styles={customStyles}
                    onChange={(
                      selectedOption: { value: string; label: string } | null,
                    ) => {
                      setValue(
                        'client_code',
                        selectedOption ? selectedOption.value : '',
                      );
                    }}
                    placeholder="Select an option"
                    isSearchable={true}
                    classNamePrefix="react-select"
                    isClearable={true}
                  />
                  <input
                    {...register('client_code')}
                    className="appearance-none rounded-s-none block w-full bg-gray-50 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    type="text"
                  />
                </div>
              </div>

              {hasPerm('admin:view_client_name', userPermissions) && (
                <div>
                  <label className="tracking-wide text-gray-700 text-sm font-bold block mb-2 ">
                    <span className="uppercase">Client Name*</span>
                    <span className="text-red-700 text-wrap block text-xs">
                      {errors.client_name && errors.client_name.message}
                    </span>
                  </label>
                  <div className="flex">
                    <Select
                      options={clientNameOptions}
                      value={
                        clientNameOptions.find(
                          (name?: { value: string; label: string }) =>
                            name?.value === watch('client_name'),
                        ) || null
                      }
                      styles={customStyles}
                      onChange={(
                        selectedOption: {
                          value: string;
                          label: string;
                        } | null,
                      ) => {
                        setValue(
                          'client_name',
                          selectedOption ? selectedOption.value : '',
                        );
                      }}
                      placeholder="Select an option"
                      isSearchable={true}
                      classNamePrefix="react-select"
                      isClearable={true}
                    />
                    <input
                      {...register('client_name')}
                      className="appearance-none rounded-s-none block w-full bg-gray-50 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                      type="text"
                      onFocus={getClientNameOnFocus}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="tracking-wide text-gray-700 text-sm font-bold block mb-2 ">
                  <span className="uppercase">Assigned Tasks*</span>
                  <span className="text-red-700 text-wrap block text-xs">
                    {errors.task && errors.task?.message}
                  </span>
                </label>

                <Controller
                  name="task"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      {...setClassNameAndIsDisabled(isOpen)}
                      isSearchable={true}
                      isMulti={true}
                      options={taskOptions}
                      closeMenuOnSelect={false}
                      placeholder="Select tasks"
                      classNamePrefix="react-select"
                      menuPortalTarget={setMenuPortalTarget}
                      styles={setCalculatedZIndex(baseZIndex)}
                      menuPlacement="auto"
                      menuPosition="fixed" // Prevent clipping by parent containers
                      value={
                        taskOptions.filter(option =>
                          field.value?.split('+').includes(option.value),
                        ) || null
                      }
                      onChange={selectedOptions =>
                        field.onChange(
                          selectedOptions
                            ?.map(option => option.value)
                            .join('+') || '',
                        )
                      }
                    />
                  )}
                />
              </div>
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
                placeholder="Write any instructions or note about the order"
              />
            </div>
          </form>

          <footer
            className={cn(
              'flex items-center px-4 py-2 border-t justify-between gap-6 border-gray-200 rounded-b',
              !watch('updated_by') && 'justify-end',
            )}
          >
            {watch('updated_by') && (
              <div className="flex justify-start items-center me-auto text-gray-400">
                <span className="me-1">Last updated by </span>

                <span className="font-semibold">{watch('updated_by')}</span>
              </div>
            )}
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
                onClick={handleSubmit(onSubmit)}
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
