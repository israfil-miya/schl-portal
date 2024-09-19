import { signOut } from '@/auth';

let LogoutAction = async () => {
  'use server';
  await signOut({
    redirect: true,
    redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/login`,
  });
};

export default LogoutAction;
