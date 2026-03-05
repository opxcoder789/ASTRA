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
  available_sizes?: string[];
  total_stock?: number;
  refund_policy?: string;
  shipping_policy?: string;
  pack_options?: any[];
  shoe_models?: string[];
  discount_percent?: number;
  additional_images?: string[];
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
  const [activeTab, setActiveTab] = useState<string>('all');
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
    description: '',
    available_sizes: [],
    total_stock: 0,
    refund_policy: '',
    shipping_policy: '',
    pack_options: [],
    shoe_models: [],
    discount_percent: 0
  });
  const [priceInINR, setPriceInINR] = useState(0);
  const [priceCurrency, setPriceCurrency] = useState<'usd' | 'inr'>('usd');
  const [sizeInput, setSizeInput] = useState('');
  const [shoeModelInput, setShoeModelInput] = useState('');
  const [packInput, setPackInput] = useState({ name: '', description: '' });
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [productImages, setProductImages] = useState<string[]>([]);

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
    
    if (name === 'price') {
      const numValue = parseFloat(value) || 0;
      if (priceCurrency === 'inr') {
        // Convert INR to USD for storage
        const USD_TO_INR = 83;
        setFormData(prev => ({ ...prev, price: numValue / USD_TO_INR }));
        setPriceInINR(numValue);
      } else {
        setFormData(prev => ({ ...prev, price: numValue }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
      }));
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    
    if (productImages.length === 0) {
      alert('Please add at least one product image');
      return;
    }
    
    // Remove fields that don't exist in the database yet
    const dataToSubmit: any = {
      name: formData.name,
      price: formData.price,
      image: productImages[0], // First image as main image
      category: formData.category,
      in_stock: formData.in_stock,
      background_type: formData.background_type,
      description: formData.description
    };

    // Add additional images if more than one
    if (productImages.length > 1) {
      dataToSubmit.additional_images = productImages.slice(1);
    }

    // Only add optional fields if they have values
    if (formData.available_sizes && formData.available_sizes.length > 0) {
      dataToSubmit.available_sizes = formData.available_sizes;
    }
    if (formData.total_stock) {
      dataToSubmit.total_stock = formData.total_stock;
    }
    if (formData.refund_policy) {
      dataToSubmit.refund_policy = formData.refund_policy;
    }
    if (formData.shipping_policy) {
      dataToSubmit.shipping_policy = formData.shipping_policy;
    }
    if (formData.pack_options && formData.pack_options.length > 0) {
      dataToSubmit.pack_options = formData.pack_options;
    }
    if (formData.shoe_models && formData.shoe_models.length > 0) {
      dataToSubmit.shoe_models = formData.shoe_models;
    }
    if (formData.discount_percent) {
      dataToSubmit.discount_percent = formData.discount_percent;
    }
    
    if (editingProduct) {
      // Update
      const { error } = await supabase
        .from('products')
        .update(dataToSubmit)
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
        .insert([dataToSubmit]);

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
    setPriceCurrency('usd');
    setPriceInINR(0);
    
    // Load existing images
    const images = [];
    if (product.image) images.push(product.image);
    if (product.additional_images) {
      images.push(...product.additional_images);
    }
    setProductImages(images);
    
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
      description: '',
      available_sizes: [],
      total_stock: 0,
      refund_policy: '',
      shipping_policy: '',
      pack_options: [],
      shoe_models: [],
      discount_percent: 0
    });
    setPriceCurrency('usd');
    setPriceInINR(0);
    setSizeInput('');
    setShoeModelInput('');
    setProductImages([]);
    setImageUrlInput('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setProductImages([]);
    setImageUrlInput('');
  };

  const addImageUrl = () => {
    if (imageUrlInput.trim() && productImages.length < 15) {
      setProductImages([...productImages, imageUrlInput.trim()]);
      setImageUrlInput('');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remainingSlots = 15 - productImages.length;
    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    filesToProcess.forEach(file => {
      if (file instanceof File) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setProductImages(prev => [...prev, event.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      }
    });

    // Reset the input
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setProductImages(productImages.filter((_, i) => i !== index));
  };

  const categoryTabs = Array.from(new Set(products.map((p) => p.category))).sort(
    (a: any, b: any) => String(a).localeCompare(String(b)),
  );

  const filteredProducts =
    activeTab === 'all'
      ? products
      : activeTab === 'landing'
      ? []
      : products.filter((p) => p.category === activeTab);

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Store Admin</h1>
            <div className="flex gap-4 mt-2">
              <a href="/admin" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                Products
              </a>
              <a href="/admin/orders" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                Orders
              </a>
            </div>
          </div>
          <button 
            onClick={openCreateModal}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} /> Add Product
          </button>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-4 mb-6 border-b border-gray-200 pb-1">
          {['all', ...categoryTabs, 'landing'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium capitalize ${
                activeTab === tab
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'landing'
                ? 'Landing Page'
                : tab === 'all'
                ? 'All Products'
                : `${tab} Products`}
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
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                <h2 className="text-xl font-bold">{editingProduct ? 'Edit Product' : 'New Product'}</h2>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Product Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                  <input 
                    type="text" 
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Enter product name"
                  />
                </div>

                {/* Price and Category Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                    <div className="flex gap-2">
                      <select
                        value={priceCurrency}
                        onChange={(e) => {
                          const newCurrency = e.target.value as 'usd' | 'inr';
                          setPriceCurrency(newCurrency);
                          if (newCurrency === 'inr') {
                            const USD_TO_INR = 83;
                            setPriceInINR(Math.round((formData.price || 0) * USD_TO_INR));
                          }
                        }}
                        className="px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="usd">USD</option>
                        <option value="inr">INR</option>
                      </select>
                      <input 
                        type="number" 
                        name="price"
                        required
                        step={priceCurrency === 'inr' ? '1' : '0.01'}
                        value={priceCurrency === 'inr' ? priceInINR : formData.price}
                        onChange={handleInputChange}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder={priceCurrency === 'inr' ? 'Enter price in INR' : 'Enter price in USD'}
                      />
                    </div>
                    {priceCurrency === 'inr' && (
                      <p className="text-xs text-gray-500 mt-1">
                        ≈ ${((priceInINR || 0) / 83).toFixed(2)} USD
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <input 
                      type="text"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="e.g. astra, cartoon, limited, kids"
                    />
                  </div>
                </div>

                {/* Images Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Images (Max 15)</label>
                  
                  {/* Image Upload Options */}
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* URL Input */}
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Add Image URL</label>
                        <div className="flex gap-2">
                          <input 
                            type="url" 
                            value={imageUrlInput}
                            onChange={(e) => setImageUrlInput(e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                            placeholder="https://example.com/image.jpg"
                          />
                          <button 
                            type="button"
                            onClick={addImageUrl}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                          >
                            Add URL
                          </button>
                        </div>
                      </div>
                      
                      {/* File Upload */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Upload Images</label>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Image Gallery */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {productImages.map((image, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                          <img 
                            src={image} 
                            alt={`Product ${index + 1}`} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIxIDlWN0MxOSA1IDE3IDUgMTUgN1Y5QzE1IDExIDE3IDExIDE5IDExSDIxVjlaTTIxIDlWN0MxOSA1IDE3IDUgMTUgN1Y5QzE1IDExIDE3IDExIDE5IDExSDIxVjlaIiBzdHJva2U9IiM5Q0E3QjciIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo=';
                            }}
                          />
                        </div>
                        {index === 0 && (
                          <div className="absolute top-1 left-1 bg-green-500 text-white text-xs px-2 py-1 rounded">
                            Main
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                    
                    {/* Add More Button */}
                    {productImages.length < 15 && (
                      <div className="aspect-square bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors">
                        <div className="text-center">
                          <Plus size={24} className="text-gray-400 mx-auto mb-1" />
                          <p className="text-xs text-gray-500">Add Image</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-2">
                    First image will be used as the main product image. You can add up to 15 images.
                  </p>
                </div>

                {/* Background Type and Stock */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Background Type</label>
                    <select 
                      name="background_type"
                      value={formData.background_type}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="dark">Dark</option>
                      <option value="light">Light</option>
                    </select>
                  </div>
                  <div className="flex items-center">
                    <label className="flex items-center gap-3 cursor-pointer">
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

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
                  <textarea 
                    name="description"
                    rows={4}
                    value={formData.description || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Enter product description..."
                  />
                </div>

                {/* Available Sizes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Available Sizes</label>
                  <div className="flex gap-2 mb-2">
                    <input 
                      type="text" 
                      value={sizeInput}
                      onChange={(e) => setSizeInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (sizeInput.trim()) {
                            setFormData(prev => ({
                              ...prev,
                              available_sizes: [...(prev.available_sizes || []), sizeInput.trim()]
                            }));
                            setSizeInput('');
                          }
                        }
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="e.g. 7, 8, 9, 10 (press Enter to add)"
                    />
                    <button 
                      type="button"
                      onClick={() => {
                        if (sizeInput.trim()) {
                          setFormData(prev => ({
                            ...prev,
                            available_sizes: [...(prev.available_sizes || []), sizeInput.trim()]
                          }));
                          setSizeInput('');
                        }
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(formData.available_sizes || []).map((size, idx) => (
                      <span 
                        key={idx}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2"
                      >
                        {size}
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              available_sizes: (prev.available_sizes || []).filter((_, i) => i !== idx)
                            }));
                          }}
                          className="hover:text-blue-900"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Shoe Models */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Shoe Models (Optional)</label>
                  <div className="flex gap-2 mb-2">
                    <input 
                      type="text" 
                      value={shoeModelInput}
                      onChange={(e) => setShoeModelInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (shoeModelInput.trim()) {
                            setFormData(prev => ({
                              ...prev,
                              shoe_models: [...(prev.shoe_models || []), shoeModelInput.trim()]
                            }));
                            setShoeModelInput('');
                          }
                        }
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="e.g. Air Force 1, Jordan 1 (press Enter to add)"
                    />
                    <button 
                      type="button"
                      onClick={() => {
                        if (shoeModelInput.trim()) {
                          setFormData(prev => ({
                            ...prev,
                            shoe_models: [...(prev.shoe_models || []), shoeModelInput.trim()]
                          }));
                          setShoeModelInput('');
                        }
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(formData.shoe_models || []).map((model, idx) => (
                      <span 
                        key={idx}
                        className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center gap-2"
                      >
                        {model}
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              shoe_models: (prev.shoe_models || []).filter((_, i) => i !== idx)
                            }));
                          }}
                          className="hover:text-green-900"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Total Stock */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Stock (Optional)</label>
                  <input 
                    type="number" 
                    name="total_stock"
                    value={formData.total_stock || 0}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                {/* Discount Percent */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount % (Optional)</label>
                  <input 
                    type="number" 
                    name="discount_percent"
                    min="0"
                    max="100"
                    value={formData.discount_percent || 0}
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
