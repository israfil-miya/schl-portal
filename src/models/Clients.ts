import mongoose from 'mongoose';

export interface ClientType {
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

export type ClientDataType = ClientType & {
  readonly _id: mongoose.Types.ObjectId;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly __v: number;
};

type ClientDocType = mongoose.Document & ClientType;

const ClientSchema = new mongoose.Schema<ClientDocType>(
  {
    client_code: {
      type: String,
      required: true,
    },
    client_name: {
      type: String,
      required: true,
    },
    marketer: {
      type: String,
      required: true,
    },
    contact_person: {
      type: String,
      default: '',
    },
    designation: {
      type: String,
      default: '',
    },
    contact_number: {
      type: String,
      default: '',
    },
    email: {
      type: String,
      default: '',
    },
    country: {
      type: String,
      default: '',
    },
    address: {
      type: String,
      default: '',
    },
    prices: {
      type: String,
      default: '',
    },
    currency: {
      type: String,
      default: '',
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
  (mongoose.models.Client as mongoose.Model<ClientDocType>) ||
  mongoose.model<ClientDocType>('Client', ClientSchema);

export default Client;
