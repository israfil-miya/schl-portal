import { Change } from '@/lib/utils';
import mongoose from 'mongoose';

export interface ApprovalType {
  target_model:
    | 'User'
    | 'Report'
    | 'Employee'
    | 'Order'
    | 'Client'
    | 'Schedule';
  action: 'create' | 'update' | 'delete';
  object_id?: mongoose.Types.ObjectId; // Not required for create requests
  changes?: Change[]; // Only needed for update operations
  prev_data?: Record<string, any>; // Only needed for update operations
  new_data?: Record<string, any>; // Only needed for create operations
  deleted_data?: Record<string, any>; // Only needed for delete operations
  status: 'pending' | 'approved' | 'rejected';
  req_by: mongoose.Types.ObjectId;
  rev_by?: mongoose.Types.ObjectId | null; // The user who approved or rejected the request
}

export type ApprovalDataType = ApprovalType & {
  readonly _id: mongoose.Types.ObjectId;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly __v: number;
};

type ApprovalDocType = mongoose.Document &
  ApprovalType & {
    createdAt: mongoose.Date;
    updatedAt: mongoose.Date;
  };

const ApprovalSchema = new mongoose.Schema<ApprovalDocType>(
  {
    target_model: {
      type: String,
      required: true,
      enum: ['User', 'Report', 'Employee', 'Order', 'Client', 'Schedule'],
    },
    action: {
      type: String,
      required: true,
      enum: ['create', 'update', 'delete'],
    },
    // The id of the document that is being updated or deleted. Not required for create requests
    object_id: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'target_model',
    },
    changes: {
      type: Object,
    },
    prev_data: {
      type: Object,
    },
    new_data: {
      type: Object,
    },
    deleted_data: {
      type: Object,
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    req_by: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    rev_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true },
);

const Approval =
  (mongoose.models.Approval as mongoose.Model<ApprovalDocType>) ||
  mongoose.model<ApprovalDocType>('Approval', ApprovalSchema);

export default Approval;
