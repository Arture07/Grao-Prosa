import React, { useState } from 'react';
import { sendEmailVerification, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { Coffee, User, Mail, Lock, Loader2, ArrowLeft, Sparkles } from 'lucide-react';

interface RegisterScreenProps {
  onNavigateToLogin: () => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ onNavigateToLogin }) => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const translateError = (err: any): string => {
    const code = err?.code || err?.message || '';
    if (code.includes('email-already-in-use')) {
      return 'Este e-mail já está em uso por outra conta. Faça login ou utilize outro e-mail.';
    }
    if (code.includes('invalid-email')) {
      return 'Por favor, informe um e-mail válido.';
    }
    if (code.includes('weak-password')) {
      return 'A senha é muito fraca. Ela deve conter no mínimo 6 caracteres.';
    }
    return 'Erro ao criar conta. Verifique os dados informados e tente novamente.';
  };

  const validatePasswordStrength = (pwd: string): boolean => {
    const hasMinLength = pwd.length >= 6;
    const hasUppercase = /[A-Z]/.test(pwd);
    const hasNumber = /\d/.test(pwd);
    const hasSpecialChar = /[@$!%*?&._\-[#\]{}()+=~^\\/|:;"'<>,]/.test(pwd);
    return hasMinLength && hasUppercase && hasNumber && hasSpecialChar;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!nome.trim()) {
      setErrorMessage('Por favor, informe seu nome.');
      return;
    }
    if (!email.trim()) {
      setErrorMessage('Por favor, informe seu e-mail.');
      return;
    }
    if (!password) {
      setErrorMessage('Por favor, crie uma senha.');
      return;
    }
    if (!validatePasswordStrength(password)) {
      setErrorMessage('A senha deve ter no mínimo 6 caracteres, contendo pelo menos uma letra maiúscula, um número e um caractere especial.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Cria conta do usuário com e-mail e senha
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);

      // 2. Atualiza nome do perfil se informado
      if (nome.trim() && userCredential.user) {
        try {
          await updateProfile(userCredential.user, { displayName: nome.trim() });
        } catch (pErr) {
          console.warn('Erro ao atualizar nome do perfil:', pErr);
        }
      }

      // 3. Imediatamente após o sucesso do cadastro, envia o e-mail de verificação
      if (userCredential.user) {
        await sendEmailVerification(userCredential.user);
      }
    } catch (err: any) {
      console.error('Erro de cadastro:', err);
      setErrorMessage(translateError(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F2ED] flex flex-col items-center justify-center p-4 sm:p-6 text-[#1A1A1A] font-sans">
      <div className="w-full max-w-md space-y-7 bg-[#F5F2ED] p-6 sm:p-8 rounded-2xl border border-[#1A1A1A]/10 shadow-xl relative">
        
        {/* Botão de Voltar */}
        <button
          onClick={onNavigateToLogin}
          type="button"
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 text-xs text-[#1A1A1A]/60 hover:text-[#7B1E27] font-semibold transition-colors cursor-pointer disabled:opacity-40 mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar para Login</span>
        </button>

        {/* Branding e Cabeçalho */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-[#7B1E27] font-semibold text-[10px] uppercase tracking-widest">
            <Sparkles className="w-3 h-3" />
            <span>Criar Nova Conta</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#1A1A1A]">
            Junte-se ao Grão & Prosa
          </h1>
          <p className="text-xs text-[#1A1A1A]/60">
            Cadastre-se para sincronizar seus cafés e degustações com segurança.
          </p>
        </div>

        {/* Formulário de Registro Minimalista */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          
          {/* Campo Nome */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A]/70 flex items-center gap-1">
              <User className="w-3 h-3 text-[#7B1E27]" />
              <span>Seu Nome *</span>
            </label>
            <input
              type="text"
              disabled={isLoading}
              value={nome}
              onChange={(e) => {
                setNome(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              className="w-full bg-transparent border-b border-[#1A1A1A]/25 focus:border-[#7B1E27] px-1 py-1.5 text-xs sm:text-sm text-[#1A1A1A] focus:outline-none transition-colors rounded-none disabled:opacity-50"
            />
          </div>

          {/* Campo E-mail */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A]/70 flex items-center gap-1">
              <Mail className="w-3 h-3 text-[#7B1E27]" />
              <span>E-mail *</span>
            </label>
            <input
              type="email"
              disabled={isLoading}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              className="w-full bg-transparent border-b border-[#1A1A1A]/25 focus:border-[#7B1E27] px-1 py-1.5 text-xs sm:text-sm text-[#1A1A1A] focus:outline-none transition-colors rounded-none disabled:opacity-50"
            />
          </div>

          {/* Campo Senha */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A]/70 flex items-center gap-1">
              <Lock className="w-3 h-3 text-[#7B1E27]" />
              <span>Senha *</span>
            </label>
            <input
              type="password"
              disabled={isLoading}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              className="w-full bg-transparent border-b border-[#1A1A1A]/25 focus:border-[#7B1E27] px-1 py-1.5 text-xs sm:text-sm text-[#1A1A1A] focus:outline-none transition-colors rounded-none disabled:opacity-50"
            />
            <p className="text-[10px] text-[#1A1A1A]/60 pt-0.5 leading-tight">
              A senha deve conter: mín. 6 caracteres, letra maiúscula, número e símbolo.
            </p>
          </div>

          {/* Mensagem Elegante de Erro */}
          {errorMessage && (
            <div className="p-2.5 bg-red-50 border-l-2 border-red-600 rounded-r-md text-red-700 text-xs font-medium animate-fadeIn">
              {errorMessage}
            </div>
          )}

          {/* Botão de Submissão */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-6 bg-[#7B1E27] hover:bg-[#5A121A] text-white font-sans text-xs uppercase tracking-widest font-semibold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 rounded-lg active:scale-[0.99] mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>CRIANDO CONTA...</span>
              </>
            ) : (
              <span>CRIAR MINHA CONTA</span>
            )}
          </button>
        </form>

        {/* Rodapé / Alternância para Login */}
        <div className="pt-3 border-t border-[#1A1A1A]/10 text-center">
          <button
            type="button"
            onClick={onNavigateToLogin}
            disabled={isLoading}
            className="text-xs text-[#1A1A1A]/75 hover:text-[#7B1E27] font-medium transition-colors cursor-pointer disabled:opacity-50 underline underline-offset-4"
          >
            Já possui uma conta? Faça login
          </button>
        </div>

      </div>
    </div>
  );
};
