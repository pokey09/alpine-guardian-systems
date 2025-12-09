import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { supabase } from '@/lib/supabaseClient';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
    } else {
      setMessage('Password updated successfully.');
      setTimeout(() => {
        navigate(createPageUrl('CustomLogin'));
      }, 2000);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center px-4 sm:px-6 relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10">
          <div className="flex justify-center mb-4 sm:mb-6">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69386993c4c28da2d1fc07c3/6b5bc90fc_AdobeExpress-file.png" 
              alt="Alpine Guardian Systems"
              className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
            />
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-2">Reset Password</h1>
          <p className="text-sm sm:text-base text-slate-500 text-center mb-6 sm:mb-8">
            Enter your new password.
          </p>

          {message && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-600 text-sm">
              {message}
            </div>
          )}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700 flex items-center gap-2 text-sm sm:text-base">
                <Lock className="w-4 h-4" /> New Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-11 sm:h-12 rounded-xl border-slate-200 focus:border-red-500 focus:ring-red-500/20 text-sm sm:text-base"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-slate-700 flex items-center gap-2 text-sm sm:text-base">
                <Lock className="w-4 h-4" /> Confirm New Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="h-11 sm:h-12 rounded-xl border-slate-200 focus:border-red-500 focus:ring-red-500/20 text-sm sm:text-base"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 sm:h-12 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl text-sm sm:text-base font-medium shadow-lg shadow-red-500/25 transition-all duration-300"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </form>

          <div className="mt-5 sm:mt-6 text-center">
            <Link 
              to={createPageUrl('CustomLogin')} 
              className="text-slate-500 hover:text-slate-700 text-xs sm:text-sm flex items-center justify-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Sign In
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
