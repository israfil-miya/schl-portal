'use client';

import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useTransition } from 'react';
import { toast } from 'sonner';

/**
 * A custom Link component that wraps Next.js's next/link component.
 */
export default function Link({
  href,
  children,
  replace,
  ...rest
}: Parameters<typeof NextLink>[0]) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const toastRef = useRef<string | number | null>(null); // To store the toast ID
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null); // To store the timeout ID

  useEffect(() => {
    if (isPending && !toastRef.current) {
      // Delay showing the toast by 500ms
      toastTimeoutRef.current = setTimeout(() => {
        toastRef.current = toast.info('Please wait while the page loads...', {
          duration: Infinity, // Keep the toast open until the transition is done
          position: 'bottom-right',
        });
      }, 500);
    }

    if (!isPending && toastRef.current) {
      // Clear the timeout if the transition finishes before 500ms
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
        toastTimeoutRef.current = null;
      }

      // Dismiss the toast after 500ms
      setTimeout(() => {
        if (toastRef.current) {
          toast.dismiss(toastRef.current);
          toastRef.current = null; // Reset the ref
        }
      }, 500);
    }

    // Cleanup on unmount or when the effect is re-triggered
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, [isPending]);
  return (
    <NextLink
      href={href}
      onClick={e => {
        e.preventDefault();
        startTransition(() => {
          const url = href.toString();
          if (replace) {
            router.replace(url);
          } else {
            router.push(url);
          }
        });
      }}
      {...rest}
    >
      {children}
    </NextLink>
  );
}
