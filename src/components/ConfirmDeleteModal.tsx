import React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  titulo?: string;
  mensagem: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  titulo = 'Excluir Item?',
  mensagem,
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        e.stopPropagation();
        if (!isLoading) onCancel();
      }}
    >
      <div 
        className="stamped-border bg-[#FBF9F5] text-[#1A1A1A] max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-full bg-[#7B1E27]/10 flex items-center justify-center shrink-0 text-[#7B1E27]">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-xl font-bold text-[#1A1A1A]">
              {titulo}
            </h3>
            <p className="font-sans text-xs text-[#1A1A1A]/70 mt-1 leading-relaxed">
              {mensagem}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#1A1A1A]/10">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onCancel();
            }}
            disabled={isLoading}
            className="px-4 py-2 font-sans text-xs font-semibold uppercase tracking-wider text-[#1A1A1A]/70 hover:bg-[#1A1A1A]/5 rounded transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onConfirm();
            }}
            disabled={isLoading}
            className="px-4 py-2 bg-[#7B1E27] text-white font-sans text-xs font-bold uppercase tracking-wider hover:bg-[#60151C] shadow-sm rounded transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Excluindo...</span>
              </>
            ) : (
              <span>Excluir</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
