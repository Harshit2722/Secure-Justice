import { Outlet, Link } from 'react-router-dom';
import FloatingBackground from '../layout/FloatingBackground';

export default function AuthLayout() {

  return (
    <div className="h-screen flex flex-col selection:bg-primary-container selection:text-on-primary-container bg-surface text-on-surface font-manrope overflow-hidden relative">
      <FloatingBackground />
      {/* TopNavBar - Always Dark per design requirement */}
      <nav className="fixed top-0 w-full z-50 bg-[#0f172a] border-b border-white/5">
        <div className="flex justify-between items-center px-8 py-4 max-w-full mx-auto">
          <Link to="/" className="flex items-center gap-2 text-2xl font-black tracking-tighter text-white">
            <span className="material-symbols-outlined text-primary text-3xl">balance</span>
            SecureJustice
          </Link>
          <div className="hidden md:flex items-center gap-8">
          </div>
        </div>
      </nav>

      {/* Main Content Area - Light/Dark responsive middle */}
      <main className="flex-1 overflow-y-auto hide-scrollbar scroll-smooth pt-32 pb-32">

        {/* Abstract Architectural Background Elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-surface-container-low/50 -skew-x-12 translate-x-1/4 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-1/4 h-1/2 bg-surface-container-high/20 blur-3xl pointer-events-none"></div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row gap-16 items-center justify-center">
            
            {/* Hero/Content Section */}
            <div className="w-full lg:w-1/2 flex flex-col gap-8">
              <div className="flex flex-col gap-4">
                <span className="text-sm font-bold tracking-[0.2em] text-primary uppercase">Welcome to the community</span>
                <h1 className="text-6xl md:text-7xl font-extrabold tracking-tighter text-on-surface leading-[1.1]">
                  Justice that works <br/> <span className="text-primary-dim">for everyone.</span>
                </h1>
              </div>
              <p className="text-on-surface-variant text-lg leading-relaxed max-w-lg">
                Whether you're reporting an incident, managing a case, or reviewing evidence, we're here to make the legal process clear, secure, and completely accessible.
              </p>
              
              {/* Trust Badge */}
              <div className="bg-surface-container-lowest p-8 relative rounded-lg shadow-sm max-w-sm border border-outline-variant/10">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
                <div className="flex items-start gap-4">
                  <span className="material-symbols-outlined text-primary text-3xl">verified_user</span>
                  <div>
                    <h3 className="font-bold text-on-surface">Safe & Secure</h3>
                    <p className="text-sm text-on-surface-variant">Your personal data is encrypted end-to-end, protecting your privacy.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Registration/Login Form Container */}
            <div className="w-full lg:w-[500px]">
              <Outlet />
            </div>

          </div>
        </div>
      </main>



      {/* Footer - Always Dark per design requirement */}
      <footer className="fixed bottom-0 left-0 w-full bg-[#0f172a] border-t border-white/5 z-50">
        <div className="flex flex-col md:flex-row justify-between items-center px-12 py-5 w-full gap-4">
          <div className="font-bold text-slate-400 text-xs tracking-widest uppercase">
            SecureJustice
          </div>
          <div className="flex gap-8">
            <a className="text-slate-500 hover:text-primary transition-all text-xs tracking-wide underline decoration-transparent hover:decoration-primary" href="#">Privacy</a>
            <a className="text-slate-500 hover:text-primary transition-all text-xs tracking-wide underline decoration-transparent hover:decoration-primary" href="#">Terms</a>
            <a className="text-slate-500 hover:text-primary transition-all text-xs tracking-wide underline decoration-transparent hover:decoration-primary" href="#">Help</a>
          </div>
          <div className="text-slate-500 text-xs tracking-wide">
            © {new Date().getFullYear()} SecureJustice.
          </div>
        </div>
      </footer>
    </div>
  );
}
