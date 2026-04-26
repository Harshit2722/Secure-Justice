import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login, verifyOTP, resendOTP, forgotPassword, resetPassword } from '../../utils/api';

export default function Login() {
  const navigate = useNavigate();

  // Current view state
  const [currentView, setCurrentView] = useState('login'); // 'login', 'otp', 'forgot', 'reset'

  // Form data for different views
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });

  // UI states
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [apiSuccess, setApiSuccess] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Store email for OTP verification
  const [loginEmail, setLoginEmail] = useState('');

  const validateLogin = () => {
    const errors = {};
    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Invalid email format";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }
    return errors;
  };

  const validateOTP = () => {
    const errors = {};
    if (!formData.otp) {
      errors.otp = "OTP is required";
    } else if (!/^\d{6}$/.test(formData.otp)) {
      errors.otp = "OTP must be 6 digits";
    }
    return errors;
  };

  const validateForgotPassword = () => {
    const errors = {};
    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Invalid email format";
    }
    return errors;
  };

  const validateResetPassword = () => {
    const errors = {};
    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Invalid email format";
    }

    if (!formData.otp) {
      errors.otp = "OTP is required";
    } else if (!/^\d{6}$/.test(formData.otp)) {
      errors.otp = "OTP must be 6 digits";
    }

    if (!formData.newPassword) {
      errors.newPassword = "New password is required";
    } else if (formData.newPassword.length < 6) {
      errors.newPassword = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (formData.newPassword !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
    return errors;
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (formErrors[e.target.name]) {
      setFormErrors(prev => ({ ...prev, [e.target.name]: null }));
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setApiError(null);
    setApiSuccess(null);
    setFormErrors({});

    const errors = validateLogin();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setLoading(false);
      return;
    }

    try {
      const data = await login(formData);
      
      if (data.token) {
        console.log('Login successful (Dev Bypass):', data);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.data));
        
        if (data.data.role === 'forensic') {
          navigate('/forensics');
        } else {
          navigate('/dashboard');
        }
      } else {
        console.log('Login OTP sent:', data);
        setLoginEmail(formData.email);
        setCurrentView('otp');
        setApiError(null);
      }
    } catch (err) {
      console.error('Login failed:', err);
      setApiError(err.response?.data?.message || 'Invalid credentials. Please verify and try again.');
      setApiSuccess(null);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setApiError(null);
    setFormErrors({});

    const errors = validateOTP();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setLoading(false);
      return;
    }

    try {
      const data = await verifyOTP({ email: loginEmail, otp: formData.otp });
      console.log('OTP verified:', data);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.data));
      
      if (data.data.role === 'forensic') {
        navigate('/forensics');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('OTP verification failed:', err);
      setApiError(err.response?.data?.message || 'Invalid OTP. Please try again.');
      setApiSuccess(null);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;

    setLoading(true);
    setApiError(null);
    setApiSuccess(null);

    try {
      await resendOTP({ email: loginEmail });
      setApiSuccess('OTP resent to your email.');
      setCountdown(60); // 60 second countdown
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      console.error('Resend OTP failed:', err);
      setApiError(err.response?.data?.message || 'Failed to resend OTP. Please try again.');
      setApiSuccess(null);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setApiError(null);
    setApiSuccess(null);
    setFormErrors({});

    const errors = validateForgotPassword();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setLoading(false);
      return;
    }

    try {
      await forgotPassword({ email: formData.email });
      console.log('Password reset OTP sent');
      setCurrentView('reset');
      setApiSuccess('Password reset OTP sent! Check your email for the code.');
      setApiError(null);
    } catch (err) {
      console.error('Forgot password failed:', err);
      setApiError(err.response?.data?.message || 'Failed to send reset OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setApiError(null);
    setApiSuccess(null);
    setFormErrors({});

    const errors = validateResetPassword();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setLoading(false);
      return;
    }

    try {
      await resetPassword({
        email: formData.email,
        otp: formData.otp,
        newPassword: formData.newPassword
      });
      console.log('Password reset successful');
      setCurrentView('login');
      setApiSuccess('Password reset successful! Please login with your new password.');
      setFormData({
        email: '',
        password: '',
        otp: '',
        newPassword: '',
        confirmPassword: ''
      });
      setApiError(null);
    } catch (err) {
      console.error('Reset password failed:', err);
      setApiError(err.response?.data?.message || 'Failed to reset password. Please try again.');
      setApiSuccess(null);
    } finally {
      setLoading(false);
    }
  };

  const renderLoginForm = () => (
    <>
      <div className="mb-10 text-center lg:text-left">
        <h2 className="text-3xl font-bold tracking-tight text-on-surface mb-2">Welcome back</h2>
        <p className="text-on-surface-variant">Please enter your details to sign in</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-6">
        {/* Email Field */}
        <div className="space-y-2">
          <label className="block text-[13px] font-bold tracking-widest text-on-surface-variant uppercase ml-1 mb-2" htmlFor="email">Email Address</label>
          <div className="relative group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline transition-colors group-focus-within:text-primary">mail</span>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full pl-12 pr-4 py-4 bg-surface-container border ${formErrors.email ? 'border-error ring-1 ring-error' : 'border-outline-variant/20'} rounded-lg focus:ring-0 focus:border-primary transition-all text-on-surface placeholder:text-on-surface-variant/40 outline-none`}
              placeholder="you@example.com"
            />
          </div>
          {formErrors.email && <p className="text-error text-xs font-bold mt-1 ml-1">{formErrors.email}</p>}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <div className="flex justify-between items-center ml-1 mb-2">
            <label className="text-[13px] font-bold tracking-widest text-on-surface-variant uppercase" htmlFor="password">Password</label>
            <button
              type="button"
              onClick={() => setCurrentView('forgot')}
              className="text-xs text-primary font-bold hover:underline"
            >
              Forgot?
            </button>
          </div>
          <div className="relative group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline transition-colors group-focus-within:text-primary">lock</span>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              className={`w-full pl-12 pr-12 py-4 bg-surface-container border ${formErrors.password ? 'border-error ring-1 ring-error' : 'border-outline-variant/20'} rounded-lg focus:ring-0 focus:border-primary transition-all text-on-surface placeholder:text-on-surface-variant/40 outline-none`}
              placeholder="••••••••••••"
            />
            <button
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline-variant hover:text-on-surface"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "visibility_off" : "visibility"}
            </button>
          </div>
          {formErrors.password && <p className="text-error text-xs font-bold mt-1 ml-1">{formErrors.password}</p>}
        </div>

        {/* CTA Section */}
        <div className="pt-6">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#334155] hover:bg-[#1e293b] text-white py-5 rounded-xl font-bold tracking-widest uppercase text-sm shadow-lg transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-70"
          >
            {loading ? 'Sending OTP...' : 'Send Login OTP'}
            {!loading && <span className="material-symbols-outlined text-xl">login</span>}
          </button>
          <p className="mt-6 text-center text-sm text-on-surface-variant">
            Don't have an account? <Link to="/register" className="text-primary font-bold hover:underline">Join now</Link>
          </p>
        </div>
      </form>
    </>
  );

  const renderOTPForm = () => (
    <>
      <div className="mb-10 text-center lg:text-left">
        <h2 className="text-3xl font-bold tracking-tight text-on-surface mb-2">Verify Your Identity</h2>
        <p className="text-on-surface-variant">Enter the 6-digit OTP sent to {loginEmail}</p>
      </div>

      <form onSubmit={handleVerifyOTP} className="space-y-6">
        {/* OTP Field */}
        <div className="space-y-2">
          <label className="block text-[13px] font-bold tracking-widest text-on-surface-variant uppercase ml-1 mb-2" htmlFor="otp">One-Time Password</label>
          <div className="relative group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline transition-colors group-focus-within:text-primary">security</span>
            <input
              id="otp"
              name="otp"
              type="text"
              value={formData.otp}
              onChange={handleChange}
              maxLength="6"
              className={`w-full pl-12 pr-4 py-4 bg-surface-container border ${formErrors.otp ? 'border-error ring-1 ring-error' : 'border-outline-variant/20'} rounded-lg focus:ring-0 focus:border-primary transition-all text-on-surface placeholder:text-on-surface-variant/40 outline-none text-center text-2xl font-mono tracking-widest`}
              placeholder="000000"
            />
          </div>
          {formErrors.otp && <p className="text-error text-xs font-bold mt-1 ml-1">{formErrors.otp}</p>}
        </div>

        {/* CTA Section */}
        <div className="pt-6 space-y-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#334155] hover:bg-[#1e293b] text-white py-5 rounded-xl font-bold tracking-widest uppercase text-sm shadow-lg transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-70"
          >
            {loading ? 'Verifying...' : 'Verify & Sign In'}
            {!loading && <span className="material-symbols-outlined text-xl">verified</span>}
          </button>

          <button
            type="button"
            onClick={handleResendOTP}
            disabled={loading || countdown > 0}
            className="w-full bg-surface-container hover:bg-surface-container-high text-on-surface py-3 rounded-xl font-bold tracking-widest uppercase text-xs border border-outline-variant/20 transition-all disabled:opacity-50"
          >
            {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
          </button>

          <button
            type="button"
            onClick={() => {
              setCurrentView('login');
              setFormData(prev => ({ ...prev, otp: '' }));
              setApiError(null);
            }}
            className="w-full text-primary py-2 rounded-xl font-bold tracking-widest uppercase text-xs hover:underline"
          >
            ← Back to Login
          </button>
        </div>
      </form>
    </>
  );

  const renderForgotPasswordForm = () => (
    <>
      <div className="mb-10 text-center lg:text-left">
        <h2 className="text-3xl font-bold tracking-tight text-on-surface mb-2">Reset Your Password</h2>
        <p className="text-on-surface-variant">Enter your email to receive a reset OTP</p>
      </div>

      <form onSubmit={handleForgotPassword} className="space-y-6">
        {/* Email Field */}
        <div className="space-y-2">
          <label className="block text-[13px] font-bold tracking-widest text-on-surface-variant uppercase ml-1 mb-2" htmlFor="email">Email Address</label>
          <div className="relative group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline transition-colors group-focus-within:text-primary">mail</span>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full pl-12 pr-4 py-4 bg-surface-container border ${formErrors.email ? 'border-error ring-1 ring-error' : 'border-outline-variant/20'} rounded-lg focus:ring-0 focus:border-primary transition-all text-on-surface placeholder:text-on-surface-variant/40 outline-none`}
              placeholder="you@example.com"
            />
          </div>
          {formErrors.email && <p className="text-error text-xs font-bold mt-1 ml-1">{formErrors.email}</p>}
        </div>

        {/* CTA Section */}
        <div className="pt-6 space-y-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#334155] hover:bg-[#1e293b] text-white py-5 rounded-xl font-bold tracking-widest uppercase text-sm shadow-lg transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-70"
          >
            {loading ? 'Sending...' : 'Send Reset OTP'}
            {!loading && <span className="material-symbols-outlined text-xl">send</span>}
          </button>

          <button
            type="button"
            onClick={() => {
              setCurrentView('login');
              setFormData(prev => ({ ...prev, email: '' }));
              setApiError(null);
            }}
            className="w-full text-primary py-2 rounded-xl font-bold tracking-widest uppercase text-xs hover:underline"
          >
            ← Back to Login
          </button>
        </div>
      </form>
    </>
  );

  const renderResetPasswordForm = () => (
    <>
      <div className="mb-10 text-center lg:text-left">
        <h2 className="text-3xl font-bold tracking-tight text-on-surface mb-2">Reset Your Password</h2>
        <p className="text-on-surface-variant">Enter the OTP and your new password</p>
      </div>

      <form onSubmit={handleResetPassword} className="space-y-6">
        {/* Email Field */}
        <div className="space-y-2">
          <label className="block text-[13px] font-bold tracking-widest text-on-surface-variant uppercase ml-1 mb-2" htmlFor="email">Email Address</label>
          <div className="relative group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline transition-colors group-focus-within:text-primary">mail</span>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full pl-12 pr-4 py-4 bg-surface-container border ${formErrors.email ? 'border-error ring-1 ring-error' : 'border-outline-variant/20'} rounded-lg focus:ring-0 focus:border-primary transition-all text-on-surface placeholder:text-on-surface-variant/40 outline-none`}
              placeholder="you@example.com"
            />
          </div>
          {formErrors.email && <p className="text-error text-xs font-bold mt-1 ml-1">{formErrors.email}</p>}
        </div>

        {/* OTP Field */}
        <div className="space-y-2">
          <label className="block text-[13px] font-bold tracking-widest text-on-surface-variant uppercase ml-1 mb-2" htmlFor="otp">Reset OTP</label>
          <div className="relative group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline transition-colors group-focus-within:text-primary">security</span>
            <input
              id="otp"
              name="otp"
              type="text"
              value={formData.otp}
              onChange={handleChange}
              maxLength="6"
              className={`w-full pl-12 pr-4 py-4 bg-surface-container border ${formErrors.otp ? 'border-error ring-1 ring-error' : 'border-outline-variant/20'} rounded-lg focus:ring-0 focus:border-primary transition-all text-on-surface placeholder:text-on-surface-variant/40 outline-none text-center text-xl font-mono tracking-widest`}
              placeholder="000000"
            />
          </div>
          {formErrors.otp && <p className="text-error text-xs font-bold mt-1 ml-1">{formErrors.otp}</p>}
        </div>

        {/* New Password Field */}
        <div className="space-y-2">
          <label className="block text-[13px] font-bold tracking-widest text-on-surface-variant uppercase ml-1 mb-2" htmlFor="newPassword">New Password</label>
          <div className="relative group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline transition-colors group-focus-within:text-primary">lock</span>
            <input
              id="newPassword"
              name="newPassword"
              type={showNewPassword ? "text" : "password"}
              value={formData.newPassword}
              onChange={handleChange}
              className={`w-full pl-12 pr-12 py-4 bg-surface-container border ${formErrors.newPassword ? 'border-error ring-1 ring-error' : 'border-outline-variant/20'} rounded-lg focus:ring-0 focus:border-primary transition-all text-on-surface placeholder:text-on-surface-variant/40 outline-none`}
              placeholder="••••••••••••"
            />
            <button
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline-variant hover:text-on-surface"
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              {showNewPassword ? "visibility_off" : "visibility"}
            </button>
          </div>
          {formErrors.newPassword && <p className="text-error text-xs font-bold mt-1 ml-1">{formErrors.newPassword}</p>}
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-2">
          <label className="block text-[13px] font-bold tracking-widest text-on-surface-variant uppercase ml-1 mb-2" htmlFor="confirmPassword">Confirm Password</label>
          <div className="relative group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline transition-colors group-focus-within:text-primary">lock</span>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full pl-12 pr-4 py-4 bg-surface-container border ${formErrors.confirmPassword ? 'border-error ring-1 ring-error' : 'border-outline-variant/20'} rounded-lg focus:ring-0 focus:border-primary transition-all text-on-surface placeholder:text-on-surface-variant/40 outline-none`}
              placeholder="••••••••••••"
            />
          </div>
          {formErrors.confirmPassword && <p className="text-error text-xs font-bold mt-1 ml-1">{formErrors.confirmPassword}</p>}
        </div>

        {/* CTA Section */}
        <div className="pt-6 space-y-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#334155] hover:bg-[#1e293b] text-white py-5 rounded-xl font-bold tracking-widest uppercase text-sm shadow-lg transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-70"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
            {!loading && <span className="material-symbols-outlined text-xl">restart_alt</span>}
          </button>

          <button
            type="button"
            onClick={() => {
              setCurrentView('forgot');
              setFormData(prev => ({ ...prev, otp: '', newPassword: '', confirmPassword: '' }));
              setApiError(null);
              setApiSuccess(null);
            }}
            className="w-full text-primary py-2 rounded-xl font-bold tracking-widest uppercase text-xs hover:underline"
          >
            ← Back to Email
          </button>
        </div>
      </form>
    </>
  );

  const renderCurrentView = () => {
    switch (currentView) {
      case 'otp':
        return renderOTPForm();
      case 'forgot':
        return renderForgotPasswordForm();
      case 'reset':
        return renderResetPasswordForm();
      default:
        return renderLoginForm();
    }
  };

  return (
    <div className="bg-surface-container-lowest/80 backdrop-blur-xl p-10 md:p-14 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-outline-variant/10">
      {apiSuccess && (
        <div className="mb-6 p-4 rounded-lg bg-emerald-600 text-white text-sm flex items-start gap-3">
          <span className="material-symbols-outlined mt-0.5">check_circle</span>
          <span>{apiSuccess}</span>
        </div>
      )}

      {apiError && (
        <div className="mb-6 p-4 rounded-lg bg-error-container text-on-error-container text-sm flex items-start gap-3">
          <span className="material-symbols-outlined mt-0.5">error</span>
          <span>{apiError}</span>
        </div>
      )}

      {renderCurrentView()}
    </div>
  );
}
