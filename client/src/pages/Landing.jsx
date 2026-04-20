import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col selection:bg-primary-container selection:text-on-primary-container bg-surface text-on-surface font-manrope">
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg shadow-sm dark:shadow-none">
        <div className="flex justify-between items-center px-8 py-4 max-w-full mx-auto">
          <Link to="/" className="text-2xl font-black tracking-tighter text-slate-800 dark:text-slate-100 font-manrope antialiased tracking-tight">
            SecureJustice
          </Link>
          <div className="flex items-center gap-4 md:gap-8">
            <Link to="/login" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors font-bold">Sign In</Link>
            <Link to="/register" className="silver-sheen text-on-primary px-6 py-2 rounded-lg font-bold transition-all hover:opacity-90 active:scale-95">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-grow pt-32 pb-20 flex flex-col relative overflow-hidden">
        {/* Abstract Architectural Background Elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-surface-container-low -skew-x-12 translate-x-1/4 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-1/4 h-1/2 bg-surface-container-high/30 blur-3xl pointer-events-none"></div>
        
        {/* Decorative Illustration Background */}
        <div className="absolute bottom-0 right-0 w-[40vw] h-[409px] z-0 opacity-10 pointer-events-none">
          <img className="w-full h-full object-contain" alt="abstract architectural sketch" src="https://lh3.googleusercontent.com/aida-public/AB6AXuANoclNbLJVs-naLTYtdbwpGZT8ClMQmraAhHpo2kDPM5fFTI-CgUGX26m6WTtGaaDS5q5R1U6cfoDo3NMmiqMVXuM1Jkd0PEyMZ6It_fsTfxP7hfuyJk1DGyGS3gIm04Z5kutiwIaj1E62Fp-m3KxPvrfOFYvm-H17z9ThFOmBtITrPSPynV5NRb09MnSriz1HDYXA4daWyOH3kN6eX-LI8NaqGYmwnLOoFAUmKwMao0YkLKwgoNFLy5zmdOA3i8Prfmq87sv7lsI" />
        </div>

        {/* Hero Section */}
        <section className="relative pt-12 pb-20 lg:pt-24 lg:pb-32 overflow-hidden z-10">
          <div className="relative max-w-7xl mx-auto px-6 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-highest text-primary text-sm font-bold tracking-[0.2em] uppercase mb-8">
              <span className="flex h-2 w-2 rounded-full bg-primary"></span>
              Modernizing the Justice System
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-on-surface mb-8 max-w-4xl mx-auto leading-[1.1]">
              Justice, <span className="text-primary-dim">Unified</span> and Secure.
            </h1>
            <p className="text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto mb-10 leading-relaxed">
              A secure digital platform for transparent FIR management, tamper-proof digital evidence handling, and seamless collaboration across the judicial ecosystem.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-on-primary text-lg font-bold py-4 px-8 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2">
                Join the Platform
                <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
              <Link to="/login" className="w-full sm:w-auto bg-surface-container-lowest hover:bg-surface-container-low text-on-surface border border-outline text-lg font-bold py-4 px-8 rounded-xl transition-all shadow-sm flex items-center justify-center">
                Access Portal
              </Link>
            </div>
          </div>
        </section>

        {/* Stats/Trust Bar */}
        <section className="relative z-10 border-y border-outline-variant bg-surface-container-lowest/50 backdrop-blur-sm mt-10">
          <div className="max-w-7xl mx-auto px-6 py-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-outline-variant">
              <div>
                <p className="text-3xl font-bold text-on-surface">100%</p>
                <p className="text-sm font-medium text-on-surface-variant mt-1">Tamper-Proof Records</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-on-surface">E2E</p>
                <p className="text-sm font-medium text-on-surface-variant mt-1">Encrypted Data</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-on-surface">7</p>
                <p className="text-sm font-medium text-on-surface-variant mt-1">Integrated Roles</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-on-surface">24/7</p>
                <p className="text-sm font-medium text-on-surface-variant mt-1">Real-time Access</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 relative z-10">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tighter text-on-surface mb-4">Everything you need to handle cases securely</h2>
              <p className="text-lg text-on-surface-variant leading-relaxed">Built specifically for law enforcement, legal professionals, and citizens to ensure transparency and trust in the judicial process.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-surface-container-lowest rounded-3xl p-8 shadow-sm border border-outline-variant hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-primary-container rounded-2xl flex items-center justify-center mb-6 text-on-primary-container">
                  <span className="material-symbols-outlined text-2xl">description</span>
                </div>
                <h3 className="text-xl font-bold text-on-surface mb-3">Digital FIR Management</h3>
                <p className="text-on-surface-variant leading-relaxed">File, track, and manage First Information Reports completely online. Automated routing ensures the right precinct handles the case immediately.</p>
              </div>

              {/* Feature 2 */}
              <div className="bg-surface-container-lowest rounded-3xl p-8 shadow-sm border border-outline-variant hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-tertiary-container rounded-2xl flex items-center justify-center mb-6 text-on-tertiary-container">
                  <span className="material-symbols-outlined text-2xl">lock</span>
                </div>
                <h3 className="text-xl font-bold text-on-surface mb-3">Immutable Evidence Locker</h3>
                <p className="text-on-surface-variant leading-relaxed">Upload digital evidence with cryptographic hashing. Chain of custody is automatically maintained, preventing tampering and ensuring admissibility.</p>
              </div>

              {/* Feature 3 */}
              <div className="bg-surface-container-lowest rounded-3xl p-8 shadow-sm border border-outline-variant hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-secondary-container rounded-2xl flex items-center justify-center mb-6 text-on-secondary-container">
                  <span className="material-symbols-outlined text-2xl">group</span>
                </div>
                <h3 className="text-xl font-bold text-on-surface mb-3">Multi-Stakeholder Portal</h3>
                <p className="text-on-surface-variant leading-relaxed">Dedicated interfaces for Citizens, Police, Forensics, Lawyers, and the Court. Everyone sees exactly what they need, when they need it.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-100 dark:bg-slate-950 w-full relative z-20">
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
