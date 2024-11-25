'use client';
import {
  priorityOptions,
  statusOptions,
  taskOptions,
  typeOptions,
} from '@/app/(pages)/browse/components/Edit';
import { OrderDataType, validationSchema } from '@/app/(pages)/browse/schema';
import { fetchApi } from '@/lib/utils';
import { ClientDataType } from '@/models/Clients';
import { setMenuPortalTarget } from '@/utility/selectHelpers';
import { zodResolver } from '@hookform/resolvers/zod';
import moment from 'moment-timezone';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import Select from 'react-select';

import { toast } from 'sonner';

const Form: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();

  const bloodGroupOptions = [
    { value: 'A+', label: 'A+' },
    { value: 'A-', label: 'A-' },
    { value: 'B+', label: 'B+' },
    { value: 'B-', label: 'B-' },
    { value: 'AB+', label: 'AB+' },
    { value: 'AB-', label: 'AB-' },
    { value: 'O+', label: 'O+' },
    { value: 'O-', label: 'O-' },
  ];

  const {
    watch,
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<OrderDataType>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      client_code: '',
      client_name: '',
      folder: '',
      rate: 0,
      quantity: 0,
      download_date: moment().format('YYYY-MM-DD'),
      delivery_date: moment().add(1, 'days').format('YYYY-MM-DD'),
      delivery_bd_time: moment().format('HH:mm'),
      task: '',
      et: 0,
      production: 0,
      qc1: 0,
      comment: '',
      type: 'General',
      status: 'Running',
      folder_path: '',
      priority: '',
      updated_by: session?.user.real_name || '',
    },
  });

  async function createOrder(orderData: OrderDataType) {
    try {
      setLoading(true);
      const parsed = validationSchema.safeParse(orderData);

      if (!parsed.success) {
        console.error(parsed.error.issues.map(issue => issue.message));
        toast.error('Invalid form data');
        return;
      }

      let url: string =
        process.env.NEXT_PUBLIC_BASE_URL + '/api/order?action=create-order';
      let options: {} = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          updated_by: session?.user.real_name,
        },
        body: JSON.stringify(parsed.data),
      };

      const response = await fetchApi(url, options);

      if (response.ok) {
        toast.success('Created new order successfully');
        reset();
        // reset the form after successful submission
      } else {
        toast.error(response.data as string);
      }

      console.log('data', parsed.data, orderData);
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while creating new order');
    } finally {
      setLoading(false);
    }
  }

  const onSubmit = async (data: OrderDataType) => {
    await createOrder(data);
  };

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
    <form className="" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-3 mb-4 gap-y-4">
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
                selectedOption: { value: string; label: string } | null,
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
        <div>
          <label className="tracking-wide text-gray-700 text-sm font-bold block mb-2 ">
            <span className="uppercase">Folder*</span>
            <span className="text-red-700 text-wrap block text-xs">
              {errors.folder && errors.folder.message}
            </span>
          </label>
          <input
            {...register('folder')}
            className="appearance-none block w-full bg-gray-50 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            type="text"
          />
        </div>
        <div>
          <label className="tracking-wide text-gray-700 text-sm font-bold block mb-2 ">
            <span className="uppercase">NOF*</span>
            <span className="text-red-700 text-wrap block text-xs">
              {errors.quantity && errors.quantity.message}
            </span>
          </label>
          <input
            {...register('quantity', { valueAsNumber: true })}
            className="appearance-none block w-full bg-gray-50 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            type="number"
          />
        </div>
        <div>
          <label className="tracking-wide text-gray-700 text-sm font-bold block mb-2 ">
            <span className="uppercase">Rate</span>
            <span className="text-red-700 text-wrap block text-xs">
              {errors.rate && errors.rate.message}
            </span>
          </label>
          <input
            {...register('rate', { valueAsNumber: true })}
            className="appearance-none block w-full bg-gray-50 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            type="number"
            step="0.01"
          />
        </div>
        <div>
          <label className="tracking-wide text-gray-700 text-sm font-bold block mb-2 ">
            <span className="uppercase">Download Date*</span>
            <span className="text-red-700 text-wrap block text-xs">
              {errors.download_date && errors.download_date.message}
            </span>
          </label>
          <input
            {...register('download_date')}
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
            <span className="uppercase">Delivery Time*</span>
            <span className="text-red-700 text-wrap block text-xs">
              {errors.delivery_bd_time && errors.delivery_bd_time.message}
            </span>
          </label>
          <input
            {...register('delivery_bd_time')}
            className="appearance-none block w-full bg-gray-50 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            type="time"
          />
        </div>

        <div>
          <label className="tracking-wide text-gray-700 text-sm font-bold block mb-2 ">
            <span className="uppercase">Type*</span>
            <span className="text-red-700 text-wrap block text-xs">
              {errors.type && errors.type?.message}
            </span>
          </label>

          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <Select
                options={typeOptions}
                closeMenuOnSelect={true}
                placeholder="Select type"
                classNamePrefix="react-select"
                menuPortalTarget={setMenuPortalTarget}
                value={
                  typeOptions.find(option => option.value === field.value) ||
                  null
                }
                onChange={option => field.onChange(option ? option.value : '')}
              />
            )}
          />
        </div>
        <div>
          <label className="tracking-wide text-gray-700 text-sm font-bold block mb-2 ">
            <span className="uppercase">Status*</span>
            <span className="text-red-700 text-wrap block text-xs">
              {errors.status && errors.status?.message}
            </span>
          </label>

          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                options={statusOptions}
                closeMenuOnSelect={true}
                placeholder="Select status"
                classNamePrefix="react-select"
                menuPortalTarget={setMenuPortalTarget}
                value={
                  statusOptions.find(option => option.value === field.value) ||
                  null
                }
                onChange={option => field.onChange(option ? option.value : '')}
              />
            )}
          />
        </div>

        <div>
          <label className="tracking-wide text-gray-700 text-sm font-bold block mb-2 ">
            <span className="uppercase">Est. Time (min)*</span>
            <span className="text-red-700 text-wrap block text-xs">
              {errors.et && errors.et.message}
            </span>
          </label>
          <input
            {...register('et')}
            className="appearance-none block w-full bg-gray-50 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            type="number"
          />
        </div>
        <div>
          <label className="tracking-wide text-gray-700 text-sm font-bold block mb-2 ">
            <span className="uppercase">Production*</span>
            <span className="text-red-700 text-wrap block text-xs">
              {errors.production && errors.production.message}
            </span>
          </label>
          <input
            {...register('production')}
            className="appearance-none block w-full bg-gray-50 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            type="number"
          />
        </div>
        <div>
          <label className="tracking-wide text-gray-700 text-sm font-bold block mb-2 ">
            <span className="uppercase">QC1*</span>
            <span className="text-red-700 text-wrap block text-xs">
              {errors.qc1 && errors.qc1.message}
            </span>
          </label>
          <input
            {...register('qc1')}
            className="appearance-none block w-full bg-gray-50 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            type="number"
          />
        </div>
        <div>
          <label className="tracking-wide text-gray-700 text-sm font-bold block mb-2 ">
            <span className="uppercase">Folder Path*</span>
            <span className="text-red-700 text-wrap block text-xs">
              {errors.folder_path && errors.folder_path.message}
            </span>
          </label>
          <input
            {...register('folder_path')}
            className="appearance-none block w-full bg-gray-50 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            type="text"
          />
        </div>
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
                isSearchable={true}
                isMulti={true}
                options={taskOptions}
                closeMenuOnSelect={false}
                placeholder="Select task(s)"
                classNamePrefix="react-select"
                menuPortalTarget={setMenuPortalTarget}
                menuPlacement="auto"
                menuPosition="fixed" // Prevent clipping by parent containers
                value={
                  taskOptions.filter(option =>
                    field.value?.split('+').includes(option.value),
                  ) || null
                }
                onChange={selectedOptions =>
                  field.onChange(
                    selectedOptions?.map(option => option.value).join('+') ||
                      '',
                  )
                }
              />
            )}
          />
        </div>
        <div>
          <label className="tracking-wide text-gray-700 text-sm font-bold block mb-2 ">
            <span className="uppercase">Priority*</span>
            <span className="text-red-700 text-wrap block text-xs">
              {errors.priority && errors.priority?.message}
            </span>
          </label>

          <Controller
            name="priority"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                options={priorityOptions}
                closeMenuOnSelect={true}
                placeholder="Select priority"
                classNamePrefix="react-select"
                menuPortalTarget={setMenuPortalTarget}
                value={
                  priorityOptions.find(
                    option => option.value === field.value,
                  ) || null
                }
                onChange={option => field.onChange(option ? option.value : '')}
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

      <button
        disabled={loading}
        className="rounded-md bg-primary text-white hover:opacity-90 hover:ring-4 hover:ring-primary transition duration-200 delay-300 hover:text-opacity-100 text-primary-foreground px-10 py-2 mt-6 uppercase"
        type="submit"
      >
        {loading ? 'Creating...' : 'Create this task'}
      </button>
    </form>
  );
};

export default Form;
