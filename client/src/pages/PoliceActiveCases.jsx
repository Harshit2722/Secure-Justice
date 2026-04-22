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
  const limit = 8;

  const fetchCases = async () => {
    setLoading(true);
    try {
      const data = await getAllFirs({ page, limit, search });
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
    fetchCases();
  }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchCases();
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-extrabold text-on-surface tracking-tight">Active Jurisdiction Cases</h2>
          <p className="text-on-surface-variant font-medium mt-1">Manage and track all First Information Reports across the department.</p>
        </div>
        
        <form onSubmit={handleSearch} className="w-full md:w-96 relative group">
          <input 
            type="text" 
            placeholder="Search by FIR, Location, or Type..." 
            className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 pl-12 pr-12 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm group-hover:border-primary/30 transition-all font-medium"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">search</span>
          {search && (
            <button 
              type="button" 
              onClick={() => { setSearch(''); setPage(1); fetchCases(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-surface-container rounded-full"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          )}
        </form>
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
                        <div className="flex justify-center">
                          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase ${
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
                            {c.status}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <Link to={`/cases/${c._id}`} className="inline-flex items-center gap-2 px-4 py-2 bg-surface-container hover:bg-primary hover:text-on-primary rounded-xl text-xs font-bold transition-all shadow-sm">
                          Manage Case
                          <span className="material-symbols-outlined text-sm">open_in_new</span>
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
