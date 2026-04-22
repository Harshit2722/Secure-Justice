import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getCaseById } from '../utils/api';

export default function FirDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [fir, setFir] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-surface-container rounded-full transition-colors text-on-surface-variant flex items-center justify-center">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-3xl font-extrabold text-on-surface">Case Details</h2>
        <div className="ml-auto">
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
                fir.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                'bg-primary-container text-primary-dim'
              }`}>
                <span className={`w-2 h-2 rounded-full ${
                  fir.status === 'closed' ? 'bg-red-500' :
                  fir.status === 'verified' ? 'bg-emerald-500' :
                  fir.status === 'pending' ? 'bg-amber-500' :
                  'bg-primary'
                }`}></span>
                {fir.status}
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
              <div className="space-y-8 relative before:absolute before:inset-0 before:ml-0.5 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-outline-variant/20 before:to-transparent">
                {fir.status_history.map((history, index) => (
                  <div key={index} className="relative flex items-start gap-6 group">
                    <div className="flex-1">
                      <div className="mb-2">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                          history.status === 'closed' ? 'bg-red-100 text-red-700' :
                          history.status === 'verified' ? 'bg-emerald-100 text-emerald-700' :
                          history.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                          'bg-primary-container text-primary-dim'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            history.status === 'closed' ? 'bg-red-500' :
                            history.status === 'verified' ? 'bg-emerald-500' :
                            history.status === 'pending' ? 'bg-amber-500' :
                            'bg-primary'
                          }`}></span>
                          {history.status}
                        </span>
                      </div>
                      <div className="text-xs text-on-surface-variant font-medium ml-1">
                        {history._id ? new Date(parseInt(history._id.substring(0, 8), 16) * 1000).toLocaleString() : 'Recent'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
