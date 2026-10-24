import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './data';

export type AuthStatus = 'loading' | 'signed-out' | 'not-admin' | 'admin';

interface AuthValue {
  status: AuthStatus;
  email: string | null;
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  sendReset: (email: string) => Promise<string | null>;
  updatePassword: (password: string) => Promise<string | null>;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, next) => {
      setSession(next);
      setReady(true);
      if (event === 'PASSWORD_RECOVERY') {
        window.location.hash = '#/admin/reset';
      }
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const userId = session?.user.id ?? null;

  useEffect(() => {
    if (!userId) {
      setIsAdmin(null);
      return;
    }
    let active = true;
    setIsAdmin(null);
    supabase.rpc('is_admin').then(({ data, error }) => {
      if (active) setIsAdmin(!error && data === true);
    });
    return () => {
      active = false;
    };
  }, [userId]);

  const value = useMemo<AuthValue>(() => {
    let status: AuthStatus;
    if (!ready) status = 'loading';
    else if (!session) status = 'signed-out';
    else if (isAdmin === null) status = 'loading';
    else status = isAdmin ? 'admin' : 'not-admin';

    return {
      status,
      email: session?.user.email ?? null,
      signIn: async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (!error) return null;
        if (/invalid login credentials/i.test(error.message))
          return 'Incorrect email or password.';
        return error.message;
      },
      signOut: async () => {
        await supabase.auth.signOut();
      },
      sendReset: async email => {
        const redirectTo = `${window.location.origin}${window.location.pathname}`;
        const { error } = await supabase.auth.resetPasswordForEmail(
          email.trim(),
          { redirectTo }
        );
        return error ? error.message : null;
      },
      updatePassword: async password => {
        const { error } = await supabase.auth.updateUser({ password });
        return error ? error.message : null;
      },
    };
  }, [ready, session, isAdmin]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
