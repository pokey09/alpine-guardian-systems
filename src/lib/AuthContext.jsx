import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accountTableExists, setAccountTableExists] = useState(true);

  const checkTableExists = async () => {
    try {
      // Try a simple query to check if table exists
      const { error } = await supabase
        .from('Account')
        .select('id')
        .limit(1);

      if (error && (error.code === 'PGRST116' || error.message.includes('500') || error.message.includes('relation') || error.message.includes('does not exist'))) {
        console.warn('⚠️ Account table does not exist. Run supabase-role-migration.sql to enable admin roles.');
        setAccountTableExists(false);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('⚠️ Account table check failed. Disabling role checks.');
      setAccountTableExists(false);
      return false;
    }
  };

  const fetchUserRole = async (userId) => {
    if (!userId) {
      setUserRole(null);
      return;
    }

    // Skip fetching if table doesn't exist
    if (!accountTableExists) {
      setUserRole('user');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('Account')
        .select('role')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        // Table might have been deleted
        if (error.code === 'PGRST116' || error.message.includes('500')) {
          setAccountTableExists(false);
          setUserRole('user');
          return;
        }
      }

      if (data?.role) {
        setUserRole(data.role);
      } else {
        // Default to user if no role found
        setUserRole('user');
      }
    } catch (err) {
      // Table might not exist yet - default to user role
      setUserRole('user');
    }
  };

  useEffect(() => {
    const getSession = async () => {
      try {
        // Check if Account table exists first
        await checkTableExists();

        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await fetchUserRole(session.user.id);
        } else {
          setUserRole(null);
        }
      } catch (error) {
        console.error('Error getting session:', error);
        setUserRole('user'); // Default on error
      } finally {
        setLoading(false);
      }
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await fetchUserRole(session.user.id);
        } else {
          setUserRole(null);
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

