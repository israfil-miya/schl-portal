import moment from 'moment-timezone';
import mongoose from 'mongoose';
import { z } from 'zod';

export const validationSchema = z
  .object({
    e_id: z.string(),
    real_name: z.string(),
    joining_date: z.string(),
    phone: z.string(),
    email: z
      .optional(z.string().email('This is not a valid email.'))
      .default(''),
    birth_date: z.string(),
    nid: z.string(),
    blood_group: z
      .optional(z.enum(['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-', '']))
      .default(''),
    designation: z.string(),
    department: z.enum([
      'production',
      'marketing',
      'software',
      'accounting',
      'management',
      'hr',
      'administration',
      'others',
    ]),
    gross_salary: z.number(),
    bonus_eid_ul_fitr: z.optional(z.number()).default(0),
    bonus_eid_ul_adha: z.optional(z.number()).default(0),
    status: z.enum(['active', 'inactive', 'resigned', 'fired']),
    provident_fund: z.number(),
    pf_start_date: z.string(),
    pf_history: z.optional(
      z.array(
        z.object({
          date: z.string(),
          gross: z.number(),
          provident_fund: z.number(),
          saved_amount: z.number(),
          note: z.string(),
        }),
      ),
    ),
    branch: z.string(),
    division: z.string(),
    company_provided_name: z.optional(z.string()).nullable().default(null),
    note: z.optional(z.string()).default(''),
    _id: z.optional(
      z.string().refine(val => {
        return mongoose.Types.ObjectId.isValid(val);
      }),
    ),
    createdAt: z.optional(z.union([z.date(), z.string()])),
    updatedAt: z.optional(z.union([z.date(), z.string()])),
    __v: z.optional(z.number()),
  })
  .refine(
    data => {
      let pfStartDate = moment(data.pf_start_date, 'YYYY-MM-DD');
      const currentDate = moment().format('YYYY-MM-DD');

      if (!pfStartDate.isBefore(currentDate)) {
        return false;
      }
      return true;
    },
    {
      message: "PF Start Date must be before today's date",
      path: ['pf_start_date'],
    },
  );

export type EmployeeDataType = z.infer<typeof validationSchema>;
