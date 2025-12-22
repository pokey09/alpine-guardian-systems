import React from 'react';
import { motion } from 'framer-motion';
import { XCircle, ArrowLeft, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import Header from '../components/landing/Header';
import Footer from '../components/landing/Footer';
import { Button } from '@/components/ui/button';

export default function CheckoutCancel() {
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
            className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <XCircle className="w-12 h-12 text-yellow-600" />
          </motion.div>

          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Checkout Cancelled
          </h1>

          <p className="text-lg text-slate-600 mb-8">
            Your order was cancelled. Your cart items are still saved and waiting for you.
          </p>

          <div className="space-y-4">
            <p className="text-slate-700">
              No charges were made to your account. You can continue shopping or return to checkout when you're ready.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Button asChild className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600">
              <Link to={createPageUrl('StoreFront')}>
                <ShoppingCart className="w-5 h-5 mr-2" />
                View Cart
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
