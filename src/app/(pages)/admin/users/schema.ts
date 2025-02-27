import mongoose from 'mongoose';
import { z } from 'zod';

export const validationSchema = z
  .object({
    real_name: z
      .string({ invalid_type_error: "Real name can't be empty" })
      .min(1, "Real name can't be empty"),
    provided_name: z.string().nullable().optional(),
    name: z
      .string({ invalid_type_error: "Name can't be empty" })
      .min(1, "Name can't be empty"),
    password: z
      .string({ invalid_type_error: "Password can't be empty" })
      .min(1, "Password can't be empty"),
    role: z.enum(['super', 'admin', 'marketer', 'manager', 'user'], {
      message: "Role can't be empty",
    }),
    comment: z.string().optional(),
    _id: z.optional(
      z.string().refine(val => {
        return mongoose.Types.ObjectId.isValid(val);
      }),
    ),
    createdAt: z.union([z.date(), z.string()]).optional(),
    updatedAt: z.union([z.date(), z.string()]).optional(),
    __v: z.number().optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.role === 'marketer' &&
      (!data.provided_name || data.provided_name.trim() === '')
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Provided name can't be empty",
        path: ['provided_name'],
      });
    }
  });

export type UserDataType = z.infer<typeof validationSchema>;
