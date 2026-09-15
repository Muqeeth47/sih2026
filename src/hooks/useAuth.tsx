'use client';
// src/hooks/useAuth.tsx
// 4-Tier RBAC auth context with 1-click demo bypass

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { DEMO_ROLES, type NCBRole } from '@/data/mockData';
import { supabase } from '@/utils/supabaseClient';

export interface AuthUser {
  badge: string;
  name: string;
  role: NCBRole;
  unit: string;
  fullTitle: string;
  loginAt: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (badgeOrEmail: string, pinOrPassword: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (
    email: string,
    password: string,
    profile: { name: string; role: NCBRole; badge?: string; unit?: string }
  ) => Promise<{ success: boolean; message?: string; error?: string }>;
  loginAsRole: (role: NCBRole) => void;
  logout: () => void;
  hasPermission: (requiredRoles: NCBRole[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  // Restore session on mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('ncb_auth');
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {
      // ignore
    }

    // Check live Supabase session if present
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user && !sessionStorage.getItem('ncb_auth')) {
        const meta = session.user.user_metadata || {};
        const role = (meta.role as NCBRole) || 'ncb_io';
        const authUser: AuthUser = {
          badge: meta.badge || 'NCB-REG-USER',
          name: meta.name || session.user.email?.split('@')[0] || 'Registered Officer',
          role,
          unit: meta.unit || 'Field Interdiction Command',
          fullTitle: meta.fullTitle || 'Registered Investigating Officer',
          loginAt: new Date().toISOString(),
        };
        persistUser(authUser);
      }
    }).catch(() => {});
  }, []);

  const persistUser = (u: AuthUser | null) => {
    setUser(u);
    if (u) {
      sessionStorage.setItem('ncb_auth', JSON.stringify(u));
    } else {
      sessionStorage.removeItem('ncb_auth');
    }
  };

  /** Standard login — checks demo accounts first, then Supabase Auth */
  const login = useCallback(async (badgeOrEmail: string, pinOrPassword: string): Promise<{ success: boolean; error?: string }> => {
    // 1. Check if matches standard mock credentials
    const demo = DEMO_ROLES.find(r => (r.badge === badgeOrEmail || r.name.toLowerCase() === badgeOrEmail.toLowerCase()) && r.pin === pinOrPassword);
    if (demo) {
      persistUser({
        badge: demo.badge,
        name: demo.name,
        role: demo.role,
        unit: demo.unit,
        fullTitle: demo.fullTitle,
        loginAt: new Date().toISOString(),
      });
      return { success: true };
    }

    // 2. Real Supabase Authentication
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: badgeOrEmail,
        password: pinOrPassword,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        const meta = data.user.user_metadata || {};
        const role = (meta.role as NCBRole) || 'ncb_io';
        persistUser({
          badge: meta.badge || `NCB-${Date.now().toString(36).toUpperCase().slice(-4)}`,
          name: meta.name || data.user.email?.split('@')[0] || 'Verified Officer',
          role,
          unit: meta.unit || 'National Headquarters',
          fullTitle: meta.fullTitle || `Authorized ${role.toUpperCase()} Official`,
          loginAt: new Date().toISOString(),
        });
        return { success: true };
      }
    } catch (err) {
      console.warn('Supabase Auth error:', err);
    }

    return { success: false, error: 'Invalid Badge/Email or PIN/Password. Please check credentials or use 1-click demo login.' };
  }, []);

  /** Real Supabase Sign-Up */
  const signUp = useCallback(async (
    email: string,
    password: string,
    profile: { name: string; role: NCBRole; badge?: string; unit?: string }
  ): Promise<{ success: boolean; message?: string; error?: string }> => {
    try {
      const badge = profile.badge || `NCB-${profile.role.replace('ncb_', '').toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: profile.name,
            role: profile.role,
            badge,
            unit: profile.unit || 'Regional Field Unit',
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        // If session was established immediately (no confirm required)
        if (data.session) {
          persistUser({
            badge,
            name: profile.name,
            role: profile.role,
            unit: profile.unit || 'Regional Field Unit',
            fullTitle: `Authorized ${profile.role.toUpperCase()} Officer`,
            loginAt: new Date().toISOString(),
          });
          return { success: true, message: 'Account successfully registered and signed in!' };
        }

        return {
          success: true,
          message: 'Account registered successfully! You can now log in with your credentials.',
        };
      }
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }

    return { success: false, error: 'Could not complete registration. Please try again.' };
  }, []);

  /** 1-Click demo bypass — sets role directly */
  const loginAsRole = useCallback((role: NCBRole) => {
    const demo = DEMO_ROLES.find(r => r.role === role);
    if (!demo) return;

    persistUser({
      badge: demo.badge,
      name: demo.name,
      role: demo.role,
      unit: demo.unit,
      fullTitle: demo.fullTitle,
      loginAt: new Date().toISOString(),
    });
  }, []);

  const logout = useCallback(() => {
    supabase.auth.signOut().catch(() => {});
    persistUser(null);
  }, []);

  const hasPermission = useCallback((requiredRoles: NCBRole[]) => {
    if (!user) return false;
    return requiredRoles.includes(user.role);
  }, [user]);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      signUp,
      loginAsRole,
      logout,
      hasPermission,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

/** Route permission mapping per role */
export const ROLE_HOME_ROUTES: Record<NCBRole, string> = {
  ncb_io:     '/overview',
  ncb_fsl:    '/overview',
  ncb_zonal:  '/overview',
  ncb_court:  '/overview',
};
