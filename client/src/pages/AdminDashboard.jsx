import { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { getAdminStats, getAllFirs } from '../utils/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend, LineChart, Line, AreaChart, Area, LabelList
} from 'recharts';

const STATUS_COLORS = {
  PENDING: '#fff06eff',           // Pastel Yellow
  VERIFIED: '#59fa8eff',          // Pastel Green
  UNDER_INVESTIGATION: '#797bf7ff', // Pastel Blue
  CLOSED: '#ec8c8cff',            // Pastel Red
};

const STATUS_DARK_COLORS = {
  PENDING: '#B58105',           // Darker Yellow/Amber
  VERIFIED: '#15803d',          // Darker Green
  UNDER_INVESTIGATION: '#1d4ed8', // Darker Blue
  CLOSED: '#b91c1c',            // Darker Red
};

const CRIME_COLORS = {
  theft: '#fc87aaff',      
  fraud: 'rgba(102, 149, 236, 1)',      
  cybercrime: '#f8cb50ff', 
  violence: '#4ed48bff',   
  other: '#CBD5E1',
};

const ROLE_COLORS = {
  citizen: '#6366f1',
  police: '#0ea5e9',
  forensic: '#10b981',
  admin: '#f43f5e',
};

const EVIDENCE_COLORS = {
  PENDING: '#f59e0b',
  VERIFIED: '#10b981',
  TAMPERED: '#ef4444',
};

const DEFAULT_COLOR = '#CBD5E1';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const { name, value } = payload[0].payload;
    return (
      <div className="bg-white px-4 py-2 rounded-xl shadow-xl border border-outline-variant/10 animate-in fade-in zoom-in-95 duration-200">
        <p className="text-sm font-black text-slate-800">
          {name}: {value}
        </p>
      </div>
    );
  }
  return null;
};

