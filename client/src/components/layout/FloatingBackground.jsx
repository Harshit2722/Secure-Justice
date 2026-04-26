import React, { useMemo } from 'react';

export default function FloatingBackground() {
  const documents = useMemo(() => Array.from({ length: 40 }).map((_, i) => ({
    id: i,
    icon: ['description', 'folder', 'gavel', 'account_balance', 'assignment'][Math.floor(Math.random() * 5)],
    left: `${Math.random() * 100}%`,
    animationDuration: `${20 + Math.random() * 30}s`,
    animationDelay: `-${Math.random() * 30}s`,
    size: `${20 + Math.random() * 60}px`,
    opacity: 1,
  })), []);

  return (
    <>
      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(110vh) rotate(0deg); opacity: 0; }
          10% { opacity: calc(var(--max-opacity) * var(--opacity-scale, 1)); }
          90% { opacity: calc(var(--max-opacity) * var(--opacity-scale, 1)); }
          100% { transform: translateY(-20vh) rotate(45deg); opacity: 0; }
        }
        .animate-float {
          animation: floatUp var(--duration) linear infinite;
          animation-delay: var(--delay);
          font-variation-settings: 'FILL' 0, 'wght' 350, 'GRAD' 0, 'opsz' 24;
          --opacity-scale: 1;
        }
        .dark .animate-float {
          --opacity-scale: 0.3;
        }
      `}</style>
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {documents.map((doc) => (
          <span
            key={doc.id}
            className="material-symbols-outlined absolute text-black dark:text-slate-200 animate-float"
            style={{
              left: doc.left,
              fontSize: doc.size,
              '--duration': doc.animationDuration,
              '--delay': doc.animationDelay,
              '--max-opacity': doc.opacity,
            }}
          >
            {doc.icon}
          </span>
        ))}
      </div>
    </>
  );
}
