import { useState, useEffect } from 'react';
import { useOutletContext, useParams, useNavigate, Link } from 'react-router-dom';
import { getEvidenceByFir, getCaseById, uploadEvidence } from '../utils/api';

export default function EvidenceDetails() {
  const { user } = useOutletContext();
  const { firId } = useParams();
  const navigate = useNavigate();
  const [evidence, setEvidence] = useState([]);
  const [fir, setFir] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  
  const [showModal, setShowModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({ file: null, description: '' });

  const fetchData = async () => {
    try {
      const [evidenceRes, firRes] = await Promise.all([
        getEvidenceByFir(firId),
        getCaseById(firId)
      ]);
      
      if (evidenceRes.success) setEvidence(evidenceRes.data);
      if (firRes.success) setFir(firRes.data);
    } catch (err) {
      console.error("Failed to fetch evidence details", err);
      setError("Failed to load evidence. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [firId]);

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadForm.file || !uploadForm.description.trim()) return;

    setUploading(true);
    try {
      const file = uploadForm.file;
      const fileType = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'document';
      await uploadEvidence(firId, file, fileType, uploadForm.description);
      setShowModal(false);
      setUploadForm({ file: null, description: '' });
      fetchData(); // Refresh list
    } catch (err) {
      console.error("Upload failed", err);
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse space-y-8"><div className="h-8 bg-surface-container w-1/4 rounded"></div><div className="h-64 bg-surface-container rounded-3xl"></div></div>;
  }

  const isAssignedOfficer = fir?.assigned_officer?._id === user.id || fir?.assigned_officer === user.id;
  const canUpload = user.role === 'admin' || isAssignedOfficer;

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-surface-container rounded-full transition-colors text-on-surface-variant flex items-center justify-center">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div>
          <h2 className="text-3xl font-extrabold text-on-surface">Case Evidence</h2>
          <p className="text-on-surface-variant font-bold mt-1 uppercase tracking-widest text-xs">{fir?.fir_number}</p>
        </div>
      </div>

      {/* Header / Action Section */}
      <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/20 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined">inventory_2</span>
          </div>
          <div>
            <h3 className="font-bold">Evidence Vault</h3>
            <p className="text-sm text-on-surface-variant">Total files: {evidence.length}</p>
          </div>
        </div>
        {canUpload && (
          <button 
            onClick={() => setShowModal(true)}
            className="bg-primary text-on-primary px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-primary-dim transition-all shadow-md active:scale-95"
          >
            <span className="material-symbols-outlined text-[20px]">add_a_photo</span>
            Upload New Evidence
          </button>
        )}
      </div>

      {/* Evidence Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {evidence.map((item) => (
          <div key={item._id} className="bg-surface-container-lowest rounded-3xl border border-outline-variant/20 shadow-sm overflow-hidden group hover:border-primary/30 transition-all flex flex-col">
            <div className="aspect-square bg-surface-container relative flex items-center justify-center overflow-hidden">
              {item.file_type === 'image' ? (
                <img src={item.file_url} alt={item.description} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : item.file_type === 'video' ? (
                <div className="flex flex-col items-center gap-2 text-on-surface-variant/40">
                  <span className="material-symbols-outlined text-5xl">movie</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest">Video File</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-on-surface-variant/40">
                  <span className="material-symbols-outlined text-5xl">description</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest">Document</span>
                </div>
              )}
              
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 z-10">
                <a href={item.file_url} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/20 hover:bg-white/40 rounded-full text-white transition-colors backdrop-blur-sm shadow-lg">
                  <span className="material-symbols-outlined">visibility</span>
                </a>
              </div>

              <div className="absolute top-3 right-3 z-20">
                <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest shadow-sm ${
                  item.status === 'Verified' ? 'bg-emerald-500 text-white' :
                  item.status === 'Tampered' ? 'bg-red-500 text-white' :
                  'bg-amber-500 text-white'
                }`}>
                  {item.status}
                </span>
              </div>
            </div>
            
            <div className="p-4 flex-1 flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-xs text-primary">
                  {item.file_type === 'image' ? 'image' : item.file_type === 'video' ? 'video_file' : 'description'}
                </span>
                <p className="text-[10px] font-bold text-on-surface-variant/70 uppercase tracking-widest">{item.file_type}</p>
              </div>
              <p className="text-sm font-bold text-on-surface line-clamp-2 mb-4 leading-relaxed">
                {item.description || 'No description provided'}
              </p>
              <div className="mt-auto pt-4 border-t border-outline-variant/5 flex justify-between items-center gap-2">
                <p className="text-[9px] text-on-surface-variant/60 font-bold uppercase tracking-tight flex items-center gap-1 shrink-0">
                  <span className="material-symbols-outlined text-[10px]">calendar_today</span>
                  {new Date(item.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
                {item.uploaded_by && (
                  <div className="flex items-center gap-1.5 min-w-0">
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${item.uploaded_by.role === 'police' ? 'bg-primary' : 'bg-emerald-500'}`}></div>
                    <span className="text-[9px] font-extrabold text-on-surface-variant uppercase tracking-widest truncate">
                      {item.uploaded_by.name} ({item.uploaded_by.role})
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {evidence.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 bg-surface-container-lowest rounded-3xl border border-outline-variant/20 border-dashed">
          <div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-4xl text-outline-variant/60">cloud_off</span>
          </div>
          <h3 className="text-xl font-bold text-on-surface">No Evidence Found</h3>
          <p className="text-on-surface-variant mt-2 text-center max-w-sm">
            {canUpload 
              ? "This case folder is currently empty. Start by uploading supporting documents to build your case."
              : "This case folder is currently empty."
            }
          </p>
          {canUpload && (
            <button 
              onClick={() => setShowModal(true)}
              className="mt-8 bg-primary/10 text-primary hover:bg-primary hover:text-on-primary px-8 py-3 rounded-xl font-bold transition-all"
            >
              Upload First Item
            </button>
          )}
        </div>
      )}

      {/* Upload Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-surface-container-lowest w-full max-w-lg rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-300 border border-outline-variant/10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-extrabold text-on-surface">Add Evidence</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-surface-container rounded-full transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleUploadSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-3">Supporting File</label>
                <div className="relative group">
                  <input 
                    type="file" 
                    className="hidden" 
                    id="modal-upload"
                    onChange={(e) => setUploadForm({...uploadForm, file: e.target.files[0]})}
                    required
                  />
                  <label 
                    htmlFor="modal-upload"
                    className="flex flex-col items-center justify-center gap-3 w-full h-40 bg-surface-container border-2 border-dashed border-outline-variant/30 rounded-2xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all group-hover:border-primary/50"
                  >
                    <span className="material-symbols-outlined text-4xl text-primary/60 group-hover:scale-110 transition-transform">upload_file</span>
                    <div className="text-center px-4">
                      <p className="text-sm font-bold text-on-surface">
                        {uploadForm.file ? uploadForm.file.name : 'Select image, video or document'}
                      </p>
                      {!uploadForm.file && <p className="text-[10px] text-on-surface-variant mt-1 uppercase tracking-widest">Max size: 50MB</p>}
                    </div>
                  </label>
                  {uploadForm.file && (
                    <button 
                      type="button"
                      onClick={() => setUploadForm({...uploadForm, file: null})}
                      className="absolute right-4 top-4 p-1.5 bg-error/10 hover:bg-error/20 rounded-full transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm text-error">close</span>
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-3">Evidence Description</label>
                <textarea 
                  className="w-full bg-surface-container border border-outline-variant/30 rounded-xl p-4 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 h-32 resize-none font-medium text-on-surface"
                  placeholder="Explain what this evidence shows..."
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})}
                  required
                ></textarea>
              </div>
              
              <div className="flex gap-4 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-4 font-bold text-on-surface-variant hover:bg-surface-container rounded-xl transition-colors tracking-widest uppercase text-xs"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={uploading || !uploadForm.file || !uploadForm.description.trim()}
                  className="flex-1 py-4 font-bold bg-primary hover:bg-primary-dim text-on-primary rounded-xl transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:grayscale tracking-widest uppercase text-xs flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[20px]">cloud_upload</span>
                      Securely Upload
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
