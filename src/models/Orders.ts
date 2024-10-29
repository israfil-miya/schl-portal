import mongoose from 'mongoose';

interface OrderType {
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

export type OrderDataType = OrderType & {
  readonly _id: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

type OrderDocType = mongoose.Document & OrderType;

const OrderSchema = new mongoose.Schema<OrderDocType>(
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
  (mongoose.models.Order as mongoose.Model<OrderDocType>) ||
  mongoose.model<OrderDocType>('Order', OrderSchema);

export default Order;
