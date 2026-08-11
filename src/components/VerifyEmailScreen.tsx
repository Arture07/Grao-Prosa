import React, { useState } from 'react';
import { sendEmailVerification, signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useAuth } from '../hooks/useAuth';
import { MailCheck, RefreshCw, LogOut, Loader2, CheckCircle2, AlertCircle, Coffee } from 'lucide-react';

export const VerifyEmailScreen: React.FC = () => {
  const { reloadUser, logout } = useAuth();
  const [isChecking, setIsChecking] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const currentUser = auth.currentUser;

  const handleCheckVerification = async () => {
    setIsChecking(true);
    setMessage(null);
    try {
      if (auth.currentUser) {
        await auth.currentUser.reload();
        if (reloadUser) {
          await reloadUser();
        }
        if (auth.currentUser.emailVerified) {
          setMessage({
            text: 'E-mail verificado com sucesso! Redirecionando...',
            type: 'success'
          });
        } else {
          setMessage({
            text: 'Seu e-mail ainda não consta como verificado. Por favor, clique no link de ativação enviado para sua caixa de entrada (ou spam) e tente novamente.',
            type: 'error'
          });
        }
      }
    } catch (err: any) {
      console.error('Erro ao verificar status do e-mail:', err);
      setMessage({
        text: 'Erro ao verificar e-mail. Tente novamente em alguns instantes.',
        type: 'error'
      });
    } finally {
      setIsChecking(false);
    }
  };

  const handleResendEmail = async () => {
    setIsResending(true);
    setMessage(null);
    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
        setMessage({
          text: 'E-mail de ativação reenviado com sucesso! Verifique sua caixa de entrada e spam.',
          type: 'success'
        });
      } else {
        setMessage({
          text: 'Usuário não encontrado. Por favor, faça login novamente.',
          type: 'error'
        });
      }
    } catch (err: any) {
      console.error('Erro ao reenviar e-mail de verificação:', err);
      if (err?.code === 'auth/too-many-requests') {
        setMessage({
          text: 'Muitas solicitações recentes. Por favor, aguarde alguns minutos antes de tentar reenviar.',
          type: 'error'
        });
      } else {
        setMessage({
          text: 'Erro ao reenviar e-mail. Verifique se o endereço está correto e tente novamente.',
          type: 'error'
        });
      }
    } finally {
      setIsResending(false);
    }
  };

  const handleLogout = async () => {
    try {
      if (logout) {
        await logout();
      } else {
        await signOut(auth);
      }
    } catch (err) {
      console.error('Erro ao fazer logout:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center p-4 sm:p-6 text-[#1A1A1A] font-sans">
      <div className="w-full max-w-md space-y-6 bg-[#FAF7F2] p-6 sm:p-8 rounded-2xl border border-[#1A1A1A]/10 shadow-xl relative text-center">
        
        {/* Ícone e Marca */}
        <div className="mx-auto w-14 h-14 bg-[#7B1E27]/10 text-[#7B1E27] rounded-full flex items-center justify-center mb-2">
          <MailCheck className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#7B1E27]/10 text-[#7B1E27] rounded-full text-[10px] font-semibold uppercase tracking-widest">
            <Coffee className="w-3 h-3" />
            <span>Grão & Prosa</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#1A1A1A]">
            Ativação de Conta Pendente
          </h1>
          <p className="text-xs sm:text-sm text-[#1A1A1A]/75 leading-relaxed font-medium">
            Verifique seu e-mail para continuar. Enviamos um link de ativação para você.
          </p>
          {currentUser?.email && (
            <p className="text-xs font-mono bg-white/70 py-1.5 px-3 rounded-md border border-[#1A1A1A]/10 text-[#7B1E27] font-semibold inline-block max-w-full truncate mt-1">
              {currentUser.email}
            </p>
          )}
        </div>

        {/* Feedback Messages */}
        {message && (
          <div
            className={`p-3 rounded-lg text-xs font-medium flex items-start gap-2 text-left animate-fadeIn ${
              message.type === 'success'
                ? 'bg-emerald-50 border-l-4 border-emerald-600 text-emerald-900'
                : message.type === 'error'
                ? 'bg-red-50 border-l-4 border-red-600 text-red-900'
                : 'bg-blue-50 border-l-4 border-blue-600 text-blue-900'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Ações / Botões */}
        <div className="space-y-3 pt-2">
          {/* Botão 1: Já verifiquei meu e-mail */}
          <button
            type="button"
            onClick={handleCheckVerification}
            disabled={isChecking || isResending}
            className="w-full py-3 px-5 bg-[#7B1E27] hover:bg-[#5A121A] text-white font-sans text-xs uppercase tracking-widest font-semibold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 rounded-lg active:scale-[0.99]"
          >
            {isChecking ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>VERIFICANDO STATUS...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>JÁ VERIFIQUEI MEU E-MAIL</span>
              </>
            )}
          </button>

          {/* Botão 2: Reenviar e-mail */}
          <button
            type="button"
            onClick={handleResendEmail}
            disabled={isChecking || isResending}
            className="w-full py-2.5 px-5 bg-white hover:bg-stone-50 border border-[#1A1A1A]/20 text-[#1A1A1A] font-sans text-xs uppercase tracking-wider font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 rounded-lg active:scale-[0.99]"
          >
            {isResending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#7B1E27]" />
                <span>REENVIANDO...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5 text-[#7B1E27]" />
                <span>REENVIAR E-MAIL DE ATIVAÇÃO</span>
              </>
            )}
          </button>

          {/* Botão 3: Sair / Voltar ao Login */}
          <div className="pt-2 border-t border-[#1A1A1A]/10">
            <button
              type="button"
              onClick={handleLogout}
              disabled={isChecking || isResending}
              className="inline-flex items-center gap-1.5 text-xs text-[#1A1A1A]/60 hover:text-[#7B1E27] font-semibold transition-colors cursor-pointer disabled:opacity-50 py-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sair / Voltar ao Login</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
