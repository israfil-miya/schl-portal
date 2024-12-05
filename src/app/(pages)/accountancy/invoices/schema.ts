import mongoose from 'mongoose';
import { z } from 'zod';

export const validationSchema = z.object({
  client_code: z.string(),
  created_by: z.string(),
  time_period: z.object({
    fromDate: z.string(),
    toDate: z.string(),
  }),
  total_orders: z.number(),
  invoice_number: z.string(),

  _id: z.optional(
    z.string().refine(val => {
      return mongoose.Types.ObjectId.isValid(val);
    }),
  ),
  createdAt: z.optional(z.union([z.date(), z.string()])),
  updatedAt: z.optional(z.union([z.date(), z.string()])),
  __v: z.optional(z.number()),
});

export type InvoiceDataType = z.infer<typeof validationSchema>;
