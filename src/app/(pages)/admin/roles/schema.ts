import mongoose from 'mongoose';
import { z } from 'zod';

export const validationSchema = z.object({
  name: z
    .string({ invalid_type_error: "Role name can't be empty" })
    .min(1, "Role name can't be empty"),
  description: z.optional(z.string()),
  permissions: z.array(z.string(), {
    invalid_type_error: 'Permissions must be an array of strings',
  }),
  _id: z.optional(
    z.string().refine(val => {
      return mongoose.Types.ObjectId.isValid(val);
    }),
  ),
  createdAt: z.union([z.date(), z.string()]).optional(),
  updatedAt: z.union([z.date(), z.string()]).optional(),
  __v: z.number().optional(),
});
export type RoleDataType = z.infer<typeof validationSchema>;
