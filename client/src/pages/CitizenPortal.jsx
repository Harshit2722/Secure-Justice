import { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { getMyCases, fileComplaint, uploadEvidence } from '../utils/api';

export default function CitizenPortal() {
  const { user } = useOutletContext();

  const [activeCases, setActiveCases] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ crime_type: '', location: '', complaint_text: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [evidenceDescription, setEvidenceDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCases = async () => {
    try {
      const data = await getMyCases();
      if (data.success) {
        setActiveCases(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch cases", err);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const handleFileComplaint = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await fileComplaint(formData);

      if (data.success) {
        // If there's a file, upload it
        if (selectedFile) {
          if (!evidenceDescription) {
            setError("Evidence description is required when a file is uploaded.");
            setLoading(false);
            return;
          }
          try {
            await uploadEvidence(
              data.data._id, 
              selectedFile, 
              selectedFile.type.startsWith('image/') ? 'image' : selectedFile.type.startsWith('video/') ? 'video' : 'document',
              evidenceDescription
            );
          } catch (uploadErr) {
            console.error("Evidence upload failed:", uploadErr);
            // We still consider the FIR filed even if evidence upload fails
          }
        }
        
        // Refresh cases
        fetchCases();
        setShowModal(false);
        setFormData({ crime_type: '', location: '', complaint_text: '' });
        setSelectedFile(null);
        setEvidenceDescription('');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to file complaint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Welcome Section */}
      <section className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/20 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-container/40 rounded-bl-full -z-0 transition-transform duration-1000 group-hover:scale-110"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-extrabold mb-2 text-on-surface">Welcome back, {user?.name || 'User'}</h2>
          <p className="text-on-surface-variant max-w-2xl text-lg">
            Access justice services quickly and securely. You can file reports, track case statuses, and manage your documents all in one place.
          </p>
        </div>
      </section>



      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* Left Column (Cases) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Cases Area */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold tracking-tight flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">folder_open</span> My Active Cases
              </h3>
              <Link to="/cases" className="text-primary hover:underline font-medium text-sm flex items-center gap-1">
                View All <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>

            {activeCases && activeCases.length > 0 ? (
              <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/20 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {activeCases.slice(0, 4).map((c) => (
                    <Link key={c._id} to={`/cases/${c._id}`} className="bg-surface-container p-6 rounded-2xl border border-outline-variant/10 shadow-sm h-[200px] flex flex-col justify-between hover:shadow-md hover:border-primary/30 transition-all cursor-pointer relative animate-in fade-in zoom-in-95 duration-300 group">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs font-extrabold text-on-surface uppercase tracking-widest mt-1">FIR NO: <span className="font-bold text-on-surface-variant ml-2 normal-case tracking-normal">{c.fir_number}</span></p>
                        </div>
                        <div className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${
                          c.status === 'closed' ? 'bg-red-100 text-red-700' :
                          c.status === 'verified' ? 'bg-emerald-100 text-emerald-700' :
                          c.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                          'bg-primary-container text-primary-dim'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            c.status === 'closed' ? 'bg-red-500' :
                            c.status === 'verified' ? 'bg-emerald-500' :
                            c.status === 'pending' ? 'bg-amber-500' :
                            'bg-primary'
                          }`}></span>
                          <span className="uppercase">{c.status}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-end mt-4">
                        <div>
                          <p className="text-[10px] font-extrabold text-primary/80 uppercase tracking-[0.2em]">Location</p>
                          <p className="text-sm font-bold text-on-surface mt-1">{c.location}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-extrabold text-primary/80 uppercase tracking-[0.2em]">Crime Type</p>
                          <p className="text-sm font-bold text-on-surface mt-1">{c.crime_type}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-surface-container-lowest p-10 rounded-3xl border border-outline-variant/20 shadow-sm flex flex-col items-center justify-center text-center h-[240px]">
                <span className="material-symbols-outlined text-4xl text-outline-variant mb-3">folder_open</span>
                <p className="text-on-surface font-extrabold text-xl">No cases filed yet</p>
                <p className="text-sm text-on-surface-variant mt-2 max-w-sm">When you file a complaint, your case details will appear here.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (Stats Stack) */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="flex justify-end mb-[-8px]">
            <button
              onClick={() => setShowModal(true)}
              className="bg-[#93000A] hover:bg-[#690005] text-[#FFDAD6] px-8 py-4 rounded-xl font-bold shadow-[0_4px_0_0_rgba(70,0,0,1)] hover:shadow-[0_2px_0_0_rgba(70,0,0,1)] hover:translate-y-[2px] transition-all active:translate-y-[4px] active:shadow-none whitespace-nowrap text-sm tracking-wide"
            >
              File My Complaint
            </button>
          </div>

          {[
            { label: 'ACTIVE REPORTS', value: activeCases.filter(c => c.status !== 'closed').length.toString(), icon: 'assignment', color: 'text-emerald-800', bg: 'bg-emerald-100' },
            { label: 'PENDING VERIFICATION', value: activeCases.filter(c => c.status === 'pending').length.toString(), icon: 'pending_actions', color: 'text-amber-600', bg: 'bg-amber-100' },
            { label: 'CLOSED CASES', value: activeCases.filter(c => c.status === 'closed').length.toString(), icon: 'check_circle', color: 'text-red-600', bg: 'bg-red-100' }
          ].map(stat => (
            <div key={stat.label} className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/20 shadow-sm flex items-center gap-6 hover:shadow-md transition-shadow">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                <span className="material-symbols-outlined text-2xl">{stat.icon}</span>
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-xs font-extrabold tracking-widest text-on-surface-variant/80 uppercase">{stat.label}</p>
                <h3 className="text-3xl font-extrabold mt-1 text-on-surface">{stat.value}</h3>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* File Complaint Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest w-full max-w-md rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-extrabold text-on-surface mb-2">File a Report</h3>
            <p className="text-on-surface-variant text-sm mb-6">Enter the details of your complaint below. A preliminary FIR number will be generated automatically.</p>

            {error && (
              <div className="mb-4 p-3 bg-error-container text-on-error-container rounded-lg text-sm font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleFileComplaint} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Crime Type</label>
                <select
                  className="w-full bg-surface-container border border-outline-variant/40 rounded-xl p-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium"
                  value={formData.crime_type}
                  onChange={(e) => setFormData({ ...formData, crime_type: e.target.value })}
                  required
                >
                  <option value="" disabled>Select category...</option>
                  <option value="theft">Theft / Burglary</option>
                  <option value="cybercrime">Cybercrime</option>
                  <option value="fraud">Fraud</option>
                  <option value="violence">Violence</option>
                  <option value="other">Other Complaint</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Location</label>
                <input
                  type="text"
                  className="w-full bg-surface-container border border-outline-variant/40 rounded-xl p-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium"
                  placeholder="Where did it happen?"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Description</label>
                <textarea
                  className="w-full bg-surface-container border border-outline-variant/40 rounded-xl p-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary h-32 resize-none font-medium"
                  placeholder="Provide brief details about the incident..."
                  value={formData.complaint_text}
                  onChange={(e) => setFormData({ ...formData, complaint_text: e.target.value })}
                  required
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Supporting Evidence (Optional)</label>
                <div className="relative group">
                  <input 
                    type="file" 
                    className="hidden" 
                    id="evidence-upload"
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                  />
                  <label 
                    htmlFor="evidence-upload"
                    className="flex items-center gap-3 w-full bg-surface-container border-2 border-dashed border-outline-variant/30 rounded-xl p-4 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
                  >
                    <span className="material-symbols-outlined text-on-surface-variant">upload_file</span>
                    <span className="text-sm font-medium text-on-surface-variant truncate">
                      {selectedFile ? selectedFile.name : 'Upload image, video or document'}
                    </span>
                  </label>
                  {selectedFile && (
                    <button 
                      type="button"
                      onClick={() => setSelectedFile(null)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-surface-container-high rounded-full"
                    >
                      <span className="material-symbols-outlined text-sm text-error">close</span>
                    </button>
                  )}
                </div>
              </div>

              {selectedFile && (
                <div className="animate-in slide-in-from-top-2 duration-300">
                  <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Evidence Description</label>
                  <textarea
                    className="w-full bg-surface-container border border-outline-variant/40 rounded-xl p-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary h-20 resize-none font-medium"
                    placeholder="Briefly describe what this evidence proves..."
                    value={evidenceDescription}
                    onChange={(e) => setEvidenceDescription(e.target.value)}
                    required
                  ></textarea>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 font-bold text-on-surface-variant hover:bg-surface-container rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 font-bold bg-error hover:bg-error-dim text-white rounded-xl transition-colors shadow-md disabled:opacity-70"
                >
                  {loading ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
