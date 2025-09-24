'use client';

import { fetchApi } from '@/lib/utils';
import { setMenuPortalTarget } from '@/utility/selectHelpers';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import Select from 'react-select';
import { ClientDataType, validationSchema } from '../../schema';

import { toast } from 'sonner';

interface PropsType {
  marketerNames: string[];
}

export const currencyOptions = [
  { value: '$', label: 'Dollar ($)' },
  { value: '€', label: 'Euro (€)' },
  { value: '£', label: 'Pound (£)' },
  { value: 'A$', label: 'Australian Dollar (A$)' },
  { value: 'C$', label: 'Canadian Dollar (C$)' },
  { value: 'NOK', label: 'Norwegian Krone (NOK)' },
  { value: 'DKK', label: 'Danish Krone (DKK)' },
  { value: 'SEK', label: 'Swedish Krona (SEK)' },
];

const Form: React.FC<PropsType> = props => {
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();

  const marketerOptions = (props.marketerNames || []).map(name => ({
    label: name,
    value: name,
  }));

  const {
    watch,
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ClientDataType>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      client_code: '',
      client_name: '',
      marketer: '',
      contact_person: '',
      designation: '',
      contact_number: '',
      email: '',
      country: '',
      address: '',
      prices: '',
      currency: '',
      category: '',
      last_invoice_number: null,
      updated_by: session?.user.real_name || '',
    },
  });

  async function createClient(clientData: ClientDataType) {
    try {
      setLoading(true);
      const parsed = validationSchema.safeParse(clientData);

      if (!parsed.success) {
        console.error(parsed.error.issues.map(issue => issue.message));
        toast.error('Invalid form data');
        return;
      }

      let url: string =
        process.env.NEXT_PUBLIC_BASE_URL + '/api/client?action=create-client';
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
        toast.success('Created new client successfully');
        reset();
        // reset the form after successful submission
      } else {
        toast.error(response.data as string);
      }

      console.log('data', parsed.data, clientData);
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while creating new client');
    } finally {
      setLoading(false);
    }
  }

  const onSubmit = async (data: ClientDataType) => {
    await createClient(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-3 mb-4 gap-y-4">
        <div>
          <label className="tracking-wide text-gray-700 text-sm font-bold block mb-2 ">
            <span className="uppercase">Client Code*</span>
            <span className="text-red-700 text-wrap block text-xs">
              {errors.client_code && errors.client_code.message}
            </span>
          </label>
          <input
            {...register('client_code')}
            className="appearance-none block w-full bg-gray-50 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            type="text"
            placeholder="Enter client code"
          />
        </div>
        <div>
          <label className="tracking-wide text-gray-700 text-sm font-bold block mb-2 ">
            <span className="uppercase">Client Name*</span>
            <span className="text-red-700 text-wrap block text-xs">
              {errors.client_name && errors.client_name.message}
            </span>
          </label>
          <input
            {...register('client_name')}
            className="appearance-none block w-full bg-gray-50 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            type="text"
            placeholder="Enter client's name"
          />
        </div>
        <div>
          <label className="tracking-wide text-gray-700 text-sm font-bold block mb-2 ">
            <span className="uppercase">Marketer Name*</span>
            <span className="text-red-700 text-wrap block text-xs">
              {errors.marketer && errors.marketer?.message}
            </span>
          </label>

          <Controller
            name="marketer"
            control={control}
            render={({ field }) => (
              <Select
                options={marketerOptions}
                closeMenuOnSelect={true}
                placeholder="Select marketer"
                classNamePrefix="react-select"
                menuPortalTarget={setMenuPortalTarget}
                menuPlacement="auto"
                menuPosition="fixed"
                value={
                  marketerOptions.find(
                    option => option.value === field.value,
                  ) || null
                }
                onChange={option => field.onChange(option ? option.value : '')}
              />
            )}
          />
        </div>
        <div>
          <label className="tracking-wide text-gray-700 text-sm font-bold block mb-2 ">
            <span className="uppercase">Category</span>
            <span className="text-red-700 text-wrap block text-xs">
              {errors.category && errors.category.message}
            </span>
          </label>
          <input
            {...register('category')}
            className="appearance-none block w-full bg-gray-50 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            type="text"
            placeholder="Enter client category"
          />
        </div>
        <div>
          <label className="tracking-wide text-gray-700 text-sm font-bold block mb-2 ">
            <span className="uppercase">Contact Person</span>
            <span className="text-red-700 text-wrap block text-xs">
              {errors.contact_person && errors.contact_person.message}
            </span>
          </label>
          <input
            {...register('contact_person')}
            className="appearance-none block w-full bg-gray-50 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            type="text"
            placeholder="Enter client's contact person"
          />
        </div>

        <div>
          <label className="tracking-wide text-gray-700 text-sm font-bold block mb-2 ">
            <span className="uppercase">Designation</span>
            <span className="text-red-700 text-wrap block text-xs">
              {errors.designation && errors.designation.message}
            </span>
          </label>
          <input
            {...register('designation')}
            className="appearance-none block w-full bg-gray-50 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            type="text"
            placeholder="Enter client's contact person's designation"
          />
        </div>
        <div>
          <label className="tracking-wide text-gray-700 text-sm font-bold block mb-2 ">
            <span className="uppercase">Contact Number</span>
            <span className="text-red-700 text-wrap block text-xs">
              {errors.contact_number && errors.contact_number.message}
            </span>
          </label>
          <input
            {...register('contact_number')}
            className="appearance-none block w-full bg-gray-50 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            type="text"
            placeholder="Enter client's number"
          />
        </div>
        <div>
          <label className="tracking-wide text-gray-700 text-sm font-bold block mb-2 ">
            <span className="uppercase">Email</span>
            <span className="text-red-700 text-wrap block text-xs">
              {errors.email && errors.email.message}
            </span>
          </label>
          <input
            {...register('email')}
            className="appearance-none block w-full bg-gray-50 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            type="text"
            placeholder="Enter client's email"
          />
        </div>
        <div>
          <label className="tracking-wide text-gray-700 text-sm font-bold block mb-2 ">
            <span className="uppercase">Address</span>
            <span className="text-red-700 text-wrap block text-xs">
              {errors.address && errors.address.message}
            </span>
          </label>
          <input
            {...register('address')}
            className="appearance-none block w-full bg-gray-50 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            type="text"
            placeholder="Enter client's address"
          />
        </div>
        <div>
          <label className="tracking-wide text-gray-700 text-sm font-bold block mb-2 ">
            <span className="uppercase">Country</span>
            <span className="text-red-700 text-wrap block text-xs">
              {errors.country && errors.country.message}
            </span>
          </label>
          <input
            {...register('country')}
            className="appearance-none block w-full bg-gray-50 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            type="text"
            placeholder="Enter client's country name"
          />
        </div>
        <div>
          <label className="tracking-wide text-gray-700 text-sm font-bold block mb-2 ">
            <span className="uppercase">Currency</span>
            <span className="text-red-700 text-wrap block text-xs">
              {errors.currency && errors.currency?.message}
            </span>
          </label>

          <Controller
            name="currency"
            control={control}
            render={({ field }) => (
              <Select
                options={currencyOptions}
                closeMenuOnSelect={true}
                placeholder="Select currency"
                classNamePrefix="react-select"
                menuPortalTarget={setMenuPortalTarget}
                menuPlacement="auto"
                menuPosition="fixed"
                value={
                  currencyOptions.find(
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
          <span className="uppercase">Prices</span>
          <span className="text-red-700 text-wrap block text-xs">
            {errors.prices && errors.prices?.message}
          </span>
        </label>
        <textarea
          {...register('prices')}
          rows={5}
          className="appearance-none block w-full bg-gray-50 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
          placeholder="List cost of services pitched to client"
        />
      </div>

      <button
        disabled={loading}
        className="rounded-md bg-primary text-white hover:opacity-90 hover:ring-4 hover:ring-primary transition duration-200 delay-300 hover:text-opacity-100 text-primary-foreground px-10 py-2 mt-6 uppercase"
        type="submit"
      >
        {loading ? 'Creating...' : 'Create this client'}
      </button>
    </form>
  );
};

export default Form;
