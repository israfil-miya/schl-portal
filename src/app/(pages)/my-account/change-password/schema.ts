import mongoose from 'mongoose';
import { z } from 'zod';

export const validationSchema = z
  .object({
    username: z.string().min(1, { message: 'Username is required' }),
    old_password: z.string().min(1, { message: 'Old password is required' }),
    new_password: z.string().min(1, { message: 'New password is required' }),
    confirm_password: z
      .string()
      .min(1, { message: 'Confirm password is required' }),
  })
  .refine(data => data.old_password && data.new_password, {
    message: "Old & New password can't be the same",
    path: ['new_password'],
  })
  .refine(data => data.new_password !== data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  });

export type ChangePasswordInputsType = z.infer<typeof validationSchema>;
