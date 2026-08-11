import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { LanguageSelector } from './LanguageSelector';
import { deleteUser, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { 
  User as UserIcon, 
  LogOut, 
  Trash2, 
  Mail, 
  AlertTriangle,
  Smartphone,
  X,
  KeyRound,
  Calendar,
  CheckCircle2,
  Loader2
} from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { isInstallable, installApp } = usePWAInstall();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Estados do Reset de Senha
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [resetSuccessMsg, setResetSuccessMsg] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

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

  const handleSendPasswordReset = async () => {
    if (!auth.currentUser?.email) return;

    setIsSendingReset(true);
    setResetError(null);

    try {
      await sendPasswordResetEmail(auth, auth.currentUser.email);
      setResetSuccessMsg(true);
      setShowResetConfirm(false);
    } catch (err: any) {
      console.error('Erro ao enviar e-mail de redefinição:', err);
      setResetError(err?.message || 'Erro ao enviar e-mail de redefinição.');
    } finally {
      setIsSendingReset(false);
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

  // Formatação de data de criação do usuário (Membro desde)
  const getCreationDateFormatted = () => {
    const rawDate = auth.currentUser?.metadata.creationTime;
    if (!rawDate) return null;
    const d = new Date(rawDate);
    if (isNaN(d.getTime())) return null;
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${month}/${year}`;
  };

  const memberSince = getCreationDateFormatted();

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
              {t('profile.myAccount')}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-800 transition-colors cursor-pointer p-1"
            title={t('modals.close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informações do Usuário */}
        <div className="bg-white p-3 border border-[#1A1A1A]/10 space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1A1A1A] text-[#FAF7F2] flex items-center justify-center font-serif text-lg font-bold border border-[#7B1E27] shrink-0">
              {userInitial}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-serif text-sm font-bold text-[#1A1A1A] truncate">
                {user?.displayName || 'Apreciador de Café'}
              </h4>
              <div className="flex items-center gap-1 text-xs text-[#5A4033] truncate">
                <Mail className="w-3 h-3 text-[#7B1E27] shrink-0" />
                <span className="truncate">{user?.email}</span>
              </div>
            </div>
          </div>

          {/* Membro Desde */}
          {memberSince && (
            <div className="pt-2 border-t border-[#1A1A1A]/10 flex items-center gap-1.5 text-[11px] text-[#5A4033] font-sans">
              <Calendar className="w-3.5 h-3.5 text-[#7B1E27]" />
              <span>{t('profile.memberSince')}: <strong className="font-serif text-[#1A1A1A]">{memberSince}</strong></span>
            </div>
          )}
        </div>

        {/* Seletor de Idiomas */}
        <div className="bg-white p-3 border border-[#1A1A1A]/10">
          <LanguageSelector variant="full" />
        </div>

        {/* Mudar Senha / Confirmação Inline */}
        <div className="bg-white p-3 border border-[#1A1A1A]/10 space-y-2">
          {resetSuccessMsg ? (
            <div className="flex items-center gap-2 text-emerald-800 text-xs font-semibold bg-emerald-50 p-2.5 rounded border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{t('profile.resetEmailSent')}</span>
            </div>
          ) : showResetConfirm ? (
            <div className="space-y-2 animate-fadeIn">
              <p className="text-xs font-semibold text-[#1A1A1A]">
                {t('profile.sendResetEmailPrompt')}
              </p>
              {resetError && (
                <p className="text-[11px] text-red-600 bg-red-50 p-1.5 border border-red-200">
                  {resetError}
                </p>
              )}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSendPasswordReset}
                  disabled={isSendingReset}
                  className="px-3 py-1.5 bg-[#3B2314] hover:bg-[#2A180C] text-white font-sans text-xs uppercase tracking-wider font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSendingReset ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    t('profile.confirm')
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowResetConfirm(false);
                    setResetError(null);
                  }}
                  disabled={isSendingReset}
                  className="px-3 py-1.5 bg-transparent text-[#1A1A1A] font-sans text-xs uppercase tracking-wider font-semibold border border-[#1A1A1A]/30 cursor-pointer"
                >
                  {t('profile.cancel')}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => {
                setShowResetConfirm(true);
                setResetSuccessMsg(false);
                setResetError(null);
              }}
              className="w-full py-2 px-3 bg-[#F5F2ED] hover:bg-[#EAE6DF] text-[#1A1A1A] font-sans text-xs uppercase tracking-wider font-bold border border-[#1A1A1A]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <KeyRound className="w-4 h-4 text-[#5A4033]" />
              {t('profile.changePassword')}
            </button>
          )}
        </div>

        {/* Botões Principais de Ação */}
        <div className="space-y-2 pt-1">
          {/* Botão de Instalação PWA se disponível */}
          {isInstallable && (
            <button
              onClick={() => {
                installApp();
                onClose();
              }}
              className="w-full py-2.5 bg-[#5A4033] hover:bg-[#3D2B22] text-[#FAF7F2] font-sans text-xs uppercase tracking-wider font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Smartphone className="w-4 h-4" />
              {t('profile.addToHomeScreen')}
            </button>
          )}

          {/* Botão Sair da Conta */}
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full py-2.5 bg-transparent hover:bg-[#7B1E27]/5 text-[#7B1E27] font-sans text-xs uppercase tracking-wider font-bold border-2 border-[#7B1E27] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <LogOut className="w-4 h-4" />
            {isLoggingOut ? t('profile.loggingOut') : t('profile.logout')}
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
            {t('profile.deleteAccountPermanent')}
          </button>
        </div>

        {/* Modal Secundário de Confirmação para Exclusão */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-4">
            <div className="bg-[#FAF7F2] border-2 border-[#1A1A1A] max-w-xs w-full p-5 shadow-2xl relative space-y-4">
              <div className="flex items-center gap-2 text-red-700 border-b border-[#1A1A1A]/10 pb-2">
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                <h4 className="font-serif text-lg font-bold text-[#1A1A1A]">
                  {t('modals.areYouSure')}
                </h4>
              </div>

              <p className="text-xs text-stone-700 font-semibold leading-relaxed bg-red-100/80 p-3 border-l-4 border-red-600">
                {t('modals.cannotBeUndone')}
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
                  {t('modals.cancel')}
                </button>

                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="px-3 py-1.5 bg-[#DC2626] hover:bg-red-700 text-white font-sans text-xs uppercase tracking-wider font-bold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  {isDeleting ? t('profile.deleting') : t('modals.delete')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

