'use client';

import { parseFormData } from '@/utility/actionHelpers';
import {
  setCalculatedZIndex,
  setClassNameAndIsDisabled,
  setMenuPortalTarget,
} from '@/utility/selectHelpers';
import { zodResolver } from '@hookform/resolvers/zod';
import 'flowbite';
import { initFlowbite } from 'flowbite';
import { SquarePen, X } from 'lucide-react';
import React, { useActionState, useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import Select from 'react-select';
import { OrderDataType, validationSchema } from '../schema';

const baseZIndex = 50; // 52

interface PropsType {
  loading: boolean;
  orderData: OrderDataType;
  submitHandler: (editedOrderData: OrderDataType) => Promise<void>;
}

const EditButton: React.FC<PropsType> = props => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const popupRef = useRef<HTMLElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

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
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<OrderDataType>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      ...props.orderData!,
    },
  });

  const statusOptions = [
    { value: 'running', label: 'Running' },
    { value: 'uploaded', label: 'Uploaded' },
    { value: 'paused', label: 'Paused' },
    { value: 'client hold', label: 'Client hold' },
  ];
  const typeOptions = [
    { value: 'general', label: 'General' },
    { value: 'test', label: 'Test' },
  ];

  useEffect(() => {
    initFlowbite();
  }, []);

  const onSubmit = async (data: OrderDataType) => {
    await props.submitHandler(data);
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
              Edit Order
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-3 gap-y-4">
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

              {/* <div>
                <label className="tracking-wide text-gray-700 text-sm font-bold block mb-2 ">
                  <span className="uppercase">Store*</span>
                  <span className="text-red-700 text-wrap block text-xs">
                    {errors.store && errors.store?.message}
                  </span>
                </label>

                <Controller
                  name="store"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      {...setClassNameAndIsDisabled(isOpen)}
                      options={storeOptions}
                      closeMenuOnSelect={true}
                      placeholder="Select store"
                      classNamePrefix="react-select"
                      menuPortalTarget={setMenuPortalTarget}
                      styles={setCalculatedZIndex(baseZIndex)}
                      // Map selected values back to the option objects
                      value={
                        storeOptions.find(
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
                <label className="tracking-wide text-gray-700 text-sm font-bold block mb-2">
                  <span className="uppercase">Category*</span>
                  <span className="text-red-700 text-wrap block text-xs">
                    {errors.category && errors.category?.message}
                  </span>
                </label>

                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      {...setClassNameAndIsDisabled(isOpen)}
                      options={categoryOptions}
                      isMulti
                      closeMenuOnSelect={false}
                      placeholder="Select categories"
                      classNamePrefix="react-select"
                      menuPortalTarget={setMenuPortalTarget}
                      styles={setCalculatedZIndex(baseZIndex)}
                      // Map selected values back to the option objects
                      value={categoryOptions.filter(option =>
                        field.value.includes(option.value),
                      )}
                      onChange={selectedOptions =>
                        field.onChange(
                          selectedOptions.map(option => option.value),
                        )
                      }
                    />
                  )}
                />
              </div>

              <div>
                <label className="tracking-wide text-gray-700 text-sm font-bold block mb-2 ">
                  <span className="uppercase">Supplier*</span>
                  <span className="text-red-700 text-wrap block text-xs">
                    {errors.supplier && errors.supplier?.message}
                  </span>
                </label>

                <Controller
                  name="supplier"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      {...setClassNameAndIsDisabled(isOpen)}
                      options={supplierOptions}
                      isMulti
                      closeMenuOnSelect={false}
                      placeholder="Select suppliers"
                      classNamePrefix="react-select"
                      menuPortalTarget={setMenuPortalTarget}
                      styles={setCalculatedZIndex(baseZIndex)}
                      // Map selected values back to the option objects
                      value={supplierOptions.filter(option =>
                        field.value.includes(option.value),
                      )}
                      onChange={selectedOptions =>
                        field.onChange(
                          selectedOptions.map(option => option.value),
                        )
                      }
                    />
                  )}
                />
              </div>

              <div>
                <label className="tracking-wide text-gray-700 text-sm font-bold block mb-2 ">
                  <span className="uppercase">Quantity*</span>
                  <span className="text-red-700 text-wrap block text-xs">
                    {errors.quantity && errors.quantity?.message}
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
                  <span className="uppercase">Cost Price* (BDT)</span>
                  <span className="text-red-700 text-wrap block text-xs">
                    {errors.cost_price && errors.cost_price?.message}
                  </span>
                </label>
                <input
                  {...register('cost_price', { valueAsNumber: true })}
                  className="appearance-none block w-full bg-gray-50 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                  type="number"
                  step=".01"
                />
              </div>

              <div>
                <label className="tracking-wide text-gray-700 text-sm font-bold block mb-2 ">
                  <span className="uppercase">Selling Price* (BDT)</span>
                  <span className="text-red-700 text-wrap block text-xs">
                    {errors.selling_price && errors.selling_price?.message}
                  </span>
                </label>
                <input
                  {...register('selling_price', { valueAsNumber: true })}
                  className="appearance-none block w-full bg-gray-50 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                  type="number"
                  step=".01"
                />
              </div>

              <div>
                <label className="tracking-wide text-gray-700 text-sm font-bold block mb-2 ">
                  <span className="uppercase">VAT Rate</span>
                  <span className="text-red-700 text-wrap block text-xs">
                    {errors.vat_rate && errors.vat_rate?.message}
                  </span>
                </label>
                <input
                  {...register('vat_rate', { valueAsNumber: true })}
                  className="appearance-none block w-full bg-gray-50 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                  type="number"
                  step=".01"
                />
              </div>

              <div>
                <label className="tracking-wide text-gray-700 text-sm font-bold block mb-2 ">
                  <span className="uppercase">Mft. Date</span>
                  <span className="text-red-700 text-wrap block text-xs">
                    {errors.mft_date && errors.mft_date?.message}
                  </span>
                </label>
                <input
                  {...register('mft_date')}
                  className="appearance-none block w-full bg-gray-50 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                  type="date"
                />
              </div>

              <div>
                <label className="tracking-wide text-gray-700 text-sm font-bold block mb-2 ">
                  <span className="uppercase">Exp. Date</span>
                  <span className="text-red-700 text-wrap block text-xs">
                    {errors.exp_date && errors.exp_date?.message}
                  </span>
                </label>
                <input
                  {...register('exp_date')}
                  className="appearance-none block w-full bg-gray-50 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                  type="date"
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
                  rows={5}
                  className="appearance-none block w-full bg-gray-50 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                  placeholder="What's the product about?"
                />
              </div> */}
            </div>
          </form>

          <footer className="flex items-center px-4 py-2 border-t justify-end gap-6 border-gray-200 rounded-b">
            <div className="buttons space-x-2 ">
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-md bg-gray-600 text-white  hover:opacity-90 hover:ring-2 hover:ring-gray-600 transition duration-200 delay-300 hover:text-opacity-100 px-4 py-1"
                type="button"
                disabled={props.loading}
              >
                Close
              </button>
              <button
                disabled={props.loading}
                onClick={() => {
                  formRef.current?.requestSubmit();
                }}
                className="rounded-md bg-blue-600 text-white   hover:opacity-90 hover:ring-2 hover:ring-blue-600 transition duration-200 delay-300 hover:text-opacity-100 px-4 py-1"
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
