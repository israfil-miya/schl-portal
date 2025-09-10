import User from '@/models/Users';
import { NextRequest } from 'next/server';

export async function handleChangePassword(
  req: NextRequest,
): Promise<{ data: string; status: number }> {
  try {
    const { username, old_password, new_password } = await req.json();
    const userData = await User.findOne({
      name: username,
      password: old_password,
    });
    if (!userData) return { data: 'Invalid username or password', status: 400 };
    userData.password = new_password;
    await userData.save();
    return { data: 'Password changed successfully', status: 200 };
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
}
