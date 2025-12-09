import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { LogIn, ShoppingBag, User, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import logo from '@/assets/logo.png';

export default function Header() {
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      setUser(JSON.parse(currentUser));
    }
  }, []);

  return (
    <motion.header 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <Link to={createPageUrl('Home')} className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity">
          <img src={logo} alt="Alpine Guardian Systems" className="w-8 h-8 sm:w-10 sm:h-10" />
          <span className="text-white font-bold text-base sm:text-lg hidden sm:inline">Alpine Guardian Systems</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-3">
          <Link to={createPageUrl('StoreFront')}>
            <Button
              variant="ghost"
              className="text-white hover:bg-white/10"
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              Store
            </Button>
          </Link>

          {user ? (
            <>
              <Link to={createPageUrl('OrderHistory')}>
                <Button
                  variant="ghost"
                  className="text-white hover:bg-white/10"
                >
                  Orders
                </Button>
              </Link>
              <Link to={createPageUrl('UserProfile')}>
                <Button
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
                >
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </Button>
              </Link>
            </>
          ) : (
            <Link to={createPageUrl('CustomLogin')}>
              <Button
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden w-10 h-10 flex items-center justify-center text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-gray-900 border-t border-gray-800 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-2">
              <Link to={createPageUrl('StoreFront')} onClick={() => setMobileMenuOpen(false)}>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-white hover:bg-white/10"
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Store
                </Button>
              </Link>

              {user ? (
                <>
                  <Link to={createPageUrl('OrderHistory')} onClick={() => setMobileMenuOpen(false)}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-white hover:bg-white/10"
                    >
                      Orders
                    </Button>
                  </Link>
                  <Link to={createPageUrl('UserProfile')} onClick={() => setMobileMenuOpen(false)}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-white hover:bg-white/10"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </Button>
                  </Link>
                </>
              ) : (
                <Link to={createPageUrl('CustomLogin')} onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
  }