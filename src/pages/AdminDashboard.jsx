import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { LogOut, Package, Users, Settings, BarChart3, ShoppingCart, Star } from 'lucide-react';
import { createPageUrl } from '../utils';
import ProductsManager from '../components/admin/ProductsManager';
import UsersManager from '../components/admin/UsersManager';
import SiteSettingsManager from '../components/admin/SiteSettingsManager';
import AnalyticsManager from '../components/admin/AnalyticsManager';
import OrdersManager from '../components/admin/OrdersManager';
import ReviewsManager from '../components/admin/ReviewsManager';

export default function AdminDashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
      window.location.href = createPageUrl('CustomLogin');
      return;
    }
    setUser(JSON.parse(currentUser));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    window.location.href = createPageUrl('Home');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69386993c4c28da2d1fc07c3/6b5bc90fc_AdobeExpress-file.png" 
              alt="Alpine Guardian Systems"
              className="w-10 h-10 object-contain"
            />
            <h1 className="text-xl font-bold text-slate-900">Admin Dashboard</h1>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="text-slate-600 hover:text-red-600"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-slate-900">Welcome, {user.full_name}</h2>
          <p className="text-slate-600 mt-1">Manage your site content and users</p>
        </div>

        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="bg-white border border-slate-200">
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Products
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="reviews" className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              Reviews
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Site Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics">
            <AnalyticsManager />
          </TabsContent>

          <TabsContent value="orders">
            <OrdersManager />
          </TabsContent>

          <TabsContent value="products">
            <ProductsManager />
          </TabsContent>

          <TabsContent value="users">
            <UsersManager />
          </TabsContent>

          <TabsContent value="reviews">
            <ReviewsManager />
          </TabsContent>

          <TabsContent value="settings">
            <SiteSettingsManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}