'use client';

import Cookies from 'js-cookie';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { decodeJwtPayload } from '../util/jwt.util';

export const AUTH_COOKIE_NAME = 'auth_token';
const AUTH_COOKIE_EXPIRES_IN_DAYS = 7;

export type AuthUser = {
  id: string;
  name: string;
  email: string;
};

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  status: AuthStatus;
  login: (token: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

// O cookie e a fonte da verdade. useSyncExternalStore evita setState dentro de
// efeito e garante que servidor e hidratacao renderizem o mesmo estado
// ("loading"); so depois o cookie do navegador e lido.
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

function getClientSnapshot(): string | null {
  return Cookies.get(AUTH_COOKIE_NAME) ?? null;
}

function getServerSnapshot(): undefined {
  return undefined;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const storedToken = useSyncExternalStore<string | null | undefined>(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );

  const login = useCallback((token: string) => {
    Cookies.set(AUTH_COOKIE_NAME, token, {
      expires: AUTH_COOKIE_EXPIRES_IN_DAYS,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
    notifyListeners();
  }, []);

  const logout = useCallback(() => {
    Cookies.remove(AUTH_COOKIE_NAME);
    notifyListeners();
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    if (storedToken === undefined) {
      return { user: null, token: null, status: 'loading', login, logout };
    }

    const payload = storedToken ? decodeJwtPayload(storedToken) : null;

    if (!storedToken || !payload) {
      return { user: null, token: null, status: 'unauthenticated', login, logout };
    }

    return {
      user: { id: payload.sub, name: payload.name, email: payload.email },
      token: storedToken,
      status: 'authenticated',
      login,
      logout,
    };
  }, [storedToken, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de <AuthProvider>.');
  }

  return context;
}
