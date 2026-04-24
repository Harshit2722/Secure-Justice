import { useState, useEffect } from 'react';
import { useOutletContext, useParams, useNavigate, Link } from 'react-router-dom';
import { getCaseById, updateFirStatus, getPoliceOfficers, assignOfficer } from '../utils/api';

export default function FirDetails() {
  const { user } = useOutletContext();

  const { id } = useParams();
  const navigate = useNavigate();
  const [fir, setFir] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showAssignDropdown, setShowAssignDropdown] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [officers, setOfficers] = useState([]);
  const [assigning, setAssigning] = useState(false);


  useEffect(() => {
    const fetchFir = async () => {
      try {
        const data = await getCaseById(id);
        if (data.success) {
          setFir(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch FIR", err);
        setError("Could not load FIR details. It might not exist or you don't have permission.");
      } finally {
        setLoading(false);
      }
    };
    fetchFir();

    if (user.role === 'admin') {
      const fetchOfficers = async () => {
        try {
          const data = await getPoliceOfficers();
          if (data.success) {
            setOfficers(data.data);
          }
        } catch (err) {
          console.error("Failed to fetch officers", err);
        }
      };
      fetchOfficers();
    }
  }, [id, user.role]);

  const handleStatusUpdate = async (newStatus) => {
    if (newStatus === fir.status) {
      setShowStatusDropdown(false);
      return;
    }
    setUpdating(true);
    try {
      const data = await updateFirStatus(id, newStatus);
      if (data.success) {
        setFir(data.data);
        setShowStatusDropdown(false);
      }
    } catch (err) {
      console.error("Status update failed", err);
      alert(err.response?.data?.message || "Failed to update status. Please check your permissions.");
    } finally {
      setUpdating(false);
    }
  };

  const handleAssignOfficer = async (officerId) => {
    setAssigning(true);
    try {
      const data = await assignOfficer(id, officerId);
      if (data.success) {
        setFir(data.data);
        setShowAssignDropdown(false);
      }
    } catch (err) {
      console.error("Assignment failed", err);
      alert("Failed to assign officer.");
    } finally {
      setAssigning(false);
    }
  };


  if (loading) {
    return <div className="animate-pulse space-y-8"><div className="h-8 bg-surface-container w-1/4 rounded"></div><div className="h-96 bg-surface-container-lowest rounded-3xl"></div></div>;
  }

  if (error || !fir) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-surface-container-lowest rounded-3xl border border-outline-variant/20">
        <span className="material-symbols-outlined text-5xl text-error mb-4">error</span>
        <h3 className="text-xl font-bold">{error || "FIR not found"}</h3>
        <button onClick={() => navigate(-1)} className="mt-6 text-primary font-bold hover:underline">Go Back</button>
      </div>
    );
  }

  const isAssignedOfficer = fir.assigned_officer?._id === user.id || fir.assigned_officer === user.id;
  const canUpdate = user.role === 'admin' || isAssignedOfficer;

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-surface-container rounded-full transition-colors text-on-surface-variant flex items-center justify-center">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-3xl font-extrabold text-on-surface">Case Details</h2>
        <div className="ml-auto flex items-center gap-3">
          {canUpdate && (
            <div className="relative">
              <button 
                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                disabled={updating}
                className="flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-xl font-bold transition-all shadow-md active:scale-95 disabled:opacity-50"
              >
                {updating ? (
                  <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
                ) : (
                  <span className="material-symbols-outlined text-[20px]">edit_note</span>
                )}
                Update Status
              </button>
              
              {showStatusDropdown && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowStatusDropdown(false)}></div>
                  <div className="absolute right-0 mt-2 w-56 bg-surface-container-lowest border border-outline-variant/20 rounded-2xl shadow-2xl z-50 py-2 animate-in fade-in zoom-in-95 duration-200">
                    <p className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-on-surface-variant/50 border-b border-outline-variant/5 mb-1">Set New Status</p>
                    {[
                      { val: 'pending', label: 'Pending', icon: 'schedule', color: 'text-amber-500' },
                      { val: 'verified', label: 'Verified', icon: 'check_circle', color: 'text-emerald-500' },
                      { val: 'under_investigation', label: 'Under Investigation', icon: 'search', color: 'text-blue-500' },
                      { val: 'closed', label: 'Closed Case', icon: 'lock', color: 'text-red-500' }
                    ].map(s => (
                      <button
                        key={s.val}
                        onClick={() => handleStatusUpdate(s.val)}
                        className={`w-full text-left px-4 py-3 text-xs hover:bg-primary/5 transition-colors capitalize font-bold flex items-center gap-3 ${fir.status === s.val ? 'text-primary' : 'text-on-surface-variant'}`}
                      >
                        <span className={`material-symbols-outlined text-lg ${s.color}`}>{s.icon}</span>
                        {s.label}
                        {fir.status === s.val && <span className="material-symbols-outlined text-sm ml-auto">check</span>}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
          <Link 
            to={`/documents/${fir._id}`}
            className="flex items-center gap-2 bg-surface-container hover:bg-primary/10 text-primary px-5 py-2.5 rounded-xl font-bold transition-all border border-primary/20 shadow-sm"
          >
            <span className="material-symbols-outlined text-[20px]">folder_open</span>
            View Evidence
          </Link>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Details Column */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/20 shadow-sm">
            <div className="flex justify-between items-start mb-8">
              <div>
                <p className="text-xs font-extrabold tracking-widest text-primary uppercase mb-1">FIR NUMBER</p>
                <h3 className="text-3xl font-extrabold text-on-surface">{fir.fir_number}</h3>
              </div>
              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider ${
                fir.status === 'closed' ? 'bg-red-100 text-red-700' :
                fir.status === 'verified' ? 'bg-emerald-100 text-emerald-700' :
                fir.status === 'under_investigation' ? 'bg-blue-100 text-blue-700' :
                fir.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                'bg-primary-container text-primary-dim'
              }`}>
                <span className={`w-2 h-2 rounded-full ${
                  fir.status === 'closed' ? 'bg-red-500' :
                  fir.status === 'verified' ? 'bg-emerald-500' :
                  fir.status === 'under_investigation' ? 'bg-blue-500' :
                  fir.status === 'pending' ? 'bg-amber-500' :
                  'bg-primary'
                }`}></span>
                {fir.status?.replace('_', ' ')}
              </span>


            </div>

            <div className="grid grid-cols-2 gap-8 mb-8 border-t border-b border-outline-variant/10 py-8">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary/80 mb-2">Crime Type</p>
                <p className="font-bold text-on-surface text-lg capitalize tracking-tight">{fir.crime_type}</p>
              </div>
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary/80 mb-2">Location</p>
                <p className="font-bold text-on-surface text-lg tracking-tight">{fir.location}</p>
              </div>
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary/80 mb-2">Filed On</p>
                <p className="font-bold text-on-surface text-lg tracking-tight">{new Date(fir.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary/80 mb-2">Last Updated</p>
                <p className="font-bold text-on-surface text-lg tracking-tight">{new Date(fir.updatedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>

            <div className="mb-8">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary/80 mb-4">Assigned Officer</p>
              <div className="flex items-center gap-4 bg-primary/5 border border-primary/10 p-4 rounded-2xl relative">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-2xl">shield_person</span>
                </div>
                <div>
                  <p className="font-bold text-on-surface">{fir.assigned_officer?.name || 'Not Assigned'}</p>
                  <p className="text-xs text-on-surface-variant font-medium">{fir.assigned_officer?.email || 'Awaiting officer allocation'}</p>
                </div>
                <div className="ml-auto flex items-center gap-3">
                   {user.role === 'admin' && (
                     <div className="relative">
                       <button 
                        onClick={() => setShowAssignDropdown(!showAssignDropdown)}
                        className="p-2 hover:bg-primary/10 rounded-lg text-primary transition-colors flex items-center justify-center"
                        title="Assign Officer"
                       >
                         <span className="material-symbols-outlined">{fir.assigned_officer ? 'person_search' : 'person_add'}</span>
                       </button>

                       {showAssignDropdown && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setShowAssignDropdown(false)}></div>
                          <div className="absolute right-0 bottom-full mb-2 w-64 bg-surface-container-lowest border border-outline-variant/20 rounded-2xl shadow-2xl z-50 py-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
                            <p className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-on-surface-variant/50 border-b border-outline-variant/5 mb-1">Select Officer</p>
                            <div className="max-h-48 overflow-y-auto">
                              {officers.map(officer => (
                                <button
                                  key={officer._id}
                                  onClick={() => handleAssignOfficer(officer._id)}
                                  className={`w-full text-left px-4 py-3 text-xs hover:bg-primary/5 transition-colors font-bold flex items-center gap-3 ${fir.assigned_officer?._id === officer._id ? 'text-primary' : 'text-on-surface-variant'}`}
                                >
                                  <div className="w-6 h-6 rounded-full bg-surface-container flex items-center justify-center text-[10px]">
                                    {officer.name.charAt(0)}
                                  </div>
                                  <div className="flex-1 overflow-hidden">
                                    <p className="truncate">{officer.name}</p>
                                    <p className="text-[8px] opacity-60 truncate">{officer.email}</p>
                                  </div>
                                  {fir.assigned_officer?._id === officer._id && <span className="material-symbols-outlined text-sm">check</span>}
                                </button>
                              ))}
                              {officers.length === 0 && <p className="p-4 text-[10px] text-center opacity-50">No officers found</p>}
                            </div>
                          </div>
                        </>
                       )}
                     </div>
                   )}
                   <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${fir.assigned_officer ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {fir.assigned_officer ? 'Active' : 'Pending'}
                   </span>
                </div>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary/80 mb-4">Complaint Description</p>
              <div className="bg-surface-container p-6 rounded-2xl border border-outline-variant/10">
                <p className="whitespace-pre-wrap leading-relaxed text-on-surface font-medium">{fir.complaint_text}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-8">
          <div className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/20 shadow-sm">
             <h3 className="text-lg font-bold mb-6 flex items-center gap-2 border-b border-outline-variant/10 pb-4">
              <span className="material-symbols-outlined text-primary">person</span>
              Complainant Info
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary/80 mb-1">Name</p>
                <p className="font-bold">{fir.citizen?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary/80 mb-1">Email</p>
                <p className="font-bold">{fir.citizen?.email || 'N/A'}</p>
              </div>
            </div>
          </div>

          {fir.status_history && fir.status_history.length > 0 && (
            <div className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/20 shadow-sm">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2 border-b border-outline-variant/10 pb-4">
                <span className="material-symbols-outlined text-primary">history</span>
                Status History
              </h3>
              <div className="max-h-[220px] overflow-y-auto pr-2 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>
                <div className="space-y-8 relative before:absolute before:inset-0 before:ml-0.5 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-outline-variant/20 before:to-transparent">

                {[...fir.status_history].reverse().map((history, index) => (
                  <div key={index} className="relative flex items-start gap-6 group">
                    <div className="flex-1">
                      <div className="mb-2">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                          history.status === 'closed' ? 'bg-red-100 text-red-700' :
                          history.status === 'verified' ? 'bg-emerald-100 text-emerald-700' :
                          history.status === 'under_investigation' ? 'bg-blue-100 text-blue-700' :
                          history.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                          'bg-primary-container text-primary-dim'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            history.status === 'closed' ? 'bg-red-500' :
                            history.status === 'verified' ? 'bg-emerald-500' :
                            history.status === 'under_investigation' ? 'bg-blue-500' :
                            history.status === 'pending' ? 'bg-amber-500' :
                            'bg-primary'
                          }`}></span>
                          {history.status?.replace('_', ' ')}
                        </span>


                      </div>
                      <div className="text-xs text-on-surface-variant font-medium ml-1">
                        {history.updated_at ? new Date(history.updated_at).toLocaleString() : 'Recent'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          )}
        </div>

      </div>
    </div>
  );
}
