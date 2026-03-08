import { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Package } from 'lucide-react';
import Loader from '../components/Loader';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  in_stock: boolean;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchProducts();
      // Focus input when modal opens
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      setSearchQuery('');
      setFilteredProducts([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredProducts([]);
    } else {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [searchQuery, products]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, image, category, in_stock')
        .eq('in_stock', true)
        .order('name');

      if (error) {
        console.error('Error fetching products:', error);
      } else {
        setProducts(data || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const slugify = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  const handleProductClick = (product: Product) => {
    navigate(`/store/category/${encodeURIComponent(product.category)}/${encodeURIComponent(slugify(product.name))}`);
    onClose();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-start justify-center pt-20"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-2xl mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input */}
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="flex items-center px-6 py-4 border-b border-gray-100">
                <Search size={20} className="text-gray-400 mr-3" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search for products..."
                  className="flex-1 text-lg text-gray-900 placeholder-gray-400 outline-none"
                />
                <button
                  onClick={onClose}
                  className="ml-3 p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} className="text-gray-400" />
                </button>
              </div>

              {/* Search Results */}
              <div className="max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader color="#000000" size="40px" />
                  </div>
                ) : searchQuery.trim() === '' ? (
                  <div className="py-12 text-center">
                    <Package size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">Start typing to search products...</p>
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="py-12 text-center">
                    <Package size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">No products found for "{searchQuery}"</p>
                  </div>
                ) : (
                  <div className="py-2">
                    {filteredProducts.map((product, index) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.2 }}
                        onClick={() => handleProductClick(product)}
                        className="flex items-center gap-4 px-6 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{product.name}</h3>
                          <p className="text-sm text-gray-500 capitalize">{product.category}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">${product.price}</p>
                          <p className="text-xs text-green-600">In Stock</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Links */}
              {searchQuery.trim() === '' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="border-t border-gray-100 px-6 py-4"
                >
                  <p className="text-sm font-medium text-gray-700 mb-3">Quick Links</p>
                  <div className="flex flex-wrap gap-2">
                    {['All Products', 'Astra', 'Limited Edition', 'New Arrivals'].map((link) => (
                      <button
                        key={link}
                        onClick={() => {
                          if (link === 'All Products') {
                            navigate('/store/category/all');
                          } else {
                            navigate(`/store/category/${encodeURIComponent(link.toLowerCase())}`);
                          }
                          onClose();
                        }}
                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
                      >
                        {link}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}