import { PermissionValue } from '@/app/(pages)/admin/roles/create-role/components/Form';
import mongoose from 'mongoose';
import Employee, { EmployeeType } from './Employees';
import Role, { RoleType } from './Roles';

export interface UserType {
  employee_id: mongoose.Schema.Types.ObjectId;
  username: string;
  password: string;
  role_id: mongoose.Schema.Types.ObjectId;
  comment: string;
}

export type UserDataType = UserType & {
  readonly _id: mongoose.Types.ObjectId;
  readonly __v: number;
};

export interface PopulatedByEmployeeUserType
  extends Omit<UserDataType, 'employee_id'> {
  employee_id: {
    _id: string;
    e_id: string;
    real_name: string;
    company_provided_name: string;
  };
}

export interface PopulatedByRoleUserType extends Omit<UserDataType, 'role_id'> {
  role_id: {
    _id: string;
    name: string;
    permissions: PermissionValue[];
  };
}

export interface FullyPopulatedUserType
  extends Omit<UserDataType, 'employee_id' | 'role_id'>,
    Pick<PopulatedByEmployeeUserType, 'employee_id'>,
    Pick<PopulatedByRoleUserType, 'role_id'> {}

export type UserDocType = mongoose.Document & UserType;

const UserSchema = new mongoose.Schema<UserDocType>({
  username: {
    type: String,
    required: [true, 'Username is not given'],
    unique: true,
  },
  // real_name: { type: String, required: [true, 'Real name is not given'] },
  // provided_name: { type: String, default: null },
  password: { type: String, required: [true, 'Password is not given'] },
  employee_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Employee ID is not given'],
    ref: () => Employee.modelName,
  },
  // role: { type: String, required: [true, 'Role is not given'] },
  role_id: {
    type: mongoose.Schema.Types.ObjectId,
    // Use a function so bundlers keep the import and Mongoose resolves the model correctly
    ref: () => Role.modelName,
    required: [true, 'Role ID is not given'],
  },
  comment: { type: String },
});

const User =
  (mongoose.models.User as mongoose.Model<UserDocType>) ||
  mongoose.model<UserDocType>('User', UserSchema);

export default User;
