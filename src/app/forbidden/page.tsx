'use client';

import '@/app/globals.css';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ForbiddenPage() {
  const router = useRouter();

  const logoutHandler = async () => {
    await signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-lg bg-white shadow-sm">
        <div className="bg-red-500 px-6 py-4">
          <h1 className="text-2xl font-semibold text-white">403 Forbidden</h1>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-gray-700 text-base">
            You are <span className="font-semibold">denied</span> to access the
            page.
          </p>
          <div>
            <span className="text-gray-600">Go to </span>
            <span
              onClick={logoutHandler}
              className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
            >
              Login Page
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
