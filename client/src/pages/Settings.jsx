import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { updateProfile } from '../utils/api';

export default function Settings() {
  const { user } = useOutletContext();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    oldPassword: '',
    password: ''
  });
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Initial check for theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && document.documentElement.classList.contains('dark'))) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const handleThemeChange = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      setIsDarkMode(false);
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
      localStorage.setItem('theme', 'dark');
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    setLoading(true);
    try {
      const payload = {};
      if (formData.name && formData.name !== user?.name) payload.name = formData.name;
      if (formData.oldPassword) payload.oldPassword = formData.oldPassword;
      if (formData.password) payload.password = formData.password;

      if (Object.keys(payload).length === 0) {
        setSuccessMsg('No changes to save.');
        setLoading(false);
        return;
      }

      const data = await updateProfile(payload);

      if (data.success) {
        setSuccessMsg('Profile updated successfully!');
        // Update local storage user data
        const updatedUser = { ...user, ...data.data };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setFormData({ ...formData, oldPassword: '', password: '' });
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in">
      <h2 className="text-3xl font-extrabold text-on-surface">Account Settings</h2>

      {/* Profile Settings */}
      <div className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/20 shadow-sm">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">person</span>
          Profile Information
        </h3>

        {errorMsg && (
          <div className="mb-4 p-3 bg-error-container text-on-error-container rounded-lg text-sm font-medium">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 bg-secondary/20 text-secondary rounded-lg text-sm font-bold">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Full Name</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full bg-surface-container border border-outline-variant/40 rounded-xl p-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Email Address</label>
              <input 
                type="email" 
                value={user?.email || 'user@example.com'}
                disabled
                className="w-full bg-surface-container/50 border border-outline-variant/20 rounded-xl p-4 text-on-surface-variant/60 font-medium cursor-not-allowed"
              />
            </div>
          </div>
          
          <div className="border-t border-outline-variant/10 pt-6 mt-6">
            <h4 className="text-sm font-bold mb-4">Change Password</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary/80 mb-2">Current Password</label>
                <div className="relative">
                  <input 
                    type={showOldPassword ? "text" : "password"} 
                    value={formData.oldPassword}
                    onChange={(e) => setFormData({...formData, oldPassword: e.target.value})}
                    className="w-full bg-surface-container border border-outline-variant/40 rounded-xl p-4 pr-12 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium transition-all"
                    placeholder="Enter current password"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 hover:text-primary transition-colors flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showOldPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary/80 mb-2">New Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full bg-surface-container border border-outline-variant/40 rounded-xl p-4 pr-12 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium transition-all"
                    placeholder="Enter new password"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 hover:text-primary transition-colors flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4 pt-4">
            <button type="submit" disabled={loading} className="bg-primary hover:bg-primary-dim text-on-primary px-8 py-3 rounded-xl font-bold shadow-sm hover:-translate-y-0.5 transition-all disabled:opacity-70">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Preferences & Accessibility */}
      <div className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/20 shadow-sm">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">palette</span>
          Appearance & Accessibility
        </h3>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-surface-container rounded-2xl border border-outline-variant/10">
            <div>
              <p className="font-bold text-on-surface">Dark Mode</p>
              <p className="text-sm text-on-surface-variant mt-1">Switch between light and dark theme</p>
            </div>
            <button 
              onClick={handleThemeChange}
              className={`relative w-14 h-8 rounded-full transition-colors ${isDarkMode ? 'bg-primary' : 'bg-outline-variant/40'}`}
            >
              <span className={`absolute top-1 left-1 bg-white w-6 h-6 rounded-full transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-1'}`}></span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
