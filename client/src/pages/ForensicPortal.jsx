import { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { getForensicStats, getAllFirs } from '../utils/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend, LabelList
} from 'recharts';

const STATUS_COLORS = {
  PENDING: '#fff06eff',           // Pastel Yellow
  VERIFIED: '#59fa8eff',          // Pastel Green
  TAMPERED: '#ec8c8cff',            // Pastel Red
};

const STATUS_DARK_COLORS = {
  PENDING: '#B58105',           // Darker Yellow/Amber
  VERIFIED: '#15803d',          // Darker Green
  TAMPERED: '#b91c1c',            // Darker Red
};

const TYPE_COLORS = {
  Image: '#fc87aaff',      // Pastel Pink
  Document: 'rgba(102, 149, 236, 1)',      // Pastel Light Blue
  Video: '#f8cb50ff', // Pastel Orange
  Other: '#4ed48bff',   // Pastel Green
};

const DEFAULT_COLOR = '#CBD5E1';

const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const { name, value, fill } = payload[0].payload;
    return (
      <div className="bg-white px-5 py-2.5 rounded-2xl shadow-2xl border border-white/20 animate-in fade-in zoom-in-95 duration-200">
        <p className="text-sm font-black tracking-tight" style={{ color: fill || '#000000' }}>
          {name}: {value}
        </p>
      </div>
    );
  }
  return null;
};

export default function ForensicPortal() {
  const { user } = useOutletContext();

  const [stats, setStats] = useState({ statusStats: [], typeStats: [] });
  const [recentCases, setRecentCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredBarIndex, setHoveredBarIndex] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, casesData] = await Promise.all([
          getForensicStats(),
          getAllFirs({ limit: 5 })
        ]);

        if (statsData.success) {
          setStats(statsData.data);
        }
        if (casesData.success) {
          setRecentCases(casesData.data);
        }
      } catch (err) {
        console.error("Failed to fetch forensic data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const statusOrder = ['PENDING', 'VERIFIED', 'TAMPERED'];
  const statusData = statusOrder.map(orderStatus => {
    const s = stats.statusStats.find(stat => stat._id.toUpperCase() === orderStatus.toUpperCase());
    return {
      name: orderStatus,
      count: s ? s.count : 0
    };
  });

  const typeData = stats.typeStats.map(c => ({
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
          <h2 className="text-3xl font-extrabold mb-2 text-on-surface">Examiner {user?.name || 'Portal'}</h2>
          <p className="text-on-surface-variant max-w-2xl text-lg">
            Monitor digital evidence integrity, perform cryptographic analysis, and maintain the chain of custody for jurisdiction-wide cases.
          </p>
        </div>
      </section>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Evidence Status - Bar Graph */}
        <div className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/20 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">analytics</span> Evidence Integrity Overview
            </h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={statusData}
                margin={{ top: 30, right: 30, left: 0, bottom: 0 }}
              >
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
                <Bar
                  dataKey="count"
                  radius={[6, 6, 0, 0]}
                  isAnimationActive={true}
                >
                  {statusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={STATUS_COLORS[entry.name.toUpperCase()] || DEFAULT_COLOR}
                      onMouseEnter={() => setHoveredBarIndex(index)}
                      onMouseLeave={() => setHoveredBarIndex(null)}
                      style={{ cursor: 'pointer' }}
                    />
                  ))}
                  <LabelList
                    dataKey="count"
                    position="top"
                    content={(props) => {
                      const { x, y, width, value, index } = props;
                      if (index !== hoveredBarIndex) return null;
                      return (
                        <g>
                          <rect
                            x={x + width / 2 - 14}
                            y={y - 28}
                            width={28}
                            height={22}
                            fill="#ffffff"
                            rx={6}
                            style={{ filter: 'drop-shadow(0 4px 6px -1px rgb(0 0 0 / 0.1))' }}
                          />
                          <text
                            x={x + width / 2}
                            y={y - 12}
                            fill={STATUS_DARK_COLORS[statusData[index].name.toUpperCase()] || "#475569"}
                            textAnchor="middle"
                            fontSize={13}
                            fontWeight="900"
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

        {/* Evidence Type Distribution - Pie Chart */}
        <div className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/20 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">pie_chart</span> Evidence Type Distribution
            </h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  isAnimationActive={true}
                >
                  {typeData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={TYPE_COLORS[entry.name] || DEFAULT_COLOR}
                      style={{ outline: 'none', transition: 'all 0.3s ease' }}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} isAnimationActive={false} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <section>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h3 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">list_alt</span> Recent Incident Reports
          </h3>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Link to="/forensic-active-cases" className="text-primary hover:bg-primary/10 p-2.5 rounded-xl transition-all flex items-center justify-center shrink-0" title="View All Reports">
              <span className="material-symbols-outlined">open_in_new</span>
            </Link>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/20 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant/10">
                <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-[0.2em] text-on-surface-variant/80">FIR Number</th>
                <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-[0.2em] text-on-surface-variant/80">Citizen</th>
                <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-[0.2em] text-on-surface-variant/80">Crime Type</th>
                <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-[0.2em] text-on-surface-variant/80">Officer</th>
                <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-[0.2em] text-on-surface-variant/80">Forensic</th>
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
                  <td className="px-6 py-5">
                    {c.assigned_officer ? (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-police-container text-police flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[14px]">shield_person</span>
                        </div>
                        <span className="text-[10px] font-bold text-on-surface truncate max-w-[80px]">{c.assigned_officer.name}</span>
                      </div>
                    ) : (
                      <span className="text-[9px] text-on-surface-variant/40 font-bold uppercase tracking-widest">Unassigned</span>
                    )}
                  </td>
                  <td className="px-6 py-5">
                    {c.assigned_forensic ? (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-forensic-container text-forensic flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[14px]">science</span>
                        </div>
                        <span className="text-[10px] font-bold text-on-surface truncate max-w-[80px]">{c.assigned_forensic.name}</span>
                      </div>
                    ) : (
                      <span className="text-[9px] text-on-surface-variant/40 font-bold uppercase tracking-widest">Unassigned</span>
                    )}
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${c.status === 'closed' ? 'bg-red-100 text-red-700' :
                        c.status === 'verified' ? 'bg-emerald-100 text-emerald-700' :
                          c.status === 'under_investigation' ? 'bg-blue-100 text-blue-700' :
                            c.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                              'bg-primary-container text-primary-dim'
                      }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${c.status === 'closed' ? 'bg-red-500' :
                          c.status === 'verified' ? 'bg-emerald-500' :
                            c.status === 'under_investigation' ? 'bg-blue-500' :
                              c.status === 'pending' ? 'bg-amber-500' :
                                'bg-primary'
                        }`}></span>
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
