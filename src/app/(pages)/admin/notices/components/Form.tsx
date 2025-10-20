'use client';
import { constructFileName, fetchApi, hasPerm } from '@/lib/utils';
import { setMenuPortalTarget } from '@/utility/selectHelpers';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle, CloudUpload, Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import Select from 'react-select';
import { toast } from 'sonner';
import { NoticeDataType, validationSchema } from '../schema';

import NoticeBodyEditor from '@/components/RichText/RichTextEditor';

export const channelOptions = [
  { value: 'marketers', label: 'Marketers' },
  { value: 'production', label: 'Production' },
];

const Form: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    watch,
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<Partial<NoticeDataType>>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      channel: undefined,
      notice_no: '',
      title: '',
      description: '',
      file_name: '',
      updated_by: session?.user.real_name || '',
    },
  });

  // derive available channels from user permissions and hide channels
  const userPermissions = useMemo(
    () => session?.user.permissions || [],
    [session?.user.permissions],
  );

  const allowedChannelOptions = useMemo(() => {
    const opts: { value: 'marketers' | 'production'; label: string }[] = [];
    if (hasPerm('notice:send_notice_marketers', userPermissions)) {
      opts.push({ value: 'marketers', label: 'Marketers' });
    }
    if (hasPerm('notice:send_notice_production', userPermissions)) {
      opts.push({ value: 'production', label: 'Production' });
    }
    return opts;
  }, [userPermissions]);

  // set sensible default channel once permissions load
  useEffect(() => {
    if (!watch('channel') && allowedChannelOptions.length > 0) {
      // prefer production when available, otherwise pick the first allowed
      const defaultVal =
        allowedChannelOptions.find(o => o.value === 'production')?.value ||
        allowedChannelOptions[0].value;
      setValue('channel', defaultVal);
    }
  }, [allowedChannelOptions, setValue, watch]);

  let constructFileName = (file: File, notice_no: string) => {
    let file_name = file.name;
    let file_ext = file_name.split('.').pop();
    let file_name_without_ext = file_name.split('.').slice(0, -1).join('.');
    let new_file_name = `${file_name_without_ext}_${notice_no}.${file_ext}`;
    return new_file_name;
  };

  async function createNotice(noticeData: NoticeDataType) {
    try {
      setLoading(true);
      const parsed = validationSchema.safeParse(noticeData);

      if (!parsed.success) {
        console.error(parsed.error.issues.map(issue => issue.message));
        toast.error('Invalid form data');
        return;
      }

      const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/notice?action=create-notice`;
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          updated_by: session?.user.real_name || '',
        },
        body: JSON.stringify(parsed.data),
      };

      const response = await fetchApi(url, options);

      if (response.ok) {
        toast.success('Created new notice successfully');
        if (file) {
          let formData = new FormData();
          formData.append(
            'file',
            file,
            constructFileName(file, response.data.notice_no),
          );

          const ftp_url: string =
            process.env.NEXT_PUBLIC_BASE_URL + '/api/ftp?action=insert-file';
          const ftp_options: {} = {
            method: 'POST',
            body: formData,
            headers: {
              folder_name: 'notice',
            },
          };

          let ftp_response = await fetchApi(ftp_url, ftp_options);

          if (!ftp_response.ok) {
            toast.error(ftp_response.data as string);
            return;
          }

          toast.success('Attached file saved successfully in ftp');
        }

        reset();
        setFile(null);
      } else {
        toast.error(response.data as string);
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while creating new notice');
    } finally {
      setLoading(false);
    }
  }

  const onSubmit = async (data: Partial<NoticeDataType>) => {
    // validationSchema will ensure required fields are present before sending
    await createNotice(data as NoticeDataType);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const allowedExtensions =
      /\.(xls|xlsx|doc|docx|ppt|pptx|txt|pdf|zip|7z|rar)$/i;
    const selectedFile = e.target.files?.[0];

    if (selectedFile && allowedExtensions.test(selectedFile.name)) {
      setValue('file_name', selectedFile.name);
      setUploading(true);
      // Simulate a brief upload delay for UX
      setTimeout(() => {
        setFile(selectedFile);
        setUploading(false);
      }, 1000);
    } else {
      toast.error('Invalid file format');
      setFile(null);
    }
  };

  // Drag and Drop Handlers
  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    const allowedExtensions =
      /\.(xls|xlsx|doc|docx|ppt|pptx|txt|pdf|zip|7z|rar)$/i;
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      const selectedFile = droppedFiles[0];
      if (selectedFile && allowedExtensions.test(selectedFile.name)) {
        setValue('file_name', selectedFile.name);
        setUploading(true);
        // Simulate a brief upload delay for UX
        setTimeout(() => {
          setFile(selectedFile);
          setUploading(false);
        }, 1000);
      } else {
        toast.error('Invalid file format');
        setFile(null);
      }
      e.dataTransfer.clearData();
    }
  };

  const clearFile = () => {
    setFile(null);
    setValue('file_name', '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <form className="" onSubmit={handleSubmit(onSubmit)}>
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
                options={allowedChannelOptions}
                closeMenuOnSelect={true}
                placeholder="Select type"
                classNamePrefix="react-select"
                menuPortalTarget={setMenuPortalTarget}
                value={
                  allowedChannelOptions.find(
                    option => option.value === field.value,
                  ) || null
                }
                onChange={option =>
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
            <NoticeBodyEditor onChange={onChange} initialContent={value} />
          )}
        />
      </div>

      <div>
        <label className="tracking-wide text-gray-700 text-sm font-bold block mb-2 ">
          <span className="uppercase">Attach file</span>
        </label>

        <div className="flex items-center justify-center w-full">
          <label
            htmlFor="dropzone-file"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {uploading ? (
                <Loader2
                  size={32}
                  className="animate-spin text-blue-500 mb-4"
                />
              ) : file ? (
                <CheckCircle size={32} className="text-green-500 mb-4" />
              ) : (
                <CloudUpload
                  size={32}
                  className="w-10 h-10 mb-4 text-gray-500"
                />
              )}
              <p className="mb-2 text-sm text-gray-500">
                {uploading ? (
                  'Uploading...'
                ) : file ? (
                  <span className="animate-fade-in">{file.name}</span>
                ) : (
                  <span className="font-semibold">
                    Click to upload or drag and drop
                  </span>
                )}
              </p>
              <p className="text-xs text-gray-500">
                ( XLS, XLSX, DOC, DOCX, PPT, PPTX, TXT, PDF, ZIP, 7Z, RAR )
              </p>
            </div>
            <input
              ref={fileInputRef}
              id="dropzone-file"
              type="file"
              className="hidden"
              accept=".xls,.xlsx,.doc,.docx,.ppt,.pptx,.txt,.pdf,.zip,.7z,.rar"
              onChange={handleFileInput}
            />
          </label>
        </div>
        {file && !uploading && (
          <button
            type="button"
            onClick={clearFile}
            className="mt-2 text-sm text-red-600 hover:text-red-800"
          >
            Clear file
          </button>
        )}
      </div>

      <button
        disabled={loading}
        className="rounded-md bg-primary text-white hover:opacity-90 hover:ring-4 hover:ring-primary transition duration-200 delay-300 hover:text-opacity-100 text-primary-foreground px-10 py-2 mt-6 uppercase"
        type="submit"
      >
        {loading ? 'Creating...' : 'Create this notice'}
      </button>
      <style jsx>{`
        .animate-fade-in {
          animation: fadeInUp 0.5s ease-in-out forwards;
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </form>
  );
};

export default Form;
