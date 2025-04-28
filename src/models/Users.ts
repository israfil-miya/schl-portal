import mongoose from 'mongoose';
import Role from './Roles';

export interface UserType {
  real_name: string;
  provided_name: string | null;
  name: string;
  password: string;
  role_id: mongoose.Schema.Types.ObjectId;
  comment: string;
}

export type UserDataType = UserType & {
  readonly _id: mongoose.Types.ObjectId;
  readonly __v: number;
};

export type UserDocType = mongoose.Document & UserType;

const UserSchema = new mongoose.Schema<UserDocType>({
  name: {
    type: String,
    required: [true, 'Name is not given'],
    unique: true,
  },
  real_name: { type: String, required: [true, 'Real name is not given'] },
  provided_name: { type: String, default: null },
  password: { type: String, required: [true, 'Password is not given'] },
  // role: { type: String, required: [true, 'Role is not given'] },
  role_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Role.modelName,
    required: [true, 'Role has not been assigned'],
  },
  comment: { type: String },
});

const User =
  (mongoose.models.User as mongoose.Model<UserDocType>) ||
  mongoose.model<UserDocType>('User', UserSchema);

export default User;
