import { useState, useEffect } from 'react';
import { useOutletContext, useParams, useNavigate, Link } from 'react-router-dom';
import { getCaseById, updateFirStatus, assignOfficer, assignForensic, getUsers, deleteFIR } from '../utils/api';
import ConfirmModal from '../components/ConfirmModal';

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
  const [forensicExperts, setForensicExperts] = useState([]);
  const [showForensicDropdown, setShowForensicDropdown] = useState(false);
  const [statusUpdateError, setStatusUpdateError] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [staffSearch, setStaffSearch] = useState('');

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
  }, [id]);

  const fetchStaff = async () => {
    try {
      const [officerData, forensicData] = await Promise.all([
        getUsers({ role: 'police', search: staffSearch }),
        getUsers({ role: 'forensic', search: staffSearch })
      ]);
      if (officerData.success) setOfficers(officerData.data);
      if (forensicData.success) setForensicExperts(forensicData.data);
    } catch (err) {
      console.error("Failed to fetch staff", err);
    }
  };

  useEffect(() => {
    if (user.role === 'admin') {
      fetchStaff();
    }
  }, [staffSearch, user.role]);

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
      setStatusUpdateError(err.response?.data?.message || "Failed to update status. Please check your permissions.");
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

  const handleAssignForensic = async (forensicId) => {
    setAssigning(true);
    try {
      const data = await assignForensic(id, forensicId);
      if (data.success) {
        setFir(data.data);
        setShowForensicDropdown(false);
      }
    } catch (err) {
      console.error("Assignment failed", err);
      alert("Failed to assign forensic expert.");
    } finally {
      setAssigning(false);
    }
  };

  const handleDeleteCase = async () => {
    try {
      setDeleting(true);
      const res = await deleteFIR(id);
      if (res.success) {
        navigate('/admin-assignments');
      }
    } catch (err) {
      console.error("Delete failed", err);
      alert("Failed to delete case.");
    } finally {
      setDeleting(false);
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
  const canUpdate = isAssignedOfficer;
  const isAdmin = user.role === 'admin';
  const canAccessUserProfile = user.role !== 'citizen';

  const navigateToUser = (userId) => {
    if (canAccessUserProfile && userId) {
      navigate(`/admin-users/${userId}`);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-surface-container rounded-full transition-colors text-on-surface-variant flex items-center justify-center">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-3xl font-extrabold text-on-surface">Case Details</h2>
        <div className="ml-auto flex items-center gap-3">
          {(canUpdate || isAdmin) && (
            <div className="relative">
              <button 
                onClick={() => !isAdmin && setShowStatusDropdown(!showStatusDropdown)}
                disabled={updating || isAdmin || (user.role === 'police' && (!fir.assigned_officer || !fir.assigned_forensic))}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all active:scale-95 disabled:cursor-not-allowed ${
                  isAdmin 
                    ? 'bg-surface-container-highest/30 text-on-surface-variant/40 border border-outline-variant/10 shadow-none' 
                    : 'bg-primary text-on-primary shadow-md active:scale-95'
                }`}
                title={isAdmin ? "Administrators cannot update case status directly" : user.role === 'police' && (!fir.assigned_officer || !fir.assigned_forensic) ? "Both Police and Forensic Expert must be assigned to update status" : "Update Case Status"}
              >
                {updating ? (
                  <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
                ) : (
                  <span className="material-symbols-outlined text-[20px]">{isAdmin ? 'lock' : 'edit_note'}</span>
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
                    ].map(s => {
                      let isDisabled = false;
                      if (fir.status === 'under_investigation' && s.val !== 'closed' && s.val !== 'under_investigation') {
                        isDisabled = true;
                      }
                      if (fir.status === 'closed' && s.val !== 'under_investigation' && s.val !== 'closed') {
                        isDisabled = true;
                      }
                      if (fir.status !== 'pending' && s.val === 'pending') {
                        isDisabled = true;
                      }

                      return (
                        <button
                          key={s.val}
                          onClick={() => !isDisabled && handleStatusUpdate(s.val)}
                          disabled={isDisabled}
                          className={`w-full text-left px-4 py-3 text-xs hover:bg-primary/5 transition-colors capitalize font-bold flex items-center gap-3 ${fir.status === s.val ? 'text-primary' : 'text-on-surface-variant'} ${isDisabled ? 'opacity-30 cursor-not-allowed' : ''}`}
                        >
                          <span className={`material-symbols-outlined text-lg ${s.color}`}>{s.icon}</span>
                          {s.label}
                          {fir.status === s.val && <span className="material-symbols-outlined text-sm ml-auto">check</span>}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}
          <Link 
            to={`/documents/${fir._id}`}
            className="flex items-center gap-2 bg-surface-container-highest hover:bg-primary/20 text-on-surface px-5 py-2.5 rounded-xl font-bold transition-all border border-outline-variant shadow-sm"
          >
            <span className="material-symbols-outlined text-[20px]">folder_open</span>
            View Evidence
          </Link>
          {isAdmin && (
            <button 
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-2 bg-error-container text-on-error-container px-5 py-2.5 rounded-xl font-bold transition-all shadow-md active:scale-95"
            >
              <span className="material-symbols-outlined text-[20px]">delete</span>
              Delete Case
            </button>
          )}
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
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
              <div 
                onClick={() => navigateToUser(fir.assigned_officer?._id || fir.assigned_officer)}
                className={`flex items-center gap-4 bg-police-container/10 border border-police/20 p-4 rounded-2xl relative group ${canAccessUserProfile && fir.assigned_officer ? 'cursor-pointer hover:bg-police-container/20 hover:border-police transition-all shadow-sm' : ''}`}
              >
                <div className="w-12 h-12 rounded-xl bg-police-container text-police flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl">shield_person</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-on-surface truncate">{fir.assigned_officer?.name || 'Not Assigned'}</p>
                  <p className="text-xs text-on-surface-variant font-medium truncate">{fir.assigned_officer?.email || 'Awaiting officer allocation'}</p>
                </div>
                <div className="ml-auto flex items-center gap-3">
                  {user.role === 'admin' && (
                    <div className="relative" onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowAssignDropdown(!showAssignDropdown);
                        }}
                        className="flex items-center gap-1.5 bg-primary/10 hover:bg-primary text-primary hover:text-on-primary px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm"
                      >
                        <span className="material-symbols-outlined text-sm">{fir.assigned_officer ? 'edit' : 'add'}</span>
                        {fir.assigned_officer ? 'Modify' : 'Assign'}
                      </button>
                      
                      {showAssignDropdown && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setShowAssignDropdown(false)}></div>
                          <div className="absolute right-0 bottom-full mb-2 w-72 bg-surface-container-lowest border border-outline-variant/20 rounded-2xl shadow-2xl z-50 py-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
                            <div className="px-3 py-2 border-b border-outline-variant/10">
                              <div className="relative">
                                <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-sm">search</span>
                                <input 
                                  type="text"
                                  placeholder="Search officers..."
                                  className="w-full pl-8 pr-3 py-1.5 bg-surface-container rounded-lg text-[10px] font-bold focus:outline-none"
                                  value={staffSearch}
                                  onChange={(e) => setStaffSearch(e.target.value)}
                                />
                              </div>
                            </div>
                            <div className="max-h-48 overflow-y-auto custom-scrollbar">
                              {officers.length > 0 ? officers.map(off => (
                                <button
                                  key={off._id}
                                  onClick={() => {
                                    handleAssignOfficer(off._id);
                                    setShowAssignDropdown(false);
                                  }}
                                  className={`w-full text-left px-4 py-3 text-xs hover:bg-primary/5 transition-colors font-bold flex items-center gap-3 ${fir.assigned_officer?._id === off._id ? 'text-primary' : 'text-on-surface-variant'}`}
                                >
                                  <div className="w-8 h-8 rounded-full bg-police-container/30 flex items-center justify-center text-[10px] text-police">
                                    {off.name ? off.name.charAt(0) : '?'}
                                  </div>
                                  <div className="flex-1 overflow-hidden">
                                    <p className="truncate">{off.name || 'Unknown Officer'}</p>
                                    <p className="text-[8px] opacity-60 truncate">{off.email}</p>
                                  </div>
                                  {fir.assigned_officer?._id === off._id && <span className="material-symbols-outlined text-sm">check</span>}
                                </button>
                              )) : (
                                <p className="px-4 py-3 text-[10px] text-on-surface-variant/50 italic text-center">No officers found</p>
                              )}
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

            <div className="mb-8">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary/80 mb-4">Assigned Forensic Expert</p>
              <div 
                onClick={() => navigateToUser(fir.assigned_forensic?._id || fir.assigned_forensic)}
                className={`flex items-center gap-4 bg-forensic-container/10 border border-forensic/20 p-4 rounded-2xl relative group ${canAccessUserProfile && fir.assigned_forensic ? 'cursor-pointer hover:bg-forensic-container/20 hover:border-forensic transition-all shadow-sm' : ''}`}
              >
                <div className="w-12 h-12 rounded-xl bg-forensic-container text-forensic flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl">science</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-on-surface truncate">{fir.assigned_forensic?.name || 'Not Assigned'}</p>
                  <p className="text-xs text-on-surface-variant font-medium truncate">{fir.assigned_forensic?.email || 'Awaiting forensic allocation'}</p>
                </div>
                <div className="ml-auto flex items-center gap-3">
                  {user.role === 'admin' && (
                    <div className="relative" onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowForensicDropdown(!showForensicDropdown);
                        }}
                        className="flex items-center gap-1.5 bg-primary/10 hover:bg-primary text-primary hover:text-on-primary px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm"
                      >
                        <span className="material-symbols-outlined text-sm">{fir.assigned_forensic ? 'edit' : 'add'}</span>
                        {fir.assigned_forensic ? 'Modify' : 'Assign'}
                      </button>
                      
                      {showForensicDropdown && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setShowForensicDropdown(false)}></div>
                          <div className="absolute right-0 bottom-full mb-2 w-72 bg-surface-container-lowest border border-outline-variant/20 rounded-2xl shadow-2xl z-50 py-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
                            <div className="px-3 py-2 border-b border-outline-variant/10">
                              <div className="relative">
                                <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-sm">search</span>
                                <input 
                                  type="text"
                                  placeholder="Search experts..."
                                  className="w-full pl-8 pr-3 py-1.5 bg-surface-container rounded-lg text-[10px] font-bold focus:outline-none"
                                  value={staffSearch}
                                  onChange={(e) => setStaffSearch(e.target.value)}
                                />
                              </div>
                            </div>
                            <div className="max-h-48 overflow-y-auto custom-scrollbar">
                              {forensicExperts.length > 0 ? forensicExperts.map(expert => (
                                <button
                                  key={expert._id}
                                  onClick={() => {
                                    handleAssignForensic(expert._id);
                                    setShowForensicDropdown(false);
                                  }}
                                  className={`w-full text-left px-4 py-3 text-xs hover:bg-primary/5 transition-colors font-bold flex items-center gap-3 ${fir.assigned_forensic?._id === expert._id ? 'text-primary' : 'text-on-surface-variant'}`}
                                >
                                  <div className="w-8 h-8 rounded-full bg-forensic-container/30 flex items-center justify-center text-[10px] text-forensic">
                                    {expert.name ? expert.name.charAt(0) : '?'}
                                  </div>
                                  <div className="flex-1 overflow-hidden">
                                    <p className="truncate">{expert.name || 'Unknown Expert'}</p>
                                    <p className="text-[8px] opacity-60 truncate">{expert.email}</p>
                                  </div>
                                  {fir.assigned_forensic?._id === expert._id && <span className="material-symbols-outlined text-sm">check</span>}
                                </button>
                              )) : (
                                <p className="px-4 py-3 text-[10px] text-on-surface-variant/50 italic text-center">No experts found</p>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${fir.assigned_forensic ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {fir.assigned_forensic ? 'Active' : 'Pending'}
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
            <div 
              onClick={() => navigateToUser(fir.citizen?._id || fir.citizen)}
              className={`space-y-4 p-4 -m-4 rounded-2xl transition-all ${canAccessUserProfile ? 'cursor-pointer hover:bg-surface-container/50 group' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary/80 mb-1">Name</p>
                  <p className={`font-bold transition-colors ${canAccessUserProfile ? 'group-hover:text-primary' : ''}`}>{fir.citizen?.name || 'N/A'}</p>
                </div>
                {canAccessUserProfile && (
                  <span className="material-symbols-outlined text-on-surface-variant/20 group-hover:text-primary group-hover:translate-x-1 transition-all">chevron_right</span>
                )}
              </div>
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary/80 mb-1">Email</p>
                <p className="font-bold text-sm opacity-80">{fir.citizen?.email || 'N/A'}</p>
              </div>
            </div>
          </div>

          {fir.status_history && fir.status_history.length > 0 && (
            <div className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/20 shadow-sm">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2 border-b border-outline-variant/10 pb-4">
                <span className="material-symbols-outlined text-primary">history</span>
                Status History
              </h3>
              <div className="max-h-[220px] overflow-y-auto pr-2">
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

      {/* Status Update Error Modal */}
      {statusUpdateError && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-surface-container-lowest w-full max-w-md rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-300 border border-outline-variant/10 text-center">
            <div className="w-20 h-20 bg-error/10 text-error rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-4xl">warning</span>
            </div>
            <h3 className="text-2xl font-extrabold text-on-surface mb-4">Procedural Block</h3>
            <p className="text-on-surface-variant leading-relaxed mb-8">
              {statusUpdateError}
            </p>
            <button 
              onClick={() => setStatusUpdateError(null)}
              className="w-full py-4 bg-primary text-on-primary rounded-xl font-bold tracking-widest uppercase text-xs hover:bg-primary-dim transition-all shadow-lg active:scale-[0.98]"
            >
              Acknowledged
            </button>
          </div>
        </div>
      )}

      <ConfirmModal 
        show={confirmDelete}
        title="Permanently Delete Case"
        message={`Are you sure you want to delete Case #${fir.fir_number}? All evidence, documents, and logs will be permanently removed. This action is irreversible.`}
        confirmText={deleting ? "Deleting..." : "Delete Case"}
        onConfirm={handleDeleteCase}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
