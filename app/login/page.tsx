'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (!result?.ok) {
        setError(result?.error || 'Invalid credentials. Please try again.');
        return;
      }

      router.push('/report-home');
    } catch (err) {
      console.error('Error during login:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex min-h-screen justify-center bg-bgPrimary'>
      <div
        className='flex w-full max-w-[452px] flex-col items-center space-y-5 p-10'
        style={{ paddingTop: '7vh' }}
      >
        {/* APEX Text and Version */}
        <div className='flex items-baseline space-x-1.5'>
          <h1 className='text-[48px] font-extrabold italic text-textPrimary'>
            APEX
          </h1>
          <span className='text-[24px] text-[#64516E]'>v 0.1</span>
        </div>

        {/* Header Section */}
        <div className='space-y-3 text-center'>
          <h1 className='text-[38px] font-extrabold text-textPrimary'>
            Log In
          </h1>
          <p className='text-[14px] text-textSecondary'>Welcome Back!</p>
        </div>

        {/* Login Form */}
        <form className='w-full space-y-5' onSubmit={handleSubmit}>
          <div className='space-y-1.5'>
            <label
              htmlFor='email'
              className='block text-[14px] font-medium text-textPrimary'
            >
              Email
            </label>
            <div className='flex h-10 w-full items-center rounded-lg bg-[#64516E]/20 px-3 py-1.5'>
              <input
                id='email'
                type='email'
                placeholder='johndoe@gmail.com'
                value={formData.email}
                onChange={handleChange}
                className='h-full w-full bg-transparent text-textPrimary placeholder-textSecondary focus:outline-none'
              />
            </div>
          </div>

          <div className='space-y-1.5'>
            <label
              htmlFor='password'
              className='block text-[14px] font-medium text-textPrimary'
            >
              Password
            </label>
            <div className='flex h-10 w-full items-center rounded-lg bg-[#64516E]/20 px-3 py-1.5'>
              <input
                id='password'
                type='password'
                placeholder='••••••••'
                value={formData.password}
                onChange={handleChange}
                className='h-full w-full bg-transparent text-textPrimary placeholder-textSecondary focus:outline-none'
              />
            </div>
          </div>

          {/* Error Message */}
          {error && <p className='text-center text-red-600'>{error}</p>}

          {/* Login Button */}
          <div className='space-y-3'>
            <div className='flex justify-center'>
              <button
                type='submit'
                className={`h-[40px] w-[320px] rounded-lg py-2.5 text-white transition ${
                  loading ? 'cursor-not-allowed opacity-50' : ''
                }`}
                style={{ backgroundColor: 'rgba(100, 81, 110, 0.6)' }}
                disabled={loading}
              >
                {loading ? 'Logging In...' : 'Log In'}
              </button>
            </div>

            {/* Google Login Button */}
            <div className='flex cursor-pointer justify-center'>
              <div
                onClick={() =>
                  signIn('google', { callbackUrl: '/report-home' })
                }
                className='grid h-[40px] w-[320px] place-items-center rounded-lg py-2.5 text-center text-white transition'
                style={{ backgroundColor: 'rgba(100, 81, 110, 0.6)' }}
              >
                Log In with Google
              </div>
            </div>

            {/* Links Section */}
            <div className='space-y-3 text-center'>
              <p className='pt-1.5 text-[14px] text-textPrimary'>
                <span className='underline decoration-textPrimary underline-offset-2'>
                  Don’t have an account?
                </span>{' '}
                <a
                  href='/signup'
                  className='text-textSecondary underline decoration-textSecondary underline-offset-2'
                >
                  Sign-Up
                </a>
              </p>
              <p className='pt-1.5 text-[14px] text-textPrimary'>
                <span className='underline decoration-textPrimary underline-offset-2'>
                  Forgot Password?
                </span>{' '}
                <a
                  href='#'
                  className='text-textSecondary underline decoration-textSecondary underline-offset-2'
                >
                  Reset Password
                </a>
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
