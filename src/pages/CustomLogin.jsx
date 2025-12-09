import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { supabase } from '@/lib/supabaseClient';

export default function CustomLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      window.location.href = createPageUrl('Dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center px-4 sm:px-6 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-96 h-96 rounded-full"
            style={{
              left: `${20 + i * 30}%`,
              top: `${20 + i * 20}%`,
              background: 'radial-gradient(circle, rgba(239, 68, 68, 0.1) 0%, transparent 70%)',
              filter: 'blur(40px)',
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 15 + i * 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10">
          {/* Logo */}
          <div className="flex justify-center mb-4 sm:mb-6">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69386993c4c28da2d1fc07c3/6b5bc90fc_AdobeExpress-file.png" 
              alt="Alpine Guardian Systems"
              className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
            />
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-2">Welcome back</h1>
          <p className="text-sm sm:text-base text-slate-500 text-center mb-6 sm:mb-8">Sign in to your account</p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 flex items-center gap-2 text-sm sm:text-base">
                <Mail className="w-4 h-4" /> Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="h-11 sm:h-12 rounded-xl border-slate-200 focus:border-red-500 focus:ring-red-500/20 text-sm sm:text-base"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700 flex items-center gap-2 text-sm sm:text-base">
                <Lock className="w-4 h-4" /> Password
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
              <Link
                to={createPageUrl('ForgotPassword')}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Forgot Password?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 sm:h-12 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl text-sm sm:text-base font-medium shadow-lg shadow-red-500/25 transition-all duration-300"
            >
              <LogIn className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-5 sm:mt-6 text-center">
            <p className="text-sm sm:text-base text-slate-600">
              Don't have an account?{' '}
              <Link 
                to={createPageUrl('CustomSignup')} 
                className="text-red-600 hover:text-red-700 font-medium"
              >
                Create one
              </Link>
            </p>
          </div>

          <div className="mt-5 sm:mt-6 pt-5 sm:pt-6 border-t border-slate-200 text-center">
            <Link 
              to={createPageUrl('Home')} 
              className="text-slate-500 hover:text-slate-700 text-xs sm:text-sm"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}