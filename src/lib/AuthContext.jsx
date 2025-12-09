import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

const AuthContext = createContext();

const isMissingAccountTableError = (error) => {
  if (!error) return false;
  return (
    error.code === 'PGRST116' ||
    error.message?.includes('relation') ||
    error.message?.includes('does not exist') ||
    error.message?.includes('500')
  );
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  // null = unknown, true = exists, false = missing
  const [accountTableExists, setAccountTableExists] = useState(null);

  const checkTableExists = async () => {
    // If we already know it's missing, don't re-query
    if (accountTableExists === false) return false;

    try {
      const { error } = await supabase.from('Account').select('id').limit(1);

      if (error && isMissingAccountTableError(error)) {
        console.warn('⚠️ Account table does not exist. Run supabase-role-migration.sql to enable admin roles.');
        setAccountTableExists(false);
        return false;
      }

      setAccountTableExists(true);
      return true;
    } catch (err) {
      console.warn('⚠️ Account table check failed. Disabling role checks.');
      setAccountTableExists(false);
      return false;
    }
  };

  const loadAccountAndRole = async (userId, tableExistsOverride) => {
    if (!userId) {
      setUserRole(null);
      setAccount(null);
      return;
    }

    const tableExists = typeof tableExistsOverride === 'boolean'
      ? tableExistsOverride
      : accountTableExists;

    if (tableExists === false) {
      setUserRole('user');
      setAccount(null);
      return;
    }

    const tableIsPresent = tableExists ?? await checkTableExists();
    if (!tableIsPresent) {
      setUserRole('user');
      setAccount(null);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('Account')
        .select('id, role, email, full_name')
        .eq('id', userId)
        .maybeSingle();

      if (error && isMissingAccountTableError(error)) {
        setAccountTableExists(false);
        setUserRole('user');
        setAccount(null);
        return;
      }

      setUserRole(data?.role || 'user');
      setAccount(data || null);
    } catch (err) {
      setUserRole('user');
      setAccount(null);
    }
  };

  useEffect(() => {
    const getSession = async () => {
      try {
        const exists = await checkTableExists();

        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await loadAccountAndRole(session.user.id, exists);
        } else {
          setUserRole(null);
          setAccount(null);
        }
      } catch (error) {
        console.error('Error getting session:', error);
        setUserRole('user'); // Default on error
        setAccount(null);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await loadAccountAndRole(session.user.id);
        } else {
          setUserRole(null);
          setAccount(null);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const value = {
    session,
    user,
    userRole,
    account,
    accountTableExists,
    isAdmin: userRole === 'admin',
    loading,
    signOut: () => supabase.auth.signOut(),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider.');
  }
  return context;
};
