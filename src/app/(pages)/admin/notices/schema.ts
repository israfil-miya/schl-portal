import mongoose from 'mongoose';
import { z } from 'zod';

export const validationSchema = z.object({
  channel: z.enum(['production', 'marketers']),
  notice_no: z.string().min(1, 'Notice number is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  file_name: z.optional(z.string()).default(''),
  updated_by: z.optional(z.string()).nullable().default(null),
  _id: z.optional(
    z.string().refine(val => {
      return mongoose.Types.ObjectId.isValid(val);
    }),
  ),
  createdAt: z.optional(z.union([z.date(), z.string()])),
  updatedAt: z.optional(z.union([z.date(), z.string()])),
  __v: z.optional(z.number()),
});

export type NoticeDataType = z.infer<typeof validationSchema>;
