import { useState, useEffect, memo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Play, Search, User, ShoppingBag, X } from 'lucide-react';
import { useUser, UserButton } from '@clerk/clerk-react';
import { supabase } from '../lib/supabase';

interface NavbarProps {
  isScrolled?: boolean;
  onSearchClick?: () => void;
}

export default memo(function Navbar({ isScrolled: externalIsScrolled, onSearchClick }: NavbarProps) {
  const [menuActive, setMenuActive] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const { isSignedIn, user } = useUser();

  useEffect(() => {
    // Defer category loading to idle time to keep main thread free for interactions
    const loadCategories = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('category');
      if (!error && data) {
        const unique = Array.from(
          new Set(data.map((p: any) => p.category)),
        ).sort((a, b) => a.localeCompare(b));
        setCategories(unique);
      }
    };
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => loadCategories());
    } else {
      setTimeout(loadCategories, 200);
    }
  }, []);

  useEffect(() => {
    const fetchCartCount = async () => {
      if (!user) {
        setCartCount(0);
        return;
      }

      const { data, error } = await supabase
        .from('cart_items')
        .select('quantity')
        .eq('user_id', user.id);

      if (!error && data) {
        const total = data.reduce((sum, item) => sum + item.quantity, 0);
        setCartCount(total);
      }
    };

    // Also defer cart count to idle time
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => fetchCartCount());
    } else {
      setTimeout(fetchCartCount, 100);
    }

    // Set up real-time subscription for cart updates
    if (user) {
      const subscription = supabase
        .channel('cart_changes')
        .on('postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'cart_items',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            fetchCartCount();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user]);

  useEffect(() => {
    if (externalIsScrolled !== undefined) {
      setIsScrolled(prev => prev === externalIsScrolled ? prev : externalIsScrolled);
    } else {
      const handleScroll = () => {
        if (location.pathname === '/') {
          const shouldScroll = window.scrollY > 100;
          setIsScrolled(prev => prev === shouldScroll ? prev : shouldScroll);
        }
      };
      // passive: true ensures scroll events never block the main thread
      window.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll();
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [externalIsScrolled, location.pathname]);

  const toggleMenu = useCallback(() => setMenuActive(prev => !prev), []);

  return (
    <>
      {/* Header */}
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ease-in-out ${isScrolled
          ? 'py-2 px-4 top-4 w-auto left-1/2 -translate-x-1/2 rounded-full bg-[#0071e3] shadow-lg hover:scale-105 cursor-pointer'
          : 'py-4 px-5 bg-black/80 backdrop-blur-md border-b border-white/10 w-full'
          }`}
        onClick={() => isScrolled ? navigate('/store') : null}
      >
        <div className={`max-w-7xl mx-auto flex items-center justify-between ${isScrolled ? 'gap-2' : ''}`}>

          {/* Logo - Always visible on left */}
          <div
            role="button"
            aria-label="Navigate to Home"
            className={`flex items-center gap-2 cursor-pointer transition-all duration-300 ${isScrolled ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}
            onClick={(e) => { e.stopPropagation(); navigate('/'); }}
          >
            <img
              src="https://instant.pxcode.io/api/pages/4c054573-e508-43d9-83fe-51efb0632ead/images/05967a3b42804ffdca1a72f53c85b08ce07b4c2c.png"
              alt="Astra Logo"
              className="w-8 h-8 hover:scale-110 transition-transform"
              width="32"
              height="32"
            />
            <span className="text-sm font-bold tracking-[2px] text-white">ASTRA</span>
          </div>

          {/* Scrolled State Content */}
          {location.pathname === '/' && (
            <div className={`flex items-center gap-2 ${isScrolled ? 'opacity-100 visible' : 'opacity-0 invisible absolute'}`}>
              <span className="text-white font-bold text-sm whitespace-nowrap px-2">Shop Now</span>
              <div className="bg-white rounded-full p-1">
                <Play size={10} fill="black" className="text-black" />
              </div>
            </div>
          )}

          {/* Right Side Actions */}
          <div className={`flex items-center gap-4 transition-all duration-300 ${isScrolled ? 'w-0 opacity-0 overflow-hidden' : 'w-auto opacity-100'}`}>
            {/* Search Icon hidden - only shown on StorePage header */}

            {isSignedIn ? (
              <UserButton afterSignOutUrl="/" />
            ) : (
              <button
                aria-label="Sign In"
                className="text-white text-sm font-medium hover:opacity-70 transition-opacity"
                onClick={(e) => { e.stopPropagation(); navigate('/signin'); }}
              >
                Sign In
              </button>
            )}

            {/* Hamburger Menu - Two lines */}
            <button 
              aria-label={menuActive ? "Close Menu" : "Open Menu"} 
              aria-expanded={menuActive} 
              className="cursor-pointer hover:opacity-70 transition-opacity flex flex-col gap-1.5 p-2" 
              onClick={(e) => { e.stopPropagation(); toggleMenu(); }}
            >
              <span className="block w-5 h-0.5 bg-white transition-transform duration-300"></span>
              <span className="block w-5 h-0.5 bg-white transition-transform duration-300"></span>
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar Menu Overlay */}
      <div className={`fixed inset-0 z-[10000] flex justify-end transition-visibility duration-500 ${menuActive ? 'visible' : 'invisible'}`}>
        {/* Backdrop */}
        <div className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-500 ${menuActive ? 'opacity-100' : 'opacity-0'}`} onClick={toggleMenu}></div>

        {/* Sidebar Content */}
        <aside aria-hidden={!menuActive} className={`relative w-[85vw] max-w-[320px] h-full bg-black flex flex-col px-6 py-6 transition-transform duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] ${menuActive ? 'translate-x-0' : 'translate-x-full'} z-20 overflow-y-auto no-scrollbar border-l border-white/20`}>

          {/* Menu Header */}
          <div className="flex justify-between items-center mb-8">
            <button
              onClick={toggleMenu}
              aria-label="Close Sidebar"
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X size={24} className="text-white" />
            </button>
            <img src="https://instant.pxcode.io/api/pages/4c054573-e508-43d9-83fe-51efb0632ead/images/05967a3b42804ffdca1a72f53c85b08ce07b4c2c.png" alt="Astra Logo" className="w-10 h-8 object-contain" width="40" height="32" loading="lazy" />
          </div>

          {/* Nav Links */}
          <nav aria-label="Main Navigation" className="flex flex-col gap-6 mb-10 pl-2">
            <div role="button" aria-label="Go to Home" className="flex items-center justify-between pr-2 cursor-pointer group" onClick={() => { navigate('/'); toggleMenu(); }}>
              <span className="font-bold text-2xl tracking-tight text-white group-hover:text-[#096bff] transition-colors uppercase">HOME</span>
              <div className="w-8 flex justify-center opacity-50 group-hover:opacity-100 transition-opacity">
                <img src="https://instant.pxcode.io/api/pages/4c054573-e508-43d9-83fe-51efb0632ead/images/107_11.svg" alt="Home" className="w-5 h-5" width="20" height="20" loading="lazy" />
              </div>
            </div>
            <div className="flex items-center justify-between pr-2 cursor-pointer group" onClick={() => { navigate('/store'); toggleMenu(); }}>
              <span className="font-bold text-2xl tracking-tight text-white group-hover:text-[#1b72e4] transition-colors uppercase">STORE</span>
              <div className="w-8 flex justify-center opacity-50 group-hover:opacity-100 transition-opacity">
                <img src="https://instant.pxcode.io/api/pages/4c054573-e508-43d9-83fe-51efb0632ead/images/107_15.svg" alt="Store" className="w-5 h-5" width="20" height="20" loading="lazy" />
              </div>
            </div>
            {isSignedIn && (
              <div className="flex items-center justify-between pr-2 cursor-pointer group" onClick={() => { navigate('/cart'); toggleMenu(); }}>
                <span className="font-bold text-2xl tracking-tight text-white group-hover:text-[#3b82f6] transition-colors uppercase">CART</span>
                <div className="w-8 flex justify-center opacity-50 group-hover:opacity-100 transition-opacity relative">
                  <ShoppingBag size={20} className="text-[#3b82f6]" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold text-[10px]">
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </div>
              </div>
            )}
            {isSignedIn && (
              <div className="flex items-center justify-between pr-2 cursor-pointer group" onClick={() => { navigate('/profile'); toggleMenu(); }}>
                <span className="font-bold text-2xl tracking-tight text-white group-hover:text-[#4ade80] transition-colors uppercase">PROFILE</span>
                <div className="w-8 flex justify-center opacity-50 group-hover:opacity-100 transition-opacity">
                  <User size={20} className="text-white" />
                </div>
              </div>
            )}
          </nav>

          {categories.length > 0 && (
            <div className="flex flex-col mb-10">
              {/* Category Section Header with Original Splash Asset */}
              <div className="flex justify-start mb-8 pl-1">
                <div className="relative w-32 h-10 flex items-center justify-center group">
                  <img
                    src="https://instant.pxcode.io/api/pages/4c054573-e508-43d9-83fe-51efb0632ead/images/107_60.svg"
                    className="absolute inset-0 w-full h-full opacity-80 group-hover:scale-110 transition-transform duration-500 group-hover:rotate-3"
                    alt="Splash Decoration"
                    loading="lazy"
                    width="128"
                    height="40"
                  />
                  <span className="relative z-10 text-white font-black text-[11px] tracking-[0.3em] uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                    COLLECTIONS
                  </span>
                </div>
              </div>

              {/* Dynamic Category List with Premium Composition */}
              <div className="flex flex-col gap-3 pl-1">
                {categories.map((cat, index) => (
                  <button
                    key={cat}
                    onClick={() => {
                      navigate(`/store/category/${cat.trim()}`);
                      setMenuActive(false);
                    }}
                    className="flex items-center group py-2.5 px-3 rounded-2xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all duration-500 text-left relative overflow-hidden"
                  >
                    {/* Original Asset for Bullet/New */}
                    <div className="relative mr-4 flex-shrink-0">
                      <div className="absolute inset-0 bg-yellow-400/20 blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <img
                        src="https://instant.pxcode.io/api/pages/4c054573-e508-43d9-83fe-51efb0632ead/images/107_42.svg"
                        className={`w-7 h-7 relative z-10 transition-all duration-500 ${index < 2 ? 'grayscale-0' : 'grayscale group-hover:grayscale-0'} group-hover:rotate-12 group-hover:scale-110`}
                        alt="Category Icon"
                      />
                      {index < 2 && (
                        <span className="absolute -top-1 -right-1 flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                        </span>
                      )}
                    </div>

                    {/* Name & Subtext Styling */}
                    <div className="flex flex-col">
                      <span className="font-bold text-lg tracking-tight text-white/70 group-hover:text-white transition-colors capitalize">
                        {cat}
                      </span>
                      <span className="text-[9px] font-medium text-gray-500 group-hover:text-yellow-400/80 transition-colors tracking-widest uppercase">
                        Explore Series
                      </span>
                    </div>

                    {/* Decorative Arrow that appears on hover */}
                    <div className="ml-auto opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">
                      <img src="https://instant.pxcode.io/api/pages/4c054573-e508-43d9-83fe-51efb0632ead/images/107_15.svg" alt="Go" className="w-4 h-4 invert opacity-50" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex flex-col gap-3 mt-auto">
            <div className="h-px bg-white/10 w-full mb-2"></div>
            <div className="font-medium text-[11px] text-gray-500 cursor-pointer hover:text-white transition-colors tracking-widest uppercase pl-4">HELP & LEGAL</div>
            <div className="flex flex-col gap-4 pl-4 mt-2">
              <div className="font-bold text-sm text-gray-400 cursor-pointer hover:text-white transition-colors" onClick={() => { navigate('/contact'); toggleMenu(); }}>CONTACT US</div>
              <div className="flex items-center justify-between pr-2 cursor-pointer group" onClick={() => { navigate('/refund-policy'); toggleMenu(); }}>
                <span className="font-bold text-sm text-gray-400 group-hover:text-white transition-colors">REFUND POLICY</span>
                <img src="https://instant.pxcode.io/api/pages/4c054573-e508-43d9-83fe-51efb0632ead/images/107_25.svg" className="w-6 h-6 opacity-40 group-hover:opacity-100 transition-opacity" alt="Refund" width="24" height="24" loading="lazy" />
              </div>
            </div>
          </div>

        </aside>
      </div>
    </>
  );
}
);
