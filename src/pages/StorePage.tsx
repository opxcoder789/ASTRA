import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Heart, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Loader from '../components/Loader';

export default function StorePage() {
  const navigate = useNavigate();
  const params = useParams();
  const activeCategory = params.category || 'all';

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(activeCategory);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*');

      if (error) {
        console.error('Error fetching products:', error);
      } else {
        const productsWithData = data?.map(p => ({
          ...p,
          reviews: p.reviews || [],
          inStock: p.in_stock,
          discount: p.discount || 0,
          discountedPrice: p.discount ? p.price * (1 - p.discount / 100) : p.price,
        })) || [];
        setProducts(productsWithData);
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

  const uniqueCategories = Array.from(
    new Set(products.map((p: any) => p.category as string)),
  ).sort();

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(p => p.category === selectedCategory);

  const formatPrice = (price: number) => {
    return `₹ ${Math.round(price).toLocaleString('en-IN')}`;
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="w-full h-screen bg-black text-white overflow-hidden flex flex-col">
      {/* Header */}
      <div className="w-full shrink-0 bg-black">
        {/* Title */}
        <div className="px-6 md:px-10 pt-6 md:pt-8 pb-2 md:pb-3">
          <h1 className="text-2xl md:text-3xl font-bold tracking-wide">ASTRA SNEAKERS</h1>
        </div>

        {/* Category Filter */}
        <div className="px-6 md:px-10 pb-4 flex gap-2 md:gap-3 overflow-x-auto whitespace-nowrap border-b border-white/10 scroll-smooth">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 md:px-5 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-bold transition-all shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-white text-black'
                : 'bg-[#1c1c1e] text-gray-300 border border-white/10 hover:bg-[#2c2c2e]'
            }`}
          >
            All
          </button>
          {uniqueCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 md:px-5 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-semibold transition-all shrink-0 ${
                selectedCategory === cat
                  ? 'bg-white text-black'
                  : 'bg-[#1c1c1e] text-gray-300 border border-white/10 hover:bg-[#2c2c2e]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="flex-1 overflow-y-auto px-6 md:px-10 pt-4 md:pt-6 pb-40">
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 lg:gap-5 max-w-7xl mx-auto">
            {filteredProducts.map(product => (
              <div
                key={product.id}
                className="card-hover aspect-[3/4] rounded-2xl relative overflow-hidden bg-[#1c1c1e] border border-white/5 group"
                onClick={() => navigate(`/product/${product.id}`)}
              >
                {/* Image */}
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* Discount Badge */}
                {product.discount > 0 && (
                  <div className="absolute top-3 left-3 bg-red-600 text-white px-2.5 py-1 rounded-lg text-xs md:text-sm font-bold">
                    -{product.discount}%
                  </div>
                )}

                {/* Gradient Overlay */}
                <div className="absolute bottom-0 w-full h-[60%] bg-gradient-to-t from-black via-black/80 to-transparent"></div>

                {/* Product Info */}
                <div className="absolute bottom-4 left-4 text-white pr-12">
                  <div className="text-[13px] md:text-[15px] font-medium leading-tight text-balance line-clamp-2">
                    {product.name}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    {product.discount > 0 ? (
                      <>
                        <div className="text-[13px] md:text-[15px] font-bold text-green-400">
                          {formatPrice(product.discountedPrice)}
                        </div>
                        <div className="text-[11px] md:text-[13px] text-gray-400 line-through">
                          {formatPrice(product.price)}
                        </div>
                      </>
                    ) : (
                      <div className="text-[13px] md:text-[15px] font-bold text-gray-300">
                        {formatPrice(product.price)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Favorite Button */}
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="absolute top-3 right-3 w-8 md:w-9 h-8 md:h-9 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center interactive hover:bg-black/60 transition-colors"
                >
                  <Heart size={14} className="text-white" />
                </button>

                {/* Add to Cart Button */}
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="absolute bottom-4 right-4 w-8 md:w-9 h-8 md:h-9 rounded-full bg-white flex items-center justify-center interactive hover:bg-gray-200 transition-colors"
                >
                  <Plus size={16} className="text-black" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400">No products found</p>
          </div>
        )}
      </div>

      {/* Floating Search Button */}
      <button
        onClick={() => navigate('/store/search')}
        className="fixed right-6 md:right-10 bottom-32 md:bottom-36 w-12 md:w-14 h-12 md:h-14 bg-[#2c2c2e] rounded-full border border-white/10 flex items-center justify-center z-40 shadow-lg interactive text-white hover:bg-[#3c3c3e]"
        aria-label="Search products"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      </button>
    </div>
  );
}
