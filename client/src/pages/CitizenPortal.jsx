import { useOutletContext } from 'react-router-dom';

export default function CitizenPortal() {
  const { user } = useOutletContext();

  const quickActions = [
    { title: 'File an FIR', icon: 'description', color: 'bg-primary', text: 'text-on-primary', desc: 'Register a new First Information Report' },
    { title: 'Report Cybercrime', icon: 'bug_report', color: 'bg-error', text: 'text-on-error', desc: 'Report online fraud or harassment' },
    { title: 'Request Certificate', icon: 'verified', color: 'bg-secondary', text: 'text-on-secondary', desc: 'Apply for character or clearance certificate' },
    { title: 'Emergency Contact', icon: 'sos', color: 'bg-error-container', text: 'text-on-error-container', desc: 'View local emergency response numbers' },
  ];

  const recentActivities = [
    { id: 'FIR-2026-894', type: 'Theft Report', status: 'Under Investigation', date: 'Oct 12, 2026', icon: 'gavel' },
    { id: 'REQ-CC-102', type: 'Character Certificate', status: 'Approved', date: 'Sep 28, 2026', icon: 'task_alt' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Welcome Section */}
      <section className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/20 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-container/40 rounded-bl-full -z-0 transition-transform duration-1000 group-hover:scale-110"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-extrabold mb-2">Welcome back, {user?.name}</h2>
          <p className="text-on-surface-variant max-w-2xl text-lg">
            Access justice services quickly and securely. You can file reports, track case statuses, and manage your documents all in one place.
          </p>
        </div>
      </section>

      {/* Stats Row */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Active Reports', value: '1', icon: 'assignment', color: 'text-primary' },
          { label: 'Pending Verifications', value: '0', icon: 'pending_actions', color: 'text-secondary' },
          { label: 'Closed Cases', value: '2', icon: 'check_circle', color: 'text-tertiary' }
        ].map(stat => (
          <div key={stat.label} className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/20 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center bg-surface-container ${stat.color}`}>
              <span className="material-symbols-outlined text-3xl">{stat.icon}</span>
            </div>
            <div>
              <p className="text-sm font-bold tracking-widest text-on-surface-variant uppercase">{stat.label}</p>
              <h3 className="text-3xl font-extrabold mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Quick Actions */}
        <section className="lg:col-span-2 space-y-4">
          <h3 className="text-xl font-bold tracking-tight mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">bolt</span> Quick Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickActions.map(action => (
              <button key={action.title} className="text-left group relative bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/20 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-0 pointer-events-none"></div>
                <div className="relative z-10">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${action.color} ${action.text} shadow-inner`}>
                    <span className="material-symbols-outlined">{action.icon}</span>
                  </div>
                  <h4 className="font-extrabold text-lg mb-1 group-hover:text-primary transition-colors">{action.title}</h4>
                  <p className="text-sm text-on-surface-variant line-clamp-2">{action.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Recent Activity */}
        <section className="space-y-4">
          <h3 className="text-xl font-bold tracking-tight mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">history</span> Recent Activity
          </h3>
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 shadow-sm overflow-hidden divide-y divide-outline-variant/10">
            {recentActivities.length > 0 ? recentActivities.map(activity => (
              <div key={activity.id} className="p-5 hover:bg-surface-container/50 transition-colors cursor-pointer">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xs font-bold text-primary tracking-widest">{activity.id}</span>
                  <span className="text-xs text-on-surface-variant bg-surface-container px-2 py-1 rounded-md">{activity.date}</span>
                </div>
                <h4 className="font-bold flex items-center gap-2">
                  {activity.type}
                </h4>
                <div className="mt-3 flex items-center gap-2 text-sm text-on-surface-variant">
                  <span className={`w-2 h-2 rounded-full ${activity.status === 'Approved' ? 'bg-tertiary' : 'bg-secondary'}`}></span>
                  {activity.status}
                </div>
              </div>
            )) : (
              <div className="p-8 text-center text-on-surface-variant flex flex-col items-center">
                <span className="material-symbols-outlined text-4xl mb-3 opacity-50">inbox</span>
                <p>No recent activity found.</p>
              </div>
            )}
          </div>
        </section>
        
      </div>
    </div>
  );
}
