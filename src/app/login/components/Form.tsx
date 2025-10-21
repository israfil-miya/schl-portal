'use client';

import { signIn } from 'next-auth/react';
import { useRouter } from 'nextjs-toploader/app';
import React, { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { toast } from 'sonner';

const Form: React.FC = () => {
  const [creds, setCreds] = useState<{ username: string; password: string }>({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  let handleSignInSubmit = async (
    e: FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();
    setLoading(true);

    // console.log('creds', creds);

    try {
      const result = await signIn('credentials', {
        redirect: true,
        username: creds.username,
        password: creds.password,
        callbackUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/`,
      });

      if (result?.error) {
        setLoading(false);
        if (result.error === 'CredentialsSignin') {
          toast.error('Invalid username or password', {
            id: 'invalid-creds',
          });
        } else {
          toast.error('An error occurred', { id: 'error' });
        }
      } else if (result?.ok) {
        router.push('/');
        setLoading(false);
      }
    } catch (error) {
      toast.error('An unexpected error occurred', { id: 'unexpected-error' });
      throw error;
    }
  };

  let handleOnChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setCreds({ ...creds, [e.target.name]: e.target.value });
  };

  return (
    <form onSubmit={handleSignInSubmit}>
      <div className="flex flex-col">
        <div className="w-full">
          <label
            className="block uppercase text-gray-200 tracking-wide text-sm font-bold mb-2"
            htmlFor="grid-password"
          >
            Username
          </label>
          <input
            autoComplete="off"
            className="appearance-none block w-full bg-gray-50 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            required
            name="username"
            value={creds.username}
            onChange={handleOnChange}
            type="text"
            id="username-input"
            placeholder="JohnDoe001"
          />
        </div>
      </div>

      <div className="mb-6 flex flex-col">
        <div className="w-full">
          <label
            className="block uppercase tracking-wide text-gray-100 text-sm font-bold mb-2"
            htmlFor="grid-password"
          >
            Password
          </label>
          <input
            autoComplete="off"
            className="appearance-none block w-full bg-gray-100 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            type="password"
            name="password"
            required
            value={creds.password}
            onChange={handleOnChange}
            id="password-input"
            placeholder="*******"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="rounded-md text-primary-foreground bg-white font-bold hover:bg-gray-100 px-8 py-2.5 focus:outline-none"
      >
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
};

export default Form;
