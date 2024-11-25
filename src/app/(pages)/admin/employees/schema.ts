import mongoose from 'mongoose';
import { z } from 'zod';

export const validationSchema = z
  .object({
    e_id: string;
    real_name: string;
    joining_date: string;
    phone: string;
    email: string;
    birth_date: string;
    nid: string;
    blood_group: string;
    designation: string;
    department: string;
    gross_salary: number;
    bonus_eid_ul_fitr: number;
    bonus_eid_ul_adha: number;
    status: string;
    provident_fund: number;
    pf_start_date: string;
    pf_history: ProvidentFundHistory[];
    branch: string;
    division: string;
    company_provided_name: string;
    note: string;
    _id: z.optional(
      z.string().refine(val => {
        return mongoose.Types.ObjectId.isValid(val);
      }),
    ),
    createdAt: z.optional(z.union([z.date(), z.string()])),
    updatedAt: z.optional(z.union([z.date(), z.string()])),
    __v: z.optional(z.number()),
  })
  .refine(data => data.role === 'marketer' && data.provided_name?.length, {
    message: "Provided name can't be empty",
    path: ['provided_name'],
  });

export type UserDataType = z.infer<typeof validationSchema>;
