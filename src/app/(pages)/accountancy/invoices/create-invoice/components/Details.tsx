'use client';
import { fetchApi } from '@/lib/utils';
import { ClientDataType } from '@/models/Clients';
import { OrderDataType } from '@/models/Orders';
import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface DetailsProps {
  clientCode: string;
}

const Details: React.FC<DetailsProps> = props => {
  const [clientDetails, setClientDetails] = useState<ClientDataType | null>(
    null,
  );
  const [orders, setOrders] = useState<OrderDataType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const getClientOrders = useCallback(async () => {
    try {
      setLoading(true);

      let url: string =
        process.env.NEXT_PUBLIC_BASE_URL +
        '/api/order?action=get-client-orders';
      let options: {} = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_code: props.clientCode,
        }),
      };

      let response = await fetchApi(url, options);

      if (response.ok) {
        setOrders(response.data as OrderDataType[]);
      } else {
        toast.error(response.data as string);
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while retrieving orders data');
    } finally {
      setLoading(false);
    }
    return;
  }, [props.clientCode]);

  const getClientDetails = useCallback(async () => {
    try {
      setLoading(true);

      let url: string =
        process.env.NEXT_PUBLIC_BASE_URL +
        '/api/client?action=get-client-by-code';
      let options: {} = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          client_code: props.clientCode,
        },
      };

      let response = await fetchApi(url, options);

      if (response.ok) {
        setClientDetails(response.data as ClientDataType);
      } else {
        toast.error(response.data as string);
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while retrieving client data');
    } finally {
      setLoading(false);
    }
    return;
  }, [props.clientCode]);

  useEffect(() => {
    if (props.clientCode) {
      getClientDetails();
      getClientOrders();
    }
  }, [props.clientCode, getClientOrders, getClientDetails]);

  const [customer, setCustomer] = useState({
    companyName: '',
    companyAddress: '',
    contactPerson: '',
    email: '',
    contactNumber: '',
    invoiceNumber: '',
    currency: '',
    prices: '',
  });

  const [vendor, setVendor] = useState({
    companyName: 'Studio Click House Ltd.',
    contactPerson: 'Raiyan Abrar',
    streetAddress: 'Tengra Road, Ma HolyCity Tower, Level 2',
    city: 'Demra, Dhaka-1361, Bangladesh',
    contactNumber: '+46855924212, +8801819727117',
    email: 'info@studioclickhouse.com',
  });

  useEffect(() => {
    if (clientDetails) {
      setCustomer({
        companyName: clientDetails.client_name ?? '',
        companyAddress: clientDetails.address
          ? clientDetails.address.trim().endsWith(',')
            ? `${clientDetails.address} ${clientDetails.country}`
            : `${clientDetails.address}, ${clientDetails.country}`
          : clientDetails.country ?? '',
        contactPerson: clientDetails.contact_person ?? '',
        email: clientDetails.email ?? '',
        contactNumber: clientDetails.contact_number ?? '',
        invoiceNumber: (() => {
          const lastInvoiceNumber = clientDetails?.last_invoice_number;
          const baseCode =
            clientDetails?.client_code?.split('_')?.[1] || '00XX';
          if (lastInvoiceNumber) {
            const numericPart = lastInvoiceNumber.match(/\d+/)?.[0];
            return numericPart
              ? `${baseCode}${(parseInt(numericPart) + 1)
                  .toString()
                  .padStart(4, '0')}`
              : `${baseCode}0001`;
          }
          return `${baseCode}00XX`;
        })(),
        currency: clientDetails.currency ?? '',
        prices: clientDetails.prices ?? '',
      });
    }
  }, [clientDetails]);

  const handleChangeClient = (e: Change) => {
    setCustomer({ ...customer, [e.target.name]: e.target.value });
  };

  const handleChangeVendor = e => {
    setVendor({ ...vendor, [e.target.name]: e.target.value });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!clientDetails) {
    return (
      <div className="max-w-4xl mx-auto mt-8 p-6 bg-red-100 border border-red-400 text-red-700 rounded-lg">
        <p className="text-center font-semibold">
          Client data couldn't be retrieved!
        </p>
      </div>
    );
  }

  if (!orders.length) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="bg-primary text-white p-6">
        <h2 className="text-3xl font-bold text-center">Create Invoice</h2>
      </div>

      <div className="p-6 space-y-8">
        <section>
          <h3 className="text-xl font-semibold mb-4 pb-2 border-b">
            Customer Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="companyName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Company Name
              </label>
              <input
                id="companyName"
                name="companyName"
                onChange={handleChangeClient}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                value={customer.companyName}
                type="text"
              />
            </div>
            <div>
              <label
                htmlFor="contactPerson"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Contact Person
              </label>
              <input
                id="contactPerson"
                name="contactPerson"
                onChange={handleChangeClient}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                value={customer.contactPerson}
                type="text"
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                onChange={handleChangeClient}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                value={customer.email}
                type="email"
              />
            </div>
            <div>
              <label
                htmlFor="contactNumber"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Contact Number
              </label>
              <input
                id="contactNumber"
                name="contactNumber"
                onChange={handleChangeClient}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                value={customer.contactNumber}
                type="tel"
              />
            </div>
            <div>
              <label
                htmlFor="invoiceNumber"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Invoice Number
              </label>
              <input
                id="invoiceNumber"
                name="invoiceNumber"
                onChange={handleChangeClient}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                value={customer.invoiceNumber}
                type="text"
              />
            </div>
            <div>
              <label
                htmlFor="currency"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Currency
              </label>
              <input
                id="currency"
                name="currency"
                onChange={handleChangeClient}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                value={customer.currency}
                type="text"
              />
            </div>
            <div className="md:col-span-2">
              <label
                htmlFor="prices"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Prices
              </label>
              <textarea
                id="prices"
                rows={3}
                name="prices"
                onChange={handleChangeClient}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                value={customer.prices}
              />
            </div>
            <div className="md:col-span-2">
              <label
                htmlFor="companyAddress"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Company Address
              </label>
              <textarea
                id="companyAddress"
                rows={3}
                name="companyAddress"
                onChange={handleChangeClient}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                value={customer.companyAddress}
              />
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-4 pb-2 border-b">
            Vendor Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="vendorCompanyName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Company Name
              </label>
              <input
                id="vendorCompanyName"
                name="companyName"
                onChange={handleChangeVendor}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                value={vendor.companyName}
                type="text"
              />
            </div>
            <div>
              <label
                htmlFor="vendorContactPerson"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Contact Person
              </label>
              <input
                id="vendorContactPerson"
                name="contactPerson"
                onChange={handleChangeVendor}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                value={vendor.contactPerson}
                type="text"
              />
            </div>
            <div>
              <label
                htmlFor="vendorEmail"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <input
                id="vendorEmail"
                name="email"
                onChange={handleChangeVendor}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                value={vendor.email}
                type="email"
              />
            </div>
            <div>
              <label
                htmlFor="vendorContactNumber"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Contact Number
              </label>
              <input
                id="vendorContactNumber"
                name="contactNumber"
                onChange={handleChangeVendor}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                value={vendor.contactNumber}
                type="tel"
              />
            </div>
            <div>
              <label
                htmlFor="vendorStreetAddress"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Street Address
              </label>
              <input
                id="vendorStreetAddress"
                name="streetAddress"
                onChange={handleChangeVendor}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                value={vendor.streetAddress}
                type="text"
              />
            </div>
            <div>
              <label
                htmlFor="vendorCity"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                City
              </label>
              <input
                id="vendorCity"
                name="city"
                onChange={handleChangeVendor}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                value={vendor.city}
                type="text"
              />
            </div>
          </div>
        </section>

        <div className="flex justify-end">
          <button className="px-6 py-2 bg-primary text-white font-semibold rounded-md hover:bg-primary-dark transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50">
            Create Invoice
          </button>
        </div>
      </div>
    </div>
  );
};

export default Details;
