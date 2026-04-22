import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../../utils/api';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const validate = () => {
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

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    // Clear validation error when user types
    if (formErrors[e.target.name]) {
      setFormErrors(prev => ({ ...prev, [e.target.name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setApiError(null);
    setFormErrors({});

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setLoading(false);
      return;
    }

    try {
      const data = await login(formData);
      console.log('Login successful:', data);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.data));
      navigate('/dashboard'); 
    } catch (err) {
      console.error('Login failed:', err);
      setApiError(err.response?.data?.message || 'Invalid credentials. Please verify and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface-container-lowest/80 backdrop-blur-xl p-10 md:p-14 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-outline-variant/10">
      <div className="mb-10 text-center lg:text-left">
        <h2 className="text-3xl font-bold tracking-tight text-on-surface mb-2">Welcome back</h2>
        <p className="text-on-surface-variant">Please enter your details to sign in</p>
      </div>

      {apiError && (
        <div className="mb-6 p-4 rounded-lg bg-error-container text-on-error-container text-sm flex items-start gap-3">
          <span className="material-symbols-outlined mt-0.5">error</span>
          <span>{apiError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
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
            <a href="#" className="text-xs text-primary font-bold hover:underline">Forgot?</a>
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
            {loading ? 'Authenticating...' : 'Sign In'}
            {!loading && <span className="material-symbols-outlined text-xl">login</span>}
          </button>
          <p className="mt-6 text-center text-sm text-on-surface-variant">
            Don't have an account? <Link to="/register" className="text-primary font-bold hover:underline">Join now</Link>
          </p>
        </div>
      </form>
    </div>
  );
}
