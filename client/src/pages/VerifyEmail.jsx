import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { verifyEmailToken } from '../utils/api';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const token = searchParams.get('token');

        if (!token) {
          setStatus('error');
          setMessage('No verification token provided.');
          return;
        }

        await verifyEmailToken(token);

        setStatus('success');
        setMessage('Email verified successfully! Redirecting to login...');

        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.message || error.message || 'Failed to verify your email. The link may have expired.');
      }
    };

    verifyToken();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface text-on-surface px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-outline-variant/10 bg-surface-container p-10 shadow-[0_20px_50px_rgba(0,0,0,0.12)]">
        {status === 'loading' && (
          <div className="space-y-6 text-center">
            <div className="mx-auto h-12 w-12 rounded-full border-4 border-surface-container border-t-primary animate-spin" />
            <h2 className="text-3xl font-bold tracking-tight text-on-surface">Verifying your email...</h2>
            <p className="text-sm leading-6 text-on-surface-variant">Please wait while we verify your email address.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-white text-3xl">✓</div>
            <h2 className="text-3xl font-bold tracking-tight text-on-surface">Email Verified!</h2>
            <p className="text-sm leading-6 text-on-surface-variant">{message}</p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-error text-white text-3xl">✗</div>
            <h2 className="text-3xl font-bold tracking-tight text-on-surface">Verification Failed</h2>
            <p className="text-sm leading-6 text-on-surface-variant">{message}</p>
            <button
              onClick={() => navigate('/register')}
              className="mt-4 inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-bold text-on-primary transition hover:bg-primary-container"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
