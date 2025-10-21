import { auth } from '@/auth';
import { redirect } from 'next/navigation';

const FALLBACK_MESSAGE = `SSO_LOGIN_URL is not configured. Update the environment variables to point to the SSO host.`;

const LoginPage = async () => {
  const session = await auth();

  if (session?.user) {
    redirect('/');
  }

  const target = process.env.SSO_LOGIN_URL;

  if (target) {
    redirect(target);
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6 text-center">
      <p className="max-w-lg text-lg text-gray-700">{FALLBACK_MESSAGE}</p>
    </div>
  );
};

export default LoginPage;
