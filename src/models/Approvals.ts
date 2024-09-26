import mongoose from 'mongoose';

// Interface for Approval document
export interface Approval extends mongoose.Document {
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

  // id for deletion
  id: string;
}

// Create Approval schema with type annotations for properties
const ApprovalSchema = new mongoose.Schema<Approval>(
  {
    req_type: { type: String, required: [true, 'Request type is not given'] },
    req_by: { type: String, required: [true, 'Request by is not given'] },
    checked_by: { type: String, default: 'None' },
    is_rejected: { type: Boolean, default: false },

    // Reports Database Entry
    marketer_id: { type: String, default: '' },
    marketer_name: { type: String, default: '' },
    calling_date: { type: String, default: '' },
    followup_date: { type: String, default: '' },
    country: { type: String, default: '' },
    website: { type: String, default: '' },
    category: { type: String, default: '' },
    company_name: { type: String, default: '' },
    contact_person: { type: String, default: '' },
    contact_number: { type: String, default: '' },
    email_address: { type: String, default: '' },
    calling_status: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    calling_date_history: { type: [String] },
    updated_by: { type: String, default: null },
    followup_done: { type: Boolean, default: false },
    is_test: { type: Boolean, default: false },
    is_prospected: { type: Boolean, default: false },
    prospect_status: { type: String, default: '' },
    is_lead: { type: Boolean, default: false },
    lead_withdrawn: { type: Boolean, default: false },

    id: { type: String, required: [true, 'id is not given'] }, // Ensure a unique identifier
  },
  {
    timestamps: true, // Add timestamps for created and updated at fields
  },
);

// Define Approval model based on schema, using generics for type safety
const Approval =
  (mongoose.models.Approval as mongoose.Model<Approval>) ||
  mongoose.model<Approval>('Approval', ApprovalSchema);

// Export the Approval model
export default Approval;
