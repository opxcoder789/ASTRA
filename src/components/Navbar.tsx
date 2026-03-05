import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Play, Search, User, ShoppingBag, X } from 'lucide-react';
import { useUser, UserButton } from '@clerk/clerk-react';
import { supabase } from '../lib/supabase';

interface NavbarProps {
  isScrolled?: boolean;
  onSearchClick?: () => void;
}

export default function Navbar({ isScrolled: externalIsScrolled, onSearchClick }: NavbarProps) {
  const [menuActive, setMenuActive] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const { isSignedIn, user } = useUser();

  useEffect(() => {
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
    loadCategories();
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

    fetchCartCount();
    
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
      setIsScrolled(externalIsScrolled);
    } else {
      const handleScroll = () => {
        // Only use compact navbar on the landing page
        if (location.pathname === '/') {
          setIsScrolled(window.scrollY > 100);
        } else {
          setIsScrolled(false);
        }
      };
      window.addEventListener('scroll', handleScroll);
      handleScroll(); // Check initial state
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [externalIsScrolled, location.pathname]);

  const toggleMenu = () => setMenuActive(!menuActive);

  return (
    <>
      {/* Header */}
      <header 
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ease-in-out ${
          isScrolled 
            ? 'py-2 px-4 top-4 w-auto left-1/2 -translate-x-1/2 rounded-full bg-[#0071e3] shadow-lg hover:scale-105 cursor-pointer' 
            : 'py-4 px-5 bg-black/80 backdrop-blur-md border-b border-white/10 w-full'
        }`}
        onClick={() => isScrolled ? navigate('/store') : null}
      >
        <div className={`max-w-7xl mx-auto flex items-center justify-between ${isScrolled ? 'gap-2' : ''}`}>
          
          {/* Logo - Always visible on left */}
          <div 
            className={`flex items-center gap-2 cursor-pointer transition-all duration-300 ${isScrolled ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`} 
            onClick={(e) => { e.stopPropagation(); navigate('/'); }}
          >
            <img 
              src="https://instant.pxcode.io/api/pages/4c054573-e508-43d9-83fe-51efb0632ead/images/05967a3b42804ffdca1a72f53c85b08ce07b4c2c.png" 
              alt="Astra Logo" 
              className="w-8 h-8 hover:scale-110 transition-transform" 
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
            {onSearchClick && (
              <button className="hover:opacity-70 transition-opacity" onClick={(e) => { e.stopPropagation(); onSearchClick(); }}>
                <Search size={20} className="text-white" />
              </button>
            )}
            
            {isSignedIn ? (
              <UserButton afterSignOutUrl="/" />
            ) : (
              <button 
                className="text-white text-sm font-medium hover:opacity-70 transition-opacity" 
                onClick={(e) => { e.stopPropagation(); navigate('/signin'); }}
              >
                Sign In
              </button>
            )}
            
            <button className="cursor-pointer hover:scale-110 transition-transform" onClick={(e) => { e.stopPropagation(); toggleMenu(); }}>
               <img src="https://instant.pxcode.io/api/pages/4c054573-e508-43d9-83fe-51efb0632ead/images/106_388.svg" alt="Menu" className="w-[24px] h-[32px] md:w-[30px] md:h-[40px]" />
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar Menu Overlay */}
      <div className={`fixed inset-0 z-[10000] flex justify-end transition-visibility duration-500 ${menuActive ? 'visible' : 'invisible'}`}>
        {/* Backdrop */}
        <div className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-500 ${menuActive ? 'opacity-100' : 'opacity-0'}`} onClick={toggleMenu}></div>
        
        {/* Sidebar Content */}
        <aside className={`relative w-[85vw] max-w-[320px] h-full bg-black flex flex-col px-6 py-6 transition-transform duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] ${menuActive ? 'translate-x-0' : 'translate-x-full'} z-20 overflow-y-auto no-scrollbar border-l border-white/20`}>
          
          {/* Menu Header */}
          <div className="flex justify-between items-center mb-8">
            <button 
              onClick={toggleMenu}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X size={24} className="text-white" />
            </button>
            <img src="https://instant.pxcode.io/api/pages/4c054573-e508-43d9-83fe-51efb0632ead/images/05967a3b42804ffdca1a72f53c85b08ce07b4c2c.png" alt="Astra Logo" className="w-10 h-8 object-contain" />
          </div>

          {/* Nav Links */}
          <nav className="flex flex-col gap-6 mb-10 pl-2">
            <div className="flex items-center justify-between pr-2 cursor-pointer group" onClick={() => { navigate('/'); toggleMenu(); }}>
              <span className="font-bold text-2xl tracking-tight text-white group-hover:text-[#096bff] transition-colors">HOME</span>
              <div className="w-8 flex justify-center opacity-50 group-hover:opacity-100 transition-opacity">
                 <img src="https://instant.pxcode.io/api/pages/4c054573-e508-43d9-83fe-51efb0632ead/images/107_11.svg" alt="Home" className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-center justify-between pr-2 cursor-pointer group" onClick={() => { navigate('/store'); toggleMenu(); }}>
              <span className="font-bold text-2xl tracking-tight text-white group-hover:text-[#1b72e4] transition-colors">STORE</span>
              <div className="w-8 flex justify-center opacity-50 group-hover:opacity-100 transition-opacity">
                 <img src="https://instant.pxcode.io/api/pages/4c054573-e508-43d9-83fe-51efb0632ead/images/107_15.svg" alt="Store" className="w-5 h-5" />
              </div>
            </div>
            {isSignedIn && (
              <div className="flex items-center justify-between pr-2 cursor-pointer group" onClick={() => { navigate('/cart'); toggleMenu(); }}>
                <span className="font-bold text-2xl tracking-tight text-white group-hover:text-[#3b82f6] transition-colors">CART</span>
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
                <span className="font-bold text-2xl tracking-tight text-white group-hover:text-[#4ade80] transition-colors">PROFILE</span>
                <div className="w-8 flex justify-center opacity-50 group-hover:opacity-100 transition-opacity">
                  <User size={20} className="text-white" />
                </div>
              </div>
            )}
          </nav>

          {categories.length > 0 && (
            <>
              {/* Category Section */}
              <div className="flex justify-start mb-6 pl-2">
                <div className="relative w-24 h-8 flex items-center justify-center">
                  <img
                    src="https://instant.pxcode.io/api/pages/4c054573-e508-43d9-83fe-51efb0632ead/images/107_60.svg"
                    className="absolute inset-0 w-full h-full opacity-60"
                    alt="Splash"
                  />
                  <span className="relative z-10 text-yellow-400 font-bold text-xs tracking-widest">
                    CATEGORY
                  </span>
                </div>
              </div>

              {/* Dynamic Category List */}
              <div className="flex gap-4 mb-auto pl-2">
                <div className="pt-1">
                  <img
                    src="https://instant.pxcode.io/api/pages/4c054573-e508-43d9-83fe-51efb0632ead/images/107_42.svg"
                    className="w-8 opacity-70"
                    alt="New"
                  />
                </div>
                <div className="flex flex-col gap-3">
                  {categories.map((cat, index) => (
                    <div
                      key={cat}
                      className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => {
                        navigate(`/store/category/${encodeURIComponent(cat)}`);
                        toggleMenu();
                      }}
                    >
                      <div className="bg-white text-black w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center">
                        {index + 1}
                      </div>
                      <span className="font-medium text-sm text-yellow-300 hover:text-yellow-200 transition-colors capitalize">
                        {cat}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Footer */}
          <div className="flex flex-col gap-3 mt-10">
             <div className="h-px bg-white/10 w-full mb-2"></div>
             <div className="font-medium text-sm text-gray-400 cursor-pointer hover:text-white transition-colors">CONTACT US</div>
             <div className="flex items-center justify-between pr-2">
                <span className="font-medium text-sm text-gray-400 cursor-pointer hover:text-white transition-colors">REFUND POLICY</span>
                <img src="https://instant.pxcode.io/api/pages/4c054573-e508-43d9-83fe-51efb0632ead/images/107_25.svg" className="w-8 h-8 opacity-50 hover:opacity-100 transition-opacity" alt="Refund" />
             </div>
          </div>

        </aside>
      </div>
    </>
  );
}
