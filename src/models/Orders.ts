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
  production: number;
  qc1: number;
  qc2: number;
  comment: string;
  type: string;
  status: string;
  folder_path: string;
  priority: string;
  updated_by: string;
}

export type OrderDataType = OrderType & {
  readonly _id?: mongoose.Types.ObjectId | string; // Allow ObjectId or string
  readonly createdAt?: string;
  readonly updatedAt?: string;
  readonly __v?: number;
};

type OrderDocType = mongoose.Document &
  OrderType & {
    createdAt: mongoose.Date;
    updatedAt: mongoose.Date;
  };

const OrderSchema = new mongoose.Schema<OrderDocType>(
  {
    client_code: {
      type: String,
      required: [true, 'Client code is not given'],
    },
    client_name: {
      type: String,
      required: [true, 'Client name is not given'],
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
      default: 0,
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
      type: Number,
    },
    qc1: {
      type: Number,
      default: 0,
    },
    qc2: {
      type: Number,
      default: 0,
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
