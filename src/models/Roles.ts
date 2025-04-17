import mongoose from 'mongoose';

interface RoleType {
  name: string;
  description: string;
  permissions: string[];
}

export type RoleDataType = RoleType & {
  readonly _id: mongoose.Types.ObjectId;
  readonly __v: number;
};

export type RoleDocType = mongoose.Document & RoleType;

const RoleSchema = new mongoose.Schema<RoleDocType>({
  name: { type: String, required: [true, 'Role name is not given'] },
  description: {
    type: String,
    required: [true, 'Role description is not given'],
  },
  permissions: {
    type: [String],
    required: [true, 'Role permissions are not given'],
  },
});

const Role =
  (mongoose.models.Role as mongoose.Model<RoleDocType>) ||
  mongoose.model<RoleDocType>('Role', RoleSchema);

export default Role;
