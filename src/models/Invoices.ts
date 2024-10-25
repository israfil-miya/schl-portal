import mongoose from 'mongoose';

export interface InvoiceDataType {
  client_id: string;
  client_code: string;
  created_by: string;
  time_period: { fromDate: string; toDate: string };
  total_orders: number;
  invoice_number: string;
}

type Invoice = mongoose.Document & InvoiceDataType;

const InvoiceSchema = new mongoose.Schema<Invoice>(
  {
    client_id: {
      type: String,
    },
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
  (mongoose.models.Invoice as mongoose.Model<Invoice>) ||
  mongoose.model<Invoice>('Invoice', InvoiceSchema);

export default Invoice;
