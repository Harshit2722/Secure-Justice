import { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { getMyAssignedCases } from '../utils/api';

export default function YourCases() {
  const { user } = useOutletContext();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const fetchCases = async () => {
    setLoading(true);
    try {
      const data = await getMyAssignedCases({ search, status });
      if (data.success) {
        setCases(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch assigned cases", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCases();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, status]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-extrabold text-on-surface tracking-tight">My Assigned Cases</h2>
          <p className="text-on-surface-variant font-medium mt-1">Manage First Information Reports specifically allocated to you for investigation.</p>
        </div>

        <div className="w-full md:w-auto flex flex-col md:flex-row gap-4 items-center">
          <div className="w-full md:w-80 relative group order-1">
            <input
              type="text"
              placeholder="Search your cases..."
              className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 pl-12 pr-12 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm group-hover:border-primary/30 transition-all font-medium"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">search</span>
          </div>

          <div className="relative w-full md:w-auto order-2">
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className={`w-12 h-12 rounded-full transition-all flex items-center justify-center border shadow-sm ${status ? 'bg-primary text-on-primary' : 'bg-surface-container-lowest border-outline-variant/30 text-on-surface-variant hover:text-primary hover:bg-surface-container'}`}
              title="Filter Status"
            >
              <span className="material-symbols-outlined text-xl">filter_alt</span>
            </button>

            {showFilterMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowFilterMenu(false)}></div>
                <div className="absolute right-0 mt-3 w-56 bg-surface-container-lowest border border-outline-variant/20 rounded-2xl shadow-2xl z-50 py-2 animate-in fade-in zoom-in-95 duration-200">
                  <p className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-on-surface-variant/50 border-b border-outline-variant/5 mb-1">Filter My Cases</p>
                  {['', 'pending', 'verified', 'under_investigation', 'closed'].map(s => (
                    <button
                      key={s}
                      onClick={() => { setStatus(s); setShowFilterMenu(false); }}
                      className={`w-full text-left px-4 py-3 text-xs hover:bg-primary/5 transition-colors capitalize font-bold flex items-center justify-between ${status === s ? 'text-primary' : 'text-on-surface-variant'}`}
                    >
                      {s === '' ? 'All Statuses' : s.replace('_', ' ')}
                      {status === s && <span className="material-symbols-outlined text-sm">check_circle</span>}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/20 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-96 gap-4">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
            <p className="text-on-surface-variant font-bold text-sm tracking-widest uppercase">Loading your cases...</p>
          </div>
        ) : cases.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant/10">
                  <th className="px-6 py-5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-on-surface-variant/80">FIR Reference</th>
                  <th className="px-6 py-5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-on-surface-variant/80">Citizen Info</th>
                  <th className="px-6 py-5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-on-surface-variant/80">Offense</th>
                  <th className="px-6 py-5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-on-surface-variant/80 text-center">Status</th>
                  <th className="px-6 py-5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-on-surface-variant/80 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {cases.map((c) => (
                  <tr key={c._id} className="hover:bg-primary/[0.02] transition-colors group">
                    <td className="px-6 py-5">
                      <span className="text-sm font-black text-on-surface">#{c.fir_number}</span>
                      <p className="text-[10px] text-on-surface-variant font-medium mt-0.5">{new Date(c.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-bold text-on-surface">{c.citizen?.name}</p>
                      <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">{c.citizen?.email}</p>
                    </td>
                    <td className="px-6 py-5">
                      <span className="inline-flex items-center px-3 py-1 rounded-lg text-[11px] font-black bg-surface-container border border-outline-variant/20 text-on-surface uppercase tracking-wide">
                        {c.crime_type}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="flex justify-center">
                        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase ${c.status === 'closed' ? 'bg-red-100 text-red-700' :
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
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <Link to={`/cases/${c._id}`} className="inline-flex items-center gap-2 px-5 py-2 bg-primary text-on-primary rounded-xl text-[11px] font-black transition-all shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95 whitespace-nowrap group/btn">
                        Manage Case
                        <span className="material-symbols-outlined text-[16px] group-hover/btn:translate-x-0.5 transition-transform">edit_square</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-96 text-center">
            <span className="material-symbols-outlined text-5xl text-outline-variant mb-4">assignment_turned_in</span>
            <p className="text-xl font-bold text-on-surface">No assigned cases</p>
            <p className="text-on-surface-variant text-sm mt-2">You haven't been assigned any First Information Reports yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
