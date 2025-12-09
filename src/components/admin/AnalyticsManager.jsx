import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { createClient } from '@supabase/supabase-js';
import { Users, Package, ShoppingCart, TrendingUp } from 'lucide-react';

export default function AnalyticsManager() {
  const { adminClient, serviceRoleLoaded } = useMemo(() => {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceRoleKey) {
      return { adminClient: null, serviceRoleLoaded: !!serviceRoleKey };
    }
    return { adminClient: createClient(url, serviceRoleKey), serviceRoleLoaded: true };
  }, []);

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('Product')
        .select('*');
      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
  });

  const { data: users = [] } = useQuery({
    queryKey: ['auth-users'],
    queryFn: async () => {
      if (!adminClient) {
        throw new Error('Service role key not configured; cannot read auth.users from the client.');
      }
      const { data, error } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 200 });
      if (error) {
        throw new Error(error.message);
      }
      return data?.users || [];
    },
    enabled: !!adminClient,
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('Order')
        .select('*');
      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
  });

  const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
  const completedOrders = orders.filter(order => order.status === 'completed').length;

  const metrics = [
    {
      title: 'Total Users',
      value: users.length,
      icon: Users,
      color: 'from-blue-600 to-blue-700',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Total Products',
      value: products.length,
      icon: Package,
      color: 'from-red-600 to-red-700',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Total Orders',
      value: orders.length,
      icon: ShoppingCart,
      color: 'from-green-600 to-green-700',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Total Revenue',
      value: `$${totalRevenue.toFixed(2)}`,
      icon: TrendingUp,
      color: 'from-purple-600 to-purple-700',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div>
      {!serviceRoleLoaded && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl mb-4">
          To load user analytics from `auth.users`, set `VITE_SUPABASE_SERVICE_ROLE_KEY` (only in secure/server context). Showing other metrics without user counts.
        </div>
      )}
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Analytics Overview</h2>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric) => (
          <div key={metric.title} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${metric.color} flex items-center justify-center`}>
                <metric.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-slate-600 text-sm mb-1">{metric.title}</p>
            <p className="text-3xl font-bold text-slate-900">{metric.value}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Order Status Breakdown</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Completed</span>
              <span className="font-semibold text-green-600">{completedOrders}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Pending</span>
              <span className="font-semibold text-yellow-600">
                {orders.filter(o => o.status === 'pending').length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Cancelled</span>
              <span className="font-semibold text-red-600">
                {orders.filter(o => o.status === 'cancelled').length}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-slate-600 text-sm">
                {users.length} registered users
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <span className="text-slate-600 text-sm">
                {products.length} products available
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span className="text-slate-600 text-sm">
                {orders.length} total orders placed
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
