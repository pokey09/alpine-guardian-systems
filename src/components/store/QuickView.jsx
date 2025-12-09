import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Star, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import ImageGallery from './ImageGallery';
import ProductVariations from './ProductVariations';

export default function QuickView({ product, isOpen, onClose, onAddToCart, reviews = [] }) {
  const [selectedVariations, setSelectedVariations] = useState({});
  const [priceAdjustment, setPriceAdjustment] = useState(0);

  const handleVariationChange = (name, value, adjustment) => {
    if (!product) return;
    
    setSelectedVariations((prev) => ({ ...prev, [name]: value }));
    
    const totalAdjustment = Object.entries({ ...selectedVariations, [name]: value })
      .reduce((sum, [varName, varValue]) => {
        const variation = product.variations?.find(v => v.name === varName);
        const option = variation?.options?.find(o => o.value === varValue);
        return sum + (option?.price_adjustment || 0);
      }, 0);
    
    setPriceAdjustment(totalAdjustment);
  };

  if (!product) return null;

  const finalPrice = (product.price || 0) + priceAdjustment;

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  const allImages = [product.image, ...(product.image_gallery || [])].filter(Boolean);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-4xl bg-white rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Quick View</h2>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid md:grid-cols-2 gap-8">
                <ImageGallery images={allImages} />

                <div>
                  <h3 className="text-3xl font-bold text-slate-900 mb-2">{product.name}</h3>
                  
                  {reviews.length > 0 && (
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= Math.round(averageRating)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-slate-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-slate-600">
                        {averageRating} ({reviews.length})
                      </span>
                    </div>
                  )}

                  <p className="text-3xl font-bold text-red-600 mb-4">${finalPrice}</p>
                  
                  <p className="text-slate-700 mb-6 leading-relaxed">{product.description}</p>

                  <ProductVariations
                    variations={product.variations}
                    selectedVariations={selectedVariations}
                    onVariationChange={handleVariationChange}
                  />

                  <div className="mt-6 flex gap-3">
                    <Button
                      onClick={() => {
                        onAddToCart({ ...product, price: finalPrice, selectedVariations });
                        onClose();
                      }}
                      className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white h-12"
                    >
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Add to Cart
                    </Button>
                    <Link to={`${createPageUrl('ProductDetail')}?id=${product.id}`}>
                      <Button variant="outline" className="h-12 px-6">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Full Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}