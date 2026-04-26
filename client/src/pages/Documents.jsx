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
  const [crimeFilter, setCrimeFilter] = useState('');
  const [integrityFilter, setIntegrityFilter] = useState('all'); // 'all', 'verified', 'tampered'
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'recent', 'priority', 'tampered'
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showCrimeMenu, setShowCrimeMenu] = useState(false);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        let params = { search: searchTerm, status: statusFilter, crime_type: crimeFilter };
        
        if (activeTab === 'recent') {
          // Sort by newest is default usually, but we could add a date filter
        } else if (activeTab === 'priority') {
          // Violence and Cybercrime as priority
          params.crime_type = 'violence'; 
        }

        let data;
        if (user.role === 'police') {
          data = await getMyAssignedCases(params);
        } else if (user.role === 'forensic') {
          const { getMyAssignedForensicCases } = await import('../utils/api');
          data = await getMyAssignedForensicCases(params);
        } else {
          data = await getAllFirs(params);
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
  }, [searchTerm, statusFilter, crimeFilter, activeTab, user.role]);


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
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-extrabold text-on-surface tracking-tight">Evidence Vault</h2>
          <p className="text-on-surface-variant font-medium">Manage and view all supporting documents grouped by case.</p>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          {/* Search Bar */}
          <div className="relative flex-1 md:w-[450px] group">
            <input
              type="text"
              placeholder="Search by case number, location, or description..."
              className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 shadow-sm text-sm transition-all font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 group-focus-within:text-primary transition-colors">search</span>
          </div>
        </div>
      </div>

      {/* Power Filters Row */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-1.5 p-1.5 bg-surface-container-lowest border border-outline-variant/10 rounded-2xl w-fit shadow-sm">
          {[
            { id: 'all', label: 'All Evidence', icon: 'folder_copy' },
            { id: 'recent', label: 'Recent Files', icon: 'schedule' },
            { id: 'priority', label: 'Critical Cases', icon: 'emergency' },
            { id: 'tampered', label: 'Tampered Alerts', icon: 'warning_amber' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id === 'priority') setCrimeFilter('violence');
                else if (tab.id === 'tampered') setIntegrityFilter('tampered');
                else { setCrimeFilter(''); setIntegrityFilter('all'); }
              }}
              className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all relative ${
                activeTab === tab.id 
                  ? tab.id === 'tampered' ? 'bg-error text-on-error shadow-lg shadow-error/20 scale-[1.02]' : 'bg-primary text-on-primary shadow-lg shadow-primary/20 scale-[1.02]' 
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
              {tab.label}
              {tab.id === 'tampered' && cases.some(c => c.has_tampered_evidence) && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-error rounded-full border-2 border-surface animate-ping"></span>
              )}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Crime Category */}
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
                      onClick={() => { setCrimeFilter(t); setShowCrimeMenu(false); setActiveTab('all'); }}
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

          {/* Integrity Status */}
          <div className="relative">
            <button
              onClick={() => { setShowStatusMenu(!showStatusMenu); }}
              className={`flex items-center gap-3 px-5 py-2.5 rounded-xl border text-xs font-black uppercase tracking-widest transition-all ${integrityFilter !== 'all' ? 'bg-error/5 border-error text-error' : 'bg-surface-container-lowest border-outline-variant/20 text-on-surface-variant hover:border-primary/50'}`}
            >
              <span className="material-symbols-outlined text-[18px]">{integrityFilter === 'tampered' ? 'gpp_bad' : 'gpp_good'}</span>
              {integrityFilter === 'all' ? 'Integrity Status' : integrityFilter}
              <span className={`material-symbols-outlined text-[18px] transition-transform duration-300 ${showStatusMenu ? 'rotate-180' : ''}`}>expand_more</span>
            </button>

            {showStatusMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowStatusMenu(false)}></div>
                <div className="absolute left-0 mt-2 w-56 bg-surface-container-lowest border border-outline-variant/20 rounded-2xl shadow-2xl z-50 py-2 animate-in fade-in zoom-in-95 duration-200">
                  {['all', 'verified', 'tampered'].map(s => (
                    <button
                      key={s}
                      onClick={() => { setIntegrityFilter(s); setShowStatusMenu(false); if(s === 'tampered') setActiveTab('tampered'); }}
                      className={`w-full text-left px-4 py-3 text-xs hover:bg-primary/5 transition-colors capitalize font-bold flex items-center justify-between ${integrityFilter === s ? 'text-primary' : 'text-on-surface-variant'}`}
                    >
                      {s === 'all' ? 'All Records' : s}
                      {integrityFilter === s && <span className="material-symbols-outlined text-sm">check</span>}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {(searchTerm || statusFilter || crimeFilter || integrityFilter !== 'all') && (
            <button 
              onClick={() => { setSearchTerm(''); setStatusFilter(''); setCrimeFilter(''); setIntegrityFilter('all'); setActiveTab('all'); }}
              className="text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:text-primary-dim underline underline-offset-4 ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cases.filter(c => {
          if (integrityFilter === 'tampered') return c.has_tampered_evidence;
          return true;
        }).map((c) => {
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
                  <div className="flex flex-col gap-2">
                    <span className="text-[11px] font-black text-primary uppercase tracking-[0.15em] bg-primary/10 px-3 py-1.5 rounded-xl border border-primary/20 w-fit">
                      {c.fir_number}
                    </span>
                    {c.has_tampered_evidence && (
                      <span className="inline-flex items-center gap-1.5 text-[9px] font-black text-error uppercase tracking-widest bg-error/10 px-2 py-1 rounded-lg border border-error/20 animate-pulse">
                        <span className="material-symbols-outlined text-[14px]">warning</span>
                        Tampered Evidence
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest">Files</p>
                      <p className="text-sm font-black text-on-surface">{c.evidence_count || 0}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-on-surface-variant group-hover:bg-primary group-hover:text-on-primary transition-all shadow-sm">
                      <span className="material-symbols-outlined">folder</span>
                    </div>
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
              : user.role === 'forensic' 
                ? "You have not been assigned to any cases yet."
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
