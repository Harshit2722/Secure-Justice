import { useOutletContext } from 'react-router-dom';
import CitizenPortal from './CitizenPortal';
import VictimPortal from './VictimPortal';

export default function DashboardRouter() {
  const { user } = useOutletContext();

  if (!user) return null;

  switch (user.role) {
    case 'citizen':
      return <CitizenPortal />;
    case 'victim':
    case 'defendant':
      return <VictimPortal />;
    default:
      // Fallback dashboard for other roles
      return (
        <div className="h-full flex flex-col items-center justify-center animate-in fade-in">
          <span className="material-symbols-outlined text-6xl text-primary mb-4">admin_panel_settings</span>
          <h2 className="text-3xl font-extrabold mb-2 capitalize">{user.role} Portal</h2>
          <p className="text-on-surface-variant text-lg bg-surface-container px-6 py-4 rounded-xl border border-outline-variant/20 shadow-sm mt-4">
            Dashboard under construction for your specific role.
          </p>
        </div>
      );
  }
}
