import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import FloatingBackground from '../components/layout/FloatingBackground';

export default function LandingPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check initial theme from localStorage or document class
    const savedTheme = localStorage.getItem('theme');
    const isDark = document.documentElement.classList.contains('dark') || 
                   localStorage.getItem('theme') === 'dark';
    setIsDarkMode(isDark);
  }, []);

  const toggleTheme = () => {
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

  return (
    <div className="min-h-screen bg-surface-container-lowest text-on-surface flex flex-col font-manrope relative">
      <FloatingBackground />
        
        {/* Blurry Orbs */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary/5 dark:bg-primary/10 rounded-full blur-[100px] -z-10 pointer-events-none transform translate-x-1/2 -translate-y-1/3"></div>
        <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-secondary/5 dark:bg-secondary/10 rounded-full blur-[80px] -z-10 pointer-events-none transform -translate-x-1/2 -translate-y-1/2"></div>
        
        {/* TopNavBar - Always Dark to maintain parity with AuthLayout */}
        <nav className="w-full z-50 bg-[#0f172a] border-b border-white/5">
        <div className="flex justify-between items-center px-6 md:px-12 py-4 w-full">
          <Link to="/" className="flex items-center gap-2 text-2xl font-black tracking-tighter text-white">
            <span className="material-symbols-outlined text-primary text-3xl">balance</span>
            SecureJustice
          </Link>
          
          <div className="flex items-center gap-4 md:gap-6">
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-slate-800 transition-colors flex items-center justify-center text-slate-400 hover:text-primary"
              aria-label="Toggle Theme"
            >
              <span className="material-symbols-outlined">
                {isDarkMode ? 'light_mode' : 'dark_mode'}
              </span>
            </button>
            <Link to="/login" className="hidden sm:block font-bold text-sm text-slate-300 hover:text-white transition-colors">Sign In</Link>
            <Link to="/register" className="bg-primary text-on-primary px-5 md:px-6 py-2 md:py-2.5 rounded-lg font-bold text-sm shadow-md hover:bg-primary-container hover:text-on-primary-container transition-colors whitespace-nowrap">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center relative overflow-hidden">
        
        {/* Decorative Background Elements */}
        {/* Abstract Grid Pattern */}
        <div 
          className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" 
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '32px 32px' }}
        ></div>
        
        {/* Hero Section */}
        <section className="flex flex-col items-center text-center px-4 pt-16 md:pt-24 pb-16 md:pb-20 max-w-4xl mx-auto z-10 w-full">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-container border border-outline-variant/20 mb-8">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span className="text-xs font-bold tracking-[0.2em] text-on-surface-variant uppercase">Modernizing the Justice System</span>
          </div>
          
          <h2 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight mb-6 md:mb-8 leading-[1.15] text-on-surface">
            Justice, Unified and <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#334155] to-primary dark:from-primary dark:to-primary-container">Secure.</span>
          </h2>
          
          <p className="text-base sm:text-lg md:text-xl text-on-surface-variant max-w-2xl mb-10 md:mb-12 leading-relaxed">
            A secure digital platform for transparent FIR management, tamper-proof digital evidence handling, and seamless collaboration across the judicial ecosystem.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto px-4">
            <Link to="/register" className="w-full sm:w-auto bg-[#334155] hover:bg-[#1e293b] dark:bg-primary dark:hover:bg-primary-container text-white dark:text-on-primary px-8 py-3.5 md:py-4 rounded-xl font-bold tracking-wide shadow-xl flex items-center justify-center gap-2 transition-all">
              Join the Platform <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
            <Link to="/login" className="w-full sm:w-auto bg-surface-container-lowest hover:bg-surface-container text-on-surface px-8 py-3.5 md:py-4 rounded-xl font-bold tracking-wide border border-outline-variant/30 flex items-center justify-center gap-2 transition-all">
              Access Portal
            </Link>
          </div>
        </section>

        {/* Stats Divider */}
        <div className="w-full border-y border-outline-variant/30 bg-surface/60 backdrop-blur-xl py-6 md:py-8 mt-8 md:mt-12 z-10 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 divide-x-0 md:divide-x divide-outline-variant/20">
            <div className="text-center px-2 sm:px-4">
              <p className="text-xl sm:text-2xl font-black text-on-surface mb-1">100%</p>
              <p className="text-[10px] sm:text-xs font-bold text-on-surface-variant tracking-wider uppercase">Tamper-Proof Records</p>
            </div>
            <div className="text-center px-2 sm:px-4 border-l border-outline-variant/20 md:border-none">
              <p className="text-xl sm:text-2xl font-black text-on-surface mb-1">E2E</p>
              <p className="text-[10px] sm:text-xs font-bold text-on-surface-variant tracking-wider uppercase">Encrypted Data</p>
            </div>
            <div className="text-center px-2 sm:px-4 border-t border-outline-variant/20 md:border-none pt-6 md:pt-0">
              <p className="text-xl sm:text-2xl font-black text-on-surface mb-1">4</p>
              <p className="text-[10px] sm:text-xs font-bold text-on-surface-variant tracking-wider uppercase">Integrated Roles</p>
            </div>
            <div className="text-center px-2 sm:px-4 border-l border-t md:border-t-0 border-outline-variant/20 md:border-none pt-6 md:pt-0">
              <p className="text-xl sm:text-2xl font-black text-on-surface mb-1">24/7</p>
              <p className="text-[10px] sm:text-xs font-bold text-on-surface-variant tracking-wider uppercase">Real-time Access</p>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-32 z-10">
          <div className="text-center mb-12 md:mb-16 max-w-3xl mx-auto">
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mb-4 text-on-surface">Everything you need to handle cases securely</h3>
            <p className="text-on-surface-variant text-base md:text-lg">Built specifically for law enforcement, forensic experts, and citizens to ensure transparency and trust in the judicial process.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Feature 1 */}
            <div className="bg-surface-container-lowest/70 backdrop-blur-md p-6 md:p-8 rounded-3xl border border-outline-variant/40 shadow-xl hover:shadow-2xl hover:border-primary/50 transition-all group flex flex-col items-start">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-5 md:mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[24px] md:text-[28px]">account_tree</span>
              </div>
              <h4 className="text-lg md:text-xl font-bold mb-2 md:mb-3 text-on-surface">End-to-End FIR Lifecycle</h4>
              <p className="text-sm md:text-base text-on-surface-variant leading-relaxed">
                Seamlessly track cases from initial citizen filing, through police investigation and forensic analysis, to final court closure with automated routing.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-surface-container-lowest/70 backdrop-blur-md p-6 md:p-8 rounded-3xl border border-outline-variant/40 shadow-xl hover:shadow-2xl hover:border-primary/50 transition-all group flex flex-col items-start">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-5 md:mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[24px] md:text-[28px]">enhanced_encryption</span>
              </div>
              <h4 className="text-lg md:text-xl font-bold mb-2 md:mb-3 text-on-surface">Military-Grade Encryption</h4>
              <p className="text-sm md:text-base text-on-surface-variant leading-relaxed">
                All digital evidence and case files are encrypted at rest and in transit. Cryptographic hashing ensures files cannot be altered without detection.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-surface-container-lowest/70 backdrop-blur-md p-6 md:p-8 rounded-3xl border border-outline-variant/40 shadow-xl hover:shadow-2xl hover:border-primary/50 transition-all group flex flex-col items-start">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-5 md:mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[24px] md:text-[28px]">admin_panel_settings</span>
              </div>
              <h4 className="text-lg md:text-xl font-bold mb-2 md:mb-3 text-on-surface">Strict RBAC Architecture</h4>
              <p className="text-sm md:text-base text-on-surface-variant leading-relaxed">
                Role-Based Access Control ensures users only see what they are authorized to see. Strict boundaries separate Citizen, Police, Forensic, and Admin data.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-surface-container-lowest/70 backdrop-blur-md p-6 md:p-8 rounded-3xl border border-outline-variant/40 shadow-xl hover:shadow-2xl hover:border-primary/50 transition-all group flex flex-col items-start">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-5 md:mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[24px] md:text-[28px]">history</span>
              </div>
              <h4 className="text-lg md:text-xl font-bold mb-2 md:mb-3 text-on-surface">Tamper-Proof Audit Trails</h4>
              <p className="text-sm md:text-base text-on-surface-variant leading-relaxed">
                Every action, view, and modification on the platform is logged immutably. Maintaining a verifiable chain of custody for all digital evidence.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-surface-container-lowest/70 backdrop-blur-md p-6 md:p-8 rounded-3xl border border-outline-variant/40 shadow-xl hover:shadow-2xl hover:border-primary/50 transition-all group flex flex-col items-start">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-5 md:mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[24px] md:text-[28px]">groups</span>
              </div>
              <h4 className="text-lg md:text-xl font-bold mb-2 md:mb-3 text-on-surface">Multi-Stakeholder Portal</h4>
              <p className="text-sm md:text-base text-on-surface-variant leading-relaxed">
                Dedicated, optimized interfaces for different departments. Forensics can easily attach reports directly to police FIRs without physical handoffs.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-surface-container-lowest/70 backdrop-blur-md p-6 md:p-8 rounded-3xl border border-outline-variant/40 shadow-xl hover:shadow-2xl hover:border-primary/50 transition-all group flex flex-col items-start">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-5 md:mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[24px] md:text-[28px]">notifications_active</span>
              </div>
              <h4 className="text-lg md:text-xl font-bold mb-2 md:mb-3 text-on-surface">Real-Time Case Updates</h4>
              <p className="text-sm md:text-base text-on-surface-variant leading-relaxed">
                Citizens receive instant transparency into their case status. No more waiting in lines—get automated notifications as the investigation progresses.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full bg-[#0f172a] border-t border-white/5 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center px-6 md:px-12 w-full gap-4">
          <div className="font-bold text-slate-400 text-xs tracking-widest uppercase">
            SecureJustice
          </div>
          <div className="flex gap-8">
            <a className="text-slate-500 hover:text-primary transition-all text-xs tracking-wide underline decoration-transparent hover:decoration-primary" href="#">Privacy</a>
            <a className="text-slate-500 hover:text-primary transition-all text-xs tracking-wide underline decoration-transparent hover:decoration-primary" href="#">Terms</a>
            <a className="text-slate-500 hover:text-primary transition-all text-xs tracking-wide underline decoration-transparent hover:decoration-primary" href="#">Help</a>
          </div>
          <div className="text-slate-500 text-xs tracking-wide">
            &copy; {new Date().getFullYear()} SecureJustice.
          </div>
        </div>
      </footer>
    </div>
  );
}
