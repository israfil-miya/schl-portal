import mongoose from 'mongoose';
import { z } from 'zod';

export const validationSchema = z.object({
  receive_date: z
    .string({ invalid_type_error: "Recieve date can't be empty" })
    .min(1, "Date can't be empty"),
  delivery_date: z
    .string({ invalid_type_error: "Delivery date can't be empty" })
    .min(1, "Date can't be empty"),
  client_code: z
    .string({ invalid_type_error: "Client code can't be empty" })
    .min(1, "Client code can't be empty"),
  client_name: z
    .string({ invalid_type_error: "Client name can't be empty" })
    .min(1, "Client name can't be empty"),
  task: z
    .string({ invalid_type_error: "Task can't be empty" })
    .min(1, "Task can't be empty"),
  comment: z.string(),
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

export type ScheduleDataType = z.infer<typeof validationSchema>;