export default function AdminDashboard() {
  const { user } = useOutletContext();
  const [stats, setStats] = useState({ 
    statusStats: [], 
    crimeTypeStats: [], 
    userRoleStats: [], 
    monthlyTrends: [],
    evidenceStats: [] 
  });
  const [recentCases, setRecentCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredStatusIndex, setHoveredStatusIndex] = useState(null);
  const [hoveredUserIndex, setHoveredUserIndex] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, casesData] = await Promise.all([
          getAdminStats(),
          getAllFirs({ limit: 5 })
        ]);

        if (statsData.success) {
          setStats(statsData.data);
        }
        if (casesData.success) {
          setRecentCases(casesData.data);
        }
        setError(null);
      } catch (err) {
        console.error("Failed to fetch admin data", err);
        setError("Unable to connect to the backend. Please ensure the server is running and you are logged in as an Admin.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statusData = ['PENDING', 'UNDER_INVESTIGATION', 'VERIFIED', 'CLOSED'].map(status => {
    const s = stats.statusStats?.find(stat => stat._id && stat._id.toUpperCase() === status);
    return { name: status, count: s ? s.count : 0 };
  });

  const crimeData = stats.crimeTypeStats?.map(c => ({
    name: c._id ? (c._id.charAt(0).toUpperCase() + c._id.slice(1)) : 'Unknown',
    value: c.count
  })) || [];

  const userData = stats.userRoleStats?.map(r => ({
    name: r._id ? (r._id.charAt(0).toUpperCase() + r._id.slice(1)) : 'Unknown',
    count: r.count
  })) || [];

  const trendData = stats.monthlyTrends?.map(t => ({
    name: `${t._id.month}/${t._id.year}`,
    count: t.count
  })) || [];

  const evidenceData = stats.evidenceStats?.map(e => ({
    name: e._id ? e._id.toUpperCase() : 'UNKNOWN',
    value: e.count
  })) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
        <span className="material-symbols-outlined text-6xl text-error mb-4">error_outline</span>
        <h3 className="text-xl font-bold text-on-surface mb-2">Connection Error</h3>
        <p className="text-on-surface-variant max-w-md">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-6 px-6 py-2 bg-primary text-on-primary rounded-xl font-bold hover:scale-105 transition-transform"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Welcome Section */}
      <section className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/20 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-container/40 rounded-bl-full -z-0 transition-transform duration-1000 group-hover:scale-110"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-extrabold mb-2 text-on-surface">Admin {user?.name || 'Portal'}</h2>
          <p className="text-on-surface-variant max-w-2xl text-lg">
            Global system oversight. Monitor platform-wide FIR activity, resource allocation, and user distribution.
          </p>
        </div>
      </section>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {userData.map((role) => (
          <div key={role.name} className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/20 shadow-sm hover:shadow-md transition-all">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/70 mb-1">{role.name}s</p>
            <div className="flex items-end justify-between">
              <h4 className="text-3xl font-black text-on-surface">{role.count}</h4>
              <span className="material-symbols-outlined text-primary/40 text-4xl">
                {role.name === 'Police' ? 'shield' : role.name === 'Forensic' ? 'science' : 'person'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Status Distribution */}
        <div className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/20 shadow-sm">
          <h3 className="text-xl font-bold tracking-tight flex items-center gap-2 mb-8">
            <span className="material-symbols-outlined text-primary">analytics</span> Platform-wide Case Status
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip cursor={{ fill: 'transparent' }} content={() => null} wrapperStyle={{ display: 'none' }} />
                <Bar 
                  dataKey="count" 
                  radius={[6, 6, 0, 0]} 
                  isAnimationActive={false}
                >
                  {statusData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={STATUS_COLORS[entry.name] || DEFAULT_COLOR} 
                      onMouseEnter={() => setHoveredStatusIndex(index)}
                      onMouseLeave={() => setHoveredStatusIndex(null)}
                      style={{ cursor: 'pointer' }}
                    />
                  ))}
                  <LabelList 
                    dataKey="count" 
                    position="top" 
                    content={(props) => {
                      const { x, y, width, value, index } = props;
                      if (index !== hoveredStatusIndex) return null;
                      return (
                        <g>
                          <text 
                            x={x + width / 2} 
                            y={y - 12} 
                            fill="white" 
                            textAnchor="middle" 
                            fontSize={14} 
                            fontWeight="900"
                            style={{ filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.6))' }}
                          >
                            {value}
                          </text>
                        </g>
                      );
                    }} 
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Evidence Integrity Pie Chart */}
        <div className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/20 shadow-sm">
          <h3 className="text-xl font-bold tracking-tight flex items-center gap-2 mb-8">
            <span className="material-symbols-outlined text-primary">verified_user</span> Platform Evidence Integrity
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={evidenceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                   isAnimationActive={false}
                >
                  {evidenceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={EVIDENCE_COLORS[entry.name] || DEFAULT_COLOR} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                  content={<CustomTooltip />} 
                  isAnimationActive={false}
                  contentStyle={{ backgroundColor: 'transparent', border: 'none' }}
                  itemStyle={{ color: 'white' }}
                  wrapperStyle={{ outline: 'none' }}
                />
                <Legend iconType="wye" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Crime Distribution */}
        <div className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/20 shadow-sm">
          <h3 className="text-xl font-bold tracking-tight flex items-center gap-2 mb-8">
            <span className="material-symbols-outlined text-primary">pie_chart</span> Global Crime Distribution
          </h3>
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
                   isAnimationActive={false}
                >
                  {crimeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CRIME_COLORS[entry.name.toLowerCase()] || DEFAULT_COLOR} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                  content={<CustomTooltip />} 
                  isAnimationActive={false}
                  contentStyle={{ backgroundColor: 'transparent', border: 'none' }}
                  itemStyle={{ color: 'white' }}
                  wrapperStyle={{ outline: 'none' }}
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Distribution */}
        <div className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/20 shadow-sm">
          <h3 className="text-xl font-bold tracking-tight flex items-center gap-2 mb-8">
            <span className="material-symbols-outlined text-primary">group</span> User Role Distribution
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={userData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" opacity={0.1} />
                <XAxis type="number" axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700 }} />
                <Tooltip cursor={{ fill: 'transparent' }} content={() => null} wrapperStyle={{ display: 'none' }} />
                <Bar 
                  dataKey="count" 
                  radius={[0, 6, 6, 0]} 
                  isAnimationActive={false}
                >
                  {userData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={ROLE_COLORS[entry.name.toLowerCase()] || DEFAULT_COLOR} 
                      onMouseEnter={() => setHoveredUserIndex(index)}
                      onMouseLeave={() => setHoveredUserIndex(null)}
                      style={{ cursor: 'pointer' }}
                    />
                  ))}
                  <LabelList 
                    dataKey="count" 
                    position="right" 
                    content={(props) => {
                      const { x, y, height, value, index } = props;
                      if (index !== hoveredUserIndex) return null;
                      return (
                        <g>
                          <text 
                            x={x + 25} 
                            y={y + height / 2 + 5} 
                            fill="white" 
                            textAnchor="middle" 
                            fontSize={14} 
                            fontWeight="900"
                            style={{ filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.6))' }}
                          >
                            {value}
                          </text>
                        </g>
                      );
                    }} 
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">list_alt</span> Platform Recent FIRs
          </h3>
          <Link to="/admin-assignments" className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
            Manage All <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>

        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/20 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant/10">
                <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-[0.2em] text-on-surface-variant/80">FIR Number</th>
                <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-[0.2em] text-on-surface-variant/80">Citizen</th>
                <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-[0.2em] text-on-surface-variant/80">Crime Type</th>
                <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-[0.2em] text-on-surface-variant/80">Status</th>
                <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-[0.2em] text-on-surface-variant/80 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {recentCases.map((c) => (
                <tr key={c._id} className="hover:bg-surface-container/30 transition-colors">
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
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                      c.status === 'closed' ? 'bg-red-100 text-red-700' :
                      c.status === 'verified' ? 'bg-emerald-100 text-emerald-700' :
                      c.status === 'under_investigation' ? 'bg-blue-100 text-blue-700' :
                      c.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      'bg-primary-container text-primary-dim'
                    }`}>
                      {c.status?.replace('_', ' ')}
                    </span>
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
