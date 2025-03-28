import mongoose from 'mongoose';

export interface ApprovalType {
  target_model: 'User' | 'Report' | 'Employee' | 'Order' | 'Client';
  action: 'create' | 'update' | 'delete';
  object_id?: mongoose.Types.ObjectId; // Not required for create requests
  changes?: Record<string, any>; // Only needed for update and create
  prev_data?: Record<string, any>; // Only needed for update and delete
  status: 'pending' | 'approved' | 'rejected';
  req_by: mongoose.Types.ObjectId;
  rev_by?: mongoose.Types.ObjectId | null;
}

export type ApprovalDataType = ApprovalType & {
  readonly _id: mongoose.Types.ObjectId;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly __v: number;
};

type ApprovalDocType = mongoose.Document & ApprovalType;

const ApprovalSchema = new mongoose.Schema<ApprovalDocType>(
  {
    target_model: {
      type: String,
      required: true,
      enum: ['User', 'Report', 'Employee', 'Order', 'Client'],
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
      description:
        'The updated fields and their new values (or new document data for create)',
    },
    prev_data: {
      type: Object,
      description:
        'The current values before the change was requested (or may be null for create)',
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
