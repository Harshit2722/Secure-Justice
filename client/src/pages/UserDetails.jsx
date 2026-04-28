import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useOutletContext } from 'react-router-dom';
import { getUserById, deleteUserAccount } from '../utils/api';
import ConfirmModal from '../components/ConfirmModal';

export default function UserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useOutletContext();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, [id]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const res = await getUserById(id);
      if (res.success) {
        setProfile(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch user details", err);
      setError("User profile not found or access denied.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await deleteUserAccount(id);
      setConfirmDelete(false);
      navigate('/admin-users');
    } catch (err) {
      console.error("Delete failed", err);
      alert("Failed to delete user account.");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="h-8 bg-surface-container w-1/4 rounded"></div>
        <div className="grid grid-cols-3 gap-8">
          <div className="col-span-1 h-96 bg-surface-container-lowest rounded-3xl"></div>
          <div className="col-span-2 h-96 bg-surface-container-lowest rounded-3xl"></div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-surface-container-lowest rounded-3xl border border-outline-variant/20">
        <span className="material-symbols-outlined text-5xl text-error mb-4">error</span>
        <h3 className="text-xl font-bold">{error || "User not found"}</h3>
        <button onClick={() => navigate(-1)} className="mt-6 text-primary font-bold hover:underline">Go Back</button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex items-center gap-6">
        <button 
          onClick={() => navigate(-1)}
          className="w-12 h-12 rounded-2xl bg-surface-container hover:bg-surface-container-highest flex items-center justify-center transition-all active:scale-90 shadow-sm"
        >
          <span className="material-symbols-outlined text-on-surface">arrow_back</span>
        </button>
        <div>
          <h2 className="text-3xl font-extrabold text-on-surface">User Profile</h2>
          <p className="text-on-surface-variant font-medium">Detailed view of platform participant and their history.</p>
        </div>
        <div className="ml-auto">
          {user.role === 'admin' && profile.role !== 'admin' && (
            <button 
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-2 bg-error-container text-on-error-container px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-md"
            >
              <span className="material-symbols-outlined text-[20px]">delete</span>
              Delete User
            </button>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-surface-container-lowest p-8 rounded-[40px] border border-outline-variant/20 shadow-sm text-center relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-primary/10 to-transparent"></div>
             
             <div className="relative z-10">
                <div className={`w-32 h-32 rounded-full mx-auto mb-6 flex items-center justify-center text-5xl font-black shadow-2xl border-4 border-surface-container-lowest ${
                  profile.role === 'admin' ? 'bg-rose-100 text-rose-700' :
                  profile.role === 'police' ? 'bg-blue-100 text-blue-700' :
                  profile.role === 'forensic' ? 'bg-emerald-100 text-emerald-700' :
                  'bg-slate-100 text-slate-700'
                }`}>
                  {profile.name?.charAt(0) || '?'}
                </div>
                <h3 className="text-2xl font-black text-on-surface mb-1">{profile.name}</h3>
                <p className="text-on-surface-variant font-medium mb-6">{profile.email}</p>
                
                <div className="flex flex-wrap justify-center gap-3">
                   <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      profile.role === 'admin' ? 'bg-rose-100 text-rose-700' :
                      profile.role === 'police' ? 'bg-blue-100 text-blue-700' :
                      profile.role === 'forensic' ? 'bg-emerald-100 text-emerald-700' :
                      'bg-slate-100 text-slate-700'
                   }`}>
                     {profile.role}
                   </span>
                   <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      profile.isVerified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                   }`}>
                     {profile.isVerified ? 'Verified' : 'Pending'}
                   </span>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4 mt-10 pt-8 border-t border-outline-variant/10 text-left">
                <div>
                   <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary/80 mb-1">Joined On</p>
                   <p className="font-bold text-sm">{new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                </div>
                <div>
                   <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary/80 mb-1">Total Cases</p>
                   <p className="font-bold text-sm">{profile.firs?.length || 0}</p>
                </div>
             </div>
          </div>
        </div>

        {/* Cases List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-on-surface flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">folder_shared</span>
              Associated Cases
            </h3>
          </div>

          <div className="bg-surface-container-lowest rounded-[40px] border border-outline-variant/20 shadow-sm overflow-hidden">
            {profile.firs && profile.firs.length > 0 ? (
              <div className="divide-y divide-outline-variant/10">
                {profile.firs.map((fir) => (
                  <Link 
                    key={fir._id}
                    to={`/cases/${fir._id}`}
                    className="flex items-center justify-between p-6 hover:bg-surface-container/30 transition-all group"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-all">
                        <span className="material-symbols-outlined">description</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <p className="font-black text-on-surface tracking-tight">#{fir.fir_number}</p>
                          <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest ${
                            fir.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                            fir.status === 'verified' ? 'bg-emerald-100 text-emerald-700' :
                            fir.status === 'closed' ? 'bg-rose-100 text-rose-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {fir.status.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-xs text-on-surface-variant font-medium capitalize">{fir.crime_type} • {fir.location}</p>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-on-surface-variant/30 group-hover:text-primary transition-all group-hover:translate-x-1">chevron_right</span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center">
                <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center mx-auto mb-6 opacity-40">
                  <span className="material-symbols-outlined text-4xl">folder_off</span>
                </div>
                <h4 className="text-lg font-bold text-on-surface mb-1">No Cases Found</h4>
                <p className="text-on-surface-variant text-sm px-10">This user is not currently associated with any active or historical cases.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmModal 
        show={confirmDelete}
        title="Permanently Delete User"
        message={`Are you sure you want to delete ${profile.name}? All personal access will be revoked. This action is irreversible.`}
        confirmText={deleting ? "Deleting..." : "Delete User"}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
