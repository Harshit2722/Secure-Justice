import React from 'react';

export default function ConfirmModal({ 
  show, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  confirmText = "Delete", 
  cancelText = "Cancel",
  type = "danger" // 'danger', 'warning', 'info'
}) {
  if (!show) return null;

  const typeStyles = {
    danger: {
      icon: 'delete_forever',
      color: 'text-error',
      bg: 'bg-error/10',
      btn: 'bg-error text-on-error hover:bg-error-dim'
    },
    warning: {
      icon: 'warning',
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      btn: 'bg-amber-500 text-white hover:bg-amber-600'
    },
    info: {
      icon: 'info',
      color: 'text-primary',
      bg: 'bg-primary/10',
      btn: 'bg-primary text-on-primary hover:bg-primary-dim'
    }
  };

  const style = typeStyles[type] || typeStyles.info;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-surface-container-lowest w-full max-w-md rounded-[40px] p-8 shadow-2xl animate-in zoom-in-95 duration-300 border border-outline-variant/10 text-center relative overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-outline-variant/20 to-transparent"></div>
        
        <div className={`w-20 h-20 ${style.bg} ${style.color} rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner`}>
          <span className="material-symbols-outlined text-4xl">{style.icon}</span>
        </div>

        <h3 className="text-2xl font-black text-on-surface mb-3 tracking-tight">{title}</h3>
        <p className="text-on-surface-variant leading-relaxed mb-8 font-medium px-4">
          {message}
        </p>

        <div className="flex flex-col gap-3">
          <button 
            onClick={onConfirm}
            className={`w-full py-4 ${style.btn} rounded-2xl font-black tracking-widest uppercase text-[10px] transition-all shadow-lg active:scale-[0.98] hover:shadow-xl`}
          >
            {confirmText}
          </button>
          <button 
            onClick={onCancel}
            className="w-full py-4 bg-surface-container text-on-surface-variant rounded-2xl font-black tracking-widest uppercase text-[10px] hover:bg-surface-container-highest transition-all active:scale-[0.98]"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
}
