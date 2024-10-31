import mongoose from 'mongoose';

interface ProvidentFundHistory extends mongoose.Document {
  date: string;
  gross: number;
  provident_fund: number;
  saved_amount: number;
  note: string;
}

export interface EmployeeType {
  e_id: string;
  real_name: string;
  joining_date: string;
  phone: string;
  email: string;
  birth_date: string;
  nid: string;
  blood_group: string;
  designation: string;
  department: string;
  gross_salary: number;
  bonus_eid_ul_fitr: number;
  bonus_eid_ul_adha: number;
  status: string;
  provident_fund: number;
  pf_start_date: string;
  pf_history: ProvidentFundHistory[];
  branch: string;
  division: string;
  company_provided_name: string;
  note: string;
}

export type EmployeeDataType = EmployeeType & {
  readonly _id: mongoose.Types.ObjectId;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly __v: number;
};

type EmployeeDocType = mongoose.Document & EmployeeType;

const ProvidentFundHistorySchema = new mongoose.Schema<ProvidentFundHistory>(
  {
    date: String, // An update of provident_fund/gross was made in this date.

    gross: Number, // previous gross salary (if changed).

    provident_fund: Number, // previous pf percentage (if changed).

    saved_amount: Number, // total saved pf money
    // from previous object's(of this pf_history array) `date` value, if no previous object then use `pf_start_date` field's value
    // to this object's(of this pf_history array) `date` value. (use previous pf percentage and gross salary to calculate)

    note: String, // what got changed. Ex. Value: "Gross salary was updated."
  },
  { _id: false },
);

const EmployeeSchema = new mongoose.Schema<EmployeeDocType>(
  {
    e_id: {
      type: String,
      required: true,
    },
    real_name: {
      type: String,
      required: true,
    },
    joining_date: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
    },
    email: {
      type: String,
    },

    birth_date: {
      type: String,
    },
    nid: {
      type: String,
    },
    blood_group: {
      type: String,
    },
    designation: {
      type: String,
    },
    department: {
      type: String,
    },
    gross_salary: {
      type: Number,
      default: 0,
    },
    bonus_eid_ul_fitr: {
      type: Number,
      default: 0,
    },
    bonus_eid_ul_adha: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      default: 'Active',
    },
    provident_fund: {
      type: Number,
      default: 0,
    },
    pf_start_date: {
      type: String,
    },
    pf_history: {
      type: [ProvidentFundHistorySchema],
    },
    branch: {
      type: String,
    },
    division: {
      type: String,
    },
    company_provided_name: {
      type: String,
    },
    note: {
      type: String,
    },
  },
  { timestamps: true },
);

const Employee =
  (mongoose.models.Employee as mongoose.Model<EmployeeDocType>) ||
  mongoose.model<EmployeeDocType>('Employee', EmployeeSchema);

export default Employee;
