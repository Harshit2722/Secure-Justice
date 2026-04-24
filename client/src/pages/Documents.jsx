import { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { getMyCases, getAllFirs, getMyAssignedCases } from '../utils/api';

const CRIME_THEMES = {
  theft: { border: 'border-l-[#fc87aaff]', bg: 'bg-[#fc87aaff]/5', text: 'text-[#be1d46ff]', icon: 'text-[#fc87aaff]' },
  fraud: { border: 'border-l-[#6695ecff]', bg: 'bg-[#6695ecff]/5', text: 'text-[#059aebff]', icon: 'text-[#6695ecff]' },
  cybercrime: { border: 'border-l-[#f8cb50ff]', bg: 'bg-[#f8cb50ff]/5', text: 'text-[#fc821fff]', icon: 'text-[#f8cb50ff]' },
  violence: { border: 'border-l-[#4ed48bff]', bg: 'bg-[#4ed48bff]/5', text: 'text-[#17a75fff]', icon: 'text-[#4ed48bff]' },
  other: { border: 'border-l-slate-400', bg: 'bg-slate-400/5', text: 'text-slate-600', icon: 'text-slate-400' }
};

export default function Documents() {
  const { user } = useOutletContext();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        let data;
        if (user.role === 'police') {
          // Officers see only their assigned cases' documents (Server-side filtered)
          data = await getMyAssignedCases({ search: searchTerm, status: statusFilter });
        } else {
          // Admins see everything, Citizens see their own (handled by backend)
          data = await getAllFirs({ search: searchTerm, status: statusFilter });
        }
        
        if (data.success) {
          setCases(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch cases for documents", err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchCases();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter, user.role]);


  if (loading) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="h-8 bg-surface-container w-1/4 rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-48 bg-surface-container rounded-3xl"></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-extrabold text-on-surface">Evidence Vault</h2>
          <p className="text-on-surface-variant mt-1">Manage and view all supporting documents grouped by case.</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Search Bar */}
          <div className="relative flex-1 md:w-80 group">
            <input
              type="text"
              placeholder="Search vault..."
              className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm text-base transition-all font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl">search</span>
          </div>

          {/* Status Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => { setShowFilterMenu(!showFilterMenu); }}
              className={`w-14 h-14 rounded-full transition-all flex items-center justify-center border shadow-sm ${statusFilter ? 'bg-primary text-on-primary' : 'bg-surface-container-lowest border-outline-variant/30 text-on-surface-variant hover:text-primary hover:bg-surface-container'}`}
              title="Filter by Status"
            >
              <span className="material-symbols-outlined text-2xl">filter_alt</span>
            </button>

            {showFilterMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowFilterMenu(false)}></div>
                <div className="absolute right-0 mt-2 w-48 bg-surface-container-lowest border border-outline-variant/20 rounded-2xl shadow-2xl z-50 py-2 animate-in fade-in zoom-in-95 duration-200">
                  <p className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-on-surface-variant/50 border-b border-outline-variant/5 mb-1">Filter Status</p>
                  {['', 'pending', 'verified', 'under_investigation', 'closed'].map(s => (
                    <button
                      key={s}
                      onClick={() => { setStatusFilter(s); setShowFilterMenu(false); }}
                      className={`w-full text-left px-4 py-2.5 text-xs hover:bg-primary/5 transition-colors capitalize font-bold flex items-center justify-between ${statusFilter === s ? 'text-primary' : 'text-on-surface-variant'}`}
                    >
                      {s === '' ? 'All Reports' : s.replace('_', ' ')}
                      {statusFilter === s && <span className="material-symbols-outlined text-sm">check_circle</span>}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Active Filters Tag Cloud */}
      {(statusFilter || searchTerm) && (
        <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-left-4">
          {statusFilter && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
              Status: {statusFilter.replace('_', ' ')}
              <button onClick={() => setStatusFilter('')} className="hover:text-primary-dim transition-colors">
                <span className="material-symbols-outlined text-xs">close</span>
              </button>
            </span>
          )}
          {searchTerm && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
              Search: {searchTerm}
              <button onClick={() => setSearchTerm('')} className="hover:text-primary-dim transition-colors">
                <span className="material-symbols-outlined text-xs">close</span>
              </button>
            </span>
          )}
          <button
            onClick={() => { setStatusFilter(''); setSearchTerm(''); }}
            className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors ml-2 underline underline-offset-4"
          >
            Clear All
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cases.map((c) => {
          const theme = CRIME_THEMES[c.crime_type?.toLowerCase()] || CRIME_THEMES.other;
          return (
            <Link 
              key={c._id} 
              to={`/documents/${c._id}`}
              className={`group bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/20 ${theme.border} border-l-4 shadow-sm hover:shadow-md hover:border-primary/30 transition-all flex flex-col justify-between relative overflow-hidden`}
            >
              <div className={`absolute top-0 right-0 w-24 h-24 ${theme.bg} rounded-bl-full -z-0 opacity-50`}></div>
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-5">
                  <span className="text-[11px] font-black text-primary uppercase tracking-[0.15em] bg-primary/10 px-3 py-1.5 rounded-xl border border-primary/20">
                    #{c.fir_number}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-surface-container text-on-surface-variant flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary transition-all duration-300">
                    <span className="material-symbols-outlined text-xl">folder</span>
                  </div>
                </div>
                
                <h3 className="text-lg font-black text-on-surface group-hover:text-primary transition-colors truncate">
                  {c.citizen?.name}
                </h3>
                <p className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-wider mt-1 truncate">
                  {c.citizen?.email}
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-outline-variant/5 pt-4 z-10">
                <div className="flex flex-col">
                  <span className="text-[10px] font-extrabold text-on-surface-variant/50 uppercase tracking-[0.2em]">CRIME TYPE</span>
                  <span className={`text-sm font-black capitalize ${theme.text}`}>{c.crime_type}</span>
                </div>
                <span className="material-symbols-outlined text-primary opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all">
                  arrow_forward
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {cases.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-surface-container-lowest rounded-3xl border border-outline-variant/20 border-dashed">
          <span className="material-symbols-outlined text-6xl text-outline-variant/40 mb-4">folder_off</span>
          <h3 className="text-xl font-bold text-on-surface">No Documents Found</h3>
          <p className="text-on-surface-variant mt-2 text-center max-w-sm">
            {user.role === 'police'
              ? "There are currently no active cases with evidence in the jurisdiction."
              : "You haven't filed any cases yet. Documents will appear here once you file a complaint with supporting evidence."}
          </p>
          {user.role === 'citizen' && (
            <Link to="/dashboard" className="mt-6 text-primary font-bold hover:underline">File a Complaint</Link>
          )}
        </div>
      )}

    </div>
  );
}
