import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';

export default function Settings() {
  const { user } = useOutletContext();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    password: '',
    confirmPassword: ''
  });
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    // Initial check for theme
    setIsDarkMode(document.documentElement.classList.contains('dark'));
  }, []);

  const handleThemeChange = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (formData.password && formData.password !== formData.confirmPassword) {
      alert("Passwords don't match");
      return;
    }
    // In a real app, make API call to updateUserProfile
    setSuccessMsg('Profile updated successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
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
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">New Password</label>
                <input 
                  type="password" 
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full bg-surface-container border border-outline-variant/40 rounded-xl p-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium transition-all"
                  placeholder="Leave blank to keep current"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Confirm New Password</label>
                <input 
                  type="password" 
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  className="w-full bg-surface-container border border-outline-variant/40 rounded-xl p-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium transition-all"
                  placeholder="Confirm new password"
                />
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4 pt-4">
            <button type="submit" className="bg-primary hover:bg-primary-dim text-on-primary px-8 py-3 rounded-xl font-bold shadow-sm hover:-translate-y-0.5 transition-all">
              Save Changes
            </button>
            {successMsg && <span className="text-sm font-bold text-secondary">{successMsg}</span>}
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

          <div className="flex items-center justify-between p-4 bg-surface-container rounded-2xl border border-outline-variant/10">
            <div>
              <p className="font-bold text-on-surface">High Contrast</p>
              <p className="text-sm text-on-surface-variant mt-1">Increase contrast for better visibility</p>
            </div>
            <button 
              onClick={() => {
                setHighContrast(!highContrast);
                if (!highContrast) {
                  document.body.classList.add('contrast-more');
                } else {
                  document.body.classList.remove('contrast-more');
                }
              }}
              className={`relative w-14 h-8 rounded-full transition-colors ${highContrast ? 'bg-primary' : 'bg-outline-variant/40'}`}
            >
              <span className={`absolute top-1 left-1 bg-white w-6 h-6 rounded-full transition-transform ${highContrast ? 'translate-x-6' : 'translate-x-1'}`}></span>
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-surface-container rounded-2xl border border-outline-variant/10">
            <div>
              <p className="font-bold text-on-surface">Large Text</p>
              <p className="text-sm text-on-surface-variant mt-1">Increase the default font size</p>
            </div>
            <button 
              onClick={() => {
                setLargeText(!largeText);
                if (!largeText) {
                  document.documentElement.style.fontSize = '110%';
                } else {
                  document.documentElement.style.fontSize = '100%';
                }
              }}
              className={`relative w-14 h-8 rounded-full transition-colors ${largeText ? 'bg-primary' : 'bg-outline-variant/40'}`}
            >
              <span className={`absolute top-1 left-1 bg-white w-6 h-6 rounded-full transition-transform ${largeText ? 'translate-x-6' : 'translate-x-1'}`}></span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
