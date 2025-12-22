import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowLeft, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import Header from '../components/landing/Header';
import Footer from '../components/landing/Footer';
import { Button } from '@/components/ui/button';

export default function CheckoutSuccess() {
  useEffect(() => {
    // Clear the cart after successful checkout
    localStorage.removeItem('cart');
  }, []);

  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get('session_id');

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <div className="max-w-2xl mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl shadow-xl p-12 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-12 h-12 text-green-600" />
          </motion.div>

          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Order Successful!
          </h1>

          <p className="text-lg text-slate-600 mb-8">
            Thank you for your purchase. We've received your order and will process it shortly.
          </p>

          {sessionId && (
            <p className="text-sm text-slate-500 mb-8">
              Order ID: {sessionId}
            </p>
          )}

          <div className="space-y-4">
            <p className="text-slate-700">
              A confirmation email has been sent to your email address with order details.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Button asChild className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600">
              <Link to={createPageUrl('StoreFront')}>
                <ShoppingBag className="w-5 h-5 mr-2" />
                Continue Shopping
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to={createPageUrl('Home')}>
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Home
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
