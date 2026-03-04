import { useState, useEffect, useRef } from 'react';
import React from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, ShoppingBag, User, X, Menu, ChevronLeft, Minus, Plus, Grid, LayoutGrid, Star, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';

gsap.registerPlugin(ScrollTrigger);

export default function StorePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('category') || 'selection';
  
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [layout, setLayout] = useState(4); // 4 or 6 columns
  const [cartItems, setCartItems] = useState<any[]>([]);

  // Fetch Products
  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*');
      
      if (error) {
        console.error('Error fetching products:', error);
      } else {
        // Add mock reviews if missing, to prevent UI errors
        const productsWithReviews = data?.map(p => ({
          ...p,
          reviews: p.reviews || [],
          // Map database fields to UI fields if necessary (e.g. snake_case to camelCase)
          inStock: p.in_stock,
          backgroundType: p.background_type
        })) || [];
        setProducts(productsWithReviews);
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

  // Product Detail State
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');
  const [customizationMode, setCustomizationMode] = useState(false);
  const [customOptions, setCustomOptions] = useState({
    upperColor: '#ffffff',
    soleColor: '#000000',
    lacesColor: '#ffffff',
    personalization: '',
    description: '',
    images: [] as File[]
  });
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });

  const scrollRef = useRef<HTMLDivElement>(null);

  // Parallax Animations
  useEffect(() => {
    // Scroll to top on mount and reset overflow
    window.scrollTo(0, 0);
    document.body.style.overflow = '';

    // Only run GSAP if we are NOT in selection mode (i.e. we have a hero section)
    if (activeCategory !== 'selection') {
      const ctx = gsap.context(() => {
        // Check if elements exist before animating
        const heroBg = document.querySelector('.store-hero-bg');
        const heroContent = document.querySelector('.store-hero-content');

        if (heroBg && heroContent) {
          gsap.to('.store-hero-bg', {
            yPercent: 30,
            ease: 'none',
            scrollTrigger: {
              trigger: '.store-hero',
              start: 'top top',
              end: 'bottom top',
              scrub: true
            }
          });

          gsap.to('.store-hero-content', {
            yPercent: -20,
            opacity: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: '.store-hero',
              start: 'top top',
              end: 'bottom top',
              scrub: true
            }
          });
        }
      }, scrollRef);
      return () => ctx.revert();
    }
  }, [activeCategory]);

  // Prevent body scroll when overlays are active
  useEffect(() => {
    if (cartOpen || searchOpen || mobileMenuOpen || selectedProduct) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [cartOpen, searchOpen, mobileMenuOpen, selectedProduct]);

  // Reset state when product changes
  useEffect(() => {
    if (selectedProduct) {
      setActiveTab('details');
      setCustomizationMode(false);
      setCustomOptions({
        upperColor: '#ffffff',
        soleColor: '#000000',
        lacesColor: '#ffffff',
        personalization: '',
        description: '',
        images: []
      });
    }
  }, [selectedProduct]);

  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc'>('default');
  const [filterInStock, setFilterInStock] = useState(false);

  // Filter and Sort Logic
  const filteredProducts = products
    .filter(p => activeCategory === 'selection' || p.category === activeCategory)
    .filter(p => !filterInStock || p.inStock)
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      return 0;
    });

  // Search Animation Refs
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchOpen) {
      const ctx = gsap.context(() => {
        gsap.fromTo(searchContainerRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.3, ease: 'power2.out' }
        );
        gsap.fromTo(searchContentRef.current,
          { y: -50, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, ease: 'back.out(1.7)', delay: 0.1 }
        );
      });
      return () => ctx.revert();
    }
  }, [searchOpen]);

  const addToCart = (product: any) => {
    setCartItems([...cartItems, product]);
    setCartOpen(true);
    // Don't close the product overlay
    // setSelectedProduct(null); 
  };

  const handleCustomOrder = () => {
    // Mock sending to admin
    alert(`Custom order request sent for ${selectedProduct.name}!\nDetails: ${JSON.stringify({ ...customOptions, images: customOptions.images.length })}`);
    setCustomizationMode(false);
    setSelectedProduct(null);
  };

  const handleAddReview = () => {
    if (!newReview.comment) return;
    
    // Check if user already has 3 reviews (mock check)
    const userReviews = selectedProduct.reviews?.filter((r: any) => r.user === "You") || [];
    if (userReviews.length >= 3) {
      alert("You can only submit a maximum of 3 reviews for this product.");
      return;
    }

    const review = {
      id: Date.now(),
      user: "You",
      rating: newReview.rating,
      comment: newReview.comment
    };
    // In a real app, this would update the backend. Here we just update local state for the session.
    selectedProduct.reviews = [review, ...(selectedProduct.reviews || [])];
    setNewReview({ rating: 5, comment: '' });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (files.length + customOptions.images.length > 3) {
        alert("You can only upload a maximum of 3 images.");
        return;
      }
      setCustomOptions({ ...customOptions, images: [...customOptions.images, ...files] });
    }
  };

  // Render Category Selection
  if (activeCategory === 'selection') {
    return (
      <div className="bg-black text-white min-h-screen font-sans flex flex-col md:flex-row">
        {/* Header (Minimalist) */}
        <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-between items-center bg-transparent pointer-events-none">
          <div className="pointer-events-auto cursor-pointer" onClick={() => setMobileMenuOpen(true)}>
             <img src="https://instant.pxcode.io/api/pages/4c054573-e508-43d9-83fe-51efb0632ead/images/106_388.svg" alt="Menu" className="w-6 h-8" />
          </div>
          <div className="pointer-events-auto flex gap-4">
             <ShoppingBag className="w-6 h-6" onClick={() => setCartOpen(true)} />
          </div>
        </header>

        {/* Astra Design Section */}
        <div 
          className="flex-1 h-[50vh] md:h-screen relative group cursor-pointer overflow-hidden border-b md:border-b-0 md:border-r border-white/10"
          onClick={() => setSearchParams({ category: 'astra' })}
        >
          <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/astra/1920/1080')] bg-cover bg-center opacity-60 group-hover:opacity-80 transition-opacity duration-500 scale-100 group-hover:scale-105 transform"></div>
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-colors duration-500">
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white uppercase italic">Astra Design</h1>
          </div>
        </div>

        {/* Cartoon Design Section */}
        <div 
          className="flex-1 h-[50vh] md:h-screen relative group cursor-pointer overflow-hidden"
          onClick={() => setSearchParams({ category: 'cartoon' })}
        >
          <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/cartoon/1920/1080')] bg-cover bg-center opacity-60 group-hover:opacity-80 transition-opacity duration-500 scale-100 group-hover:scale-105 transform"></div>
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-colors duration-500">
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white uppercase italic">Cartoon Design</h1>
          </div>
        </div>
        
        {/* Mobile Menu (Sidebar) */}
        <div className={`fixed inset-0 z-[10000] flex justify-end transition-visibility duration-500 ${mobileMenuOpen ? 'visible' : 'invisible'}`}>
          <div className={`absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-500 ${mobileMenuOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setMobileMenuOpen(false)}></div>
          <aside className={`relative w-[85vw] max-w-[300px] h-full bg-black flex flex-col px-6 py-6 transition-transform duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'} z-20 overflow-y-auto no-scrollbar border-l border-white/10`}>
            <div className="flex justify-between items-center mb-8">
              <img src="https://instant.pxcode.io/api/pages/4c054573-e508-43d9-83fe-51efb0632ead/images/106_388.svg" alt="Menu" className="w-6 h-8 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setMobileMenuOpen(false)} />
              <img src="https://instant.pxcode.io/api/pages/4c054573-e508-43d9-83fe-51efb0632ead/images/05967a3b42804ffdca1a72f53c85b08ce07b4c2c.png" alt="Shoe" className="w-10 h-8 object-contain" />
            </div>
            <nav className="flex flex-col gap-6 mb-10 pl-2">
              <div className="flex items-center justify-between pr-2 cursor-pointer group" onClick={() => navigate('/')}>
                <span className="font-bold text-2xl tracking-tight text-white group-hover:text-[#096bff] transition-colors">HOME</span>
              </div>
              <div className="flex items-center justify-between pr-2 cursor-pointer group" onClick={() => { setMobileMenuOpen(false); setSearchParams({ category: 'selection' }); }}>
                <span className="font-bold text-2xl tracking-tight text-white group-hover:text-[#1b72e4] transition-colors">STORE</span>
              </div>
            </nav>
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black text-white min-h-screen font-sans" ref={scrollRef}>
      {/* Header */}
      <Navbar 
        onCartClick={() => setCartOpen(true)}
        onSearchClick={() => setSearchOpen(true)}
        cartCount={cartItems.length}
      />

      <main className="pt-24">
        {/* Store Hero */}
        <section className="store-hero relative h-[40vh] overflow-hidden flex items-center justify-center">
          <div className="store-hero-bg absolute inset-0 bg-[url('https://images.unsplash.com/photo-1556906781-9a412961d28c?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-50"></div>
          <div className="store-hero-content relative z-10 text-center px-4">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4 italic uppercase">
              {activeCategory === 'astra' ? 'ASTRA STORE' : 'CARTOON COLLECTION'}
            </h1>
            <p className="text-gray-400 max-w-md mx-auto">
              {activeCategory === 'astra' ? 'Premium customizable footwear.' : 'Playful designs for the bold.'}
            </p>
          </div>
        </section>

        {/* Filter Bar */}
        <div className="border-b border-white/10 py-4 sticky top-[66px] bg-black/95 z-30 backdrop-blur-md">
          <div className="max-w-[1400px] mx-auto px-5 md:px-10 flex justify-between items-center flex-wrap gap-4">
            <div className="flex items-center gap-6">
              <button 
                className={`flex items-center gap-2 text-xs font-medium transition-opacity ${filterInStock ? 'text-white' : 'text-gray-400 hover:text-white'}`}
                onClick={() => setFilterInStock(!filterInStock)}
              >
                Availability {filterInStock && <Check size={12} />}
              </button>
              <button 
                className={`flex items-center gap-2 text-xs font-medium transition-opacity ${sortBy.startsWith('price') ? 'text-white' : 'text-gray-400 hover:text-white'}`}
                onClick={() => setSortBy(prev => prev === 'price-asc' ? 'price-desc' : 'price-asc')}
              >
                Price {sortBy === 'price-asc' ? '↑' : sortBy === 'price-desc' ? '↓' : ''}
              </button>
            </div>
            <div className="flex items-center gap-6">
              <span className="text-xs text-gray-400">{filteredProducts.length} items</span>
              <div className="hidden md:flex items-center gap-3 pl-5 border-l border-white/10">
                <button 
                  className={`p-1 transition-opacity ${layout === 4 ? 'opacity-100' : 'opacity-30'}`}
                  onClick={() => setLayout(4)}
                >
                  <Grid size={16} />
                </button>
                <button 
                  className={`p-1 transition-opacity ${layout === 6 ? 'opacity-100' : 'opacity-30'}`}
                  onClick={() => setLayout(6)}
                >
                  <LayoutGrid size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Product Grid - Conditional Layout */}
        <section className="py-10 pb-20 px-5 md:px-10 max-w-[1400px] mx-auto">
          {activeCategory === 'astra' ? (
            // Astra Design Layout (Card Style)
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product) => (
                <div key={product.id} className="bg-black border border-white/10 rounded-3xl overflow-hidden group cursor-pointer relative" onClick={() => setSelectedProduct(product)}>
                  {/* Card Header */}
                  <div className="absolute top-0 left-0 right-0 p-4 flex justify-center items-center z-10">
                    <img src="https://instant.pxcode.io/api/pages/4c054573-e508-43d9-83fe-51efb0632ead/images/05967a3b42804ffdca1a72f53c85b08ce07b4c2c.png" alt="Shoe" className="w-8 h-6 object-contain" />
                  </div>
                  
                  {/* Title */}
                  <div className="absolute top-14 left-0 right-0 text-center z-10">
                    <h3 className="text-blue-500 font-black text-xl tracking-widest uppercase italic drop-shadow-md">ASTRA STORE</h3>
                  </div>

                  {/* Image Container */}
                  <div className="relative aspect-[4/5] bg-[#1a1a1a] mt-0">
                    {!product.inStock && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
                        <span className="text-white font-bold text-xl uppercase border-2 border-white px-4 py-2 transform -rotate-12">Out of Stock</span>
                      </div>
                    )}
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-full object-cover"
                    />
                    {/* Price Overlay with Dynamic Color */}
                    <div className="absolute bottom-20 left-0 right-0 text-center pointer-events-none">
                      <p 
                        className="font-serif text-3xl font-bold tracking-wide"
                        style={{ color: product.backgroundType === 'dark' ? 'white' : 'black' }}
                      >
                        PRICE: {product.price.toLocaleString()} rs
                      </p>
                    </div>
                  </div>

                  {/* Bottom Action Bar */}
                  <div className="bg-[#ff9900] p-4 flex flex-col items-center justify-center gap-3 absolute bottom-0 left-0 right-0 rounded-t-3xl shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
                    <p className="text-black text-[10px] font-bold text-center uppercase leading-tight max-w-[200px] line-clamp-2">
                      {product.description || "Easy customization personalization add on customize this shoes flexible"}
                    </p>
                    <button className="bg-[#0099ff] text-white text-xs font-bold uppercase px-6 py-2 rounded-full shadow-md hover:bg-[#0077cc] transition-colors">
                      buy now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Cartoon Design Layout (Standard Grid)
            <div className={`grid grid-cols-2 md:grid-cols-4 ${layout === 6 ? 'xl:grid-cols-6' : ''} gap-x-4 gap-y-10`}>
              {filteredProducts.map((product) => (
                <div key={product.id} className="group cursor-pointer" onClick={() => setSelectedProduct(product)}>
                  <div className="relative aspect-[4/5] bg-[#0d0d0d] overflow-hidden mb-3">
                    {!product.inStock && (
                      <span className="absolute top-2 left-2 bg-black text-white text-[10px] px-2 py-1 rounded-full z-10 font-medium">
                        Sold Out
                      </span>
                    )}
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:-translate-y-1 group-hover:scale-105"
                    />
                  </div>
                  <h3 className="text-sm text-white font-normal truncate">{product.name}</h3>
                  <p className="text-xs text-gray-400 mt-1">${product.price}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Product Detail Overlay */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 top-[66px] bg-black z-50 overflow-y-auto"
          >
            <div className="max-w-[1400px] mx-auto min-h-full pb-20">
              <div className="flex justify-between items-center px-6 md:px-10 py-6 sticky top-0 bg-black/95 backdrop-blur-md z-20 border-b border-white/10">
                <button 
                  onClick={() => setSelectedProduct(null)}
                  className="flex items-center gap-2 text-[#0071e3] hover:text-[#0077ed] text-sm font-bold uppercase tracking-wide transition-colors border-b-2 border-[#0071e3] pb-0.5"
                >
                  <ChevronLeft size={16} /> Back
                </button>
                
                <div className="flex gap-4">
                   <button 
                     onClick={() => setCustomizationMode(!customizationMode)}
                     className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border transition-all ${customizationMode ? 'bg-white text-black border-white' : 'border-white/30 text-white hover:border-white'}`}
                   >
                     {customizationMode ? 'Exit Studio' : 'Customize This Shoe'}
                   </button>
                </div>
              </div>

              <div className="grid md:grid-cols-[1fr_400px] lg:grid-cols-[1fr_450px] gap-0 items-start relative">
                {/* Images / Visualizer - Sticky on Desktop */}
                <div className="grid grid-cols-1 gap-4 px-0 md:pl-10 pb-10 md:sticky md:top-[80px] h-[calc(100vh-100px)]">
                  <div 
                    className="w-full h-full bg-[#0d0d0d] overflow-hidden relative rounded-xl border border-white/5 group"
                    onMouseMove={(e) => {
                      const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
                      const x = (e.clientX - left) / width;
                      const y = (e.clientY - top) / height;
                      const img = e.currentTarget.querySelector('img');
                      if (img) {
                        img.style.transformOrigin = `${x * 100}% ${y * 100}%`;
                        img.style.transform = 'scale(2)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      const img = e.currentTarget.querySelector('img');
                      if (img) {
                        img.style.transform = 'scale(1)';
                        img.style.transformOrigin = 'center center';
                      }
                    }}
                  >
                    {/* Simple visualizer simulation using CSS filters if in custom mode */}
                    {!selectedProduct.inStock && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20 pointer-events-none">
                        <span className="text-white font-bold text-3xl uppercase border-4 border-white px-6 py-3 transform -rotate-12">Out of Stock</span>
                      </div>
                    )}
                    <img 
                      src={selectedProduct.image} 
                      alt={selectedProduct.name} 
                      className="w-full h-full object-cover transition-transform duration-200 ease-out cursor-zoom-in"
                      style={customizationMode ? { 
                        filter: `drop-shadow(0 0 20px ${customOptions.upperColor}40)` 
                      } : {}}
                    />
                    
                    {customizationMode && (
                      <div className="absolute bottom-6 left-6 bg-black/80 backdrop-blur-md p-4 rounded-xl border border-white/10">
                         <p className="text-xs text-gray-400 mb-1">Preview Configuration</p>
                         <div className="flex gap-2 text-xs">
                            <span style={{ color: customOptions.upperColor }}>● Upper</span>
                            <span style={{ color: customOptions.soleColor }}>● Sole</span>
                            <span style={{ color: customOptions.lacesColor }}>● Laces</span>
                         </div>
                         {customOptions.personalization && (
                           <div className="mt-2 text-xs font-mono border-t border-white/10 pt-2">
                             Engraving: "{customOptions.personalization}"
                           </div>
                         )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Info Panel */}
                <div className="px-6 md:px-10 pb-20">
                  <h1 className="text-3xl font-bold mb-2">{selectedProduct.name}</h1>
                  <p className="text-xl text-gray-300 mb-6">${selectedProduct.price}</p>
                  
                  {customizationMode ? (
                    /* CUSTOMIZATION UI */
                    <div className="bg-[#111] p-6 rounded-2xl border border-white/10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <Grid size={18} /> Customization Studio
                      </h3>
                      
                      <div className="space-y-6">
                        <div>
                          <label className="text-xs font-bold uppercase text-gray-500 mb-3 block">Upper Color</label>
                          <div className="flex gap-3">
                            {['#ffffff', '#000000', '#ff0000', '#0000ff', '#ffff00'].map(color => (
                              <button 
                                key={color}
                                className={`w-8 h-8 rounded-full border-2 ${customOptions.upperColor === color ? 'border-white scale-110' : 'border-transparent hover:scale-110'} transition-all`}
                                style={{ backgroundColor: color }}
                                onClick={() => setCustomOptions({...customOptions, upperColor: color})}
                              />
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-bold uppercase text-gray-500 mb-3 block">Sole Color</label>
                          <div className="flex gap-3">
                            {['#ffffff', '#000000', '#888888'].map(color => (
                              <button 
                                key={color}
                                className={`w-8 h-8 rounded-full border-2 ${customOptions.soleColor === color ? 'border-white scale-110' : 'border-transparent hover:scale-110'} transition-all`}
                                style={{ backgroundColor: color }}
                                onClick={() => setCustomOptions({...customOptions, soleColor: color})}
                              />
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-bold uppercase text-gray-500 mb-3 block">Laces Color</label>
                          <div className="flex gap-3">
                            {['#ffffff', '#000000', '#ff0000', '#00ff00'].map(color => (
                              <button 
                                key={color}
                                className={`w-8 h-8 rounded-full border-2 ${customOptions.lacesColor === color ? 'border-white scale-110' : 'border-transparent hover:scale-110'} transition-all`}
                                style={{ backgroundColor: color }}
                                onClick={() => setCustomOptions({...customOptions, lacesColor: color})}
                              />
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-bold uppercase text-gray-500 mb-3 block">Personalization (Max 10 chars)</label>
                          <input 
                            type="text" 
                            maxLength={10}
                            placeholder="Your Name"
                            className="w-full bg-black border border-white/20 rounded-lg px-4 py-3 text-white focus:border-white outline-none transition-colors"
                            value={customOptions.personalization}
                            onChange={(e) => setCustomOptions({...customOptions, personalization: e.target.value})}
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold uppercase text-gray-500 mb-3 block">Style Description</label>
                          <textarea 
                            placeholder="Describe your style..."
                            className="w-full bg-black border border-white/20 rounded-lg px-4 py-3 text-white focus:border-white outline-none transition-colors"
                            rows={3}
                            value={customOptions.description}
                            onChange={(e) => setCustomOptions({...customOptions, description: e.target.value})}
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold uppercase text-gray-500 mb-3 block">Reference Images (Max 3)</label>
                          <input 
                            type="file" 
                            accept="image/*"
                            multiple
                            className="w-full bg-black border border-white/20 rounded-lg px-4 py-3 text-white focus:border-white outline-none transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-white file:text-black hover:file:bg-gray-200"
                            onChange={handleImageUpload}
                          />
                          <div className="flex gap-2 mt-2">
                            {customOptions.images.map((file, idx) => (
                              <div key={idx} className="text-xs text-gray-400 truncate max-w-[100px]">{file.name}</div>
                            ))}
                          </div>
                        </div>

                        <button 
                          onClick={handleCustomOrder}
                          className="w-full py-4 bg-white text-black font-bold uppercase tracking-widest rounded-full hover:bg-gray-200 transition-colors mt-4"
                        >
                          Request Custom Order
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* STANDARD DETAILS UI */
                    <>
                      <div className="flex gap-6 border-b border-white/10 mb-6">
                        <button 
                          className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'details' ? 'text-white' : 'text-gray-500 hover:text-white'}`}
                          onClick={() => setActiveTab('details')}
                        >
                          Details
                          {activeTab === 'details' && <motion.div layoutId="underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />}
                        </button>
                        <button 
                          className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'reviews' ? 'text-white' : 'text-gray-500 hover:text-white'}`}
                          onClick={() => setActiveTab('reviews')}
                        >
                          Reviews ({selectedProduct.reviews?.length || 0})
                          {activeTab === 'reviews' && <motion.div layoutId="underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />}
                        </button>
                      </div>

                      {activeTab === 'details' ? (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                          <div className="mb-8">
                            <p className="text-sm font-medium mb-3">Size</p>
                            <div className="flex flex-wrap gap-2">
                              {[7, 8, 9, 10, 11].map(size => (
                                <button key={size} className="w-14 h-12 border border-white/20 hover:border-white flex items-center justify-center text-sm transition-colors">
                                  {size}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="flex gap-3 mb-4">
                            <div className="flex items-center bg-white rounded-full overflow-hidden shrink-0">
                              <button className="w-10 h-[52px] flex items-center justify-center text-black hover:bg-black/5">
                                <Minus size={16} />
                              </button>
                              <span className="w-8 text-center text-black font-semibold">1</span>
                              <button className="w-10 h-[52px] flex items-center justify-center text-black hover:bg-black/5">
                                <Plus size={16} />
                              </button>
                            </div>
                            <button 
                              onClick={() => addToCart(selectedProduct)}
                              disabled={!selectedProduct.inStock}
                              className={`flex-1 h-[52px] rounded-full font-semibold text-sm transition-colors flex items-center justify-center gap-2 ${!selectedProduct.inStock ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-[#e07640] hover:bg-[#c8612e] text-white'}`}
                            >
                              {selectedProduct.inStock ? 'Add to cart' : 'Out of Stock'}
                            </button>
                          </div>
                          <button 
                            disabled={!selectedProduct.inStock}
                            className={`w-full h-[52px] border-2 rounded-full font-semibold text-sm transition-all ${!selectedProduct.inStock ? 'border-gray-800 text-gray-600 cursor-not-allowed' : 'border-[#e07640] text-[#e07640] hover:bg-[#e07640] hover:text-white'}`}
                          >
                            Buy it now
                          </button>
                          
                          <div className="mt-8 text-sm text-gray-400 leading-relaxed">
                            <p>Experience the ultimate in comfort and style with the {selectedProduct.name}. Designed for the modern urban explorer, featuring breathable materials and responsive cushioning.</p>
                          </div>
                        </div>
                      ) : (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                          {/* Reviews List */}
                          <div className="space-y-6 mb-8">
                            {selectedProduct.reviews && selectedProduct.reviews.length > 0 ? (
                              selectedProduct.reviews.map((review: any) => (
                                <div key={review.id} className="border-b border-white/5 pb-4">
                                  <div className="flex justify-between items-start mb-2">
                                    <span className="font-bold text-sm">{review.user}</span>
                                    <div className="flex text-[#e07640]">
                                      {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={12} fill={i < review.rating ? "currentColor" : "none"} className={i < review.rating ? "" : "text-gray-700"} />
                                      ))}
                                    </div>
                                  </div>
                                  <p className="text-sm text-gray-300">{review.comment}</p>
                                </div>
                              ))
                            ) : (
                              <p className="text-sm text-gray-500 italic">No reviews yet. Be the first!</p>
                            )}
                          </div>

                          {/* Add Review Form */}
                          <div className="bg-[#111] p-5 rounded-xl border border-white/10">
                            <h4 className="text-sm font-bold mb-4">Write a Review</h4>
                            <div className="flex gap-2 mb-4">
                              {[1, 2, 3, 4, 5].map(star => (
                                <button key={star} onClick={() => setNewReview({...newReview, rating: star})}>
                                  <Star size={20} className={star <= newReview.rating ? "text-[#e07640] fill-[#e07640]" : "text-gray-600"} />
                                </button>
                              ))}
                            </div>
                            <textarea 
                              className="w-full bg-black border border-white/20 rounded-lg p-3 text-sm text-white focus:border-white outline-none transition-colors mb-4"
                              rows={3}
                              placeholder="Share your thoughts..."
                              value={newReview.comment}
                              onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                            />
                            <button 
                              onClick={handleAddReview}
                              className="bg-white text-black px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-gray-200 transition-colors"
                            >
                              Submit Review
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Overlay */}
      <AnimatePresence>
        {cartOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setCartOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-[90%] max-w-md bg-[#0a0a0a] border border-white/10 p-10 text-center rounded-lg z-10"
            >
              <button onClick={() => setCartOpen(false)} className="absolute top-4 right-4 p-2 text-white hover:opacity-60">
                <X size={22} />
              </button>
              
              {cartItems.length === 0 ? (
                <>
                  <h2 className="text-2xl mb-4 font-medium">Your cart is empty</h2>
                  <p className="text-white/60 text-sm mb-8">Have an account? <span className="text-[#e07640] underline cursor-pointer">Log in</span> to check out faster.</p>
                </>
              ) : (
                <>
                  <h2 className="text-2xl mb-4 font-medium">Cart ({cartItems.length})</h2>
                  <div className="max-h-[300px] overflow-y-auto mb-6 text-left">
                    {cartItems.map((item, idx) => (
                      <div key={idx} className="flex gap-4 mb-4 border-b border-white/10 pb-4">
                        <img src={item.image} className="w-16 h-20 object-cover bg-white/5" alt={item.name} />
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-400">${item.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
              
              <button 
                onClick={() => setCartOpen(false)}
                className="w-full py-4 border-2 border-[#e07640] text-[#e07640] hover:bg-[#e07640] hover:text-white rounded-xl font-semibold uppercase text-xs tracking-wider transition-all"
              >
                Continue shopping
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Search Overlay */}
      <div 
        ref={searchContainerRef}
        className={`fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex flex-col ${searchOpen ? 'visible' : 'invisible'}`}
      >
        <div ref={searchContentRef} className="flex items-center p-5 gap-4 border-b border-white/10">
          <div className="flex-1 bg-white/10 rounded-xl flex items-center px-4 py-3 gap-3">
            <Search size={18} className="text-white/50" />
            <input 
              type="text" 
              placeholder="Search products..." 
              className="bg-transparent border-none outline-none text-white w-full text-lg placeholder-white/50" 
              autoFocus={searchOpen}
            />
          </div>
          <button onClick={() => setSearchOpen(false)} className="text-white font-medium hover:opacity-70">Cancel</button>
        </div>
        <div className="p-8">
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4">Popular</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {products.slice(0, 4).map(p => (
                <div key={p.id} className="cursor-pointer hover:opacity-70 transition-opacity" onClick={() => { setSelectedProduct(p); setSearchOpen(false); }}>
                  <div className="aspect-[4/5] bg-[#0d0d0d] mb-2">
                    <img src={p.image} className="w-full h-full object-cover" alt={p.name} />
                  </div>
                  <p className="text-xs">{p.name}</p>
                  <p className="text-xs text-gray-500">${p.price}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu (Sidebar) */}
      <div className={`fixed inset-0 z-[10000] flex justify-end transition-visibility duration-500 ${mobileMenuOpen ? 'visible' : 'invisible'}`}>
        {/* Backdrop */}
        <div className={`absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-500 ${mobileMenuOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setMobileMenuOpen(false)}></div>
        
        {/* Sidebar Content */}
        <aside className={`relative w-[85vw] max-w-[400px] h-full bg-black flex flex-col px-6 py-4 transition-transform duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'} z-20 overflow-y-auto no-scrollbar border-l border-white/10`}>
          
          {/* Menu Header */}
          <div className="flex justify-between items-center mb-10 mt-2">
            <img src="https://instant.pxcode.io/api/pages/4c054573-e508-43d9-83fe-51efb0632ead/images/106_388.svg" alt="Menu" className="w-8 h-10 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setMobileMenuOpen(false)} />
            <img src="https://instant.pxcode.io/api/pages/4c054573-e508-43d9-83fe-51efb0632ead/images/05967a3b42804ffdca1a72f53c85b08ce07b4c2c.png" alt="Shoe" className="w-14 h-12 object-contain" />
          </div>

          {/* Nav Links */}
          <nav className="flex flex-col gap-8 mb-12 pl-4">
            <div className="flex items-center justify-between pr-4 cursor-pointer group" onClick={() => navigate('/')}>
              <span className="font-black text-4xl md:text-5xl tracking-tight text-[#096bff] group-hover:opacity-80 transition-opacity">HOME</span>
              <div className="w-10 flex justify-center">
                 <img src="https://instant.pxcode.io/api/pages/4c054573-e508-43d9-83fe-51efb0632ead/images/107_11.svg" alt="Home" className="w-6 h-6" />
              </div>
            </div>
            <div className="flex items-center justify-between pr-4 cursor-pointer group" onClick={() => navigate('/store')}>
              <span className="font-black text-4xl md:text-5xl tracking-tight text-[#1b72e4] group-hover:opacity-80 transition-opacity">STORE</span>
              <div className="w-10 flex justify-center">
                 <img src="https://instant.pxcode.io/api/pages/4c054573-e508-43d9-83fe-51efb0632ead/images/107_15.svg" alt="Store" className="w-6 h-6" />
              </div>
            </div>
          </nav>

          {/* Category Section */}
          <div className="flex justify-center mb-10 pr-4">
             <div className="relative w-36 h-12 flex items-center justify-center">
                <img src="https://instant.pxcode.io/api/pages/4c054573-e508-43d9-83fe-51efb0632ead/images/107_60.svg" className="absolute inset-0 w-full h-full" alt="Splash" />
                <span className="relative z-10 text-[#0b1fff] font-black text-sm tracking-widest">CATEGORY</span>
             </div>
          </div>

          {/* Product List */}
          <div className="flex gap-5 mb-auto pl-2">
             <div className="pt-2">
                <img src="https://instant.pxcode.io/api/pages/4c054573-e508-43d9-83fe-51efb0632ead/images/107_42.svg" className="w-10" alt="New" />
             </div>
             <div className="flex flex-col gap-6">
                <div className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => { setMobileMenuOpen(false); navigate('/store'); }}>
                   <div className="bg-[#ff0000] text-white w-6 h-4 rounded-full text-[10px] font-bold flex items-center justify-center">1</div>
                   <span className="font-black text-xl text-[#ed2c1a]">ASTRA DESIGN</span>
                </div>
                <div className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => { setMobileMenuOpen(false); navigate('/store'); }}>
                   <div className="bg-[#ff0000] text-white w-6 h-4 rounded-full text-[10px] font-bold flex items-center justify-center">2</div>
                   <span className="font-black text-xl text-[#ef310f]">CARTOON DESIGN</span>
                </div>
             </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col gap-4 mt-12">
             <div className="h-px bg-white/20 w-full mb-2"></div>
             <div className="font-bold text-lg text-[#1877e3] cursor-pointer hover:opacity-80 transition-opacity">CONTACT US</div>
             <div className="flex items-center justify-between pr-4">
                <span className="font-bold text-lg text-[#2277e5] cursor-pointer hover:opacity-80 transition-opacity">REFUND POLICY</span>
                <img src="https://instant.pxcode.io/api/pages/4c054573-e508-43d9-83fe-51efb0632ead/images/107_25.svg" className="w-10 h-10" alt="Refund" />
             </div>
          </div>

        </aside>
      </div>

    </div>
  );
}
