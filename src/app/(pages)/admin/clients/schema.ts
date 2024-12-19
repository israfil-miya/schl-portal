import mongoose from 'mongoose';
import { z } from 'zod';

export const validationSchema = z.object({
  client_code: z
    .string({ invalid_type_error: "Client code can't be empty" })
    .min(1, "Client code can't be empty"),
  client_name: z
    .string({ invalid_type_error: "Client name can't be empty" })
    .min(1, "Client name can't be empty"),
  marketer: z
    .string({ invalid_type_error: "Marketer can't be empty" })
    .min(1, "Marketer can't be empty"),
  contact_person: z.optional(z.string()),
  designation: z.optional(z.string()),
  contact_number: z.optional(z.string()),
  email: z.optional(z.string()),
  address: z.optional(z.string()),
  country: z.optional(z.string()),
  prices: z.optional(z.string()),
  currency: z.optional(z.string()),
  last_invoice_number: z.optional(z.string()).nullable().default(null),
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
