'use client';

import { fetchApi, hasPerm } from '@/lib/utils';
import {
  setClassNameAndIsDisabled,
  setMenuPortalTarget,
} from '@/utility/selectHelpers';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSession } from 'next-auth/react';
import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import Select from 'react-select';

import { BookCheck, Redo2, SquarePen, Trash2 } from 'lucide-react';
import { useRouter } from 'nextjs-toploader/app';
import { toast } from 'sonner';
import {
  priorityOptions,
  statusOptions,
  taskOptions,
  typeOptions,
} from '../../components/Edit';
import { OrderDataType, validationSchema } from '../../schema';

interface PropsType {
  orderData: OrderDataType;
}

const Form: React.FC<PropsType> = props => {
  const [loading, setLoading] = useState({
    deleteOrder: false,
    editOrder: false,
    redoOrder: false,
    finishOrder: false,
  });
  const { data: session } = useSession();
  const userPermissions = useMemo(
    () => session?.user.permissions || [],
    [session?.user.permissions],
  );

  const router = useRouter();

  const {
    watch,
    getValues,
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<OrderDataType>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      ...props.orderData,
    },
  });

  const deleteOrder = async (orderData: OrderDataType) => {
    try {
      if (!confirm('Are you sure you want to delete this order?')) return;
      setLoading(prevData => ({ ...prevData, deleteOrder: true }));

      let url: string =
        process.env.NEXT_PUBLIC_BASE_URL + '/api/approval?action=new-request';
      let options: {} = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          target_model: 'Order',
          action: 'delete',
          object_id: orderData._id,
          deleted_data: orderData,
          req_by: session?.user.db_id,
        }),
      };

      let response = await fetchApi(url, options);

      if (response.ok) {
        toast.success('Request sent for approval');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while sending request for approval');
    } finally {
      setLoading(prevData => ({ ...prevData, deleteOrder: false }));
    }
  };

  const finishOrder = async (orderData: OrderDataType) => {
    try {
      setLoading(prevData => ({ ...prevData, finishOrder: true }));

      if (
        props.orderData.quantity != orderData.quantity ||
        props.orderData.production != orderData.production ||
        props.orderData.qc1 != orderData.qc1 ||
        props.orderData.qc2 != orderData.qc2
      ) {
        toast.error('Save changes before updating the status!');
        return;
      }

      let url: string =
        process.env.NEXT_PUBLIC_BASE_URL + '/api/order?action=finish-order';
      let options: {} = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order_id: orderData._id,
        }),
      };

      if (
        orderData.production >= orderData.quantity &&
        orderData.qc1 >= orderData.quantity &&
        orderData.qc2 >= orderData.quantity
      ) {
        const response = await fetchApi(url, options);

        if (response.ok) {
          toast.success('Changed the status to FINISHED');
          router.refresh();
        } else {
          toast.error('Unable to change status');
        }
      } else {
        if (orderData.production < orderData.quantity) {
          toast.error('Production is not completed');
        } else if (
          orderData.qc1 < orderData.quantity ||
          orderData.qc2 < orderData.quantity
        ) {
          toast.error('QC is not completed');
        } else {
          toast.error('Unable to change status');
        }
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while changing the status');
    } finally {
      setLoading(prevData => ({ ...prevData, finishOrder: false }));
    }
  };

  const redoOrder = async (orderData: OrderDataType) => {
    try {
      setLoading(prevData => ({ ...prevData, redoOrder: true }));

      let url: string =
        process.env.NEXT_PUBLIC_BASE_URL + '/api/order?action=redo-order';
      let options: {} = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order_id: orderData._id,
        }),
      };

      const response = await fetchApi(url, options);

      if (response.ok) {
        toast.success('Changed the status to CORRECTION');
        router.refresh();
      } else {
        toast.error('Unable to change status');
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while changing the status');
    } finally {
      setLoading(prevData => ({ ...prevData, redoOrder: false }));
    }
  };

  const editOrder = async (editedOrderData: OrderDataType) => {
    try {
      setLoading(prevData => ({ ...prevData, editOrder: true }));
      const parsed = validationSchema.safeParse(editedOrderData);

      if (!parsed.success) {
        console.error(parsed.error.issues.map(issue => issue.message));
        toast.error('Invalid form data');
        return;
      }

      let url: string =
        process.env.NEXT_PUBLIC_BASE_URL + '/api/order?action=edit-order';
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
        toast.success('Updated the order data');
        router.refresh();
      } else {
        toast.error(response.data as string);
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while updating the order');
    } finally {
      setLoading(prevData => ({ ...prevData, editOrder: false }));
    }
  };

  return (
    <div className="overflow-x-hidden text-start mt-8">
      <div className="form">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-3 mb-4 gap-y-4">
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
              placeholder="Enter folder name"
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
              placeholder="Enter number of files"
            />
          </div>

          {hasPerm('admin:view_task_rate', userPermissions) && (
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
                placeholder="Enter rate"
              />
            </div>
          )}

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
                  {...field}
                  options={typeOptions}
                  closeMenuOnSelect={true}
                  placeholder="Select type"
                  classNamePrefix="react-select"
                  menuPortalTarget={setMenuPortalTarget}
                  value={
                    typeOptions.find(option => option.value === field.value) ||
                    null
                  }
                  onChange={option =>
                    field.onChange(option ? option.value : '')
                  }
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
                    statusOptions.find(
                      option => option.value === field.value,
                    ) || null
                  }
                  onChange={option =>
                    field.onChange(option ? option.value : '')
                  }
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
              placeholder="Enter estimated time in minutes"
            />
          </div>

          <div>
            <label className="tracking-wide text-gray-700 text-sm font-bold block mb-2">
              <span className="uppercase">Production*</span>
              <span className="text-red-700 text-wrap block text-xs">
                {errors.production && errors.production.message}
              </span>
            </label>
            <div className="flex items-center">
              <input
                {...register('production')}
                className="appearance-none block w-full bg-gray-50 text-gray-700 border border-gray-200 rounded-l py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                placeholder="Enter the number of completed files"
                type="number"
              />
              <button
                disabled={watch('quantity') === watch('production')}
                onClick={() => {
                  setValue('production', watch('quantity') || 0, {
                    shouldValidate: true,
                  });
                }}
                type="button"
                className="bg-gray-100 disabled:cursor-not-allowed border-gray-200 border enabled:hover:bg-gray-200 text-gray-800 py-[0.63rem] px-4 rounded-r enabled:focus:outline-none enabled:transition duration-100 delay-100"
              >
                <span className="text-nowrap">= NOF</span>
              </button>
            </div>
          </div>

          <div>
            <label className="tracking-wide text-gray-700 text-sm font-bold block mb-2">
              <span className="uppercase">QC1*</span>
              <span className="text-red-700 text-wrap block text-xs">
                {errors.qc1 && errors.qc1.message}
              </span>
            </label>
            <div className="flex items-center">
              <input
                {...register('qc1')}
                className="appearance-none block w-full bg-gray-50 text-gray-700 border border-gray-200 rounded-l py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                placeholder="Enter QC count (1)"
                type="number"
              />
              <button
                disabled={watch('production') === watch('qc1')}
                onClick={() => {
                  setValue('qc1', watch('production') || 0, {
                    shouldValidate: true,
                  });
                }}
                type="button"
                className="bg-gray-100 disabled:cursor-not-allowed border-gray-200 border enabled:hover:bg-gray-200 text-gray-800 py-[0.63rem] px-4 rounded-r enabled:focus:outline-none enabled:transition duration-100 delay-100"
              >
                <span className="text-nowrap">= PROD</span>
              </button>
            </div>
          </div>

          <div>
            <label className="tracking-wide text-gray-700 text-sm font-bold block mb-2">
              <span className="uppercase">QC2*</span>
              <span className="text-red-700 text-wrap block text-xs">
                {errors.qc2 && errors.qc2.message}
              </span>
            </label>
            <div className="flex items-center">
              <input
                {...register('qc2')}
                className="appearance-none block w-full bg-gray-50 text-gray-700 border border-gray-200 rounded-l py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                placeholder="Enter QC count (2)"
                type="number"
              />
              <button
                disabled={watch('qc1') === watch('qc2')}
                onClick={() => {
                  setValue('qc2', watch('qc1') || 0, {
                    shouldValidate: true,
                  });
                }}
                type="button"
                className="bg-gray-100 disabled:cursor-not-allowed border-gray-200 border enabled:hover:bg-gray-200 text-gray-800 py-[0.63rem] px-4 rounded-r enabled:focus:outline-none enabled:transition duration-100 delay-100"
              >
                <span className="text-nowrap">= QC1</span>
              </button>
            </div>
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
              placeholder='Enter folder path e.g. "P:\SCHL Production\.."'
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
                  placeholder="Select tasks"
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
              <span className="uppercase">Priority</span>
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
                  placeholder="Select status"
                  classNamePrefix="react-select"
                  menuPortalTarget={setMenuPortalTarget}
                  value={
                    priorityOptions.find(
                      option => option.value === field.value,
                    ) || null
                  }
                  onChange={option =>
                    field.onChange(option ? option.value : '')
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
      </div>
      <div className="flex gap-2 my-2 mx-1">
        {hasPerm('browse:edit_task', userPermissions) && (
          <>
            <button
              onClick={() => editOrder(getValues())}
              disabled={loading.editOrder}
              className="rounded-md bg-blue-600 hover:opacity-90 hover:ring-2 hover:ring-blue-600 transition duration-200 delay-300 hover:text-opacity-100 text-white p-2 items-center"
              type="button"
            >
              {loading.editOrder ? (
                'Updating...'
              ) : (
                <span className="flex items-center gap-2">
                  Update <SquarePen size={18} />
                </span>
              )}
            </button>
            {watch('status')?.trim().toLocaleLowerCase() === 'finished' ? (
              <button
                onClick={() => redoOrder(getValues())}
                disabled={loading.redoOrder}
                className="rounded-md bg-amber-600 hover:opacity-90 hover:ring-2 hover:ring-amber-600 transition duration-200 delay-300 hover:text-opacity-100 text-white p-2 items-center"
                type="button"
              >
                {loading.redoOrder ? (
                  'Redoing...'
                ) : (
                  <span className="flex items-center gap-2">
                    Redo <Redo2 size={18} />
                  </span>
                )}
              </button>
            ) : (
              <button
                onClick={() => finishOrder(getValues())}
                disabled={loading.finishOrder}
                className="rounded-md bg-green-600 hover:opacity-90 hover:ring-2 hover:ring-green-600 transition duration-200 delay-300 hover:text-opacity-100 text-white p-2 items-center"
                type="button"
              >
                {loading.finishOrder ? (
                  'Finishing...'
                ) : (
                  <span className="flex items-center gap-2">
                    Finish <BookCheck size={18} />
                  </span>
                )}
              </button>
            )}
          </>
        )}

        {hasPerm('browse:delete_task_approval', userPermissions) && (
          <button
            onClick={() => deleteOrder(props.orderData)}
            disabled={loading.deleteOrder}
            className="rounded-md bg-destructive hover:opacity-90 hover:ring-2 hover:ring-destructive transition duration-200 delay-300 hover:text-opacity-100 text-destructive-foreground p-2 items-center"
            type="button"
          >
            {loading.deleteOrder ? (
              'Deleting...'
            ) : (
              <span className="flex items-center gap-2">
                Delete <Trash2 size={18} />
              </span>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default Form;
