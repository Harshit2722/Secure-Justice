import { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { getPoliceStats, getAllFirs } from '../utils/api';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend
} from 'recharts';

const COLORS = ['#545f73', '#93000A', '#1C2022', '#506076', '#a7c8ff'];

export default function PolicePortal() {
  const { user } = useOutletContext();

  const [stats, setStats] = useState({ statusStats: [], crimeTypeStats: [] });
  const [recentCases, setRecentCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, casesData] = await Promise.all([
          getPoliceStats(),
          getAllFirs({ limit: 5 })
        ]);

        if (statsData.success) {
          setStats(statsData.data);
        }
        if (casesData.success) {
          setRecentCases(casesData.data);
        }
      } catch (err) {
        console.error("Failed to fetch police data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const statusData = stats.statusStats.map(s => ({
    name: s._id.toUpperCase(),
    count: s.count
  }));

  const crimeData = stats.crimeTypeStats.map(c => ({
    name: c._id.charAt(0).toUpperCase() + c._id.slice(1),
    value: c.count
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Welcome Section */}
      <section className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/20 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-container/40 rounded-bl-full -z-0 transition-transform duration-1000 group-hover:scale-110"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-extrabold mb-2 text-on-surface">Officer {user?.name || 'Portal'}</h2>
          <p className="text-on-surface-variant max-w-2xl text-lg">
            Monitor jurisdiction-wide incident reports, analyze crime patterns, and manage case progression in real-time.
          </p>
        </div>
      </section>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Status Distribution - Bar Graph */}
        <div className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/20 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">analytics</span> Case Status Overview
            </h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' 
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Crime Type Distribution - Pie Chart */}
        <div className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/20 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">pie_chart</span> Incident Distribution
            </h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={crimeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {crimeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' 
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">list_alt</span> Recent Incident Reports
          </h3>
          <Link to="/active-cases" className="text-primary hover:underline font-bold text-sm tracking-wide uppercase">
            View All Reports
          </Link>
        </div>

        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/20 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant/10">
                <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-[0.2em] text-on-surface-variant/80">FIR Number</th>
                <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-[0.2em] text-on-surface-variant/80">Citizen</th>
                <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-[0.2em] text-on-surface-variant/80">Crime Type</th>
                <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-[0.2em] text-on-surface-variant/80">Location</th>
                <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-[0.2em] text-on-surface-variant/80">Status</th>
                <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-[0.2em] text-on-surface-variant/80 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {recentCases.map((c) => (
                <tr key={c._id} className="hover:bg-surface-container/30 transition-colors group">
                  <td className="px-6 py-5 font-bold text-sm text-on-surface">#{c.fir_number}</td>
                  <td className="px-6 py-5">
                    <p className="text-sm font-bold text-on-surface">{c.citizen?.name}</p>
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">{c.citizen?.email}</p>
                  </td>
                  <td className="px-6 py-5">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary uppercase tracking-wide">
                      {c.crime_type}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-sm font-medium text-on-surface-variant">{c.location}</td>
                  <td className="px-6 py-5">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                      c.status === 'closed' ? 'bg-red-100 text-red-700' :
                      c.status === 'verified' ? 'bg-emerald-100 text-emerald-700' :
                      c.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      'bg-primary-container text-primary-dim'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        c.status === 'closed' ? 'bg-red-500' :
                        c.status === 'verified' ? 'bg-emerald-500' :
                        c.status === 'pending' ? 'bg-amber-500' :
                        'bg-primary'
                      }`}></span>
                      <span className="uppercase">{c.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <Link to={`/cases/${c._id}`} className="p-2 hover:bg-primary/10 rounded-full transition-colors text-primary inline-block">
                      <span className="material-symbols-outlined">chevron_right</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
