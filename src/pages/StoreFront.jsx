import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShoppingCart, Star, Search, SlidersHorizontal, Eye, ArrowUpDown } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { startCheckout } from '@/lib/checkout';
import { useAuth } from '@/lib/AuthContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import Header from '../components/landing/Header';
import Footer from '../components/landing/Footer';
import Cart from '../components/store/Cart';
import QuickView from '../components/store/QuickView';

export default function StoreFront() {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [sortBy, setSortBy] = useState('name');
  const { user } = useAuth();

  const addToCart = (product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (id, quantity) => {
    if (quantity === 0) {
      setCartItems((prev) => prev.filter((item) => item.id !== id));
    } else {
      setCartItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, quantity } : item))
      );
    }
  };

  const removeItem = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleCheckout = async () => {
    try {
      const lineItems = cartItems
        .map((item) => {
          const priceId = item.is_subscription ? item.stripe_recurring_price_id : item.stripe_price_id;
          if (!priceId) return null;
          return { priceId, quantity: item.quantity };
        })
        .filter(Boolean);

      if (lineItems.length === 0) {
        alert('No Stripe price IDs configured for items in your cart.');
        return;
      }

      await startCheckout({
        items: lineItems,
        customerEmail: user?.email || undefined,
      });
    } catch (err) {
      console.error('Stripe checkout error:', err);
      alert(err.message || 'Unable to start checkout.');
    }
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('Product')
        .select('id,name,price,image,description,rating,variations,is_subscription,subscription_interval,stripe_price_id,stripe_recurring_price_id');
      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
  });

  const { data: allReviews = [] } = useQuery({
    queryKey: ['allApprovedReviews'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('Review')
        .select('*')
        .eq('status', 'approved');
      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
  });

  const getProductAverageRating = (productId) => {
    const productReviews = allReviews.filter(r => r.product_id === productId);
    if (productReviews.length === 0) return 0;
    return productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;
  };

  // Fuzzy search helper function
  const fuzzyMatch = (text, search) => {
    if (!search) return true;
    
    const searchLower = search.toLowerCase();
    const textLower = text.toLowerCase();
    
    // Direct substring match (highest priority)
    if (textLower.includes(searchLower)) return true;
    
    // Word boundary match - check if search terms match word starts
    const searchWords = searchLower.split(/\s+/);
    const textWords = textLower.split(/\s+/);
    
    return searchWords.every(searchWord => 
      textWords.some(textWord => textWord.startsWith(searchWord))
    );
  };

  const filteredProducts = products
    .filter((product) => {
      const matchesSearch = fuzzyMatch(product.name, searchTerm) || 
                           fuzzyMatch(product.description, searchTerm);
      
      const matchesMinPrice = minPrice === '' || product.price >= parseFloat(minPrice);
      const matchesMaxPrice = maxPrice === '' || product.price <= parseFloat(maxPrice);
      
      return matchesSearch && matchesMinPrice && matchesMaxPrice;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return getProductAverageRating(b.id) - getProductAverageRating(a.id);
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <button
        onClick={() => setIsCartOpen(true)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-full shadow-xl flex items-center justify-center z-40 transition-all hover:scale-110"
      >
        <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
        {cartCount > 0 && (
          <span className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-6 h-6 sm:w-7 sm:h-7 bg-slate-900 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-bold">
            {cartCount}
          </span>
        )}
      </button>

      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemove={removeItem}
        onCheckout={handleCheckout}
      />
      
      <div className="pt-20 sm:pt-24 pb-12 sm:pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 sm:mb-12 lg:mb-16"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-3 sm:mb-4 px-4">
              Patrol <span className="bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">Solutions Store</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl mx-auto px-4">
              Professional tools and systems for modern ski patrol operations
            </p>
          </motion.div>

          {/* Search and Filters */}
          <div className="mb-6 sm:mb-8 bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-slate-200">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 sm:pl-10 h-10 sm:h-12 text-sm sm:text-base"
                />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-10 sm:h-12 px-3 sm:px-4 border border-slate-200 rounded-lg text-sm sm:text-base bg-white hover:bg-slate-50 transition-colors"
              >
                <option value="name">Sort: A-Z</option>
                <option value="price-low">Sort: Price (Low)</option>
                <option value="price-high">Sort: Price (High)</option>
                <option value="rating">Sort: Rating</option>
              </select>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="h-10 sm:h-12 px-4 sm:px-6"
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>

            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-4 pt-4 border-t border-slate-200 flex flex-col md:flex-row gap-4"
              >
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Min Price</label>
                  <Input
                    type="number"
                    placeholder="$0"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="h-10"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Max Price</label>
                  <Input
                    type="number"
                    placeholder="Any"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="h-10"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setSearchTerm('');
                      setMinPrice('');
                      setMaxPrice('');
                      setSortBy('name');
                    }}
                    className="h-10"
                  >
                    Clear All
                  </Button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Results Count */}
          {(searchTerm || minPrice || maxPrice) && (
            <div className="mb-4 text-slate-600">
              Found <span className="font-semibold text-slate-900">{filteredProducts.length}</span> {filteredProducts.length === 1 ? 'product' : 'products'}
            </div>
          )}

          {/* Products Grid */}
          {isLoading ? (
            <div className="text-center py-12 text-slate-600">Loading products...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-600 mb-2">No products found</p>
              {(searchTerm || minPrice || maxPrice) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setMinPrice('');
                    setMaxPrice('');
                    setSortBy('name');
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className="relative">
                  <Link to={`${createPageUrl('ProductDetail')}?id=${product.id}`}>
                    <div className="aspect-square overflow-hidden bg-slate-100">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                  </Link>
                  <Button
                    onClick={() => setQuickViewProduct(product)}
                    size="sm"
                    className="absolute top-4 right-4 bg-white/90 hover:bg-white text-slate-900 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Quick View
                  </Button>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.round(getProductAverageRating(product.id))
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-slate-300'
                        }`}
                      />
                    ))}
                    {getProductAverageRating(product.id) > 0 && (
                      <span className="text-xs text-slate-500 ml-1">
                        ({allReviews.filter(r => r.product_id === product.id).length})
                      </span>
                    )}
                  </div>
                  
                  <Link to={`${createPageUrl('ProductDetail')}?id=${product.id}`}>
                    <h3 className="text-xl font-bold text-slate-900 mb-2 hover:text-red-600 transition-colors">{product.name}</h3>
                  </Link>
                  <p className="text-slate-600 mb-4">{product.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-slate-900">${product.price}</span>
                    <Button
                      onClick={() => addToCart(product)}
                      className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Cart
                    </Button>
                  </div>
                </div>
              </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />

      <QuickView
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={addToCart}
        reviews={quickViewProduct ? allReviews.filter(r => r.product_id === quickViewProduct.id) : []}
      />
    </div>
  );
}
