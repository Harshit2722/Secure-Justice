import { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';

export default function MyCases() {
  const { user } = useOutletContext();
  const [cases, setCases] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const casesPerPage = 10;

  useEffect(() => {
    // For demo purposes, if user has fewer than 15 cases, let's mock more to show pagination
    let loadedCases = user?.cases || [];
    if (loadedCases.length === 0) {
      // Mocking some cases if none
      loadedCases = Array.from({ length: 25 }, (_, i) => ({
        id: `FIR-2026-${100 + i}`,
        status: i % 3 === 0 ? 'Closed' : (i % 2 === 0 ? 'Verified' : 'Pending'),
        officer: `Officer ${i % 5 + 1}`,
        crimeType: ['Theft', 'Cybercrime', 'Fraud', 'Violence', 'Other'][i % 5],
        date: new Date(2026, 3, 20 - i).toLocaleDateString()
      }));
    }
    setCases(loadedCases);
  }, [user]);

  // Pagination logic
  const indexOfLastCase = currentPage * casesPerPage;
  const indexOfFirstCase = indexOfLastCase - casesPerPage;
  const currentCases = cases.slice(indexOfFirstCase, indexOfLastCase);
  const totalPages = Math.ceil(cases.length / casesPerPage);

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="flex items-center gap-4">
        <Link to="/dashboard" className="p-2 hover:bg-surface-container rounded-full transition-colors text-on-surface-variant flex items-center justify-center">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <h2 className="text-3xl font-extrabold text-on-surface">My Cases</h2>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant/20 shadow-sm rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container-low text-xs uppercase tracking-widest text-on-surface-variant border-b border-outline-variant/10">
              <tr>
                <th className="px-6 py-5 font-bold">Case ID</th>
                <th className="px-6 py-5 font-bold">Crime Type</th>
                <th className="px-6 py-5 font-bold">Status</th>
                <th className="px-6 py-5 font-bold">Assigned Officer</th>
                <th className="px-6 py-5 font-bold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {currentCases.map((c) => (
                <tr key={c.id} className="hover:bg-surface-container/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-on-surface">{c.id}</td>
                  <td className="px-6 py-4 text-sm font-medium text-on-surface-variant">{c.crimeType}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${c.status === 'Closed' ? 'bg-surface-container-high text-on-surface-variant' : (c.status === 'Verified' ? 'bg-secondary/10 text-secondary' : 'bg-primary/10 text-primary')}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${c.status === 'Closed' ? 'bg-outline' : (c.status === 'Verified' ? 'bg-secondary' : 'bg-primary')}`}></span>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-on-surface-variant">{c.officer}</td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <button className="text-primary hover:text-primary/80 transition-colors font-bold tracking-wide">View Details</button>
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
              Showing <span className="font-bold text-on-surface">{indexOfFirstCase + 1}</span> to <span className="font-bold text-on-surface">{Math.min(indexOfLastCase, cases.length)}</span> of <span className="font-bold text-on-surface">{cases.length}</span> cases
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
