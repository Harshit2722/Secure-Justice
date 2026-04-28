import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../../utils/api';

const ROLES = [
  { label: 'Citizen', value: 'citizen' },
  { label: 'Police', value: 'police' },
  { label: 'Forensic Expert', value: 'forensic' }
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
  const [apiError, setApiError] = useState(null);
  const [apiSuccess, setApiSuccess] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const validate = () => {
    const errors = {};
    if (!formData.name) {
      errors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      errors.name = "Name is too short";
    }

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
    
    if (!formData.role) {
      errors.role = "Role selection is required";
    }

    return errors;
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (formErrors[e.target.name]) {
      setFormErrors(prev => ({ ...prev, [e.target.name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setApiError(null);
    setApiSuccess(null);
    setFormErrors({});

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setLoading(false);
      return;
    }

    try {
      const data = await register(formData);
      console.log('Registration successful:', data);
      
      // Show success message and redirect to login with verification instructions
      setApiSuccess('Registration successful! Please check your email and click the verification link to activate your account.');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      console.error('Registration failed:', err);
      setApiError(err.response?.data?.message || 'Oops! Something went wrong. Please check your connection and try again.');
      setApiSuccess(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface-container-lowest/80 backdrop-blur-xl p-10 md:p-14 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-outline-variant/10">
      <div className="mb-10 text-center lg:text-left">
        <h2 className="text-3xl font-bold tracking-tight text-on-surface mb-2">Create your account</h2>
        <p className="text-on-surface-variant">Takes less than a minute to get started</p>
      </div>

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

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Field */}
        <div className="space-y-2">
          <label className="block text-[13px] font-bold tracking-widest text-on-surface-variant uppercase ml-1 mb-2" htmlFor="name">Full Name</label>
          <div className="relative group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline transition-colors group-focus-within:text-primary">person</span>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className={`w-full pl-12 pr-4 py-4 bg-surface-container border ${formErrors.name ? 'border-error ring-1 ring-error' : 'border-outline-variant/20'} rounded-lg focus:ring-0 focus:border-primary transition-all text-on-surface placeholder:text-on-surface-variant/40 outline-none`}
              placeholder="Jane Doe"
            />
          </div>
          {formErrors.name && <p className="text-error text-xs font-bold mt-1 ml-1">{formErrors.name}</p>}
        </div>

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

        {/* Role Dropdown */}
        <div className="space-y-2">
          <label className="block text-[13px] font-bold tracking-widest text-on-surface-variant uppercase ml-1 mb-2" htmlFor="role">I am a...</label>
          <div className="relative group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline transition-colors group-focus-within:text-primary">badge</span>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className={`w-full pl-12 pr-4 py-4 bg-surface-container border ${formErrors.role ? 'border-error ring-1 ring-error' : 'border-outline-variant/20'} rounded-lg focus:ring-0 focus:border-primary transition-all ${!formData.role ? 'text-on-surface-variant/40' : 'text-on-surface'} appearance-none cursor-pointer outline-none`}
            >
              <option disabled value="">Select your role</option>
              {ROLES.map(role => (
                <option key={role.value} value={role.value} className="text-on-surface">{role.label}</option>
              ))}
            </select>
            <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline pointer-events-none">expand_more</span>
          </div>
          {formErrors.role && <p className="text-error text-xs font-bold mt-1 ml-1">{formErrors.role}</p>}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <label className="block text-[13px] font-bold tracking-widest text-on-surface-variant uppercase ml-1 mb-2" htmlFor="password">Create Password</label>
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
