import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const deriveRole = (supabaseUser) => {
    return supabaseUser?.user_metadata?.role || 'user';
  };

  useEffect(() => {
    const getSession = async () => {
      try {
        // Refresh to pull latest JWT claims/metadata (e.g., if role was changed server-side)
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) {
          console.warn('Session refresh failed, falling back to existing session:', refreshError.message);
        }

        const { data: { session: currentSession } } = await supabase.auth.getSession();
        const sessionToUse = refreshData?.session || currentSession;

        setSession(sessionToUse);
        setUser(sessionToUse?.user ?? null);
        setUserRole(deriveRole(sessionToUse?.user));
      } catch (error) {
        console.error('Error getting session:', error);
        setUserRole('user'); // Default on error
      } finally {
        setLoading(false);
      }
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setUserRole(deriveRole(session?.user));
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
