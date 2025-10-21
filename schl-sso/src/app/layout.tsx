import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Studio Click House SSO',
  description: 'Unified sign-in portal for Studio Click House applications.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
