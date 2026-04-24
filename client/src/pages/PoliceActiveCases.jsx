import { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { getAllFirs } from '../utils/api';

export default function PoliceActiveCases() {
  const { user } = useOutletContext();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const limit = 8;



  const fetchCases = async () => {
    setLoading(true);
    try {
      const data = await getAllFirs({ page, limit, search, status });
      if (data.success) {
        setCases(data.data);
        setTotalPages(data.pages);
      }
    } catch (err) {
      console.error("Failed to fetch cases", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCases();
    }, 300);
    return () => clearTimeout(timer);
  }, [page, search, status]);


  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
    setPage(1);
  };


  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-extrabold text-on-surface tracking-tight">Active Jurisdiction Cases</h2>
          <p className="text-on-surface-variant font-medium mt-1">Manage and track all First Information Reports across the department.</p>
        </div>

        <div className="w-full md:w-auto flex flex-col md:flex-row gap-4 items-center">
          {/* Search Bar */}
          <div className="w-full md:w-80 relative group order-1">
            <input
              type="text"
              placeholder="Search jurisdiction..."
              className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 pl-12 pr-12 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm group-hover:border-primary/30 transition-all font-medium"
              value={search}
              onChange={handleSearchChange}
            />
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">search</span>
            {search && (
              <button
                type="button"
                onClick={() => { setSearch(''); setPage(1); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-surface-container rounded-full"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            )}
          </div>

          {/* Status Filter Dropdown */}
          <div className="relative w-full md:w-auto order-2">
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className={`w-12 h-12 rounded-full transition-all flex items-center justify-center border shadow-sm ${status ? 'bg-primary text-on-primary' : 'bg-surface-container-lowest border-outline-variant/30 text-on-surface-variant hover:text-primary hover:bg-surface-container'}`}
              title="Filter Status"
            >
              <span className="material-symbols-outlined text-xl">filter_alt</span>
              {status && <span className="absolute -top-1 -right-1 w-4 h-4 bg-error text-on-error rounded-full text-[8px] flex items-center justify-center border-2 border-surface font-black">!</span>}
            </button>

            {showFilterMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowFilterMenu(false)}></div>
                <div className="absolute right-0 mt-3 w-56 bg-surface-container-lowest border border-outline-variant/20 rounded-2xl shadow-2xl z-50 py-2 animate-in fade-in zoom-in-95 duration-200">
                  <p className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-on-surface-variant/50 border-b border-outline-variant/5 mb-1">Filter Jurisdiction</p>
                  {['', 'pending', 'verified', 'under_investigation', 'closed'].map(s => (
                    <button
                      key={s}
                      onClick={() => { setStatus(s); setPage(1); setShowFilterMenu(false); }}
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
            <p className="text-on-surface-variant font-bold text-sm tracking-widest uppercase">Fetching Records...</p>
          </div>
        ) : cases.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant/10">
                    <th className="px-6 py-5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-on-surface-variant/80">FIR Reference</th>
                    <th className="px-6 py-5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-on-surface-variant/80">Citizen Info</th>
                    <th className="px-6 py-5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-on-surface-variant/80">Offense Category</th>
                    <th className="px-6 py-5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-on-surface-variant/80">Location</th>
                    <th className="px-6 py-5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-on-surface-variant/80">Officer</th>
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
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-1.5 text-sm font-medium text-on-surface-variant">
                          <span className="material-symbols-outlined text-sm">location_on</span>
                          {c.location}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        {c.assigned_officer ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">
                              {c.assigned_officer.name?.charAt(0)}
                            </div>
                            <span className="text-xs font-bold text-on-surface">{c.assigned_officer.name}</span>
                          </div>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant/50 text-[10px] font-bold uppercase tracking-wider">Unassigned</span>
                        )}
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
                        <Link to={`/cases/${c._id}`} className="inline-flex items-center gap-2 px-5 py-2 bg-surface-container-high hover:bg-primary hover:text-on-primary rounded-xl text-[11px] font-black transition-all shadow-sm whitespace-nowrap active:scale-95 hover:shadow-md group/btn">
                          View Case
                          <span className="material-symbols-outlined text-[16px] group-hover/btn:translate-x-0.5 transition-transform">arrow_right_alt</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-6 border-t border-outline-variant/10 flex justify-between items-center bg-surface-container-low/30">
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="px-4 py-2 rounded-xl bg-surface-container-lowest border border-outline-variant/30 text-sm font-bold hover:bg-surface-container disabled:opacity-50 transition-colors"
                >
                  Previous
                </button>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="px-4 py-2 rounded-xl bg-surface-container-lowest border border-outline-variant/30 text-sm font-bold hover:bg-surface-container disabled:opacity-50 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-96 text-center">
            <span className="material-symbols-outlined text-5xl text-outline-variant mb-4">search_off</span>
            <p className="text-xl font-bold text-on-surface">No records found</p>
            <p className="text-on-surface-variant text-sm mt-2">Adjust your search or filters to find specific cases.</p>
          </div>
        )}
      </div>
    </div>
  );
}
