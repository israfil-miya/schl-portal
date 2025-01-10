import mongoose from 'mongoose';

// Interface for Report document
export interface ReportType {
  marketer_id: string;
  marketer_name: string;
  calling_date: string;
  followup_date: string;
  country: string;
  designation: string;
  website: string;
  category: string;
  company_name: string;
  contact_person: string;
  contact_number: string;
  email_address: string;
  calling_status: string;
  linkedin: string;
  calling_date_history: string[];
  updated_by: string | null;
  followup_done: boolean;
  is_prospected: boolean;
  prospect_status: string;
  is_lead: boolean;
  regular_client: boolean; // limited to crm portal
  permanent_client: boolean; // added in erp portal to mark permanent clients (a regular client can be marked as permanent)
  lead_withdrawn: boolean;
  test_given_date_history: string[];
  onboard_date: string;
  createdAt: string;
  lead_origin?: string | null;
  updatedAt: string;
}

export type ReportDataType = ReportType & {
  readonly _id: mongoose.Types.ObjectId;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly __v: number;
};

export type ReportDocType = mongoose.Document & ReportType;

// Create Report schema with type annotations for properties
const ReportSchema = new mongoose.Schema<ReportDocType>(
  {
    marketer_id: { type: String, required: [true, 'Marketer id is not given'] },
    marketer_name: {
      type: String,
      required: [true, 'Marketer name is not given'],
    },
    calling_date: {
      type: String,
      required: [true, 'Calling date is not given'],
    },
    followup_date: { type: String, default: '' },
    country: { type: String, required: [true, 'Country name is not given'] },
    designation: { type: String, required: [true, 'Designation is not given'] },
    website: {
      type: String,
      required: [true, 'Website link is not given'],
      validate: {
        validator: function (v: string) {
          return /^(http|https):\/\/[^ "]+$/.test(v);
        },
        message: (props: any) => `${props.value} is not a valid website link!`,
      },
    },
    category: {
      type: String,
      minlength: [1, 'Category should be at least 1 character'],
      required: [true, 'Category is not given'],
    },
    company_name: {
      type: String,
      minlength: [3, 'Company name should be at least 3 characters'],
      required: [true, 'Company name is not given'],
    },
    contact_person: {
      type: String,
      minlength: [3, 'Contact person name should be at least 3 characters'],
      required: [true, 'Contact person name is not given'],
    },
    contact_number: { type: String, default: '' },
    email_address: { type: String, default: '' },
    calling_status: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    calling_date_history: { type: [String] },
    updated_by: { type: String, default: null },
    followup_done: { type: Boolean, default: false },
    is_prospected: { type: Boolean, default: false },
    prospect_status: { type: String, default: '' },
    is_lead: { type: Boolean, default: false },
    lead_withdrawn: { type: Boolean, default: false },
    regular_client: { type: Boolean, default: false },
    permanent_client: { type: Boolean, default: false },
    test_given_date_history: { type: [String] },
    lead_origin: { type: String, default: null }, // null for non-lead, string (generated | marketer name) for lead
    onboard_date: { type: String, default: '' },
  },
  {
    timestamps: true, // Add timestamps for created and updated at fields
  },
);

// Define Report model based on schema, using generics for type safety
const Report =
  (mongoose.models.Report as mongoose.Model<ReportDocType>) ||
  mongoose.model<ReportDocType>('Report', ReportSchema);

// Export the Report model
export default Report;
