import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('http://localhost:5001/api/auth/login', formData);
      console.log('Login successful:', response.data);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data));
      navigate('/dashboard'); 
    } catch (err) {
      console.error('Login failed:', err);
      setError(err.response?.data?.message || 'Invalid credentials. Please verify and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel p-10 md:p-14 rounded-xl shadow-2xl border border-white/40">
      <div className="mb-10 text-center lg:text-left">
        <h2 className="text-3xl font-bold tracking-tight text-on-surface mb-2">Welcome back</h2>
        <p className="text-on-surface-variant">Please enter your details to sign in</p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-error-container text-on-error-container text-sm flex items-start gap-3">
          <span className="material-symbols-outlined mt-0.5">error</span>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Field */}
        <div className="space-y-2">
          <label className="text-xs font-bold tracking-widest text-on-surface-variant uppercase ml-1" htmlFor="email">Email Address</label>
          <div className="relative group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline transition-colors group-focus-within:text-primary">mail</span>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full pl-12 pr-4 py-4 bg-surface-container-lowest border border-outline-variant/20 rounded-lg focus:ring-0 focus:border-primary transition-all text-on-surface placeholder:text-outline-variant/60 outline-none"
              placeholder="you@example.com"
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <div className="flex justify-between items-center ml-1">
            <label className="text-xs font-bold tracking-widest text-on-surface-variant uppercase" htmlFor="password">Password</label>
            <a href="#" className="text-xs text-primary font-bold hover:underline">Forgot?</a>
          </div>
          <div className="relative group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline transition-colors group-focus-within:text-primary">lock</span>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full pl-12 pr-12 py-4 bg-surface-container-lowest border border-outline-variant/20 rounded-lg focus:ring-0 focus:border-primary transition-all text-on-surface placeholder:text-outline-variant/60 outline-none"
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
        </div>

        {/* CTA Section */}
        <div className="pt-6">
          <button
            type="submit"
            disabled={loading}
            className="w-full silver-sheen text-on-primary py-5 rounded-lg font-extrabold tracking-widest uppercase text-sm shadow-xl hover:shadow-primary/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
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
