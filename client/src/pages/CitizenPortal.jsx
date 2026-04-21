import { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';

export default function CitizenPortal() {
  const { user } = useOutletContext();
  const [showFilter, setShowFilter] = useState(false);
  
  // Use React state to handle DOM manipulation for cases dynamically
  const [activeCases, setActiveCases] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ crimeType: '', description: '' });

  // Initialize state from user context if available
  useEffect(() => {
    if (user?.cases?.length > 0) {
      setActiveCases(user.cases);
    }
  }, [user]);

  const handleFileComplaint = (e) => {
    e.preventDefault();
    // Simulate filing a case by manipulating the DOM via state
    const newCase = {
      id: `FIR-2026-${Math.floor(Math.random() * 900) + 100}`,
      status: 'Pending Review',
      officer: 'Unassigned',
      crimeType: formData.crimeType || 'General Complaint',
    };
    
    // Add new case to the top of the list
    setActiveCases([newCase, ...activeCases]);
    setShowModal(false);
    setFormData({ crimeType: '', description: '' }); // reset form
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Welcome Section */}
      <section className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/20 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-container/40 rounded-bl-full -z-0 transition-transform duration-1000 group-hover:scale-110"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-extrabold mb-2 text-on-surface">Welcome back, {user?.name || 'Test User'}</h2>
          <p className="text-on-surface-variant max-w-2xl text-lg">
            Access justice services quickly and securely. You can file reports, track case statuses, and manage your documents all in one place.
          </p>
        </div>
      </section>

      {/* Search & Action Row moved outside the grid to span full width */}
      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Search Input */}
        <div className="relative flex-1 w-full group">
          <span className="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors text-2xl">search</span>
          <input
            type="text"
            placeholder="Search cases, reports or services..."
            className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded-[30px] py-4 pl-16 pr-16 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm text-lg"
          />
          <span className="material-symbols-outlined absolute right-6 top-1/2 -translate-y-1/2 text-on-surface-variant cursor-pointer hover:text-primary transition-colors text-2xl">mic</span>
        </div>

        {/* Filter Icon */}
        <div className="relative">
          <button
            onClick={() => setShowFilter(!showFilter)}
            className={`p-2 transition-colors rounded-full flex items-center justify-center ${showFilter ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-primary hover:bg-surface-container'}`}
          >
            <span className="material-symbols-outlined text-2xl">filter_alt</span>
          </button>

          {/* Filter Dropdown */}
          {showFilter && (
            <div className="absolute right-0 top-12 w-56 bg-surface-container-lowest border border-outline-variant/20 rounded-xl shadow-xl z-20 py-2 animate-in fade-in slide-in-from-top-2">
              <div className="mb-2">
                <p className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-on-surface-variant border-b border-outline-variant/10">Status</p>
                {['Pending', 'Verified', 'Investigating', 'Closed'].map(status => (
                  <button key={status} className="w-full text-left px-4 py-2 hover:bg-surface-container text-sm">
                    {status}
                  </button>
                ))}
              </div>
              <div>
                <p className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-on-surface-variant border-b border-outline-variant/10">Crime Type</p>
                {['Theft', 'Cybercrime', 'Fraud', 'Violence', 'Other'].map(type => (
                  <button key={type} className="w-full text-left px-4 py-2 hover:bg-surface-container text-sm">
                    {type}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* File Complaint Button */}
        <button 
          onClick={() => setShowModal(true)}
          className="bg-error hover:bg-error-dim text-white px-8 py-4 rounded-xl font-bold shadow-[0_4px_0_0_rgba(117,33,33,1)] hover:shadow-[0_2px_0_0_rgba(117,33,33,1)] hover:translate-y-[2px] transition-all active:translate-y-[4px] active:shadow-none whitespace-nowrap text-sm tracking-wide"
        >
          File My Complaint
        </button>
      </div>

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
                  {activeCases.map((c) => (
                    <div key={c.id} className="bg-surface-container p-6 rounded-2xl border border-outline-variant/10 shadow-sm h-[200px] flex flex-col justify-between hover:shadow-md transition-shadow relative animate-in fade-in zoom-in-95 duration-300">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs font-extrabold text-on-surface uppercase tracking-widest mt-1">FIR NO: <span className="font-bold text-on-surface-variant ml-2 normal-case tracking-normal">{c.id}</span></p>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-medium px-3 py-1 bg-surface-container-high/50 rounded-full">
                          <span className={`w-1.5 h-1.5 rounded-full ${c.status === 'Approved' ? 'bg-secondary' : 'bg-primary'}`}></span>
                          <span className="text-on-surface-variant/80">{c.status}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-end mt-4">
                        <div>
                          <p className="text-xs font-extrabold text-on-surface uppercase tracking-widest">Assigned Officer:</p>
                          <p className="text-sm font-bold text-on-surface-variant mt-1">{c.officer}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-extrabold text-on-surface uppercase tracking-widest">Crime Type:</p>
                          <p className="text-sm font-bold text-on-surface-variant mt-1">{c.crimeType}</p>
                        </div>
                      </div>
                    </div>
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
          {[
            { label: 'ACTIVE REPORTS', value: activeCases.length.toString(), icon: 'assignment', color: 'text-primary' },
            { label: 'PENDING VERIFICATION', value: activeCases.filter(c => c.status === 'Pending Review').length.toString(), icon: 'pending_actions', color: 'text-secondary' },
            { label: 'CLOSED CASES', value: user?.stats?.closed || '0', icon: 'check_circle', color: 'text-tertiary' }
          ].map(stat => (
            <div key={stat.label} className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/20 shadow-sm flex items-center gap-6 hover:shadow-md transition-shadow">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-surface-container-high ${stat.color}`}>
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
            
            <form onSubmit={handleFileComplaint} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Crime Type</label>
                <select 
                  className="w-full bg-surface-container border border-outline-variant/40 rounded-xl p-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium"
                  value={formData.crimeType}
                  onChange={(e) => setFormData({...formData, crimeType: e.target.value})}
                  required
                >
                  <option value="" disabled>Select category...</option>
                  <option value="Theft">Theft / Burglary</option>
                  <option value="Cyber Fraud">Cyber Fraud</option>
                  <option value="Assault">Assault</option>
                  <option value="Other">Other Complaint</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Description</label>
                <textarea 
                  className="w-full bg-surface-container border border-outline-variant/40 rounded-xl p-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary h-32 resize-none font-medium"
                  placeholder="Provide brief details about the incident..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                ></textarea>
              </div>
              
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
                  className="flex-1 py-3 font-bold bg-error hover:bg-error-dim text-white rounded-xl transition-colors shadow-md"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
