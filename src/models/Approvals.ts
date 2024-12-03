import mongoose from 'mongoose';

interface ApprovalType {
  req_type: string;
  req_by: string;
  checked_by: string;
  is_rejected: boolean;

  // Reports Database Entry
  marketer_id?: string;
  marketer_name?: string;
  calling_date?: string;
  followup_date?: string;
  country?: string;
  website?: string;
  category?: string;
  company_name?: string;
  contact_person?: string;
  contact_number?: string;
  email_address?: string;
  calling_status?: string;
  linkedin?: string;
  calling_date_history?: string[];
  updated_by?: string | null;
  followup_done?: boolean;
  is_test?: boolean;
  is_prospected?: boolean;
  prospect_status?: string;
  is_lead?: boolean;
  lead_withdrawn?: boolean;

  // Users Database Entry
  real_name: string;
  provided_name?: string;
  name: string;
  password: string;
  role: string;
  comment: string;

  // id for deletion
  id: string | null;
}

export type ApprovalDataType = ApprovalType & {
  readonly _id?: mongoose.Types.ObjectId | string;
  readonly createdAt?: string;
  readonly updatedAt?: string;
  readonly __v?: number;
};

type ApprovalDocType = mongoose.Document & ApprovalType;

const ApprovalSchema = new mongoose.Schema<ApprovalDocType>(
  {
    req_type: { type: String, required: [true, 'Request type is not given'] },
    req_by: { type: String, required: [true, 'Request by is not given'] },
    checked_by: { type: String, default: 'None' },
    is_rejected: { type: Boolean, default: false },

    // Reports Database Entry
    marketer_id: { type: String },
    marketer_name: { type: String },
    calling_date: { type: String },
    followup_date: { type: String },
    country: { type: String },
    website: { type: String },
    category: { type: String },
    company_name: { type: String },
    contact_person: { type: String },
    contact_number: { type: String },
    email_address: { type: String },
    calling_status: { type: String },
    linkedin: { type: String },
    calling_date_history: { type: [String] },
    updated_by: { type: String },
    followup_done: { type: Boolean },
    is_test: { type: Boolean },
    is_prospected: { type: Boolean },
    prospect_status: { type: String },
    is_lead: { type: Boolean },
    lead_withdrawn: { type: Boolean },

    // Users Database Entry
    name: { type: String },
    real_name: { type: String },
    provided_name: { type: String },
    password: { type: String },
    role: { type: String },
    comment: { type: String },

    // id for deletion
    id: { type: String, default: null }, // Ensure a unique identifier
  },
  {
    timestamps: true,
  },
);

const Approval =
  (mongoose.models.Approval as mongoose.Model<ApprovalDocType>) ||
  mongoose.model<ApprovalDocType>('Approval', ApprovalSchema);

export default Approval;
