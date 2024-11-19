import mongoose from 'mongoose';
import { z } from 'zod';

export const validationSchema = z
  .object({
    real_name: z
      .string({ invalid_type_error: "Real name can't be empty" })
      .min(1, "Real name can't be empty"),
    provided_name: z.optional(z.string()),
    name: z
      .string({ invalid_type_error: "Name can't be empty" })
      .min(1, "Name can't be empty"),
    password: z
      .string({ invalid_type_error: "Password can't be empty" })
      .min(1, "Password can't be empty"),
    role: z.enum(['admin', 'marketer', 'super', 'manager'], {
      message: "Role can't be empty",
    }),
    _id: z.optional(
      z.string().refine(val => {
        return mongoose.Types.ObjectId.isValid(val);
      }),
    ),
    createdAt: z.optional(z.union([z.date(), z.string()])),
    updatedAt: z.optional(z.union([z.date(), z.string()])),
    __v: z.optional(z.number()),
  })
  .refine(data => data.role === 'marketer' && !data.provided_name?.length, {
    message: "Provided name can't be empty",
    path: ['provided_name'],
  });

export type ClientDataType = z.infer<typeof validationSchema>;
