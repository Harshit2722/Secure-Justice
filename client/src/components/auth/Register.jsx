import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ROLES = [
  { label: 'Citizen', value: 'citizen' },
  { label: 'Police', value: 'police' },
  { label: 'Forensic Expert', value: 'forensic' },
  { label: 'Lawyer', value: 'lawyer' },
  { label: 'Victim', value: 'victim' },
  { label: 'Defendant', value: 'defendant' },
  { label: 'Court', value: 'court' },
  { label: 'Admin', value: 'admin' }
];

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: ''
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
      const response = await axios.post('http://localhost:5001/api/auth/register', formData);
      console.log('Registration successful:', response.data);
      navigate('/login');
    } catch (err) {
      console.error('Registration failed:', err);
      setError(err.response?.data?.message || 'Oops! Something went wrong. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel p-10 md:p-14 rounded-xl shadow-2xl border border-white/40">
      <div className="mb-10 text-center lg:text-left">
        <h2 className="text-3xl font-bold tracking-tight text-on-surface mb-2">Create your account</h2>
        <p className="text-on-surface-variant">Takes less than a minute to get started</p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-error-container text-on-error-container text-sm flex items-start gap-3">
          <span className="material-symbols-outlined mt-0.5">error</span>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Field */}
        <div className="space-y-2">
          <label className="text-xs font-bold tracking-widest text-on-surface-variant uppercase ml-1" htmlFor="name">Full Name</label>
          <div className="relative group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline transition-colors group-focus-within:text-primary">person</span>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full pl-12 pr-4 py-4 bg-surface-container-lowest border border-outline-variant/20 rounded-lg focus:ring-0 focus:border-primary transition-all text-on-surface placeholder:text-outline-variant/60 outline-none"
              placeholder="Jane Doe"
            />
          </div>
        </div>

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

        {/* Role Dropdown */}
        <div className="space-y-2">
          <label className="text-xs font-bold tracking-widest text-on-surface-variant uppercase ml-1" htmlFor="role">I am a...</label>
          <div className="relative group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline transition-colors group-focus-within:text-primary">badge</span>
            <select
              id="role"
              name="role"
              required
              value={formData.role}
              onChange={handleChange}
              className="w-full pl-12 pr-4 py-4 bg-surface-container-lowest border border-outline-variant/20 rounded-lg focus:ring-0 focus:border-primary transition-all text-on-surface appearance-none cursor-pointer outline-none"
            >
              <option disabled value="">Select your role</option>
              {ROLES.map(role => (
                <option key={role.value} value={role.value}>{role.label}</option>
              ))}
            </select>
            <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline pointer-events-none">expand_more</span>
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <label className="text-xs font-bold tracking-widest text-on-surface-variant uppercase ml-1" htmlFor="password">Create Password</label>
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
            {loading ? 'Setting things up...' : 'Create Account'}
            {!loading && <span className="material-symbols-outlined text-xl">arrow_forward</span>}
          </button>
          <p className="mt-6 text-center text-sm text-on-surface-variant">
            Already part of the community? <Link to="/login" className="text-primary font-bold hover:underline">Sign in here</Link>
          </p>
        </div>
      </form>
    </div>
  );
}
