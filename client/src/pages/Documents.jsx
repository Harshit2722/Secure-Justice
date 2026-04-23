import { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { getMyCases } from '../utils/api';

export default function Documents() {
  const { user } = useOutletContext();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const data = await getMyCases();
        if (data.success) {
          setCases(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch cases for documents", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCases();
  }, []);

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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-on-surface">Evidence Vault</h2>
          <p className="text-on-surface-variant mt-1">Manage and view all supporting documents grouped by case.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cases.map((c) => (
          <Link 
            key={c._id} 
            to={`/documents/${c._id}`}
            className="group bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/20 shadow-sm hover:shadow-md hover:border-primary/30 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary transition-colors">
                  <span className="material-symbols-outlined text-2xl">folder</span>
                </div>
              </div>
              <h3 className="text-lg font-bold text-on-surface group-hover:text-primary transition-colors truncate">
                Case Documents
              </h3>
              <p className="text-[10px] font-extrabold text-primary/80 uppercase tracking-[0.2em] mt-3">FIR REFERENCE</p>
              <p className="text-sm font-bold text-on-surface mt-1">
                {c.fir_number}
              </p>
            </div>
            
            <div className="mt-6 flex items-center justify-between border-t border-outline-variant/5 pt-4">
               <div className="flex flex-col">
                  <span className="text-[10px] font-extrabold text-primary/80 uppercase tracking-[0.2em]">CRIME TYPE</span>
                  <span className="text-sm font-bold text-on-surface capitalize">{c.crime_type}</span>
               </div>
               <span className="material-symbols-outlined text-primary opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all">
                arrow_forward
               </span>
            </div>
          </Link>
        ))}
      </div>

      {cases.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-surface-container-lowest rounded-3xl border border-outline-variant/20 border-dashed">
          <span className="material-symbols-outlined text-6xl text-outline-variant/40 mb-4">folder_off</span>
          <h3 className="text-xl font-bold text-on-surface">No Documents Found</h3>
          <p className="text-on-surface-variant mt-2 text-center max-w-sm">
            You haven't filed any cases yet. Documents will appear here once you file a complaint with supporting evidence.
          </p>
          <Link to="/dashboard" className="mt-6 text-primary font-bold hover:underline">File a Complaint</Link>
        </div>
      )}
    </div>
  );
}
