import mongoose from 'mongoose';

export interface UserType {
  real_name: string;
  provided_name?: string;
  name: string;
  password: string;
  role: string;
  comment: string;
}

export type UserDataType = UserType & {
  readonly _id: mongoose.Types.ObjectId;
  readonly __v: number;
};

type UserDocType = mongoose.Document & UserType;

const UserSchema = new mongoose.Schema<UserDocType>({
  name: {
    type: String,
    required: [true, 'Name is not given'],
    unique: true,
  },
  real_name: { type: String, required: [true, 'Real name is not given'] },
  provided_name: { type: String },
  password: { type: String, required: [true, 'Password is not given'] },
  role: { type: String, required: [true, 'Role is not given'] },
  comment: { type: String },
});

const User =
  (mongoose.models.User as mongoose.Model<UserDocType>) ||
  mongoose.model<UserDocType>('User', UserSchema);

export default User;
