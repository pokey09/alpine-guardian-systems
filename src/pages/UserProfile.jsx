import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Mail, Package, Heart, Edit2, Save, X } from 'lucide-react';
import { createPageUrl } from '../utils';
import Header from '../components/landing/Header';
import Footer from '../components/landing/Footer';

export default function UserProfile() {
  const { user, accountTableExists } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ full_name: '', email: '' });

  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) {
      window.location.href = createPageUrl('CustomLogin');
    } else {
      setFormData({ full_name: user.user_metadata.full_name, email: user.email });
    }
  }, [user]);

  const { data: orders = [] } = useQuery({
    queryKey: ['userOrders', user?.email],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('Order')
        .select('*')
        .eq('customer_email', user.email)
        .order('created_date', { ascending: false });
      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
    enabled: !!user,
  });

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      if (accountTableExists !== true) {
        throw new Error('Account table is missing or not ready.');
      }
      const { data: updatedData, error } = await supabase
        .from('Account')
        .update(data)
        .eq('id', user.id);
      if (error) {
        throw new Error(error.message);
      }
      return updatedData;
    },
    onSuccess: () => {
      setIsEditing(false);
      queryClient.invalidateQueries();
    },
  });

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  const handleCancel = () => {
    setFormData({ full_name: user.user_metadata.full_name, email: user.email });
    setIsEditing(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">My Profile</h1>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Account Details */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-slate-900">Account Details</h2>
                {!isEditing && accountTableExists === true && (
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                    size="sm"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                )}
              </div>

              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center">
                  <User className="w-12 h-12 text-white" />
                </div>
              </div>

              {accountTableExists === false && (
                <div className="mb-4 bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-xl p-3">
                  Account table is missing. Run `supabase-role-migration.sql` in Supabase SQL Editor to enable profile updates.
                </div>
              )}
              {accountTableExists === null && (
                <div className="mb-4 bg-slate-100 border border-slate-200 text-slate-700 text-sm rounded-xl p-3">
                  Checking Account table status...
                </div>
              )}

              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <Label>Full Name</Label>
                    <Input
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={handleSave}
                      className="flex-1 bg-red-600 hover:bg-red-700"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      className="flex-1"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-slate-700">
                    <User className="w-4 h-4 text-slate-400" />
                    <span>{user.user_metadata.full_name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-700">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span className="text-sm">{user.email}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Wishlist Placeholder */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <Heart className="w-5 h-5 text-red-600" />
                <h2 className="text-xl font-semibold text-slate-900">Wishlist</h2>
              </div>
              <p className="text-slate-500 text-sm">Coming soon - save your favorite items</p>
            </div>
          </div>

          {/* Order History */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl p-6 border border-slate-200">
              <div className="flex items-center gap-3 mb-6">
                <Package className="w-5 h-5 text-red-600" />
                <h2 className="text-xl font-semibold text-slate-900">Order History</h2>
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 mx-auto mb-3 text-slate-400" />
                  <p className="text-slate-600">No orders yet</p>
                  <p className="text-slate-400 text-sm mt-1">Start shopping to see your orders here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border border-slate-200 rounded-xl p-4 hover:border-red-300 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm text-slate-500">#{order.id.slice(0, 8)}</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                        <span className="font-semibold text-slate-900">${order.total?.toFixed(2)}</span>
                      </div>

                      <div className="text-sm text-slate-600 mb-3">
                        {new Date(order.created_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>

                      {order.items && order.items.length > 0 && (
                        <div className="space-y-2 pt-3 border-t border-slate-100">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between text-sm">
                              <span className="text-slate-700">
                                {item.name} <span className="text-slate-400">× {item.quantity}</span>
                              </span>
                              <span className="text-slate-600">${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
