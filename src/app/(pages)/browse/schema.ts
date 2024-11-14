import mongoose from 'mongoose';
import { z } from 'zod';

export const validationSchema = z.object({
  client_code: z.string(),
  client_name: z.string(),
  folder: z.string(),
  rate: z.optional(
    z.coerce.number().min(0, "Rate can't be negative").default(0),
  ),
  quantity: z.coerce
    .number({ invalid_type_error: "Quantity can't be empty" })
    .min(0, "Quantity can't be negative"),
  download_date: z.string(),
  delivery_date: z.string(),
  delivery_bd_time: z.string(),
  task: z.string(),
  et: z.coerce.number().default(0),
  production: z.coerce.number().default(0),
  qc1: z.coerce.number().default(0),
  comment: z.string(),
  type: z.string(),
  status: z.string(),
  folder_path: z.string(),
  priority: z.string(),
  updated_by: z.optional(z.string()),
  _id: z.optional(
    z.string().refine(val => {
      return mongoose.Types.ObjectId.isValid(val);
    }),
  ),
  createdAt: z.optional(z.union([z.date(), z.string()])),
  updatedAt: z.optional(z.union([z.date(), z.string()])),
  __v: z.optional(z.number()),
});

export type OrderDataType = z.infer<typeof validationSchema>;
