'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'STUDENT' | 'FACULTY' | 'STAFF' | 'MAINTENANCE' | 'ADMIN';
  departmentId?: string | null;
  department?: {
    id: string;
    name: string;
  } | null;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: AuthUser, remember?: boolean) => void;
  logout: () => void;
  isAdmin: boolean;
  isMaintenance: boolean;
  isStudent: boolean;
  isStaffOrFaculty: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'campvox_token';
const USER_KEY = 'campvox_user';
const LEGACY_TOKEN_KEY = 'fixmycampus_token';
const LEGACY_USER_KEY = 'fixmycampus_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Hydrate from localStorage on client mount
    try {
      let savedToken = localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(LEGACY_TOKEN_KEY);
      let savedUser = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY) || localStorage.getItem(LEGACY_USER_KEY);

      // Clear any outdated placeholder tokens or non-JWT strings
      if (savedToken && savedToken.split('.').length !== 3) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(LEGACY_TOKEN_KEY);
        localStorage.removeItem(LEGACY_USER_KEY);
        sessionStorage.removeItem(TOKEN_KEY);
        sessionStorage.removeItem(USER_KEY);
        savedToken = null;
        savedUser = null;
      }

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        if (localStorage.getItem(TOKEN_KEY) || localStorage.getItem(LEGACY_TOKEN_KEY)) {
          localStorage.setItem(TOKEN_KEY, savedToken);
          localStorage.setItem(USER_KEY, savedUser);
        }
        localStorage.removeItem(LEGACY_TOKEN_KEY);
        localStorage.removeItem(LEGACY_USER_KEY);
      }
    } catch (e) {
      console.error('Error hydrating auth state:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (newToken: string, newUser: AuthUser, remember = true) => {
    setToken(newToken);
    setUser(newUser);
    const storage = remember ? localStorage : sessionStorage;
    const otherStorage = remember ? sessionStorage : localStorage;
    storage.setItem(TOKEN_KEY, newToken);
    storage.setItem(USER_KEY, JSON.stringify(newUser));
    otherStorage.removeItem(TOKEN_KEY);
    otherStorage.removeItem(USER_KEY);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(LEGACY_TOKEN_KEY);
    localStorage.removeItem(LEGACY_USER_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    router.push('/login');
  };

  const isAdmin = user?.role === 'ADMIN';
  const isMaintenance = user?.role === 'MAINTENANCE';
  const isStudent = user?.role === 'STUDENT';
  const isStaffOrFaculty = user?.role === 'FACULTY' || user?.role === 'STAFF';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
        isAdmin,
        isMaintenance,
        isStudent,
        isStaffOrFaculty,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
