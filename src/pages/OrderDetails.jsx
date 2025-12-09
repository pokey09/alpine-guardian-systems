import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Package, Calendar, DollarSign, ArrowLeft, User, Mail, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import Header from '../components/landing/Header';
import Footer from '../components/landing/Footer';

export default function OrderDetails() {
  const { user } = useAuth();
  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get('id');

  useEffect(() => {
    if (!user) {
      window.location.href = createPageUrl('CustomLogin');
    }
  }, [user]);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('Order')
        .select('*')
        .eq('id', orderId);
      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
    enabled: !!orderId,
  });

  const order = orders[0];

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
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link to={createPageUrl('OrderHistory')}>
              <Button variant="ghost" className="mb-6">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Order History
              </Button>
            </Link>

            {isLoading ? (
              <div className="text-center py-12 text-slate-600">Loading order details...</div>
            ) : !order ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-slate-200">
                <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Order not found</h3>
                <p className="text-slate-600 mb-6">This order doesn't exist or you don't have access to it</p>
                <Link to={createPageUrl('OrderHistory')}>
                  <Button className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600">
                    View All Orders
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Order Header */}
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                      <h1 className="text-3xl font-bold text-slate-900 mb-2">Order #{order.id.slice(0, 8)}</h1>
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(order.created_date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                    <span className={`px-6 py-3 rounded-xl text-base font-medium border ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)} {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>

                  {/* Customer Info */}
                  <div className="grid md:grid-cols-2 gap-4 pt-6 border-t border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                        <User className="w-5 h-5 text-slate-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Customer Name</p>
                        <p className="font-medium text-slate-900">{order.customer_name || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                        <Mail className="w-5 h-5 text-slate-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Email</p>
                        <p className="font-medium text-slate-900">{order.customer_email}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                  <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5" />
                    Order Items
                  </h2>
                  <div className="space-y-4">
                    {order.items?.map((item, index) => (
                      <div key={index} className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-20 h-20 object-cover rounded-lg bg-slate-100"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900">{item.name}</h3>
                          <p className="text-sm text-slate-600 mt-1">Quantity: {item.quantity}</p>
                          {item.selectedVariations && Object.keys(item.selectedVariations).length > 0 && (
                            <div className="text-xs text-slate-500 mt-1">
                              {Object.entries(item.selectedVariations).map(([key, value]) => (
                                <span key={key} className="mr-2">
                                  {key}: {value}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-900">${(item.price * item.quantity).toFixed(2)}</p>
                          <p className="text-sm text-slate-600">${item.price.toFixed(2)} each</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Summary */}
                  <div className="mt-6 pt-6 border-t border-slate-200">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-slate-900">Total</span>
                      <span className="text-2xl font-bold text-red-600">${order.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between">
                  <Link to={createPageUrl('OrderHistory')}>
                    <Button variant="outline">
                      View All Orders
                    </Button>
                  </Link>
                  <Link to={createPageUrl('StoreFront')}>
                    <Button className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600">
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      Continue Shopping
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}