import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { User, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { useAuth } from '@/lib/AuthContext';

export default function UsersManager() {
  const { accountTableExists } = useAuth();
  const accountReady = accountTableExists === true;

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('Account')
        .select('*');
      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
    enabled: accountReady,
  });

  if (accountTableExists === false) {
    return (
      <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl">
        Account table is missing. Run the Supabase SQL file `supabase-role-migration.sql` to manage users.
      </div>
    );
  }

  if (accountTableExists === null) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-4 text-slate-600">
        Checking Account table status...
      </div>
    );
  }

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Users</h2>
      
      <div className="grid gap-4">
        {users.map((user) => (
          <div key={user.id} className="bg-white rounded-xl p-4 border border-slate-200 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900">{user.full_name}</h3>
              <p className="text-slate-600 text-sm">{user.email}</p>
              <p className="text-slate-400 text-xs mt-1">
                Joined: {new Date(user.created_date).toLocaleDateString()}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                window.open(`${createPageUrl('UserProfile')}?id=${user.id}`, '_blank');
              }}
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
