import mongoose from 'mongoose';

interface ScheduleType {
  receive_date: string;
  delivery_date: string;
  client_code: string;
  client_name: string;
  task: string;
  comment: string;
  updated_by: string;
}

export type ScheduleDataType = ScheduleType & {
  readonly _id?: mongoose.Types.ObjectId | string; // Allow ObjectId or string
  readonly createdAt?: string;
  readonly updatedAt?: string;
  readonly __v?: number;
};

type ScheduleDocType = mongoose.Document &
  ScheduleType & {
    createdAt: mongoose.Date;
    updatedAt: mongoose.Date;
  };

const ScheduleSchema = new mongoose.Schema<ScheduleDocType>(
  {
    receive_date: {
      type: String,
      required: [true, 'Recieve date is not given'],
    },

    delivery_date: {
      type: String,
      required: [true, 'Delivery date is not given'],
    },

    client_code: {
      type: String,
      required: [true, 'Client code is not given'],
    },

    client_name: {
      type: String,
      required: [true, 'Client name is not given'],
    },

    task: {
      type: String,
      required: [true, 'Task is not given'],
    },

    comment: { type: String },

    updated_by: {
      type: String,
      default: null,
    },
  },
  { timestamps: true },
);

const Schedule =
  (mongoose.models.Schedule as mongoose.Model<ScheduleDocType>) ||
  mongoose.model<ScheduleDocType>('Schedule', ScheduleSchema);

export default Schedule;
