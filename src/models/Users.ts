import mongoose from 'mongoose';

export interface UserType {
  name: string;
  real_name: string;
  provided_name: string;
  password: string;
  role: string;
}

export type UserDataType = UserType & {
  readonly _id: mongoose.Types.ObjectId;
  readonly __v: number;
};

type UserDocType = mongoose.Document & UserType;

// Create User schema with type annotations for properties
const UserSchema = new mongoose.Schema<UserDocType>({
  name: {
    type: String,
    required: [true, 'Name id is not given'],
    unique: true,
  },
  real_name: { type: String, required: [true, 'Real name is not given'] },
  provided_name: { type: String, required: [true, 'Fake name is not given'] },
  password: { type: String, required: [true, 'Password is not given'] },
  role: { type: String, required: [true, 'Role is not given'] },
});

// Define User model based on schema, using generics for type safety
const User =
  (mongoose.models.User as mongoose.Model<UserDocType>) ||
  mongoose.model<UserDocType>('User', UserSchema);

// Export the User model
export default User;
