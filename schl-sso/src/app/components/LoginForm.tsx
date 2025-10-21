'use client';

import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { toast } from 'sonner';

const LoginForm = () => {
  const router = useRouter();
  const [values, setValues] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        username: values.username,
        password: values.password,
        callbackUrl: '/redirect',
      });

      if (!result) {
        toast.error('Unable to reach the sign-in service.');
        return;
      }

      if (result.error) {
        const message =
          result.error === 'CredentialsSignin'
            ? 'Invalid username or password.'
            : 'An unexpected error occurred.';
        toast.error(message, { id: 'login-error' });
        return;
      }

      if (result.ok) {
        router.push(result.url ?? '/redirect');
        return;
      }

      toast.error('Sign-in failed. Please try again.');
    } catch (error) {
      console.error('Unexpected sign-in error', error);
      toast.error('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div>
        <label
          className="block text-sm font-semibold uppercase text-gray-700"
          htmlFor="username"
        >
          Username
        </label>
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="off"
          required
          value={values.username}
          onChange={event =>
            setValues(current => ({ ...current, username: event.target.value }))
          }
          className="mt-2 w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-gray-500 focus:outline-none"
          placeholder="JohnDoe001"
        />
      </div>

      <div>
        <label
          className="block text-sm font-semibold uppercase text-gray-700"
          htmlFor="password"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="off"
          required
          value={values.password}
          onChange={event =>
            setValues(current => ({ ...current, password: event.target.value }))
          }
          className="mt-2 w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-gray-500 focus:outline-none"
          placeholder="*******"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-white px-6 py-3 text-sm font-bold uppercase text-[#5b8032] transition hover:bg-gray-100 disabled:cursor-not-allowed"
      >
        {loading ? 'Logging in…' : 'Login'}
      </button>
    </form>
  );
};

export default LoginForm;
