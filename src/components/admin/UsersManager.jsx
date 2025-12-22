import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { User, ExternalLink, Shield, ShieldOff, Mail, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';

export default function UsersManager() {
  const [error, setError] = useState(null);

  const { data: users = [], isLoading, refetch } = useQuery({
    queryKey: ['auth-users'],
    queryFn: async () => {
      try {
        // Call the Edge Function to list users
        const { data, error } = await supabase.functions.invoke('list-users');

        if (error) {
          console.error('List users error:', error);
          setError('Unable to fetch users. This requires admin privileges.');
          return [];
        }

        if (data?.error) {
          console.error('Data error:', data.error);
          setError(data.error);
          return [];
        }

        return data?.users || [];
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Unable to fetch users. Please ensure you have admin access.');
        return [];
      }
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-red-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <p className="text-sm text-red-500">
          Note: User management requires Supabase service role key.
          For now, you can manage users directly in the{' '}
          <a
            href="https://app.supabase.com/project/npevhmlqvcsutfrswrag/auth/users"
            target="_blank"
            rel="noopener noreferrer"
            className="underline font-semibold"
          >
            Supabase Dashboard
          </a>
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Users</h2>
        <div className="text-sm text-slate-600">
          Total: <span className="font-semibold text-slate-900">{users.length}</span> users
        </div>
      </div>

      {users.length === 0 ? (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-12 text-center">
          <User className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">No users found</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {users.map((user) => (
            <div key={user.id} className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 text-white" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-slate-900 truncate">
                      {user.user_metadata?.full_name || user.user_metadata?.name || 'Unnamed User'}
                    </h3>
                    {user.user_metadata?.role === 'admin' && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-50 text-red-700 border border-red-200 text-xs font-medium">
                        <Shield className="w-3 h-3" />
                        Admin
                      </span>
                    )}
                    {user.email_confirmed_at && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-50 text-green-700 border border-green-200 text-xs font-medium">
                        <Mail className="w-3 h-3" />
                        Verified
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 text-sm">
                    <p className="text-slate-600 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-slate-400" />
                      {user.email}
                    </p>
                    <p className="text-slate-400 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Joined {new Date(user.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    {user.last_sign_in_at && (
                      <p className="text-slate-400 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Last active {new Date(user.last_sign_in_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    window.open(`${createPageUrl('UserProfile')}?id=${user.id}`, '_blank');
                  }}
                  className="flex-shrink-0"
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  View
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
