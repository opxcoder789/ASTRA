import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Play, ShoppingBag, Search } from 'lucide-react';

interface NavbarProps {
  isScrolled?: boolean;
  onCartClick?: () => void;
  onSearchClick?: () => void;
  cartCount?: number;
}

export default function Navbar({ isScrolled: externalIsScrolled, onCartClick, onSearchClick, cartCount = 0 }: NavbarProps) {
  const [menuActive, setMenuActive] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    if (externalIsScrolled !== undefined) {
      setIsScrolled(externalIsScrolled);
    } else {
      const handleScroll = () => {
        if (location.pathname === '/store') {
          setIsScrolled(false);
        } else {
          setIsScrolled(window.scrollY > 100);
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
            : 'py-4 px-5 bg-transparent backdrop-blur-none w-full'
        }`}
        onClick={() => isScrolled ? navigate('/store') : null}
      >
        <div className={`max-w-7xl mx-auto flex items-center justify-between ${isScrolled ? 'gap-2' : ''}`}>
          
          {/* Logo - Hidden when scrolled */}
          <div 
            className={`flex flex-col items-center cursor-pointer transition-all duration-300 ${isScrolled ? 'w-0 opacity-0 overflow-hidden' : 'w-auto opacity-100'}`} 
            onClick={(e) => { e.stopPropagation(); navigate('/'); }}
          >
            <img src="https://instant.pxcode.io/api/pages/4c054573-e508-43d9-83fe-51efb0632ead/images/05967a3b42804ffdca1a72f53c85b08ce07b4c2c.png" alt="Astra Logo" className="w-8 md:w-9 hover:scale-110 transition-transform" />
            <span className="text-[8px] md:text-[10px] tracking-[2px] font-bold mt-1 text-white">ASTRA</span>
          </div>

          {/* Scrolled State Content */}
          {location.pathname !== '/store' && (
            <div className={`flex items-center gap-2 ${isScrolled ? 'opacity-100 visible' : 'opacity-0 invisible absolute'}`}>
               <span className="text-white font-bold text-sm whitespace-nowrap px-2">Shop Now</span>
               <div className="bg-white rounded-full p-1">
                 <Play size={10} fill="black" className="text-black" />
               </div>
            </div>
          )}

          {/* Cart & Menu */}
          <div className={`flex items-center gap-6 transition-all duration-300 ${isScrolled ? 'w-0 opacity-0 overflow-hidden' : 'w-auto opacity-100'}`}>
            {onSearchClick && (
              <button className="hover:opacity-70 transition-opacity" onClick={(e) => { e.stopPropagation(); onSearchClick(); }}>
                <Search size={20} className="text-white" />
              </button>
            )}
            {onCartClick && (
              <button className="relative hover:opacity-70 transition-opacity" onClick={(e) => { e.stopPropagation(); onCartClick(); }}>
                <ShoppingBag size={20} className="text-white" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-white text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
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
        <div className={`absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-500 ${menuActive ? 'opacity-100' : 'opacity-0'}`} onClick={toggleMenu}></div>
        
        {/* Sidebar Content */}
        <aside className={`relative w-[85vw] max-w-[300px] h-full bg-black flex flex-col px-6 py-6 transition-transform duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] ${menuActive ? 'translate-x-0' : 'translate-x-full'} z-20 overflow-y-auto no-scrollbar border-l border-white/10`}>
          
          {/* Menu Header */}
          <div className="flex justify-between items-center mb-8">
            <img src="https://instant.pxcode.io/api/pages/4c054573-e508-43d9-83fe-51efb0632ead/images/106_388.svg" alt="Menu" className="w-6 h-8 cursor-pointer hover:opacity-80 transition-opacity" onClick={toggleMenu} />
            <img src="https://instant.pxcode.io/api/pages/4c054573-e508-43d9-83fe-51efb0632ead/images/05967a3b42804ffdca1a72f53c85b08ce07b4c2c.png" alt="Shoe" className="w-10 h-8 object-contain" />
          </div>

          {/* Nav Links */}
          <nav className="flex flex-col gap-6 mb-10 pl-2">
            <div className="flex items-center justify-between pr-2 cursor-pointer group" onClick={() => navigate('/')}>
              <span className="font-bold text-2xl tracking-tight text-white group-hover:text-[#096bff] transition-colors">HOME</span>
              <div className="w-8 flex justify-center opacity-50 group-hover:opacity-100 transition-opacity">
                 <img src="https://instant.pxcode.io/api/pages/4c054573-e508-43d9-83fe-51efb0632ead/images/107_11.svg" alt="Home" className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-center justify-between pr-2 cursor-pointer group" onClick={() => navigate('/store')}>
              <span className="font-bold text-2xl tracking-tight text-white group-hover:text-[#1b72e4] transition-colors">STORE</span>
              <div className="w-8 flex justify-center opacity-50 group-hover:opacity-100 transition-opacity">
                 <img src="https://instant.pxcode.io/api/pages/4c054573-e508-43d9-83fe-51efb0632ead/images/107_15.svg" alt="Store" className="w-5 h-5" />
              </div>
            </div>
          </nav>

          {/* Category Section */}
          <div className="flex justify-start mb-8 pl-2">
             <div className="relative w-24 h-8 flex items-center justify-center">
                <img src="https://instant.pxcode.io/api/pages/4c054573-e508-43d9-83fe-51efb0632ead/images/107_60.svg" className="absolute inset-0 w-full h-full opacity-50" alt="Splash" />
                <span className="relative z-10 text-[#0b1fff] font-bold text-xs tracking-widest">CATEGORY</span>
             </div>
          </div>

          {/* Product List */}
          <div className="flex gap-4 mb-auto pl-2">
             <div className="pt-1">
                <img src="https://instant.pxcode.io/api/pages/4c054573-e508-43d9-83fe-51efb0632ead/images/107_42.svg" className="w-8 opacity-70" alt="New" />
             </div>
             <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate('/store?category=astra')}>
                   <div className="bg-[#ff0000] text-white w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center">1</div>
                   <span className="font-medium text-sm text-gray-300 hover:text-white transition-colors">ASTRA DESIGN</span>
                </div>
                <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate('/store?category=cartoon')}>
                   <div className="bg-[#ff0000] text-white w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center">2</div>
                   <span className="font-medium text-sm text-gray-300 hover:text-white transition-colors">CARTOON DESIGN</span>
                </div>
             </div>
          </div>

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
