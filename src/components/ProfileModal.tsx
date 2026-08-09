import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { deleteUser } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { 
  User as UserIcon, 
  LogOut, 
  Trash2, 
  Mail, 
  AlertTriangle,
  X
} from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  if (!isOpen) return null;

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      onClose();
    } catch (err) {
      console.error('Erro ao realizar logout:', err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!auth.currentUser) {
      setDeleteError('Nenhum usuário ativo foi encontrado.');
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      await deleteUser(auth.currentUser);
      setIsDeleteModalOpen(false);
      onClose();
    } catch (err: any) {
      console.error('Erro ao excluir conta:', err);
      const errorCode = err?.code || '';
      const errorMessage = err?.message || '';

      if (errorCode === 'auth/requires-recent-login' || errorMessage.includes('requires-recent-login')) {
        setDeleteError(
          'Sua sessão é antiga para esta operação. Por razões de segurança, faça logout, entre na conta novamente e tente excluir a conta.'
        );
      } else {
        setDeleteError(
          'Ocorreu um erro ao tentar excluir sua conta. Por favor, tente novamente.'
        );
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const userInitial = user?.displayName
    ? user.displayName.charAt(0).toUpperCase()
    : user?.email
    ? user.email.charAt(0).toUpperCase()
    : 'C';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-[#FAF7F2] border-2 border-[#1A1A1A] max-w-sm w-full p-5 shadow-2xl relative space-y-4">
        {/* Header do Modal */}
        <div className="flex items-center justify-between border-b border-[#1A1A1A]/15 pb-3">
          <div className="flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-[#7B1E27]" />
            <h3 className="font-serif text-xl font-bold text-[#1A1A1A]">
              Minha Conta
            </h3>
          </div>

          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-800 transition-colors cursor-pointer p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informações do Usuário */}
        <div className="flex items-center gap-3 bg-white p-3 border border-[#1A1A1A]/10">
          <div className="w-10 h-10 rounded-full bg-[#1A1A1A] text-[#FAF7F2] flex items-center justify-center font-serif text-lg font-bold border border-[#7B1E27] shrink-0">
            {userInitial}
          </div>
          <div className="min-w-0">
            <h4 className="font-serif text-sm font-bold text-[#1A1A1A] truncate">
              {user?.displayName || 'Apreciador de Café'}
            </h4>
            <div className="flex items-center gap-1 text-xs text-[#5A4033] truncate">
              <Mail className="w-3 h-3 text-[#7B1E27] shrink-0" />
              <span className="truncate">{user?.email}</span>
            </div>
          </div>
        </div>

        {/* Botões Principais de Ação */}
        <div className="space-y-2 pt-1">
          {/* Botão Sair da Conta */}
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full py-2.5 bg-transparent hover:bg-[#7B1E27]/5 text-[#7B1E27] font-sans text-xs uppercase tracking-wider font-bold border-2 border-[#7B1E27] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <LogOut className="w-4 h-4" />
            {isLoggingOut ? 'Saindo...' : 'Sair da Conta'}
          </button>

          {/* Botão Excluir Conta */}
          <button
            onClick={() => {
              setDeleteError(null);
              setIsDeleteModalOpen(true);
            }}
            className="w-full py-2.5 bg-[#DC2626] hover:bg-red-700 text-white font-sans text-xs uppercase tracking-wider font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            Excluir Minha Conta Permanentemente
          </button>
        </div>

        {/* Modal Secundário de Confirmação para Exclusão */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-4">
            <div className="bg-[#FAF7F2] border-2 border-[#1A1A1A] max-w-xs w-full p-5 shadow-2xl relative space-y-4">
              <div className="flex items-center gap-2 text-red-700 border-b border-[#1A1A1A]/10 pb-2">
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                <h4 className="font-serif text-lg font-bold text-[#1A1A1A]">
                  Confirmar Exclusão
                </h4>
              </div>

              <p className="text-xs text-stone-700 font-semibold leading-relaxed bg-red-100/80 p-3 border-l-4 border-red-600">
                Tem certeza? Esta ação apagará todos os seus grãos e diários e não pode ser desfeita.
              </p>

              {deleteError && (
                <p className="text-[11px] text-amber-900 bg-amber-50 p-2 border border-amber-200">
                  {deleteError}
                </p>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  disabled={isDeleting}
                  className="px-3 py-1.5 bg-transparent text-[#1A1A1A] font-sans text-xs uppercase tracking-wider font-semibold border border-[#1A1A1A]/30 cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="px-3 py-1.5 bg-[#DC2626] hover:bg-red-700 text-white font-sans text-xs uppercase tracking-wider font-bold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  {isDeleting ? 'Excluindo...' : 'Confirmar Exclusão'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
