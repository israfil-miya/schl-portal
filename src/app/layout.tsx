import '@/app/globals.css';
import { cn } from '@/lib/utils';
import type { Metadata } from 'next';
import { Karla, Lato } from 'next/font/google';
import NextTopLoader from 'nextjs-toploader';
import { Toaster } from 'sonner';

// Initialize the fonts
const karla = Karla({ subsets: ['latin'], weight: ['400', '700'] });
const lato = Lato({ subsets: ['latin'], weight: ['400', '700'] });

export const metadata: Metadata = {
  title: 'SCHL - Portal',
  description:
    'Studio Click House is also known as the House of Graphics Designer started their journey in the Image Editing Industry from 2015. The motto of the Studio Click House is to provide quality images editing services at a reasonable cost. We are from Studio Click House always motivated about the work we do for our clients. We take challenges from our clients to full-fill their requirements. Our goal is to help our clients through our services. Studio Click House providing services like Clipping path, Multiple clipping path, Image masking, Image cut out, Remove background, Photo retouching, Neck joint/Ghost mannequin, Drop shadow, Color correction, E-commerce image editing, 360-degree image editing, Products image editing, etc. Mostly we work with Online shops, Brands, Photographers, Graphic designers, Photo studio, Photo agency Worldwide. Our image processing is a full-service post-production studio based in Bangladesh. Currently, we have 150+ experienced Graphic designers who are operating 24/7, 365 days. To meet the deadline we even work on a holiday like Christmas, New Year or any other festivals.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          karla.className,
          lato.className,
        )}
      >
        <NextTopLoader color="#7ba541" height={4} />
        <noscript>You need to enable JavaScript to run this app.</noscript>
        <main>{children}</main>
        <Toaster
          closeButton
          richColors
          position="top-right"
          pauseWhenPageIsHidden
        />
      </body>
    </html>
  );
}
