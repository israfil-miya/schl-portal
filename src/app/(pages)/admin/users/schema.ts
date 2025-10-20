import mongoose from 'mongoose';
import { z } from 'zod';

export const populatedUserSchema = z.object({
  username: z.string(),
  password: z.string(),
  comment: z.string().optional(),
  employee_id: z.object({
    _id: z.string(),
    e_id: z.string(),
    company_provided_name: z.string(),
    real_name: z.string(),
  }),
  role_id: z.object({
    _id: z.string(),
    name: z.string(),
    permissions: z.array(z.string()),
  }),
});

export const userSchema = z.object({
  username: z.string().min(1, "Username can't be empty"),
  password: z.string().min(1, "Password can't be empty"),
  comment: z.string().optional(),
  role_id: z.string().refine(mongoose.Types.ObjectId.isValid),
  employee_id: z.string().refine(mongoose.Types.ObjectId.isValid),
});
export type ZodUserDataType = z.infer<typeof userSchema>;

export type ZodPopulatedUserDataType = z.infer<typeof populatedUserSchema>;
