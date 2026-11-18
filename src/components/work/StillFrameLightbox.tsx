import React, { useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { WorkStill } from '../../types';

interface StillFrameLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  stills: WorkStill[];
  activeIndex: number;
  onSelectIndex: (index: number) => void;
  workTitle: string;
}

export const StillFrameLightbox: React.FC<StillFrameLightboxProps> = ({
  isOpen,
  onClose,
  stills,
  activeIndex,
  onSelectIndex,
  workTitle,
}) => {
  const currentStill = stills[activeIndex];
  const total = stills.length;

  const handlePrev = useCallback(() => {
    if (total <= 1) return;
    onSelectIndex((activeIndex - 1 + total) % total);
  }, [activeIndex, total, onSelectIndex]);

  const handleNext = useCallback(() => {
    if (total <= 1) return;
    onSelectIndex((activeIndex + 1) % total);
  }, [activeIndex, total, onSelectIndex]);

  // Keyboard navigation: Escape, ArrowLeft, ArrowRight
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, handlePrev, handleNext]);

  if (!isOpen || !currentStill) return null;

  const indexStr = String(activeIndex + 1).padStart(2, '0');
  const totalStr = String(total).padStart(2, '0');

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Pratinjau detail adegan ${currentStill.title}`}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
      style={{ backgroundColor: 'rgba(20, 18, 15, 0.85)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl border border-rule overflow-hidden flex flex-col max-h-[92vh]"
        style={{ backgroundColor: 'var(--paper)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Bar Atas Header Lightbox */}
        <div className="flex items-center justify-between border-b border-rule px-4 py-2.5 bg-paper-2">
          <div className="flex items-center gap-2">
            <span className="label-mono text-xs text-ink font-bold">
              FRAME {indexStr} / {totalStr}
            </span>
            {currentStill.timestamp && (
              <span className="label-mono text-xs text-ink-2 border-l border-rule pl-2">
                {currentStill.timestamp}
              </span>
            )}
            <span className="label-mono text-xs text-ink-2 border-l border-rule pl-2 hidden sm:inline">
              {workTitle}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrev}
              disabled={total <= 1}
              aria-label="Frame sebelumnya"
              className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-ink hover:text-ink-2 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed bg-transparent border-none"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={total <= 1}
              aria-label="Frame berikutnya"
              className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-ink hover:text-ink-2 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed bg-transparent border-none"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup jendela frame"
              className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-ink hover:text-ink-2 cursor-pointer bg-transparent border-none border-l border-rule ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Gambar Frame Utama */}
        <div className="relative bg-paper-2 w-full flex items-center justify-center overflow-hidden min-h-[220px] max-h-[60vh]">
          <img
            src={currentStill.imageUrl}
            alt={currentStill.title}
            className="w-full h-full max-h-[58vh] object-contain select-none"
          />
        </div>

        {/* Bar Bawah: Judul & Analisis Adegan */}
        <div className="p-4 border-t border-rule bg-paper space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
            <h4 className="font-serif text-lg sm:text-xl text-ink font-bold">
              {currentStill.title}
            </h4>
            <span className="label-mono text-xs text-ink-2">
              Navigasi: Tombol panah kiri / kanan / Esc
            </span>
          </div>

          {currentStill.caption && (
            <p className="font-sans text-xs sm:text-sm text-ink-2 leading-relaxed max-w-[75ch]">
              {currentStill.caption}
            </p>
          )}

          {/* Thumbnail Strip */}
          {total > 1 && (
            <div className="flex items-center gap-2 pt-2 border-t border-rule overflow-x-auto pb-1">
              {stills.map((st, idx) => {
                const isActive = idx === activeIndex;
                return (
                  <button
                    key={st.id || idx}
                    type="button"
                    onClick={() => onSelectIndex(idx)}
                    className="relative shrink-0 w-16 h-10 border overflow-hidden cursor-pointer bg-paper-2 min-h-[44px]"
                    style={{
                      borderColor: isActive ? 'var(--ink)' : 'var(--rule)',
                      borderWidth: isActive ? '2px' : '1px',
                    }}
                    aria-label={`Pilih frame ${idx + 1}`}
                  >
                    <img
                      src={st.imageUrl}
                      alt={st.title}
                      className="w-full h-full object-contain"
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
