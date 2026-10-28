import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfile, Wallet } from '../types/index.ts';
import { Language, translations, Translations } from '../utils/i18n.ts';

interface AuthContextType {
  user: UserProfile | null;
  wallet: Wallet | null;
  token: string | null;
  language: Language;
  theme: 'light' | 'dark';
  isLoading: boolean;
  t: Translations;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string, phone?: string, referralCode?: string) => Promise<void>;
  logout: () => void;
  switchDemoRole: (role: 'user' | 'admin') => Promise<void>;
  updateWallet: (wallet: Wallet) => void;
  setLanguage: (lang: Language) => void;
  toggleTheme: () => void;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('earnpro_token'));
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('earnpro_lang') as Language) || 'en';
  });
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('earnpro_theme') as 'light' | 'dark') || 'light';
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Sync theme with html document element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('earnpro_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setThemeState(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('earnpro_lang', lang);
  };

  const updateWallet = (newWallet: Wallet) => {
    setWallet(newWallet);
  };

  const refreshUserData = useCallback(async () => {
    if (!token) {
      setUser(null);
      setWallet(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setWallet(data.wallet);
      } else {
        // Token expired or invalid
        localStorage.removeItem('earnpro_token');
        setToken(null);
        setUser(null);
        setWallet(null);
      }
    } catch (err) {
      console.error('Error refreshing user session:', err);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    refreshUserData();
  }, [refreshUserData]);

  const login = async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Login failed');
    }
    localStorage.setItem('earnpro_token', data.token);
    setToken(data.token);
    setUser(data.user);
    setWallet(data.wallet);
  };

  const register = async (email: string, password: string, fullName: string, phone?: string, referralCode?: string) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, fullName, phone, referralCode }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Registration failed');
    }
    localStorage.setItem('earnpro_token', data.token);
    setToken(data.token);
    setUser(data.user);
    setWallet(data.wallet);
  };

  const logout = () => {
    localStorage.removeItem('earnpro_token');
    setToken(null);
    setUser(null);
    setWallet(null);
  };

  const switchDemoRole = async (role: 'user' | 'admin') => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/demo-switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('earnpro_token', data.token);
        setToken(data.token);
        setUser(data.user);
        setWallet(data.wallet);
      }
    } catch (err) {
      console.error('Demo switch failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const t = translations[language];

  return (
    <AuthContext.Provider
      value={{
        user,
        wallet,
        token,
        language,
        theme,
        isLoading,
        t,
        login,
        register,
        logout,
        switchDemoRole,
        updateWallet,
        setLanguage,
        toggleTheme,
        refreshUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
