import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function PortalLayout() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
    } else {
      setUser(JSON.parse(userData));
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) return null;

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
    { name: 'My Cases', path: '/cases', icon: 'gavel' },
    { name: 'Documents', path: '/documents', icon: 'folder' },
    { name: 'Settings', path: '/settings', icon: 'settings' }
  ];

  return (
    <div className="flex h-screen bg-surface overflow-hidden text-on-surface">
      {/* Sidebar */}
      <aside className="w-64 bg-surface-container-lowest border-r border-outline-variant/20 flex flex-col shadow-sm z-10">
        <div className="h-20 flex items-center px-8 border-b border-outline-variant/10">
          <span className="material-symbols-outlined text-primary text-3xl mr-3">balance</span>
          <h1 className="text-xl font-extrabold tracking-tight text-on-surface">Secure<span className="text-primary">Justice</span></h1>
        </div>
        
        <nav className="flex-1 py-8 px-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <Link 
              key={item.name}
              to={item.path}
              className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all ${
                location.pathname === item.path 
                  ? 'bg-primary-container text-on-primary-container font-bold shadow-sm' 
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
              <span className="text-sm tracking-wide">{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-outline-variant/10">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-low mb-4">
            <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold truncate">{user.name}</p>
              <p className="text-xs text-on-surface-variant uppercase tracking-wider">{user.role}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 text-error hover:bg-error-container hover:text-on-error-container rounded-lg transition-colors text-sm font-bold tracking-widest uppercase"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top Header */}
        <header className="h-20 bg-surface/80 backdrop-blur-md border-b border-outline-variant/10 flex items-center justify-between px-8 z-10 sticky top-0">
          <h2 className="text-2xl font-bold tracking-tight capitalize">{user.role} Portal</h2>
          <div className="flex items-center gap-5">
            <button className="relative p-2 text-on-surface-variant hover:text-primary transition-colors">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-error"></span>
            </button>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-8 relative">
           {/* Background Decoration */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none transform translate-x-1/3 -translate-y-1/3"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-3xl -z-10 pointer-events-none transform -translate-x-1/2 translate-y-1/3"></div>
          
          <div className="max-w-6xl mx-auto">
            <Outlet context={{ user }} />
          </div>
        </div>
      </main>
    </div>
  );
}
