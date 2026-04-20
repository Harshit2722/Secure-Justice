import { Outlet, Link } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col selection:bg-primary-container selection:text-on-primary-container bg-surface text-on-surface font-manrope">
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg shadow-sm dark:shadow-none">
        <div className="flex justify-between items-center px-8 py-4 max-w-full mx-auto">
          <Link to="/" className="text-2xl font-black tracking-tighter text-slate-800 dark:text-slate-100 font-manrope antialiased tracking-tight">
            SecureJustice
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors" href="#">How it Works</a>
            <a className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors" href="#">Community</a>
            <a className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors" href="#">Support</a>
            <Link to="/login" className="silver-sheen text-on-primary px-6 py-2 rounded-lg font-bold transition-all hover:opacity-90 active:scale-95">Sign In</Link>
          </div>
        </div>
      </nav>

      {/* Main Registration Canvas */}
      <main className="flex-grow pt-32 pb-20 flex items-center justify-center relative overflow-hidden">
        {/* Abstract Architectural Background Elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-surface-container-low -skew-x-12 translate-x-1/4 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-1/4 h-1/2 bg-surface-container-high/30 blur-3xl pointer-events-none"></div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row gap-16 items-center justify-center">
            
            {/* Hero/Content Section (Polished but Human) */}
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
              <div className="bg-surface-container-lowest p-8 relative rounded-lg shadow-sm max-w-sm">
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

            {/* Registration/Login Form */}
            <div className="w-full lg:w-[540px]">
              <Outlet />
            </div>

          </div>
        </div>
      </main>

      {/* Decorative Illustration Background */}
      <div className="fixed bottom-0 right-0 w-[40vw] h-[409px] z-0 opacity-10 pointer-events-none">
        <img className="w-full h-full object-contain" alt="abstract architectural sketch" src="https://lh3.googleusercontent.com/aida-public/AB6AXuANoclNbLJVs-naLTYtdbwpGZT8ClMQmraAhHpo2kDPM5fFTI-CgUGX26m6WTtGaaDS5q5R1U6cfoDo3NMmiqMVXuM1Jkd0PEyMZ6It_fsTfxP7hfuyJk1DGyGS3gIm04Z5kutiwIaj1E62Fp-m3KxPvrfOFYvm-H17z9ThFOmBtITrPSPynV5NRb09MnSriz1HDYXA4daWyOH3kN6eX-LI8NaqGYmwnLOoFAUmKwMao0YkLKwgoNFLy5zmdOA3i8Prfmq87sv7lsI" />
      </div>

      {/* Footer */}
      <footer className="bg-slate-100 dark:bg-slate-950 w-full relative">
        <div className="flex flex-col md:flex-row justify-between items-center px-12 py-12 w-full gap-6">
          <div className="font-bold text-slate-800 dark:text-slate-100 font-manrope text-sm tracking-wide">
            SecureJustice
          </div>
          <div className="flex gap-8">
            <a className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white underline transition-all font-manrope text-sm tracking-wide" href="#">Privacy</a>
            <a className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white underline transition-all font-manrope text-sm tracking-wide" href="#">Terms</a>
            <a className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white underline transition-all font-manrope text-sm tracking-wide" href="#">Help</a>
          </div>
          <div className="text-slate-500 dark:text-slate-400 font-manrope text-sm tracking-wide">
            © {new Date().getFullYear()} SecureJustice.
          </div>
        </div>
      </footer>
    </div>
  );
}
