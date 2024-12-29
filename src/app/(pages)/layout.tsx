import '@/app/globals.css';
import { auth } from '@/auth';
import Header from '@/components/Header';
import { SessionProvider } from 'next-auth/react';

export default async function PageLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <SessionProvider session={session} refetchOnWindowFocus={false}>
      <Header />
      {children}
    </SessionProvider>
  );
}
