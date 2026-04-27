import { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { getMyAssignedCases } from '../utils/api';

export default function YourCases() {
  const { user } = useOutletContext();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [crimeFilter, setCrimeFilter] = useState('');
  const [activeTab, setActiveTab] = useState('active'); // 'active', 'closed', 'all'
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showCrimeMenu, setShowCrimeMenu] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 8;

  const fetchCases = async () => {
    setLoading(true);
    try {
      let params = { page, limit, search, status, crime_type: crimeFilter };

      if (activeTab === 'active') {
        if (!status) params.status = 'under_investigation';
      } else if (activeTab === 'closed') {
        params.status = 'closed';
      }

      const data = await getMyAssignedCases(params);
      if (data.success) {
        setCases(data.data);
        setTotalPages(data.pages);
        setTotal(data.total);
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
  }, [page, search, status, crimeFilter, activeTab]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h2 className="text-3xl font-extrabold text-on-surface tracking-tight">My Assigned Cases</h2>
          <p className="text-on-surface-variant font-medium mt-1">Manage First Information Reports specifically allocated to you for investigation.</p>
        </div>

        <div className="w-full lg:w-auto flex flex-col md:flex-row gap-4 items-center">
          {/* Search Bar */}
          <div className="w-full md:w-[450px] relative group order-1">
            <input
              type="text"
              placeholder="Search your records..."
              className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 pl-12 pr-12 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 shadow-sm transition-all font-medium text-sm"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">search</span>
          </div>
        </div>
      </div>

      {/* Power Filters Row */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-1.5 p-1.5 bg-surface-container-lowest border border-outline-variant/10 rounded-2xl w-fit shadow-sm">
          {[
            { id: 'active', label: 'Active', icon: 'bolt' },
            { id: 'closed', label: 'Closed', icon: 'inventory_2' },
            { id: 'all', label: 'All Cases', icon: 'list' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setPage(1);
              }}
              className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab.id
                  ? 'bg-primary text-on-primary shadow-lg shadow-primary/20 scale-[1.02]'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
            >
              <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
            <button
              onClick={() => { setShowCrimeMenu(!showCrimeMenu); }}
              className={`flex items-center gap-3 px-5 py-2.5 rounded-xl border text-xs font-black uppercase tracking-widest transition-all ${crimeFilter ? 'bg-primary/5 border-primary text-primary' : 'bg-surface-container-lowest border-outline-variant/20 text-on-surface-variant hover:border-primary/50'}`}
            >
              <span className="material-symbols-outlined text-[18px]">category</span>
              {crimeFilter || 'Crime Category'}
              <span className={`material-symbols-outlined text-[18px] transition-transform duration-300 ${showCrimeMenu ? 'rotate-180' : ''}`}>expand_more</span>
            </button>
            {showCrimeMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowCrimeMenu(false)}></div>
                <div className="absolute left-0 mt-2 w-56 bg-surface-container-lowest border border-outline-variant/20 rounded-2xl shadow-2xl z-50 py-2 animate-in fade-in zoom-in-95 duration-200">
                  {['', 'theft', 'cybercrime', 'fraud', 'violence', 'other'].map(t => (
                    <button
                      key={t}
                      onClick={() => { setCrimeFilter(t); setShowCrimeMenu(false); setPage(1); }}
                      className={`w-full text-left px-4 py-3 text-xs hover:bg-primary/5 transition-colors capitalize font-bold flex items-center justify-between ${crimeFilter === t ? 'text-primary' : 'text-on-surface-variant'}`}
                    >
                      {t || 'All Categories'}
                      {crimeFilter === t && <span className="material-symbols-outlined text-sm">check</span>}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => { setShowStatusMenu(!showStatusMenu); }}
              className={`flex items-center gap-3 px-5 py-2.5 rounded-xl border text-xs font-black uppercase tracking-widest transition-all ${status ? 'bg-primary/5 border-primary text-primary' : 'bg-surface-container-lowest border-outline-variant/20 text-on-surface-variant hover:border-primary/50'}`}
            >
              <span className="material-symbols-outlined text-[18px]">info</span>
              {status.replace('_', ' ') || 'Specific Status'}
              <span className={`material-symbols-outlined text-[18px] transition-transform duration-300 ${showStatusMenu ? 'rotate-180' : ''}`}>expand_more</span>
            </button>
            {showStatusMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowStatusMenu(false)}></div>
                <div className="absolute left-0 mt-2 w-56 bg-surface-container-lowest border border-outline-variant/20 rounded-2xl shadow-2xl z-50 py-2 animate-in fade-in zoom-in-95 duration-200">
                  {['', 'pending', 'verified', 'under_investigation', 'closed'].map(s => (
                    <button
                      key={s}
                      onClick={() => { setStatus(s); setShowStatusMenu(false); setPage(1); }}
                      className={`w-full text-left px-4 py-3 text-xs hover:bg-primary/5 transition-colors capitalize font-bold flex items-center justify-between ${status === s ? 'text-primary' : 'text-on-surface-variant'}`}
                    >
                      {s === '' ? 'All Statuses' : s.replace('_', ' ')}
                      {status === s && <span className="material-symbols-outlined text-sm">check</span>}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {(search || status || crimeFilter || activeTab !== 'active') && (
            <button
              onClick={() => { setSearch(''); setStatus(''); setCrimeFilter(''); setActiveTab('active'); setPage(1); }}
              className="text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:text-primary-dim underline underline-offset-4 ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/20 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-96 gap-4">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
            <p className="text-on-surface-variant font-bold text-sm tracking-widest uppercase">Loading your cases...</p>
          </div>
        ) : cases.length > 0 ? (
          <>
            <div className="w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant/10">
                    <th className="px-3 py-5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-on-surface-variant/80">FIR Reference</th>
                    <th className="px-3 py-5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-on-surface-variant/80">Citizen Info</th>
                    <th className="px-3 py-5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-on-surface-variant/80">Offense</th>
                    <th className="px-3 py-5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-on-surface-variant/80">Officer</th>
                    <th className="px-3 py-5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-on-surface-variant/80">Forensic</th>
                    <th className="px-3 py-5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-on-surface-variant/80 text-center">Status</th>
                    <th className="px-3 py-5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-on-surface-variant/80 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {cases.map((c) => (
                    <tr key={c._id} className="hover:bg-primary/[0.02] transition-colors group">
                      <td className="px-3 py-5">
                        <span className="text-xs font-black text-on-surface block">#{c.fir_number}</span>
                        <p className="text-[9px] text-on-surface-variant font-medium mt-0.5">{new Date(c.createdAt).toLocaleDateString()}</p>
                      </td>
                      <td className="px-3 py-5">
                        <p className="text-xs font-bold text-on-surface truncate max-w-[140px]">{c.citizen?.name}</p>
                        <p className="text-[9px] text-on-surface-variant uppercase tracking-wider truncate max-w-[140px]">{c.citizen?.email}</p>
                      </td>
                      <td className="px-3 py-5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-black bg-surface-container border border-outline-variant/20 text-on-surface uppercase tracking-wide">
                          {c.crime_type}
                        </span>
                      </td>
                      <td className="px-3 py-5">
                        {c.assigned_officer ? (
                          <div className="flex items-center gap-2 truncate max-w-[100px]">
                            <div className="w-6 h-6 rounded-lg bg-police-container text-police flex items-center justify-center shrink-0">
                              <span className="material-symbols-outlined text-[14px]">shield_person</span>
                            </div>
                            <span className="text-[10px] font-bold text-on-surface truncate">{c.assigned_officer.name}</span>
                          </div>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant/50 text-[9px] font-bold uppercase tracking-wider">Unassigned</span>
                        )}
                      </td>
                      <td className="px-3 py-5">
                        {c.assigned_forensic ? (
                          <div className="flex items-center gap-2 truncate max-w-[100px]">
                            <div className="w-6 h-6 rounded-lg bg-forensic-container text-forensic flex items-center justify-center shrink-0">
                              <span className="material-symbols-outlined text-[14px]">science</span>
                            </div>
                            <span className="text-[10px] font-bold text-on-surface truncate">{c.assigned_forensic.name}</span>
                          </div>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant/50 text-[9px] font-bold uppercase tracking-wider">Unassigned</span>
                        )}
                      </td>
                      <td className="px-3 py-5 text-center">
                        <div className="flex justify-center">
                          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase ${c.status === 'closed' ? 'bg-red-100 text-red-700' :
                            c.status === 'verified' ? 'bg-emerald-100 text-emerald-700' :
                              c.status === 'under_investigation' ? 'bg-blue-100 text-blue-700' :
                                c.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                  'bg-primary-container text-primary-dim'
                            }`}>
                            <span className={`w-1 h-1 rounded-full ${c.status === 'closed' ? 'bg-red-500' :
                              c.status === 'verified' ? 'bg-emerald-500' :
                                c.status === 'under_investigation' ? 'bg-blue-500' :
                                  c.status === 'pending' ? 'bg-amber-500' :
                                    'bg-primary'
                              }`}></span>
                            {c.status?.replace('_', ' ')}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-5 text-right">
                        <Link to={`/cases/${c._id}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-on-primary rounded-lg text-[10px] font-black transition-all shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95 whitespace-nowrap group/btn">
                          Manage
                          <span className="material-symbols-outlined text-[14px] group-hover/btn:translate-x-0.5 transition-transform">edit_square</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-outline-variant/10 bg-surface-container-lowest">
                <p className="text-[10px] text-on-surface-variant font-black uppercase tracking-widest">
                  Showing <span className="text-on-surface">{(page - 1) * limit + 1}</span> to <span className="text-on-surface">{Math.min(page * limit, total)}</span> of <span className="text-on-surface">{total}</span> cases
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">chevron_left</span>
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
                    <button
                      key={num}
                      onClick={() => setPage(num)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-colors ${page === num
                          ? 'bg-primary text-on-primary shadow-sm'
                          : 'hover:bg-surface-container text-on-surface-variant'
                        }`}
                    >
                      {num}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                  </button>
                </div>
              </div>
            )}
          </>
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
