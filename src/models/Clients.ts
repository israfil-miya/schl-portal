import mongoose from 'mongoose';

export interface ClientDataType {
  client_code: string;
  client_name: string;
  marketer: string;
  contact_person: string;
  designation: string;
  contact_number: string;
  email: string;
  country: string;
  address: string;
  prices: string;
  currency: string;
  last_invoice_number: string | null;
  updated_by: string | null;
}

type Client = mongoose.Document & ClientDataType;

const ClientSchema = new mongoose.Schema<Client>(
  {
    client_code: {
      type: String,
    },
    client_name: {
      type: String,
    },
    marketer: {
      type: String,
    },
    contact_person: {
      type: String,
    },
    designation: {
      type: String,
    },
    contact_number: {
      type: String,
    },
    email: {
      type: String,
    },
    country: {
      type: String,
    },
    address: {
      type: String,
    },
    prices: {
      type: String,
    },
    currency: {
      type: String,
    },
    last_invoice_number: {
      type: String,
      default: null,
    },
    updated_by: {
      type: String,
      default: null,
    },
  },
  { timestamps: true },
);

const Client =
  (mongoose.models.Client as mongoose.Model<Client>) ||
  mongoose.model<Client>('Client', ClientSchema);

export default Client;
