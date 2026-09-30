'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { AuthUser, UserRole, LoginCredentials } from './types';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  register: (payload: { name: string; email: string; collegeId: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  identifyStudent: (payload: { name: string; classSection: string; rollNumber: string }) => Promise<{ success: boolean; error?: string }>;
  enterStaff: (staffId: string) => Promise<{ success: boolean; error?: string }>;
  loginAdmin: (credentials: { email: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type SessionPayload = Omit<AuthUser, 'email'> & { email?: string };

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/session')
      .then(response => response.json())
      .then(data => setUser(data.user ? { ...data.user, email: data.user.email || '' } as AuthUser : null))
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  const authenticateAt = useCallback(async (endpoint: string, payload: Record<string, string>) => {
    setIsLoading(true);
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) return { success: false, error: data.error || 'Unable to verify your details.' };
      setUser({ ...(data.user as SessionPayload), email: data.user.email || '' } as AuthUser);
      return { success: true };
    } catch {
      return { success: false, error: 'Unable to connect to Smart Campus. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const identifyStudent = useCallback((payload: { name: string; classSection: string; rollNumber: string }) =>
    authenticateAt('/api/access/student', payload), [authenticateAt]);

  const enterStaff = useCallback((staffId: string) =>
    authenticateAt('/api/access/staff', { staffId }), [authenticateAt]);

  const loginAdmin = useCallback((credentials: { email: string; password: string }) =>
    authenticateAt('/api/access/admin', credentials), [authenticateAt]);

  const login = useCallback(async (credentials: LoginCredentials) => {
    return loginAdmin(credentials);
  }, [loginAdmin]);

  const register = useCallback(async (payload: { name: string; email: string; collegeId: string; password: string }) => {
    void payload;
    return { success: false, error: 'Student access uses your name, class/section, and roll number.' };
  }, []);

  const logout = useCallback(async () => {
    setUser(null);
    await fetch('/api/session', { method: 'DELETE' }).catch(() => undefined);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      register,
      identifyStudent,
      enterStaff,
      loginAdmin,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function useRequireAuth(requiredRole?: UserRole) {
  const { user, isAuthenticated, isLoading } = useAuth();

  const isAuthorized = isAuthenticated && (!requiredRole || user?.role === requiredRole);

  return { user, isAuthenticated, isAuthorized, isLoading };
}
