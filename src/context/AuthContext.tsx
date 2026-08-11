import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  updateProfile
} from 'firebase/auth';
import { auth } from '../firebaseConfig';

interface AuthContextType {
  user: User | null;
  uid: string | null;
  isLoadingAuth: boolean;
  errorAuth: string | null;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  reloadUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [errorAuth, setErrorAuth] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
        setIsLoadingAuth(false);
        setErrorAuth(null);
      },
      (error) => {
        console.error('[AuthContext] Listener error:', error);
        setErrorAuth(error.message);
        setIsLoadingAuth(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    setErrorAuth(null);
    const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
    setUser(cred.user);
  };

  const register = async (email: string, pass: string, name?: string) => {
    setErrorAuth(null);
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    if (name && name.trim()) {
      try {
        await updateProfile(cred.user, { displayName: name.trim() });
      } catch (pErr) {
        console.warn('Erro ao atualizar nome do perfil:', pErr);
      }
    }
    if (cred.user) {
      try {
        await sendEmailVerification(cred.user);
      } catch (eErr) {
        console.warn('Erro ao enviar e-mail de verificação:', eErr);
      }
    }
    setUser(cred.user);
  };

  const reloadUser = async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      setUser({ ...auth.currentUser });
    }
  };

  const logout = async () => {
    setErrorAuth(null);
    await signOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        uid: user ? user.uid : null,
        isLoadingAuth,
        errorAuth,
        login,
        register,
        logout,
        reloadUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
};
