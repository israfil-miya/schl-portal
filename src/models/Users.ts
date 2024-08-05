import mongoose from 'mongoose';

// Interface for User document
interface User {
  name: string;
  password: string;
  role: string;
  real_name: string | null;
}

// Create User schema with type annotations for properties
const UserSchema = new mongoose.Schema<User>({
  name: {
    type: String,
    required: [true, 'Name is not given'],
    unique: true,
  },
  password: { type: String, required: [true, 'Password is not given'] },
  role: { type: String, required: [true, 'Role is not given'] },
  real_name: { type: String, default: null },
});

// Define User model based on schema, using generics for type safety
const User = mongoose.models.User || mongoose.model<User>('User', UserSchema);

// Export the User model
export default User;
