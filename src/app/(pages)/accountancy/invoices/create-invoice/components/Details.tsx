'use client';
import { ClientDataType } from '@/models/Clients';
import { OrderDataType } from '@/models/Orders';
import React, { useState } from 'react';

interface DetailsProps {
  clientDetails: ClientDataType;
  orders: OrderDataType[];
}

const Details: React.FC<DetailsProps> = props => {
  const { clientDetails, orders } = props;

  const [customer, setCustomer] = useState({
    companyName: clientDetails.client_name,
    companyAddress: clientDetails.address
      ? clientDetails.address.trim().endsWith(',')
        ? `${clientDetails.address} ${clientDetails.country}`
        : `${clientDetails.address}, ${clientDetails.country}`
      : clientDetails.country ?? '',
    contactPerson: clientDetails.contact_person,
    email: clientDetails.email,
    contactNumber: clientDetails.contact_number,
    invoiceNumber:
      clientDetails?.last_invoice_number === undefined ||
      clientDetails?.last_invoice_number === null
        ? clientDetails?.client_code?.split('_')?.[1] + '00XX'
        : clientDetails?.client_code?.split('_')?.[1] +
          `${(
            parseInt(
              clientDetails.last_invoice_number.match(/\d+/g)?.[0] || '0',
            ) + 1
          )
            .toString()
            .padStart(4, '0')}`,
    currency: '',
    prices: '',
  });

  const handleChangeClient = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ): void => {
    const { name, type, value } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setCustomer(prevData => ({
        ...prevData,
        [name]: checked,
      }));
    } else {
      setCustomer(prevData => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const [vendor, setVendor] = useState({
    companyName: 'Studio Click House Ltd.',
    contactPerson: 'Raiyan Abrar',
    streetAddress: 'Tengra Road, Ma HolyCity Tower, Level 2',
    city: 'Demra, Dhaka-1361, Bangladesh',
    contactNumber: '+46855924212, +8801819727117',
    email: 'info@studioclickhouse.com',
  });

  const handleChangeVendor = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ): void => {
    const { name, type, value } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setVendor(prevData => ({
        ...prevData,
        [name]: checked,
      }));
    } else {
      setVendor(prevData => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  return (
    <div className="border rounded-md p-3">
      <h4 className="py-2 text-center">Create Invoice</h4>

      <h5>Customer details</h5>
      <div></div>

      <h5>Vendor details</h5>
      <div></div>
    </div>
  );
};

export default Details;
