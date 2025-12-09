import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, User, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';

export default function Dashboard() {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <nav className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">AGS</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">Alpine Guardian Systems</h1>
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

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Welcome back, {user.full_name}!</h2>
              <p className="text-slate-500">{user.email}</p>
            </div>
          </div>
          
          <div className="border-t border-slate-200 pt-6">
            <p className="text-slate-600 text-lg">
              Your dashboard is ready. This is where you'll manage your patrol operations.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-2">Incidents</h3>
            <p className="text-slate-600 text-sm">Track and manage incidents</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-2">Coordination</h3>
            <p className="text-slate-600 text-sm">Real-time team coordination</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-2">Reports</h3>
            <p className="text-slate-600 text-sm">View and generate reports</p>
          </div>
        </div>

        <div className="mt-8 bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-4">
            <ShieldCheck className="w-12 h-12" />
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-1">Admin Access</h3>
              <p className="text-red-100">Manage products, users, and site settings</p>
            </div>
            <Link to={createPageUrl('AdminDashboard')}>
              <Button variant="outline" className="bg-white text-red-600 hover:bg-red-50 border-0">
                Go to Admin
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}