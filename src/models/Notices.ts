import mongoose from 'mongoose';

export interface NoticeType {
  channel: string;
  notice_no: string;
  title: string;
  description: string;
  file_name?: string;
  updated_by: string | null;
}

export type NoticeDataType = NoticeType & {
  readonly _id: mongoose.Types.ObjectId;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly __v: number;
};

type NoticeDocType = mongoose.Document & NoticeType;

const NoticeSchema = new mongoose.Schema<NoticeDocType>(
  {
    channel: { type: String, required: [true, 'Channel is not given'] },
    notice_no: {
      type: String,
      required: [true, 'Notice no. is not given'],
      unique: true,
      index: true,
    },
    title: { type: String, required: [true, 'Title is not given'] },
    description: { type: String, required: [true, 'Description is not given'] },
    file_name: { type: String, default: '' },
    updated_by: { type: String, default: null },
  },
  {
    timestamps: true,
  },
);

const Notice =
  (mongoose.models.Notice as mongoose.Model<NoticeDocType>) ||
  mongoose.model<NoticeDocType>('Notice', NoticeSchema);

export default Notice;
