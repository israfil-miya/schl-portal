'use client';

import NoticeBodyEditor from '@/components/RichText/RichTextEditor';
import { cn, hasPerm } from '@/lib/utils';
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
import { NoticeDataType, validationSchema } from '../../admin/notices/schema';

const baseZIndex = 50; // 52

interface PropsType {
  isLoading: boolean;
  noticeData: NoticeDataType;
  submitHandler: (editedNoticeData: NoticeDataType) => Promise<void>;
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
    watch,
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<NoticeDataType>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      ...props.noticeData,
    },
  });

  const { data: session } = useSession();

  const userPermissions = useMemo(
    () => session?.user.permissions || [],
    [session?.user.permissions],
  );

  const allowedChannelOptions = useMemo(() => {
    const opts: {
      value: 'marketers' | 'production';
      label: string;
      isDisabled?: boolean;
    }[] = [];
    if (hasPerm('notice:send_notice_marketers', userPermissions)) {
      opts.push({ value: 'marketers', label: 'Marketers' });
    }
    if (hasPerm('notice:send_notice_production', userPermissions)) {
      opts.push({ value: 'production', label: 'Production' });
    }
    return opts;
  }, [userPermissions]);

  // if current notice channel is not allowed for this user, include it as a disabled option
  const displayedChannelOptions = useMemo(() => {
    const out: {
      value: 'marketers' | 'production';
      label: string;
      isDisabled?: boolean;
    }[] = [...allowedChannelOptions];
    const current = props.noticeData?.channel as
      | 'marketers'
      | 'production'
      | undefined;
    if (current && !out.find(o => o.value === current)) {
      const isAllowed = out.find(o => o.value === current);
      out.push({
        value: current,
        label: current.charAt(0).toUpperCase() + current.slice(1),
        isDisabled: !isAllowed,
      });
    }
    return out;
  }, [allowedChannelOptions, props.noticeData]);

  useEffect(() => {
    initFlowbite();
  }, []);

  const onSubmit = async (data: NoticeDataType) => {
    await props.submitHandler(data);
  };

  useEffect(() => {
    if (isOpen) {
      reset(props.noticeData);
    }
    console.log(props.noticeData);
  }, [isOpen, reset, props.noticeData]);

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
              Edit Notice
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
                  <span className="uppercase">Channel*</span>
                  <span className="text-red-700 text-wrap block text-xs">
                    {errors.channel && errors.channel.message}
                  </span>
                </label>

                <Controller
                  name="channel"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      {...setClassNameAndIsDisabled(isOpen)}
                      options={displayedChannelOptions}
                      closeMenuOnSelect={true}
                      placeholder="Select type"
                      classNamePrefix="react-select"
                      menuPortalTarget={setMenuPortalTarget}
                      styles={setCalculatedZIndex(baseZIndex)}
                      value={
                        (displayedChannelOptions as any).find(
                          (option: any) => option.value === field.value,
                        ) || null
                      }
                      onChange={(option: any) =>
                        field.onChange(option ? option.value : undefined)
                      }
                    />
                  )}
                />
              </div>
              <div>
                <label className="tracking-wide text-gray-700 text-sm font-bold block mb-2 ">
                  <span className="uppercase">Notice Number*</span>
                  <span className="text-red-700 text-wrap block text-xs">
                    {errors.notice_no && errors.notice_no.message}
                  </span>
                </label>
                <input
                  {...register('notice_no')}
                  className="appearance-none block w-full bg-gray-50 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                  type="text"
                  placeholder='e.g. "SCH-20251231-001"'
                />
              </div>
              <div>
                <label className="tracking-wide text-gray-700 text-sm font-bold block mb-2 ">
                  <span className="uppercase">Notice Title*</span>
                  <span className="text-red-700 text-wrap block text-xs">
                    {errors.title && errors.title.message}
                  </span>
                </label>
                <input
                  {...register('title')}
                  className="appearance-none block w-full bg-gray-50 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                  type="text"
                  placeholder="Title of the notice"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="tracking-wide text-gray-700 text-sm font-bold block mb-2 ">
                <span className="uppercase">Notice Body*</span>
                <span className="text-red-700 text-wrap block text-xs">
                  {errors.description && errors.description.message}
                </span>
              </label>

              <Controller
                name="description"
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <NoticeBodyEditor
                    onChange={onChange}
                    initialContent={value}
                  />
                )}
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
                disabled={props.isLoading}
              >
                Close
              </button>
              <button
                disabled={props.isLoading}
                onClick={() => {
                  formRef.current?.requestSubmit();
                }}
                className="rounded-md bg-blue-600 text-white  hover:opacity-90 hover:ring-2 hover:ring-blue-600 transition duration-200 delay-300 hover:text-opacity-100 px-4 py-1"
                type="button"
              >
                {props.isLoading ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </footer>
        </article>
      </section>
    </>
  );
};

export default EditButton;
