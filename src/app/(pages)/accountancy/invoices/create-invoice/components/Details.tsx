'use client';
import { cn, fetchApi } from '@/lib/utils';
import { ClientDataType } from '@/models/Clients';
import { OrderDataType } from '@/models/Orders';
import 'flowbite';
import { initFlowbite } from 'flowbite';
import { X } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
const baseZIndex = 50; // 52

interface DetailsProps {
  clientCode: string;
}

const Details: React.FC<DetailsProps> = props => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [clientDetails, setClientDetails] = useState<ClientDataType | null>(
    null,
  );
  const [orders, setOrders] = useState<OrderDataType[]>([]);

  const [loading, setLoading] = useState<boolean>(false);

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
    initFlowbite();
  }, []);

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

  const handleChangeClient = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setCustomer({ ...customer, [e.target.name]: e.target.value });
  };

  const handleChangeVendor = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setVendor({ ...vendor, [e.target.name]: e.target.value });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span>Loading...</span>
      </div>
    );
  }

  if (!clientDetails) {
    return (
      <div className="max-w-4xl mx-auto mt-8 p-6 bg-red-100 border border-red-400 text-red-700 rounded-lg">
        <p className="text-center font-semibold">
          Client data couldn&apos;t be retrieved!
        </p>
      </div>
    );
  }

  if (!orders.length) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => {
          setIsOpen(true);
        }}
        className="rounded-md bg-blue-600 hover:opacity-90 hover:ring-2 hover:ring-blue-600 transition duration-200 delay-300 hover:text-opacity-100 text-white p-2 items-center"
      >
        Create Invoice
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
              Invoice Details
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              type="button"
              className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center "
            >
              <X size={18} />
            </button>
          </header>

          <div className="overflow-x-hidden overflow-y-scroll max-h-[70vh] p-4 text-start">
            <div className="space-y-8">
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
            </div>
          </div>

          <footer
            className={cn(
              'flex items-center px-4 py-2 border-t justify-end gap-6 border-gray-200 rounded-b',
            )}
          >
            <div className="space-x-2 justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-md bg-gray-600 text-white hover:opacity-90 hover:ring-2 hover:ring-gray-600 transition duration-200 delay-300 hover:text-opacity-100 px-4 py-1"
                type="button"
                disabled={loading}
              >
                Close
              </button>
              <button
                disabled={loading}
                onClick={() => {
                  formRef.current?.requestSubmit();
                }}
                className="rounded-md bg-blue-600 text-white  hover:opacity-90 hover:ring-2 hover:ring-blue-600 transition duration-200 delay-300 hover:text-opacity-100 px-4 py-1"
                type="button"
              >
                {props ? 'Creating...' : 'Create'}
              </button>
            </div>
          </footer>
        </article>
      </section>
    </>
  );
};

export default Details;
