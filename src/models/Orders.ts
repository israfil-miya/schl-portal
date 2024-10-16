import mongoose from 'mongoose';

export interface OrderDataType {
  client_code: string;
  client_name: string;
  folder: string;
  rate: number;
  quantity: number;
  download_date: string;
  delivery_date: string;
  delivery_bd_time: string;
  task: string;
  et: number;
  production: string;
  qc1: number;
  comment: string;
  type: string;
  status: string;
  folder_path: string;
  priority: string;
  updated_by: string;
}

type Order = mongoose.Document & OrderDataType;

const OrderSchema = new mongoose.Schema<Order>(
  {
    client_code: {
      type: String,
    },
    client_name: {
      type: String,
    },
    folder: {
      type: String,
    },
    rate: {
      type: Number,
      default: null,
    },
    quantity: {
      type: Number,
    },
    download_date: {
      type: String,
    },
    delivery_date: {
      type: String,
    },
    delivery_bd_time: {
      type: String,
    },
    task: {
      type: String,
    },
    et: {
      type: Number,
    },
    production: {
      type: String,
    },
    qc1: {
      type: Number,
    },
    comment: {
      type: String,
    },
    type: {
      type: String,
    },
    status: {
      type: String,
    },
    folder_path: {
      type: String,
    },
    priority: {
      type: String,
    },
    updated_by: {
      type: String,
      default: null,
    },
  },
  { timestamps: true },
);

const Order =
  (mongoose.models.Order as mongoose.Model<Order>) ||
  mongoose.model<Order>('Order', OrderSchema);

export default Order;
