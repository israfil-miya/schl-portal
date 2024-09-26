import mongoose from 'mongoose';

// Interface for User document
interface User extends mongoose.Document {
  real_name: string;
  provided_name: string;
  name: string;
  password: string;
  role: string;
}

// Create User schema with type annotations for properties
const UserSchema = new mongoose.Schema<User>({
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
  (mongoose.models.User as mongoose.Model<User>) ||
  mongoose.model<User>('User', UserSchema);

// Export the User model
export default User;
