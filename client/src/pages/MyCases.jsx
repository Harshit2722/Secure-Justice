import { useState, useEffect } from 'react';
import { useOutletContext, Link, useNavigate } from 'react-router-dom';
import { getMyCases } from '../utils/api';

export default function MyCases() {
  const { user } = useOutletContext();
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showFilter, setShowFilter] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const casesPerPage = 10;

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const data = await getMyCases();
        if (data.success) {
          setCases(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch cases", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCases();
  }, []);

  // Filtering logic
  const filteredCases = cases.filter(c => {
    const matchesSearch = 
      c.fir_number.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.crime_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || c.status.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const indexOfLastCase = currentPage * casesPerPage;
  const indexOfFirstCase = indexOfLastCase - casesPerPage;
  const currentCases = filteredCases.slice(indexOfFirstCase, indexOfLastCase);
  const totalPages = Math.ceil(filteredCases.length / casesPerPage);

  if (loading) {
    return <div className="animate-pulse space-y-8"><div className="h-8 bg-surface-container w-1/4 rounded"></div><div className="h-96 bg-surface-container-lowest rounded-3xl"></div></div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="p-2 hover:bg-surface-container rounded-full transition-colors text-on-surface-variant flex items-center justify-center">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <h2 className="text-3xl font-extrabold text-on-surface">My Cases</h2>
        </div>
        
        <div className="flex items-center gap-4 w-full sm:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-80 group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">search</span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              placeholder="Search by FIR, type or location..."
              className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded-full py-2.5 pl-12 pr-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm text-sm"
            />
          </div>

          {/* Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowFilter(!showFilter)}
              className={`p-2 transition-colors rounded-full flex items-center justify-center border border-outline-variant/20 shadow-sm ${showFilter || statusFilter !== 'All' ? 'bg-primary text-on-primary' : 'bg-surface-container-lowest text-on-surface-variant hover:text-primary hover:bg-surface-container'}`}
            >
              <span className="material-symbols-outlined">filter_alt</span>
            </button>

            {showFilter && (
              <div className="absolute right-0 top-12 w-48 bg-surface-container-lowest border border-outline-variant/20 rounded-xl shadow-xl z-20 py-2 animate-in fade-in slide-in-from-top-2">
                <div className="mb-1">
                  <p className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-on-surface-variant border-b border-outline-variant/10">Filter by Status</p>
                  {['All', 'Pending', 'Verified', 'Investigating', 'Closed'].map(status => (
                    <button 
                      key={status} 
                      onClick={() => { setStatusFilter(status); setShowFilter(false); setCurrentPage(1); }}
                      className={`w-full text-left px-4 py-2 hover:bg-surface-container text-sm ${statusFilter === status ? 'font-bold text-primary' : 'text-on-surface'}`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant/20 shadow-sm rounded-3xl overflow-hidden">
        <div className="w-full">
          <table className="w-full text-left">
            <thead className="bg-surface-container-low text-xs uppercase tracking-widest text-on-surface-variant border-b border-outline-variant/10">
              <tr>
                <th className="px-4 py-5 font-bold">FIR Number</th>
                <th className="px-4 py-5 font-bold">Crime Type</th>
                <th className="px-4 py-5 font-bold">Officer</th>
                <th className="px-4 py-5 font-bold">Forensic</th>
                <th className="px-4 py-5 font-bold">Status</th>
                <th className="px-4 py-5 font-bold">Location</th>
                <th className="px-4 py-5 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {currentCases.map((c) => (
                <tr key={c._id} className="hover:bg-surface-container/50 transition-colors">
                  <td className="px-4 py-4 font-bold text-on-surface truncate max-w-[120px]">{c.fir_number}</td>
                  <td className="px-4 py-4 text-sm font-medium text-on-surface-variant truncate max-w-[120px]">{c.crime_type}</td>
                  <td className="px-4 py-4">
                    {c.assigned_officer ? (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-police-container text-police flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[14px]">shield_person</span>
                        </div>
                        <span className="text-[10px] font-bold text-on-surface truncate max-w-[80px]">{c.assigned_officer.name}</span>
                      </div>
                    ) : (
                      <span className="text-[9px] text-on-surface-variant/40 font-bold uppercase tracking-widest">Pending</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    {c.assigned_forensic ? (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-forensic-container text-forensic flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[14px]">science</span>
                        </div>
                        <span className="text-[10px] font-bold text-on-surface truncate max-w-[80px]">{c.assigned_forensic.name}</span>
                      </div>
                    ) : (
                      <span className="text-[9px] text-on-surface-variant/40 font-bold uppercase tracking-widest">Pending</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className={`inline-flex items-center gap-1 py-0.5 px-2 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      c.status === 'closed' ? 'bg-red-100 text-red-700' :
                      c.status === 'verified' ? 'bg-emerald-100 text-emerald-700' :
                      c.status === 'under_investigation' ? 'bg-blue-100 text-blue-700' :
                      c.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      'bg-primary-container text-primary-dim'
                    }`}>
                      <span className={`w-1 h-1 rounded-full ${
                        c.status === 'closed' ? 'bg-red-500' :
                        c.status === 'verified' ? 'bg-emerald-500' :
                        c.status === 'under_investigation' ? 'bg-blue-500' :
                        c.status === 'pending' ? 'bg-amber-500' :
                        'bg-primary'
                      }`}></span>
                      <span>{c.status?.replace('_', ' ')}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-on-surface-variant truncate max-w-[120px]">{c.location}</td>
                  <td className="px-4 py-4 text-sm font-medium text-right">
                    <button onClick={() => navigate(`/cases/${c._id}`)} className="bg-primary/10 text-primary px-3 py-1 rounded-lg hover:bg-primary hover:text-on-primary transition-colors font-bold text-[10px] uppercase tracking-wide">View</button>
                  </td>
                </tr>
              ))}
              {currentCases.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-on-surface-variant">
                    No cases found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-outline-variant/10 bg-surface-container-lowest">
            <p className="text-sm text-on-surface-variant font-medium">
              Showing <span className="font-bold text-on-surface">{filteredCases.length > 0 ? indexOfFirstCase + 1 : 0}</span> to <span className="font-bold text-on-surface">{Math.min(indexOfLastCase, filteredCases.length)}</span> of <span className="font-bold text-on-surface">{filteredCases.length}</span> cases
            </p>
            <div className="flex gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
                <button
                  key={num}
                  onClick={() => setCurrentPage(num)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-colors ${
                    currentPage === num 
                      ? 'bg-primary text-on-primary shadow-sm' 
                      : 'hover:bg-surface-container text-on-surface-variant'
                  }`}
                >
                  {num}
                </button>
              ))}
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
