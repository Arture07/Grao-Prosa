import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Coffee, Mail, Lock, Sparkles, Loader2, ArrowRight } from 'lucide-react';

interface LoginScreenProps {
  onNavigateToRegister: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onNavigateToRegister }) => {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const translateError = (err: any): string => {
    const code = err?.code || err?.message || '';
    if (code.includes('invalid-credential') || code.includes('wrong-password') || code.includes('user-not-found')) {
      return 'E-mail ou senha incorretos. Por favor, verifique seus dados.';
    }
    if (code.includes('invalid-email')) {
      return 'Endereço de e-mail inválido. Digite um e-mail correto.';
    }
    if (code.includes('too-many-requests')) {
      return 'Muitas tentativas consecutivas. Aguarde um instante e tente novamente.';
    }
    return 'Ocorreu um erro ao entrar. Verifique seus dados e tente novamente.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage('Informe seu e-mail para continuar.');
      return;
    }
    if (!password) {
      setErrorMessage('Informe sua senha.');
      return;
    }

    setIsLoading(true);

    try {
      await login(email, password);
    } catch (err: any) {
      console.error('Erro de login:', err);
      setErrorMessage(translateError(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F2ED] flex flex-col items-center justify-center p-4 sm:p-6 text-[#1A1A1A] font-sans">
      <div className="w-full max-w-md space-y-8 bg-[#F5F2ED] p-6 sm:p-8 rounded-2xl border border-[#1A1A1A]/10 shadow-xl">
        
        {/* Branding e Cabeçalho */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#7B1E27]/10 text-[#7B1E27] rounded-full text-xs font-semibold uppercase tracking-widest">
            <Coffee className="w-3.5 h-3.5" />
            <span>Grão & Prosa</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#1A1A1A]">
            Acessar Despensa
          </h1>
          <p className="text-xs sm:text-sm text-[#1A1A1A]/60 max-w-xs mx-auto">
            Sua coleção de cafés e fichas de degustação personalizadas na nuvem.
          </p>
        </div>

        {/* Formulário de Login Minimalista */}
        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          
          {/* Campo E-mail */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1A1A1A]/70 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#7B1E27]" />
              <span>E-mail</span>
            </label>
            <input
              type="email"
              disabled={isLoading}
              placeholder="seu.email@exemplo.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              className="w-full bg-transparent border-b border-[#1A1A1A]/25 focus:border-[#7B1E27] px-1 py-2 text-sm text-[#1A1A1A] focus:outline-none transition-colors rounded-none placeholder:text-[#1A1A1A]/35 disabled:opacity-50"
            />
          </div>

          {/* Campo Senha */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1A1A1A]/70 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#7B1E27]" />
              <span>Senha</span>
            </label>
            <input
              type="password"
              disabled={isLoading}
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              className="w-full bg-transparent border-b border-[#1A1A1A]/25 focus:border-[#7B1E27] px-1 py-2 text-sm text-[#1A1A1A] focus:outline-none transition-colors rounded-none placeholder:text-[#1A1A1A]/35 disabled:opacity-50"
            />
          </div>

          {/* Mensagem Elegante de Erro */}
          {errorMessage && (
            <div className="p-3 bg-red-50 border-l-2 border-red-600 rounded-r-md text-red-700 text-xs font-medium animate-fadeIn">
              {errorMessage}
            </div>
          )}

          {/* Botão de Submissão Principal */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-6 bg-[#7B1E27] hover:bg-[#5A121A] text-white font-sans text-xs uppercase tracking-widest font-semibold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 rounded-lg active:scale-[0.99] mt-4"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>ENTRANDO...</span>
              </>
            ) : (
              <>
                <span>ENTRAR NA CONTA</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Rodapé / Alternância para Registro */}
        <div className="pt-4 border-t border-[#1A1A1A]/10 text-center">
          <button
            type="button"
            onClick={onNavigateToRegister}
            disabled={isLoading}
            className="text-xs text-[#1A1A1A]/75 hover:text-[#7B1E27] font-medium transition-colors cursor-pointer disabled:opacity-50 underline underline-offset-4"
          >
            Ainda não tem conta? Cadastre-se
          </button>
        </div>

      </div>
    </div>
  );
};
