import { useState, useEffect } from 'react';
import { 
  getAllFirs, 
  getPoliceOfficers, 
  getForensicExperts, 
  deleteFIR
} from '../utils/api';
import { Link } from 'react-router-dom';
import ConfirmModal from '../components/ConfirmModal';

export default function AdminAssignments() {
  const [firs, setFirs] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [crimeFilter, setCrimeFilter] = useState('');
  const [assignFilter, setAssignFilter] = useState(''); // 'none', 'police_missing', 'forensic_missing'
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'pending', 'needs_resource', 'active'
  const [error, setError] = useState(null);
  
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showCrimeDropdown, setShowCrimeDropdown] = useState(false);
  const [showAssignDropdown, setShowAssignDropdown] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ show: false, id: null });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, [statusFilter, search, activeTab, crimeFilter, assignFilter]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      let params = { search, limit: 50 };
      
      // 1. Apply Tab Presets (Base Constraints)
      if (activeTab === 'pending') params.status = 'pending';
      else if (activeTab === 'active') params.status = 'under_investigation';
      else if (activeTab === 'needs_resource') params.status = 'verified';

      // 2. Apply Granular Overrides (Always take precedence if explicitly set)
      if (statusFilter) params.status = statusFilter;
      if (crimeFilter) params.crime_type = crimeFilter;
      
      // 3. Apply Personnel Logic (Stackable)
      if (assignFilter === 'police_missing') params.assigned_officer = 'null';
      else if (assignFilter === 'forensic_missing') params.assigned_forensic = 'null';
      else if (assignFilter === 'none') {
        params.assigned_officer = 'null';
        params.assigned_forensic = 'null';
      }

      const [firsData, officersData, expertsData] = await Promise.all([
        getAllFirs(params),
        getPoliceOfficers(),
        getForensicExperts()
      ]);

      if (firsData.success) setFirs(firsData.data);
      if (officersData.success) setOfficers(officersData.data);
      if (expertsData.success) setExperts(expertsData.data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch assignment data", err);
      setError("Failed to load platform data. Please check your connection or role permissions.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFIR = async () => {
    const id = confirmDelete.id;
    if (!id) return;
    
    setDeleting(true);
    try {
      await deleteFIR(id);
      setConfirmDelete({ show: false, id: null });
      fetchInitialData();
    } catch (err) {
      console.error("Failed to delete FIR", err);
      alert("Failed to delete FIR.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Power Filters Header */}
      <section className="space-y-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h2 className="text-3xl font-extrabold text-on-surface tracking-tight">Case Management</h2>
            <p className="text-on-surface-variant font-medium">Global oversight of all cases. Assign resources, override statuses, and manage records.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
             <div className="relative flex-1 md:w-[450px] group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 group-focus-within:text-primary transition-colors">search</span>
                <input 
                  type="text" 
                  placeholder="Search FIRs by ID, Location, or Description..." 
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-surface-container-lowest border border-outline-variant/20 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 text-sm font-medium transition-all shadow-sm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
          </div>
        </div>

        {/* Quick Action Tabs */}
        <div className="flex items-center gap-1.5 p-1.5 bg-surface-container-lowest border border-outline-variant/10 rounded-2xl w-fit shadow-sm">
          {[
            { id: 'all', label: 'All Cases', icon: 'list' },
            { id: 'pending', label: 'Pending Review', icon: 'rate_review' },
            { id: 'needs_resource', label: 'Needs Assignment', icon: 'person_add' },
            { id: 'active', label: 'Active Investigation', icon: 'search' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                // We keep dropdowns active for combinability!
              }}
              className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all relative ${
                activeTab === tab.id 
                  ? 'bg-primary text-on-primary shadow-lg shadow-primary/20 scale-[1.02]' 
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
              {tab.label}
              {activeTab === tab.id && (statusFilter || crimeFilter || assignFilter) && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-tertiary rounded-full border-2 border-surface-container-lowest animate-pulse"></span>
              )}
            </button>
          ))}
        </div>

        {/* Advanced Filters Row */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Status Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowStatusDropdown(!showStatusDropdown)}
              className={`flex items-center gap-3 px-5 py-2.5 rounded-xl border text-xs font-black uppercase tracking-widest transition-all ${
                statusFilter ? 'bg-primary/5 border-primary text-primary' : 'bg-surface-container-lowest border-outline-variant/20 text-on-surface-variant hover:border-primary/50'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">info</span>
              {statusFilter.replace('_', ' ') || 'Specific Status'}
              <span className={`material-symbols-outlined text-[18px] transition-transform duration-300 ${showStatusDropdown ? 'rotate-180' : ''}`}>expand_more</span>
            </button>
            {showStatusDropdown && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowStatusDropdown(false)}></div>
                <div className="absolute left-0 mt-2 w-56 bg-surface-container-lowest border border-outline-variant/20 rounded-2xl shadow-2xl z-20 py-2 animate-in fade-in zoom-in-95 duration-200">
                  {['', 'pending', 'verified', 'under_investigation', 'closed'].map((status) => (
                    <button
                      key={status}
                      onClick={() => { setStatusFilter(status); setShowStatusDropdown(false); }}
                      className={`w-full text-left px-4 py-3 text-xs font-bold hover:bg-primary/5 transition-colors capitalize flex items-center justify-between ${statusFilter === status ? 'text-primary' : 'text-on-surface-variant'}`}
                    >
                      {status.replace('_', ' ') || 'All Statuses'}
                      {statusFilter === status && <span className="material-symbols-outlined text-sm">check</span>}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Crime Type Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowCrimeDropdown(!showCrimeDropdown)}
              className={`flex items-center gap-3 px-5 py-2.5 rounded-xl border text-xs font-black uppercase tracking-widest transition-all ${
                crimeFilter ? 'bg-primary/5 border-primary text-primary' : 'bg-surface-container-lowest border-outline-variant/20 text-on-surface-variant hover:border-primary/50'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">category</span>
              {crimeFilter || 'Crime Category'}
              <span className={`material-symbols-outlined text-[18px] transition-transform duration-300 ${showCrimeDropdown ? 'rotate-180' : ''}`}>expand_more</span>
            </button>
            {showCrimeDropdown && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowCrimeDropdown(false)}></div>
                <div className="absolute left-0 mt-2 w-56 bg-surface-container-lowest border border-outline-variant/20 rounded-2xl shadow-2xl z-20 py-2 animate-in fade-in zoom-in-95 duration-200">
                  {['', 'theft', 'cybercrime', 'fraud', 'violence', 'other'].map((type) => (
                    <button
                      key={type}
                      onClick={() => { setCrimeFilter(type); setShowCrimeDropdown(false); }}
                      className={`w-full text-left px-4 py-3 text-xs font-bold hover:bg-primary/5 transition-colors capitalize flex items-center justify-between ${crimeFilter === type ? 'text-primary' : 'text-on-surface-variant'}`}
                    >
                      {type || 'All Categories'}
                      {crimeFilter === type && <span className="material-symbols-outlined text-sm">check</span>}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Assignment Filter */}
          <div className="relative">
            <button 
              onClick={() => setShowAssignDropdown(!showAssignDropdown)}
              className={`flex items-center gap-3 px-5 py-2.5 rounded-xl border text-xs font-black uppercase tracking-widest transition-all ${
                assignFilter ? 'bg-rose-500/5 border-rose-500 text-rose-600' : 'bg-surface-container-lowest border-outline-variant/20 text-on-surface-variant hover:border-primary/50'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">engineering</span>
              {assignFilter === 'none' ? 'No Personnel' : assignFilter === 'police_missing' ? 'Missing Police' : assignFilter === 'forensic_missing' ? 'Missing Forensic' : 'Allocation Status'}
              <span className={`material-symbols-outlined text-[18px] transition-transform duration-300 ${showAssignDropdown ? 'rotate-180' : ''}`}>expand_more</span>
            </button>
            {showAssignDropdown && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowAssignDropdown(false)}></div>
                <div className="absolute left-0 mt-2 w-64 bg-surface-container-lowest border border-outline-variant/20 rounded-2xl shadow-2xl z-20 py-2 animate-in fade-in zoom-in-95 duration-200">
                  {[
                    { id: '', label: 'All Allocations', icon: 'group' },
                    { id: 'none', label: 'Completely Unassigned', icon: 'person_off' },
                    { id: 'police_missing', label: 'Missing Police Officer', icon: 'shield' },
                    { id: 'forensic_missing', label: 'Missing Forensic Expert', icon: 'science' },
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => { setAssignFilter(filter.id); setShowAssignDropdown(false); }}
                      className={`w-full text-left px-4 py-3 text-xs font-bold hover:bg-primary/5 transition-colors flex items-center gap-3 ${assignFilter === filter.id ? 'text-primary' : 'text-on-surface-variant'}`}
                    >
                      <span className="material-symbols-outlined text-sm">{filter.icon}</span>
                      {filter.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {(statusFilter || crimeFilter || assignFilter || search) && (
            <button 
              onClick={() => { setStatusFilter(''); setCrimeFilter(''); setAssignFilter(''); setSearch(''); setActiveTab('all'); }}
              className="text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:text-primary-dim underline underline-offset-4 ml-auto"
            >
              Reset All Filters
            </button>
          )}
        </div>
      </section>

      {/* FIR List */}
      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/20 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-surface-container-low border-b border-outline-variant/10">
              <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-[0.2em] text-on-surface-variant/80">Case Info</th>
              <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-[0.2em] text-on-surface-variant/80">Police Assignment</th>
              <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-[0.2em] text-on-surface-variant/80">Forensic Assignment</th>
              <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-[0.2em] text-on-surface-variant/80">Status</th>
              <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-[0.2em] text-on-surface-variant/80 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {loading ? (
              [1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan="5" className="px-6 py-8 h-20 bg-surface-container/10"></td>
                </tr>
              ))
            ) : firs.length > 0 ? (
              firs.map((fir) => (
                <tr key={fir._id} className="hover:bg-surface-container/30 transition-colors group">
                  <td className="px-6 py-5">
                    <p className="font-black text-sm text-on-surface">#{fir.fir_number}</p>
                    <p className="text-xs text-on-surface-variant capitalize">{fir.crime_type} • {fir.location}</p>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${fir.assigned_officer ? 'bg-blue-100 text-blue-700' : 'bg-surface-container text-on-surface-variant/40 border border-dashed border-outline-variant/30'}`}>
                        {fir.assigned_officer ? (fir.assigned_officer.name?.charAt(0) || '?') : '?'}
                      </div>
                      <p className="text-sm font-bold text-on-surface">{fir.assigned_officer?.name || 'Unassigned'}</p>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${fir.assigned_forensic ? 'bg-emerald-100 text-emerald-700' : 'bg-surface-container text-on-surface-variant/40 border border-dashed border-outline-variant/30'}`}>
                        {fir.assigned_forensic ? (fir.assigned_forensic.name?.charAt(0) || '?') : '?'}
                      </div>
                      <p className="text-sm font-bold text-on-surface">{fir.assigned_forensic?.name || 'Unassigned'}</p>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      fir.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      fir.status === 'verified' ? 'bg-emerald-100 text-emerald-700' :
                      fir.status === 'closed' ? 'bg-rose-100 text-rose-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {fir.status ? fir.status.replace('_', ' ') : 'Pending'}
                    </span>
                  </td>
                    <td className="px-6 py-5 text-right">
                      <Link 
                        to={`/cases/${fir._id}`}
                        className="px-4 py-1.5 bg-primary text-on-primary rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-sm"
                      >
                        Open
                      </Link>
                    </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-on-surface-variant/60 font-bold">
                  No cases found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
