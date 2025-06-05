'use client';
import {
  priorityOptions,
  statusOptions,
  taskOptions,
  typeOptions,
} from '@/app/(pages)/browse/components/Edit';
import {
  ScheduleDataType,
  validationSchema,
} from '@/app/(pages)/work-schedule/schema';
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

interface PropsType {
  clientsData: ClientDataType[];
}

const Form: React.FC<PropsType> = props => {
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();

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
      receive_date: '',
      delivery_date: '',
      client_code: '',
      client_name: '',
      task: '',
      comment: '',
      updated_by: session?.user.real_name || '',
    },
  });

  async function createSchedule(scheduleData: ScheduleDataType) {
    try {
      setLoading(true);
      const parsed = validationSchema.safeParse(scheduleData);

      if (!parsed.success) {
        console.error(parsed.error.issues.map(issue => issue.message));
        toast.error('Invalid form data');
        return;
      }

      let url: string =
        process.env.NEXT_PUBLIC_BASE_URL +
        '/api/schedule?action=create-schedule';
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
        toast.success('Created new schedule successfully');
        reset();
        // reset the form after successful submission
      } else {
        toast.error(response.data as string);
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while creating new schedule');
    } finally {
      setLoading(false);
    }
  }

  const onSubmit = async (data: ScheduleDataType) => {
    await createSchedule(data);
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
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-3 mb-4 gap-y-4">
        <div>
          <label className="tracking-wide text-gray-700 text-sm font-bold block mb-2 ">
            <span className="uppercase">Recieve Date*</span>
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
          placeholder="Write any instructions or note about the task"
        />
      </div>

      <button
        disabled={loading}
        className="rounded-md bg-primary text-white hover:opacity-90 hover:ring-4 hover:ring-primary transition duration-200 delay-300 hover:text-opacity-100 text-primary-foreground px-10 py-2 mt-6 uppercase"
        type="submit"
      >
        {loading ? 'Scheduling...' : 'Schedule this task'}
      </button>
    </form>
  );
};

export default Form;
