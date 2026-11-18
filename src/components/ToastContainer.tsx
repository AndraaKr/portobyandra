import React from 'react';
import { usePortfolio } from '../context/PortfolioContext';

export const ToastContainer: React.FC = () => {
  const { toasts } = usePortfolio();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4">
      {toasts.map((toast) => {
        const prefix =
          toast.type === 'success'
            ? 'BERHASIL: '
            : toast.type === 'error'
            ? 'GALAT: '
            : 'INFO: ';

        return (
          <div
            key={toast.id}
            className="pointer-events-auto p-3.5 border-l-2 transition-opacity duration-150"
            style={{
              backgroundColor: 'var(--ink)',
              color: 'var(--paper)',
              borderColor: 'var(--vermilion)',
              borderRadius: 0,
            }}
          >
            <p className="label-mono leading-relaxed" style={{ color: 'var(--paper)' }}>
              <span className="font-semibold">{prefix}</span>
              {toast.message}
            </p>
          </div>
        );
      })}
    </div>
  );
};
