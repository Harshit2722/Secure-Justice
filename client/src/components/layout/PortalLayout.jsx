import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import FloatingBackground from './FloatingBackground';
import { fetchNotifications, fetchUnreadCount, markNotificationRead, markAllNotificationsRead } from '../../utils/notificationApi';

export default function PortalLayout() {
  const [user, setUser] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let userData = localStorage.getItem('user');
    let token = localStorage.getItem('token');

    if (!userData || !token) {
      navigate('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);

    // Initial redirect based on role if on generic /dashboard
    if (location.pathname === '/dashboard') {
      if (parsedUser.role === 'police') navigate('/police-dashboard');
      if (parsedUser.role === 'forensic') navigate('/forensics');
      if (parsedUser.role === 'admin') navigate('/admin-dashboard');
    }
  }, [navigate, location.pathname]);

  useEffect(() => {
    if (!user) return;

    const getCount = async () => {
      try {
        const count = await fetchUnreadCount();
        setUnreadCount(count);
      } catch (err) {
        console.error('Failed to fetch unread count:', err);
      }
    };

    getCount();
    const interval = setInterval(getCount, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    if (showNotifications && user) {
      const getNotifs = async () => {
        try {
          const data = await fetchNotifications();
          setNotifications(data.data);
        } catch (err) {
          console.error('Failed to fetch notifications:', err);
        }
      };
      getNotifs();
    }
  }, [showNotifications, user]);

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      try {
        await markNotificationRead(notif._id);
        setUnreadCount(prev => Math.max(0, prev - 1));
        setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n));
      } catch (err) {
        console.error('Failed to mark read', err);
      }
    }
    setShowNotifications(false);
    navigate(notif.link);
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all read', err);
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'fir_filed': return { icon: 'post_add', color: 'text-primary', bg: 'bg-primary/10' };
      case 'status_changed': return { icon: 'published_with_changes', color: 'text-blue-500', bg: 'bg-blue-500/10' };
      case 'officer_assigned': return { icon: 'local_police', color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
      case 'forensic_assigned': return { icon: 'science', color: 'text-purple-500', bg: 'bg-purple-500/10' };
      case 'evidence_uploaded': return { icon: 'upload_file', color: 'text-amber-500', bg: 'bg-amber-500/10' };
      case 'evidence_verified': return { icon: 'verified', color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
      case 'tampered_alert': return { icon: 'warning', color: 'text-error', bg: 'bg-error/10' };
      case 'new_user': return { icon: 'person_add', color: 'text-primary', bg: 'bg-primary/10' };
      default: return { icon: 'notifications', color: 'text-primary', bg: 'bg-primary/10' };
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) return null;

  const citizenNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
    { name: 'My Cases', path: '/cases', icon: 'gavel' },
    { name: 'Documents', path: '/documents', icon: 'folder' },
    { name: 'Settings', path: '/settings', icon: 'settings' }
  ];

  const policeNavItems = [
    { name: 'Dashboard', path: '/police-dashboard', icon: 'dashboard' },
    { name: 'All Cases', path: '/active-cases', icon: 'list_alt' },
    { name: 'My Cases', path: '/your-cases', icon: 'assignment' },
    { name: 'Documents', path: '/documents', icon: 'folder' },
    { name: 'Settings', path: '/settings', icon: 'settings' }
  ];

  const forensicNavItems = [
    { name: 'Forensic Hub', path: '/forensics', icon: 'dashboard' },
    { name: 'All Cases', path: '/forensic-active-cases', icon: 'list_alt' },
    { name: 'My Cases', path: '/forensic-your-cases', icon: 'assignment' },
    { name: 'Documents', path: '/documents', icon: 'folder' },
    { name: 'Settings', path: '/settings', icon: 'settings' }
  ];

  const adminNavItems = [
    { name: 'Dashboard', path: '/admin-dashboard', icon: 'dashboard' },
    { name: 'Assignments', path: '/admin-assignments', icon: 'assignment_turned_in' },
    { name: 'Users', path: '/admin-users', icon: 'group' },
    { name: 'Documents', path: '/documents', icon: 'folder' },
    { name: 'Settings', path: '/settings', icon: 'settings' }
  ];

  let navItems = citizenNavItems;
  let dashboardPath = '/dashboard';
  if (user.role === 'police') {
    navItems = policeNavItems;
    dashboardPath = '/police-dashboard';
  }
  if (user.role === 'forensic') {
    navItems = forensicNavItems;
    dashboardPath = '/forensics';
  }
  if (user.role === 'admin') {
    navItems = adminNavItems;
    dashboardPath = '/admin-dashboard';
  }

  return (
    <div className="flex h-screen bg-surface overflow-hidden text-on-surface relative">
      <FloatingBackground />
      {/* Sidebar */}
      <aside
        className="w-64 border-r border-outline-variant/20 flex flex-col shadow-sm z-10"
        style={{ backgroundColor: '#0f172a' }}
      >
        <Link to={dashboardPath} className="h-20 flex items-center px-8 border-b border-outline-variant/10 transition-colors">
          <span className="material-symbols-outlined text-primary text-3xl mr-3">balance</span>
          <h1 className="text-xl font-extrabold tracking-tight text-white">Secure<span className="text-primary">Justice</span></h1>
        </Link>

        <nav className="flex-1 py-8 px-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all ${location.pathname === item.path
                  ? 'bg-primary-container text-on-primary-container font-bold shadow-sm'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
            >
              <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
              <span className="text-sm tracking-wide">{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-outline-variant/10">
          <Link
            to="/settings"
            className="flex items-center gap-3 p-3 rounded-xl mb-4 border border-white/10 transition-all group hover:border-white/20"
            style={{ backgroundColor: 'rgba(30,41,59,0.8)' }}
          >
            <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
              {user.name ? user.name.charAt(0) : 'U'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold truncate group-hover:text-primary transition-colors" style={{ color: '#ffffff' }}>{user.name}</p>
              <p className="text-xs uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.7)' }}>{user.role}</p>
            </div>
          </Link>
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
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Header */}
        <header className="h-20 bg-surface/80 backdrop-blur-md border-b border-outline-variant/10 flex items-center justify-between px-4 md:px-8 z-10 sticky top-0">
          <h2 className="text-2xl font-bold tracking-tight capitalize">{user.role} Portal</h2>
          <div className="flex items-center gap-5">
            <button
              id="notif-bell-btn"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-full transition-colors flex items-center justify-center"
            >
              <span className="material-symbols-outlined">notifications</span>
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-error border-2 border-surface text-[8px] font-bold text-white flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Notifications Panel — fixed overlay so nothing clips it */}
        {showNotifications && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-[90]"
              onClick={() => setShowNotifications(false)}
            />
            {/* Panel */}
            <div className="fixed top-20 right-6 w-96 bg-surface-container-lowest border border-outline-variant/20 rounded-2xl shadow-2xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-4 border-b border-outline-variant/10 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-on-surface">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 bg-error text-white text-[10px] font-bold rounded-full">{unreadCount}</span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button onClick={handleMarkAllRead} className="text-xs text-primary font-bold hover:underline">Mark all read</button>
                )}
              </div>
              <div className="max-h-[420px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-10 text-center">
                    <span className="material-symbols-outlined text-4xl text-on-surface-variant/30 block mb-3">notifications_off</span>
                    <p className="text-sm text-on-surface-variant/60 font-medium">You're all caught up!</p>
                  </div>
                ) : (
                  notifications.map(notification => {
                    const iconData = getNotificationIcon(notification.type);
                    return (
                      <div
                        key={notification._id}
                        role="button"
                        tabIndex={0}
                        onClick={() => handleNotificationClick(notification)}
                        onKeyDown={(e) => e.key === 'Enter' && handleNotificationClick(notification)}
                        className={`relative flex gap-4 p-4 border-b border-outline-variant/10 cursor-pointer select-none transition-colors hover:bg-primary/5 active:bg-primary/10 ${
                          !notification.isRead ? 'bg-primary/[0.04]' : ''
                        }`}
                      >
                        {!notification.isRead && (
                          <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                        )}
                        <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center ${iconData.bg} ${iconData.color} mt-0.5`}>
                          <span className="material-symbols-outlined text-[20px]">{iconData.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0 pr-1">
                          <div className="flex justify-between items-start gap-2 mb-1">
                            <p className={`text-sm leading-snug ${!notification.isRead ? 'font-bold text-on-surface' : 'font-semibold text-on-surface-variant'}`}>
                              {notification.title}
                            </p>
                            <span className="text-[10px] text-on-surface-variant/60 font-medium whitespace-nowrap flex-shrink-0">{formatTime(notification.createdAt)}</span>
                          </div>
                          <p className="text-xs text-on-surface-variant/80 line-clamp-2 leading-relaxed">
                            {notification.message}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              <div className="p-3 border-t border-outline-variant/10 text-center">
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-xs font-bold text-primary hover:underline uppercase tracking-widest"
                >
                  Close
                </button>
              </div>
            </div>
          </>
        )}

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 relative">
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
