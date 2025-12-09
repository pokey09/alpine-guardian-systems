import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Package, Calendar, DollarSign, Eye, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import Header from '../components/landing/Header';
import Footer from '../components/landing/Footer';

export default function OrderHistory() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      window.location.href = createPageUrl('CustomLogin');
    }
  }, [user]);

  const { data: orders = [], isLoading } = useQuery({
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

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[status] || 'bg-slate-100 text-slate-800 border-slate-200';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: '⏳',
      completed: '✓',
      cancelled: '✕',
    };
    return icons[status] || '•';
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <div className="pt-20 sm:pt-24 pb-12 sm:pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">Order History</h1>
                <p className="text-sm sm:text-base text-slate-600">View and track all your orders</p>
              </div>
              <Link to={createPageUrl('StoreFront')}>
                <Button className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 w-full sm:w-auto">
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Continue Shopping
                </Button>
              </Link>
            </div>

            {isLoading ? (
              <div className="text-center py-12 text-slate-600">Loading your orders...</div>
            ) : orders.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-slate-200">
                <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No orders yet</h3>
                <p className="text-slate-600 mb-6">Start shopping to see your orders here</p>
                <Link to={createPageUrl('StoreFront')}>
                  <Button className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600">
                    Browse Products
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order, index) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-shadow"
                  >
                    <div className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                            <Package className="w-6 h-6 text-red-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-slate-900">Order #{order.id.slice(0, 8)}</h3>
                            <div className="flex items-center gap-3 mt-1 text-sm text-slate-600">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {new Date(order.created_date).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })}
                              </span>
                              <span className="flex items-center gap-1">
                                <DollarSign className="w-4 h-4" />
                                ${order.total.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-4 py-2 rounded-lg text-sm font-medium border ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)} {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                        <div className="text-sm text-slate-600">
                          {order.items?.length || 0} {order.items?.length === 1 ? 'item' : 'items'}
                        </div>
                        <Link to={`${createPageUrl('OrderDetails')}?id=${order.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}