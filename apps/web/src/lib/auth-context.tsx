'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { api, setToken, clearToken, getToken } from './api-client';

type AuthState = {
  isAuthenticated: boolean;
  isLoading: boolean;
  role: string | null; // owner | staff | admin — للعرض فـUI فقط، الفرض الحقيقي عبر RolesGuard فالـAPI
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

/**
 * ⚠️ decode بلا verify — كافي هنا لأن الهدف غير عرض/إخفاء عناصر UI
 * (تجربة استخدام أحسن)، ماشي حماية حقيقية. الحماية الفعلية ديما server-side
 * عبر RolesGuard — حتى لو حد بدل الـpayload يدويا فالمتصفح، الـAPI
 * غادي ترفض الطلب لأن التوقيع (signature) ماغاديش يطابق.
 */
function decodeRoleFromToken(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role ?? null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    setIsAuthenticated(!!token);
    setRole(token ? decodeRoleFromToken(token) : null);
    setIsLoading(false);
  }, []);

  async function login(email: string, password: string) {
    const result = await api.post<{
      accessToken?: string;
      requires2FA?: boolean;
      tempToken?: string;
    }>('/auth/login', { email, password });

    if (result.requires2FA) {
      // ⚠️ TODO: صفحة إدخال كود 2FA — هنا كنرمي error مؤقت
      throw new Error('2FA مفعّلة — الصفحة المخصصة لهذا لسع ماتبنات');
    }

    if (result.accessToken) {
      setToken(result.accessToken);
      setIsAuthenticated(true);
      setRole(decodeRoleFromToken(result.accessToken));
      router.push('/dashboard');
    }
  }

  function logout() {
    clearToken();
    setIsAuthenticated(false);
    setRole(null);
    router.push('/dashboard/login');
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth خصها تكون جوا AuthProvider');
  return ctx;
}
