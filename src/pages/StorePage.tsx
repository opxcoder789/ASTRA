import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Search, Menu, X, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import SearchModal from '../components/SearchModal';

export default function StorePage() {
  const navigate = useNavigate();
  const params = useParams();
  const activeCategory = params.category || 'selection';
  
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filtersEnabled, setFiltersEnabled] = useState(false);
  const [currency, setCurrency] = useState<'usd' | 'inr'>('usd');
  const [priceRange, setPriceRange] = useState([100, 2000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Fetch Products
  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*');
      
      if (error) {
        console.error('Error fetching products:', error);
      } else {
        const productsWithReviews = data?.map(p => ({
          ...p,
          reviews: p.reviews || [],
          inStock: p.in_stock,
          backgroundType: p.background_type
        })) || [];
        setProducts(productsWithReviews);
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

  const uniqueCategories = Array.from(
    new Set(products.map((p: any) => p.category as string)),
  ).sort((a: string, b: string) => a.localeCompare(b));

  // Filter products
  const filteredProducts = products
    .filter(p => {
      if (activeCategory === 'selection') return true;
      if (activeCategory === 'all') return true;
      return p.category === activeCategory;
    })
    .filter(p => {
      // Only apply price filter if filters are enabled
      if (!filtersEnabled) return true;
      const USD_TO_INR = 83;
      const price = currency === 'inr' ? p.price * USD_TO_INR : p.price;
      return price >= priceRange[0] && price <= priceRange[1];
    })
    .filter(p => {
      // Only apply category filter if filters are enabled
      if (!filtersEnabled) return true;
      if (selectedCategories.length === 0) return true;
      return selectedCategories.includes(p.category);
    });

  const formatPrice = (price: number) => {
    const USD_TO_INR = 83;
    if (currency === 'inr') {
      return `₹${Math.round(price * USD_TO_INR).toLocaleString('en-IN')}`;
    }
    return `$${price.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const slugify = (name: string) =>
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

  // Render Category Selection
  if (activeCategory === 'selection') {
    return (
      <div className="bg-black text-white min-h-screen font-sans flex flex-col">
        <header className="flex items-center justify-between px-6 py-5 border-b border-white/10 sticky top-0 bg-black z-50">
          <div className="flex items-center gap-3">
            <button
              className="flex items-center gap-2"
              onClick={() => navigate('/')}
            >
              <img 
                src="https://instant.pxcode.io/api/pages/4c054573-e508-43d9-83fe-51efb0632ead/images/05967a3b42804ffdca1a72f53c85b08ce07b4c2c.png" 
                alt="Astra Logo" 
                className="w-8 h-8" 
              />
              <span className="text-xs text-white/60 tracking-[0.25em] uppercase">
                Category
              </span>
            </button>
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center px-6 py-10">
          <div className="max-w-md w-full">
            <h1 className="text-3xl font-semibold mb-6 tracking-tight">
              Select Category
            </h1>
            <div className="bg-white/5 rounded-3xl overflow-hidden border border-white/10 divide-y divide-white/10">
              <button
                className="w-full flex items-center justify-between px-5 py-4 active:bg-white/10 hover:bg-white/5 transition-colors"
                onClick={() => navigate('/store/category/all')}
              >
                <div className="flex flex-col items-start">
                  <span className="text-sm font-semibold">All Products</span>
                  <span className="text-xs text-white/50">
                    Explore every style and drop
                  </span>
                </div>
                <span className="text-xs text-white/40">
                  {products.length} items
                </span>
              </button>

              {uniqueCategories.map((cat: string, index: number) => (
                <button
                  key={cat}
                  className="w-full flex items-center justify-between px-5 py-4 active:bg-white/10 hover:bg-white/5 transition-colors"
                  onClick={() => navigate(`/store/category/${encodeURIComponent(cat)}`)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-white text-black text-xs font-semibold flex items-center justify-center">
                      {index + 1}
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-semibold capitalize">
                        {cat}
                      </span>
                      <span className="text-[11px] text-white/50">
                        Tap to view collection
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-white/40">
                    {products.filter((p: any) => p.category === cat).length} items
                  </span>
                </button>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-black text-white min-h-screen font-sans overflow-x-hidden">
      {/* Fixed Header */}
      <Navbar 
        onSearchClick={() => setSearchOpen(true)}
      />

      {/* Search Modal */}
      <SearchModal 
        isOpen={searchOpen} 
        onClose={() => setSearchOpen(false)} 
      />

      <main className="pt-20 w-full max-w-full">
        {/* Store Header - Clean and Fixed */}
        <section className="bg-black border-b border-white/10 py-6 sticky top-[72px] z-40">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight uppercase truncate">
                  {activeCategory === 'all'
                    ? 'ASTRA COLLECTION'
                    : `${activeCategory.toUpperCase()} COLLECTION`}
                </h1>
                <p className="text-gray-400 text-sm mt-1">
                  {filteredProducts.length} items
                </p>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                <div className="flex items-center gap-1 text-xs border border-white/15 rounded-full px-1 py-0.5 bg-white/5">
                  <button
                    className={`px-2 sm:px-3 py-1 rounded-full transition-colors text-xs ${currency === 'usd' ? 'bg-white text-black' : 'text-gray-300'}`}
                    onClick={() => setCurrency('usd')}
                  >
                    USD
                  </button>
                  <button
                    className={`px-2 sm:px-3 py-1 rounded-full transition-colors text-xs ${currency === 'inr' ? 'bg-white text-black' : 'text-gray-300'}`}
                    onClick={() => setCurrency('inr')}
                  >
                    INR
                  </button>
                </div>
                <button
                  onClick={() => setFilterOpen(true)}
                  className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                    filtersEnabled 
                      ? 'bg-green-500 text-white hover:bg-green-600' 
                      : 'bg-gray-600 text-white hover:bg-gray-700'
                  }`}
                >
                  <Filter size={14} className="sm:w-4 sm:h-4" /> 
                  <span className="hidden sm:inline">Filters</span>
                  <span className="sm:hidden">{filtersEnabled ? 'ON' : 'OFF'}</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Product Grid - Original Design */}
        <section className="py-10 pb-20 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto">
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400">No products found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-black border border-white/10 rounded-3xl overflow-hidden group cursor-pointer relative hover:border-white/30 transition-all max-w-full"
                  onClick={() =>
                    navigate(
                      `/store/category/${encodeURIComponent(String(product.category))}/${encodeURIComponent(
                        slugify(String(product.name)),
                      )}`,
                    )
                  }
                >
                  {/* Card Header with Logo */}
                  <div className="absolute top-0 left-0 right-0 p-3 sm:p-4 flex justify-center items-center z-10">
                    <img
                      src="https://instant.pxcode.io/api/pages/4c054573-e508-43d9-83fe-51efb0632ead/images/05967a3b42804ffdca1a72f53c85b08ce07b4c2c.png"
                      alt="Logo"
                      className="w-6 h-4 sm:w-8 sm:h-6 object-contain"
                    />
                  </div>

                  {/* Title */}
                  <div className="absolute top-10 sm:top-14 left-0 right-0 text-center z-10">
                    <h3 className="text-blue-500 font-black text-sm sm:text-xl tracking-widest uppercase italic drop-shadow-md">
                      ASTRA STORE
                    </h3>
                  </div>

                  {/* Image Container */}
                  <div className="relative aspect-[4/5] bg-[#0d0d0d] mt-0 flex items-center justify-center overflow-hidden">
                    {!product.inStock && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
                        <span className="text-white font-bold text-sm sm:text-xl uppercase border-2 border-white px-3 py-2 sm:px-4 sm:py-2 transform -rotate-12">
                          Out of Stock
                        </span>
                      </div>
                    )}
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                    />
                    
                    {/* Price Overlay */}
                    <div className="absolute bottom-16 sm:bottom-20 left-0 right-0 text-center pointer-events-none px-2">
                      <div className="flex flex-col items-center gap-1">
                        <p
                          className="font-serif text-xl sm:text-3xl font-bold tracking-wide"
                          style={{ color: product.backgroundType === 'dark' ? 'white' : 'black' }}
                        >
                          {formatPrice(product.price)}
                        </p>
                        <span className="inline-flex items-center gap-2 text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-white/70">
                          <span className="px-2 py-0.5 rounded-full bg-black/60 border border-white/20 capitalize">
                            {product.category}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action Bar */}
                  <div className="bg-[#ffd54a] p-3 sm:p-4 flex flex-col items-center justify-center gap-2 sm:gap-3 absolute bottom-0 left-0 right-0 rounded-t-3xl shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
                    <p className="text-black text-[9px] sm:text-[10px] font-bold text-center uppercase leading-tight max-w-[200px] sm:max-w-[220px] line-clamp-2">
                      {product.description ||
                        'Easy customization personalization add on customize this shoes flexible'}
                    </p>
                    <button className="bg-[#0099ff] text-white text-xs font-bold uppercase px-4 py-2 sm:px-6 sm:py-2 rounded-full shadow-md hover:bg-[#0077cc] transition-colors">
                      buy now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Filter Modal */}
      <AnimatePresence>
        {filterOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center md:justify-center"
            onClick={() => setFilterOpen(false)}
          >
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 500 }}
              className="bg-white w-full md:max-w-md md:rounded-2xl p-6 max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-black">Filters</h2>
                <button 
                  onClick={() => setFilterOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={24} className="text-gray-600" />
                </button>
              </div>

              {/* Filter Toggle */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-black">Enable Filters</h3>
                    <p className="text-sm text-gray-600">Turn filters on or off</p>
                  </div>
                  <button
                    onClick={() => {
                      setFiltersEnabled(!filtersEnabled);
                      if (!filtersEnabled) {
                        // Reset filters when enabling
                        setPriceRange([100, 2000]);
                        setSelectedCategories([]);
                      }
                    }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      filtersEnabled ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        filtersEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Filter Options - Only show when enabled */}
              {filtersEnabled && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-black mb-3">Categories</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {uniqueCategories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => {
                            if (selectedCategories.includes(cat)) {
                              setSelectedCategories(selectedCategories.filter(c => c !== cat));
                            } else {
                              setSelectedCategories([...selectedCategories, cat]);
                            }
                          }}
                          className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-colors ${
                            selectedCategories.includes(cat)
                              ? 'bg-black text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-black mb-3">Price Range</h3>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">
                        {currency === 'usd' ? '$' : '₹'}{priceRange[0]}
                      </span>
                      <span className="text-sm text-gray-600">
                        {currency === 'usd' ? '$' : '₹'}{priceRange[1]}
                      </span>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Minimum Price</label>
                        <input
                          type="range"
                          min="100"
                          max="2000"
                          value={priceRange[0]}
                          onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                          className="w-full accent-black"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Maximum Price</label>
                        <input
                          type="range"
                          min="100"
                          max="2000"
                          value={priceRange[1]}
                          onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                          className="w-full accent-black"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => {
                    setPriceRange([100, 2000]);
                    setSelectedCategories([]);
                    setFiltersEnabled(false);
                  }}
                  className="flex-1 py-3 border border-gray-300 rounded-full text-black font-medium hover:bg-gray-50 transition-colors"
                >
                  Reset All
                </button>
                <button
                  onClick={() => setFilterOpen(false)}
                  className="flex-1 py-3 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors"
                >
                  Apply
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
