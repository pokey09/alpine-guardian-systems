import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { User, ShoppingBag, Package, LogOut, Settings } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import Header from '../components/landing/Header';
import Footer from '../components/landing/Footer';
import { useAuth } from '@/lib/AuthContext';

export default function Dashboard() {
  const { user, session, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!session) {
      navigate(createPageUrl('CustomLogin'));
    }
  }, [session, navigate]);

  // TODO: Implement API client to fetch orders
  const orders = [];

  const handleLogout = async () => {
    await signOut();
    navigate(createPageUrl('Home'));
  };

  if (!user) return null;

  const stats = [
    { label: 'Total Orders', value: orders.length, icon: Package },
    { label: 'Pending', value: orders.filter(o => o.status === 'pending').length, icon: ShoppingBag },
    { label: 'Completed', value: orders.filter(o => o.status === 'completed').length, icon: Package },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <div className="pt-20 sm:pt-24 pb-12 sm:pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-6 sm:p-8 text-white shadow-xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold mb-2">Welcome back, {user.user_metadata?.full_name || user.email}!</h1>
                  <p className="text-white/90 text-sm sm:text-base">{user.email}</p>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-lg border border-slate-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                  </div>
                  <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Orders */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="lg:col-span-2 bg-white rounded-xl p-6 shadow-lg border border-slate-200"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">Recent Orders</h2>
                <Link to={createPageUrl('OrderHistory')}>
                  <Button variant="ghost" size="sm">View All</Button>
                </Link>
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-600">No orders yet</p>
                  <Link to={createPageUrl('StoreFront')}>
                    <Button className="mt-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600">
                      Start Shopping
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <Link
                      key={order.id}
                      to={`${createPageUrl('OrderDetails')}?id=${order.id}`}
                      className="block p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-slate-900">Order #{order.id.slice(0, 8)}</p>
                          <p className="text-sm text-slate-600">
                            {new Date(order.created_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-slate-900">${order.total.toFixed(2)}</p>
                          <span className={`inline-block text-xs px-2 py-1 rounded-full ${
                            order.status === 'completed' ? 'bg-green-100 text-green-700' :
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white rounded-xl p-6 shadow-lg border border-slate-200"
            >
              <h2 className="text-xl font-bold text-slate-900 mb-6">Quick Actions</h2>
              
              <div className="space-y-25">
                {isAdmin && (
                  <Link to={createPageUrl('AdminDashboard')}>
                    <Button className="w-full justify-start bg-slate-900 hover:bg-slate-800 text-white">
                      Admin Dashboard
                    </Button>
                  </Link>
                )}

                <Link to={createPageUrl('StoreFront')}>
                  <Button className="w-full justify-start bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white">
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Browse Store
                  </Button>
                </Link>

                <Link to={createPageUrl('OrderHistory')}>
                  <Button variant="outline" className="w-full justify-start">
                    <Package className="w-4 h-4 mr-2" />
                    View Orders
                  </Button>
                </Link>

                <Link to={createPageUrl('UserProfile')}>
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
