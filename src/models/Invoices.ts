import mongoose from 'mongoose';

export interface InvoiceType {
  client_code: string;
  created_by: string;
  time_period: { fromDate: string; toDate: string };
  total_orders: number;
  invoice_number: string;
}

export type InvoiceDataType = InvoiceType & {
  readonly _id: mongoose.Types.ObjectId;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly __v: number;
};

type InvoiceDocType = mongoose.Document &
  InvoiceType & {
    createdAt: mongoose.Date;
    updatedAt: mongoose.Date;
  };

const InvoiceSchema = new mongoose.Schema<InvoiceDocType>(
  {
    client_code: {
      type: String,
    },
    created_by: {
      type: String,
    },
    time_period: {
      type: { fromDate: String, toDate: String },
    },
    total_orders: {
      type: Number,
    },
    invoice_number: {
      type: String,
    },
  },
  { timestamps: true },
);

const Invoice =
  (mongoose.models.Invoice as mongoose.Model<InvoiceDocType>) ||
  mongoose.model<InvoiceDocType>('Invoice', InvoiceSchema);

export default Invoice;
