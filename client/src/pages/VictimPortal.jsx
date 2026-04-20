import { useOutletContext } from 'react-router-dom';

export default function VictimPortal() {
  const { user } = useOutletContext();

  const activeCase = {
    id: 'CR-2026-1142',
    title: 'State vs. Doe',
    status: 'Pre-Trial',
    progress: 45, // percentage
    nextHearing: {
      date: 'Nov 15, 2026',
      time: '10:00 AM',
      court: 'District Court, Room 4B',
      judge: 'Hon. Sarah Jenkins'
    }
  };

  const personnel = [
    { role: 'Assigned Lawyer', name: 'Adv. Michael Chang', phone: '+1 (555) 123-4567', icon: 'work' },
    { role: 'Investigating Officer', name: 'Det. Sarah Connor', phone: '+1 (555) 987-6543', icon: 'local_police' }
  ];

  const documents = [
    { name: 'Initial Statement.pdf', date: 'Oct 01, 2026', size: '2.4 MB' },
    { name: 'Medical_Report_Signed.pdf', date: 'Oct 05, 2026', size: '5.1 MB' },
    { name: 'Subpoena_Notice.pdf', date: 'Oct 10, 2026', size: '1.2 MB' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Next Hearing Highlight */}
      <section className="bg-primary text-on-primary p-8 rounded-3xl shadow-xl shadow-primary/20 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        
        <div className="relative z-10">
          <p className="text-primary-container font-bold tracking-widest uppercase text-sm mb-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">event</span> Next Scheduled Hearing
          </p>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2">{activeCase.nextHearing.date}</h2>
          <p className="text-xl text-primary-container font-medium">{activeCase.nextHearing.time} • {activeCase.nextHearing.court}</p>
        </div>

        <div className="relative z-10 bg-on-primary text-primary px-6 py-4 rounded-2xl flex flex-col items-start min-w-[200px]">
          <span className="text-xs font-bold uppercase tracking-widest opacity-70 mb-1">Presiding</span>
          <span className="font-extrabold text-lg">{activeCase.nextHearing.judge}</span>
        </div>
      </section>

      {/* Case Progress & Details */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-8">
          {/* Active Case Tracker */}
          <div className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/20 shadow-sm">
            <div className="flex justify-between items-end mb-6">
              <div>
                <span className="text-xs font-bold tracking-widest text-primary uppercase bg-primary-container px-3 py-1 rounded-full mb-3 inline-block">Active Case</span>
                <h3 className="text-2xl font-bold">{activeCase.title}</h3>
                <p className="text-on-surface-variant mt-1">Case No: {activeCase.id}</p>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-on-surface-variant uppercase tracking-widest">Status</span>
                <p className="text-xl font-extrabold text-secondary">{activeCase.status}</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-8 relative">
              <div className="flex justify-between text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">
                <span>Filed</span>
                <span>Investigation</span>
                <span>Pre-Trial</span>
                <span>Trial</span>
                <span>Verdict</span>
              </div>
              <div className="h-3 w-full bg-surface-container rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${activeCase.progress}%` }}
                ></div>
              </div>
              <div 
                className="absolute top-8 w-4 h-4 bg-primary rounded-full border-4 border-surface-container-lowest shadow-sm -mt-[3px] transition-all duration-1000"
                style={{ left: `calc(${activeCase.progress}% - 8px)` }}
              ></div>
            </div>
          </div>

          {/* Documents */}
          <div className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/20 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">folder_open</span> Case Documents
              </h3>
              <button className="text-sm font-bold text-primary hover:underline">View All</button>
            </div>
            <div className="space-y-3">
              {documents.map(doc => (
                <div key={doc.name} className="group flex items-center justify-between p-4 rounded-xl hover:bg-surface-container transition-colors border border-transparent hover:border-outline-variant/20 cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-error-container text-on-error-container flex items-center justify-center">
                      <span className="material-symbols-outlined">picture_as_pdf</span>
                    </div>
                    <div>
                      <p className="font-bold text-sm group-hover:text-primary transition-colors">{doc.name}</p>
                      <p className="text-xs text-on-surface-variant">{doc.date} • {doc.size}</p>
                    </div>
                  </div>
                  <button className="text-outline-variant group-hover:text-primary transition-colors p-2">
                    <span className="material-symbols-outlined">download</span>
                  </button>
                </div>
              ))}
            </div>
            <button className="mt-6 w-full py-4 border-2 border-dashed border-outline-variant/40 rounded-xl text-on-surface-variant font-bold tracking-wide hover:border-primary hover:text-primary hover:bg-primary-container/20 transition-all flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">upload_file</span>
              Upload New Evidence/Document
            </button>
          </div>
        </div>

        {/* Sidebar - Personnel & Support */}
        <div className="space-y-8">
          <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/20 shadow-sm">
            <h3 className="text-lg font-bold mb-5 border-b border-outline-variant/10 pb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">contact_support</span> 
              Assigned Personnel
            </h3>
            <div className="space-y-6">
              {personnel.map(person => (
                <div key={person.role} className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-on-surface-variant">{person.icon}</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-primary">{person.role}</span>
                    <p className="font-extrabold text-sm mt-0.5">{person.name}</p>
                    <a href={`tel:${person.phone}`} className="text-xs text-on-surface-variant hover:text-primary mt-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">call</span> {person.phone}
                    </a>
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-6 w-full bg-secondary-container text-on-secondary-container py-3 rounded-xl text-sm font-bold tracking-wide hover:bg-secondary hover:text-on-secondary transition-colors">
              Request Meeting
            </button>
          </div>

          <div className="bg-tertiary text-on-tertiary p-6 rounded-3xl shadow-md relative overflow-hidden">
            <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-[120px] opacity-10">psychology</span>
            <h3 className="text-lg font-bold mb-2">Need Support?</h3>
            <p className="text-sm opacity-90 mb-4 leading-relaxed">Legal proceedings can be stressful. Access free counseling and victim support services.</p>
            <button className="bg-on-tertiary text-tertiary px-5 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wider w-full hover:bg-white transition-colors shadow-sm">
              Connect Now
            </button>
          </div>
        </div>

      </section>

    </div>
  );
}
