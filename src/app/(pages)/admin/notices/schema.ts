import mongoose from 'mongoose';
import { z } from 'zod';

export const validationSchema = z.object({
  channel: z.enum(['production', 'marketers']),
  notice_no: z.string({ invalid_type_error: 'Notice no. is required' }),
  title: z.string({ invalid_type_error: 'Title is required' }),
  description: z.string({ invalid_type_error: 'Description is required' }),
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

export type ClientDataType = z.infer<typeof validationSchema>;
