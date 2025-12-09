import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Star, ShoppingCart, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import Header from '../components/landing/Header';
import Footer from '../components/landing/Footer';
import Cart from '../components/store/Cart';
import ProductReviews from '../components/store/ProductReviews';
import ImageGallery from '../components/store/ImageGallery';
import ProductVariations from '../components/store/ProductVariations';

export default function ProductDetail() {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedVariations, setSelectedVariations] = useState({});
  const [priceAdjustment, setPriceAdjustment] = useState(0);

  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('Product')
        .select('*')
        .eq('id', productId)
        .single();
      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
    enabled: !!productId,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('Review')
        .select('*')
        .eq('product_id', productId)
        .eq('status', 'approved');
      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
    enabled: !!productId,
  });

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

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

  const finalPrice = product ? (product.price || 0) + priceAdjustment : 0;

  const addToCart = () => {
    if (!product) return;
    
    const productToAdd = { ...product, price: finalPrice, selectedVariations, quantity: 1 };
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      const updated = existing
        ? prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
        : [...prev, productToAdd];
      localStorage.setItem('cart', JSON.stringify(updated));
      return updated;
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (id, quantity) => {
    if (quantity === 0) {
      removeItem(id);
      return;
    }
    setCartItems(prev => {
      const updated = prev.map(item => item.id === id ? { ...item, quantity } : item);
      localStorage.setItem('cart', JSON.stringify(updated));
      return updated;
    });
  };

  const removeItem = (id) => {
    setCartItems(prev => {
      const updated = prev.filter(item => item.id !== id);
      localStorage.setItem('cart', JSON.stringify(updated));
      return updated;
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="max-w-6xl mx-auto px-6 py-16 text-center">Loading...</div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="max-w-6xl mx-auto px-6 py-16 text-center">Product not found</div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-6 py-16">
        <Link to={createPageUrl('StoreFront')} className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to Store
        </Link>

        <div className="grid md:grid-cols-2 gap-12">
          <ImageGallery images={[product.image, ...(product.image_gallery || [])].filter(Boolean)} />

          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-4">{product.name}</h1>
            
            {reviews.length > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        star <= Math.round(averageRating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-slate-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-slate-600">
                  {averageRating} ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                </span>
              </div>
            )}

            <p className="text-3xl font-bold text-red-600 mb-6">${finalPrice}</p>
            
            <p className="text-slate-700 mb-6 leading-relaxed">{product.description}</p>

            <div className="mb-8">
              <ProductVariations
                variations={product.variations}
                selectedVariations={selectedVariations}
                onVariationChange={handleVariationChange}
              />
            </div>

            <Button
              onClick={addToCart}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white h-12 text-lg"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Add to Cart
            </Button>
          </div>
        </div>

        <ProductReviews product={product} />
      </div>

      <Footer />
      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemove={removeItem}
      />
    </div>
  );
}