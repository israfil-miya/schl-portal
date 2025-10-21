import { auth } from '@/auth';
import { redirect } from 'next/navigation';

const RedirectPage = async () => {
  const session = await auth();

  if (!session?.user) {
    redirect('/');
  }

  const permissions = session.user.permissions || [];

  const crmUrl = process.env.NEXT_PUBLIC_CRM_PORTAL_URL;
  const portalUrl = process.env.NEXT_PUBLIC_ADMIN_PORTAL_URL;
  const fallbackUrl = process.env.NEXT_PUBLIC_DEFAULT_REDIRECT_URL;

  if (permissions.includes('login:crm') && crmUrl) {
    redirect(crmUrl);
  }

  if (permissions.includes('login:portal') && portalUrl) {
    redirect(portalUrl);
  }

  if (fallbackUrl) {
    redirect(fallbackUrl);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#7ba541] to-[#5b8032] p-4 text-center text-white">
      <h1 className="text-2xl font-semibold">No redirect target configured.</h1>
      <p className="mt-4 max-w-md text-sm text-white/90">
        The authenticated user does not have a portal assignment (`login:crm` or
        `login:portal`), and no fallback URL is configured. Please contact an
        administrator.
      </p>
    </div>
  );
};

export default RedirectPage;
