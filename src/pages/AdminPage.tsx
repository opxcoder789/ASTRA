import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Trash2, Edit, Plus, X, Check, Image as ImageIcon, ArrowUp, ArrowDown } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  in_stock: boolean;
  background_type: 'dark' | 'light';
  description?: string;
}

interface HeroSlide {
  id?: number;
  bg_url: string;
  bg_type: 'video' | 'image';
  title: string;
  subtitle: string;
  btn1_text: string;
  btn1_link: string;
  btn2_text: string;
  btn2_link: string;
  sort_order: number;
}

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'astra' | 'cartoon' | 'landing'>('all');
  const [landingContent, setLandingContent] = useState<any>(null);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [isSlideModalOpen, setIsSlideModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    price: 0,
    image: '',
    category: 'astra',
    in_stock: true,
    background_type: 'dark',
    description: ''
  });

  const [slideFormData, setSlideFormData] = useState<HeroSlide>({
    bg_url: '',
    bg_type: 'image',
    title: '',
    subtitle: '',
    btn1_text: 'Shop Now',
    btn1_link: '/store',
    btn2_text: 'Learn More',
    btn2_link: '/about',
    sort_order: 0
  });

  useEffect(() => {
    fetchProducts();
    fetchLandingContent();
    fetchHeroSlides();
  }, []);

  const fetchHeroSlides = async () => {
    const { data, error } = await supabase
      .from('hero_slides')
      .select('*')
      .order('sort_order', { ascending: true });
    
    if (data) {
      setHeroSlides(data);
    } else if (error) {
      console.error('Error fetching hero slides:', error);
    }
  };

  const fetchLandingContent = async () => {
    const { data, error } = await supabase
      .from('landing_page_content')
      .select('*')
      .single();
    
    if (data) {
      setLandingContent(data);
    } else if (error && error.code !== 'PGRST116') {
      console.error('Error fetching landing content:', error);
    } else {
      setLandingContent({
        id: 1,
        feature_btn_text: 'Buy Now',
        promo_btn1_text: 'Shop',
        promo_btn1_link: '/store',
        promo_btn2_text: 'Buy',
        promo_btn2_link: '/store'
      });
    }
  };

  const handleLandingUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase
      .from('landing_page_content')
      .upsert(landingContent);
    
    if (error) {
      alert('Error updating landing page: ' + error.message);
    } else {
      alert('Landing page updated successfully!');
    }
  };

  const handleSlideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingSlide?.id) {
      const { error } = await supabase
        .from('hero_slides')
        .update(slideFormData)
        .eq('id', editingSlide.id);
      
      if (error) alert('Error updating slide: ' + error.message);
      else {
        fetchHeroSlides();
        closeSlideModal();
      }
    } else {
      const { error } = await supabase
        .from('hero_slides')
        .insert([{ ...slideFormData, sort_order: heroSlides.length }]);
      
      if (error) alert('Error creating slide: ' + error.message);
      else {
        fetchHeroSlides();
        closeSlideModal();
      }
    }
  };

  const deleteSlide = async (id: number) => {
    if (confirm('Delete this slide?')) {
      const { error } = await supabase.from('hero_slides').delete().eq('id', id);
      if (error) alert('Error: ' + error.message);
      else fetchHeroSlides();
    }
  };

  const openSlideModal = (slide?: HeroSlide) => {
    if (slide) {
      setEditingSlide(slide);
      setSlideFormData(slide);
    } else {
      setEditingSlide(null);
      setSlideFormData({
        bg_url: '',
        bg_type: 'image',
        title: '',
        subtitle: '',
        btn1_text: 'Shop Now',
        btn1_link: '/store',
        btn2_text: 'Learn More',
        btn2_link: '/about',
        sort_order: heroSlides.length
      });
    }
    setIsSlideModalOpen(true);
  };

  const closeSlideModal = () => {
    setIsSlideModalOpen(false);
    setEditingSlide(null);
  };

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.error('Error fetching products:', error);
      // alert('Error fetching products');
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
               name === 'price' ? parseFloat(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingProduct) {
      // Update
      const { error } = await supabase
        .from('products')
        .update(formData)
        .eq('id', editingProduct.id);

      if (error) {
        alert('Error updating product: ' + error.message);
      } else {
        fetchProducts();
        closeModal();
      }
    } else {
      // Create
      const { error } = await supabase
        .from('products')
        .insert([formData]);

      if (error) {
        alert('Error creating product: ' + error.message);
      } else {
        fetchProducts();
        closeModal();
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this product?')) {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        alert('Error deleting product: ' + error.message);
      } else {
        fetchProducts();
      }
    }
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData(product);
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      price: 0,
      image: '',
      category: 'astra',
      in_stock: true,
      background_type: 'dark',
      description: ''
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const filteredProducts = activeTab === 'all' 
    ? products 
    : products.filter(p => p.category === activeTab);

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Store Admin</h1>
          <button 
            onClick={openCreateModal}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} /> Add Product
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-200 pb-1">
          {['all', 'astra', 'cartoon', 'landing'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 font-medium capitalize ${
                activeTab === tab 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'landing' ? 'Landing Page' : `${tab} Products`}
            </button>
          ))}
        </div>

        {/* Product List */}
        {activeTab === 'landing' ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold mb-6">Landing Page Configuration</h2>
            
            {/* Hero Slides Management */}
            <div className="border-b border-gray-100 pb-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Hero Slides</h3>
                <button 
                  onClick={() => openSlideModal()}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1 hover:bg-blue-700"
                >
                  <Plus size={16} /> Add Slide
                </button>
              </div>
              
              <div className="space-y-3">
                {heroSlides.map((slide, index) => (
                  <div key={slide.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-gray-400 w-6">{index + 1}</span>
                      {slide.bg_type === 'image' ? (
                        <img src={slide.bg_url} alt="slide" className="w-12 h-8 object-cover rounded" />
                      ) : (
                        <div className="w-12 h-8 bg-gray-800 rounded flex items-center justify-center text-white text-xs">Video</div>
                      )}
                      <div>
                        <p className="font-medium text-sm">{slide.title || 'No Title'}</p>
                        <p className="text-xs text-gray-500 truncate max-w-[200px]">{slide.bg_url}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => openSlideModal(slide)} className="p-1 hover:bg-gray-200 rounded text-gray-600">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => deleteSlide(slide.id!)} className="p-1 hover:bg-red-100 rounded text-red-600">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
                {heroSlides.length === 0 && (
                  <p className="text-gray-500 text-sm italic">No slides added yet.</p>
                )}
              </div>
            </div>

            <form onSubmit={handleLandingUpdate} className="space-y-6">
              
              {/* Feature Carousel Button */}
              <div className="border-b border-gray-100 pb-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Featured Carousel</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Carousel Button Text</label>
                  <input 
                    type="text" 
                    value={landingContent?.feature_btn_text || ''}
                    onChange={(e) => setLandingContent({...landingContent, feature_btn_text: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Buy Now"
                  />
                </div>
              </div>

              {/* Feature Cards Images */}
              <div className="border-b border-gray-100 pb-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Feature Cards Images</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[1, 2, 3].map(num => (
                    <div key={num}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Card {num} Image</label>
                      <input 
                        type="text" 
                        value={landingContent?.[`feature_card${num}_img`] || ''}
                        onChange={(e) => setLandingContent({...landingContent, [`feature_card${num}_img`]: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="https://..."
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Promo Images & Buttons */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Promo Section</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Promo 1 */}
                  <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium">Promo Card 1</h4>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                      <input 
                        type="text" 
                        value={landingContent?.feature_bottom_img1 || ''}
                        onChange={(e) => setLandingContent({...landingContent, feature_bottom_img1: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
                      <input 
                        type="text" 
                        value={landingContent?.promo_btn1_text || ''}
                        onChange={(e) => setLandingContent({...landingContent, promo_btn1_text: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Button Link</label>
                      <input 
                        type="text" 
                        value={landingContent?.promo_btn1_link || ''}
                        onChange={(e) => setLandingContent({...landingContent, promo_btn1_link: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  {/* Promo 2 */}
                  <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium">Promo Card 2</h4>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                      <input 
                        type="text" 
                        value={landingContent?.feature_bottom_img2 || ''}
                        onChange={(e) => setLandingContent({...landingContent, feature_bottom_img2: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
                      <input 
                        type="text" 
                        value={landingContent?.promo_btn2_text || ''}
                        onChange={(e) => setLandingContent({...landingContent, promo_btn2_text: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Button Link</label>
                      <input 
                        type="text" 
                        value={landingContent?.promo_btn2_link || ''}
                        onChange={(e) => setLandingContent({...landingContent, promo_btn2_link: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit" 
                  className="bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 transition-colors w-full md:w-auto"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        ) : (
          loading ? (
            <div className="text-center py-10">Loading...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                  <div className="relative h-48 bg-gray-100">
                    <img 
                      src={product.image || 'https://via.placeholder.com/400'} 
                      alt={product.name} 
                      className="w-full h-full object-cover"
                    />
                    <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-bold ${product.in_stock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {product.in_stock ? 'In Stock' : 'Out of Stock'}
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">{product.name}</h3>
                        <p className="text-sm text-gray-500 capitalize">{product.category}</p>
                      </div>
                      <span className="font-mono font-bold text-lg">${product.price}</span>
                    </div>
                    
                    <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                      <button 
                        onClick={() => openEditModal(product)}
                        className="flex-1 bg-gray-100 text-gray-700 py-2 rounded hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                      >
                        <Edit size={16} /> Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(product.id)}
                        className="flex-1 bg-red-50 text-red-600 py-2 rounded hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                      >
                        <Trash2 size={16} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* Product Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                <h2 className="text-xl font-bold">{editingProduct ? 'Edit Product' : 'New Product'}</h2>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                  <input 
                    type="text" 
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                    <input 
                      type="number" 
                      name="price"
                      required
                      step="0.01"
                      value={formData.price}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select 
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="astra">Astra</option>
                      <option value="cartoon">Cartoon</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                  <div className="flex gap-2">
                    <input 
                      type="url" 
                      name="image"
                      required
                      value={formData.image}
                      onChange={handleInputChange}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="https://..."
                    />
                    <div className="w-10 h-10 bg-gray-100 rounded border border-gray-200 flex items-center justify-center overflow-hidden">
                      {formData.image ? (
                        <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon size={16} className="text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Background Type</label>
                    <select 
                      name="background_type"
                      value={formData.background_type}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="dark">Dark</option>
                      <option value="light">Light</option>
                    </select>
                  </div>
                  <div className="flex items-center pt-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        name="in_stock"
                        checked={formData.in_stock}
                        onChange={handleInputChange}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">In Stock</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                  <textarea 
                    name="description"
                    rows={3}
                    value={formData.description || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button" 
                    onClick={closeModal}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 px-4 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingProduct ? 'Save Changes' : 'Create Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Slide Modal */}
        {isSlideModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                <h2 className="text-xl font-bold">{editingSlide ? 'Edit Slide' : 'New Slide'}</h2>
                <button onClick={closeSlideModal} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleSlideSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Background URL</label>
                  <input 
                    type="text" 
                    value={slideFormData.bg_url}
                    onChange={(e) => setSlideFormData({...slideFormData, bg_url: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="https://..."
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Background Type</label>
                  <select 
                    value={slideFormData.bg_type}
                    onChange={(e) => setSlideFormData({...slideFormData, bg_type: e.target.value as 'video' | 'image'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input 
                    type="text" 
                    value={slideFormData.title || ''}
                    onChange={(e) => setSlideFormData({...slideFormData, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                  <input 
                    type="text" 
                    value={slideFormData.subtitle || ''}
                    onChange={(e) => setSlideFormData({...slideFormData, subtitle: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Button 1 Text</label>
                    <input 
                      type="text" 
                      value={slideFormData.btn1_text || ''}
                      onChange={(e) => setSlideFormData({...slideFormData, btn1_text: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Button 1 Link</label>
                    <input 
                      type="text" 
                      value={slideFormData.btn1_link || ''}
                      onChange={(e) => setSlideFormData({...slideFormData, btn1_link: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Button 2 Text</label>
                    <input 
                      type="text" 
                      value={slideFormData.btn2_text || ''}
                      onChange={(e) => setSlideFormData({...slideFormData, btn2_text: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Button 2 Link</label>
                    <input 
                      type="text" 
                      value={slideFormData.btn2_link || ''}
                      onChange={(e) => setSlideFormData({...slideFormData, btn2_link: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button" 
                    onClick={closeSlideModal}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 px-4 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingSlide ? 'Save Changes' : 'Create Slide'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
