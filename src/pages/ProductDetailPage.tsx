import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Minus, Plus, Upload, X } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '../lib/supabase';

export default function ProductDetailPage() {
  const navigate = useNavigate();
  const params = useParams();
  const { user } = useUser();
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedPack, setSelectedPack] = useState('');
  const [selectedShoeModel, setSelectedShoeModel] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [personalizationText, setPersonalizationText] = useState('');
  const [personalizationImages, setPersonalizationImages] = useState<File[]>([]);
  const [currency, setCurrency] = useState<'usd' | 'inr'>('inr');
  const [policies, setPolicies] = useState<any>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [allImages, setAllImages] = useState<string[]>([]);

  useEffect(() => {
    fetchProduct();
    fetchPolicies();
  }, [params.category, params.slug]);

  const fetchProduct = async () => {
    const { data: products } = await supabase
      .from('products')
      .select('*');
    
    if (products) {
      const slugify = (name: string) =>
        name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      
      const match = products.find((p: any) => {
        return (
          String(p.category) === String(params.category) &&
          slugify(String(p.name)) === String(params.slug)
        );
      });
      
      if (match) {
        setProduct(match);
        
        // Combine main image with additional images
        const images = [match.image];
        if (match.additional_images && match.additional_images.length > 0) {
          images.push(...match.additional_images);
        }
        setAllImages(images);
        
        if (match.available_sizes?.length > 0) {
          setSelectedSize(match.available_sizes[0]);
        }
        if (match.pack_options?.length > 0) {
          setSelectedPack(match.pack_options[0].name);
        }
        if (match.shoe_models?.length > 0) {
          setSelectedShoeModel(match.shoe_models[0]);
        }
      }
    }
    setLoading(false);
  };

  const fetchPolicies = async () => {
    try {
      const { data, error } = await supabase
        .from('store_policies')
        .select('*')
        .single();
      
      if (data && !error) {
        setPolicies(data);
      }
    } catch (err) {
      console.log('Policies table not found, using defaults');
      // Use default policies if table doesn't exist
      setPolicies({
        refund_policy: 'Since each pair is custom made to particular size of your choice therefore no exchange or return is possible. But in case of the product being damaged we would allow exchange if the same issue is communicate through email info@knickgasm.com within 2 days.',
        shipping_policy: 'Since each pair is individually made to order and personalised therefore it takes approximately 1-2 weeks for shipping. Once shipped we will send tracking to given email id and contact number.'
      });
    }
  };

  const formatPrice = (price: number) => {
    const USD_TO_INR = 83;
    if (currency === 'inr') {
      return `Rs. ${Math.round(price * USD_TO_INR).toLocaleString('en-IN')}`;
    }
    return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const handleImageUpload = (e: any) => {
    if (e.target.files) {
      const files = Array.from(e.target.files) as File[];
      if (files.length + personalizationImages.length > 3) {
        alert('Maximum 3 images allowed');
        return;
      }
      setPersonalizationImages([...personalizationImages, ...files]);
    }
  };

  const removeImage = (index: number) => {
    setPersonalizationImages(personalizationImages.filter((_, i) => i !== index));
  };

  const getClientIP = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error('Error getting IP:', error);
      return 'unknown';
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      alert('Please sign in to add items to cart');
      navigate('/signin');
      return;
    }

    if (!selectedSize) {
      alert('Please select a size');
      return;
    }

    if (product.shoe_models?.length > 0 && !selectedShoeModel) {
      alert('Please select a shoe model');
      return;
    }

    try {
      // Ensure user profile exists
      await ensureUserProfile();

      // Upload personalization images to a temporary storage or convert to base64
      const imageUrls: string[] = [];
      for (const file of personalizationImages) {
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        imageUrls.push(base64);
      }

      const { error } = await supabase
        .from('cart_items')
        .insert({
          user_id: user.id,
          product_id: product.id,
          quantity,
          selected_size: selectedSize,
          selected_pack: selectedPack || '',
          selected_shoe_model: selectedShoeModel || '',
          personalization_text: personalizationText || '',
          personalization_images: imageUrls.length > 0 ? imageUrls : []
        });

      if (error) {
        console.error('Add to cart error:', error);
        alert('Error adding to cart: ' + error.message);
      } else {
        alert('Added to cart!');
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      alert('Error adding to cart. Please try again.');
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      alert('Please sign in to place an order');
      navigate('/signin');
      return;
    }

    if (!selectedSize) {
      alert('Please select a size');
      return;
    }

    if (product.shoe_models?.length > 0 && !selectedShoeModel) {
      alert('Please select a shoe model');
      return;
    }

    try {
      // Ensure user profile exists
      await ensureUserProfile();

      // Create order directly with proper decimal handling
      const basePrice = parseFloat(product.price.toString());
      const discountPercent = product.discount_percent || 0;
      const discountedPrice = basePrice * (1 - discountPercent / 100);
      const totalAmount = discountedPrice * quantity;
      
      const orderData = {
        user_id: user.id,
        user_email: user.primaryEmailAddress?.emailAddress || '',
        product_id: product.id,
        product_name: product.name,
        product_image: product.image,
        price: parseFloat(discountedPrice.toFixed(4)),
        currency: currency,
        quantity,
        selected_size: selectedSize,
        selected_pack: selectedPack,
        selected_shoe_model: selectedShoeModel,
        personalization_text: personalizationText,
        personalization_images: [],
        status: 'pending',
        total_amount: parseFloat(totalAmount.toFixed(4)),
        payment_status: 'pending'
      };

      console.log('Creating order with data:', orderData);
      
      const { error } = await supabase
        .from('orders')
        .insert(orderData);

      if (error) {
        console.error('Order error:', error);
        alert('Error placing order: ' + error.message);
      } else {
        alert('Order placed successfully! Admin will review and approve your order.');
        navigate('/cart');
      }
    } catch (error) {
      console.error('Buy now error:', error);
      alert('Error placing order. Please try again.');
    }
  };

  const ensureUserProfile = async () => {
    if (!user) return;

    try {
      // Check if user profile exists
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (!existingProfile) {
        // Create user profile
        const { error } = await supabase
          .from('user_profiles')
          .insert({
            id: user.id,
            email: user.primaryEmailAddress?.emailAddress || '',
            first_name: user.firstName || '',
            last_name: user.lastName || ''
          });

        if (error) {
          console.error('Error creating user profile:', error);
        }
      }
    } catch (error) {
      console.error('Error ensuring user profile:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-black/20 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p>Product not found</p>
      </div>
    );
  }

  const discountPercent = product.discount_percent || 0;
  const originalPrice = product.price;
  const discountedPrice = originalPrice * (1 - discountPercent / 100);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-50">
        <button
          onClick={() => navigate(`/store/category/${params.category}`)}
          className="flex items-center gap-2 text-gray-900 hover:text-gray-600"
        >
          <ChevronLeft size={20} />
          <span className="font-medium">Back</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Product Image - Left Side */}
          <div className="relative">
            {discountPercent > 0 && (
              <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold z-10">
                -{discountPercent}%
              </div>
            )}
            
            {/* Main Image */}
            <div className="bg-gray-100 rounded-2xl overflow-hidden aspect-square sticky top-24 mb-4">
              <img
                src={allImages[selectedImageIndex] || product.image}
                alt={product.name}
                className="w-full h-full object-contain"
              />
            </div>
            
            {/* Image Thumbnails */}
            {allImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {allImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImageIndex === index 
                        ? 'border-black' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-contain bg-gray-50"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details - Right Side */}
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {product.name}
            </h1>

            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl font-bold text-red-600">
                {formatPrice(discountedPrice)}
              </span>
              {discountPercent > 0 && (
                <span className="text-xl text-gray-400 line-through">
                  {formatPrice(originalPrice)}
                </span>
              )}
            </div>

            {/* Shoe Model Selection */}
            {product.shoe_models && product.shoe_models.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Shoe Model: {selectedShoeModel}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {product.shoe_models.map((model: string) => (
                    <button
                      key={model}
                      onClick={() => setSelectedShoeModel(model)}
                      className={`py-3 px-4 border-2 rounded-lg font-medium transition-all text-sm ${
                        selectedShoeModel === model
                          ? 'border-black bg-black text-white'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {model}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {product.available_sizes && product.available_sizes.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Size: {selectedSize}
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {product.available_sizes.map((size: string) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`py-3 px-4 border-2 rounded-lg font-medium transition-all ${
                        selectedSize === size
                          ? 'border-black bg-black text-white'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Pack Options */}
            {product.pack_options && product.pack_options.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  No of sets: {selectedPack}
                </label>
                <div className="space-y-2">
                  {product.pack_options.map((pack: any) => (
                    <button
                      key={pack.name}
                      onClick={() => setSelectedPack(pack.name)}
                      className={`w-full py-3 px-4 border-2 rounded-lg font-medium text-left transition-all ${
                        selectedPack === pack.name
                          ? 'border-black bg-black text-white'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {pack.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Personalization Section */}
            <div className="mb-6 p-6 bg-gray-50 rounded-xl">
              <h3 className="text-lg font-bold mb-3">Add your personalization:</h3>
              <p className="text-sm text-gray-600 mb-4">
                Add your personal touch. Tell us how you'd like to customise your pair. 
                And for changeable swooshes mention the swoosh designs below!
              </p>
              
              <textarea
                value={personalizationText}
                onChange={(e) => setPersonalizationText(e.target.value)}
                placeholder="For eg. add initials H on heel or change color"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 resize-none focus:outline-none focus:ring-2 focus:ring-black"
                rows={3}
              />

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload reference images (max 3)
                </label>
                <div className="flex flex-wrap gap-3">
                  {personalizationImages.map((file, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Upload ${index + 1}`}
                        className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  {personalizationImages.length < 3 && (
                    <label className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors">
                      <Upload size={24} className="text-gray-400" />
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Quantity
              </label>
              <div className="flex items-center gap-4 bg-gray-100 rounded-full w-fit px-2 py-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 rounded-full transition-colors"
                >
                  <Minus size={16} />
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 rounded-full transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 mb-8">
              <button
                onClick={handleAddToCart}
                className="w-full bg-black text-white py-4 rounded-full font-bold text-lg hover:bg-gray-800 transition-colors"
              >
                Add to Cart
              </button>
              <button
                onClick={() => {
                  const items = [{
                    product_id: product.id,
                    product_name: product.name,
                    product_image: product.image,
                    price: discountedPrice,
                    quantity: quantity,
                    selected_size: selectedSize,
                    selected_pack: selectedPack,
                    selected_shoe_model: selectedShoeModel,
                    personalization_text: personalizationText
                  }];
                  navigate('/checkout', { state: { items, fromCart: false } });
                }}
                className="w-full bg-red-500 text-white py-4 rounded-full font-bold text-lg hover:bg-red-600 transition-colors"
              >
                Buy it now
              </button>
            </div>

            {/* Product Description */}
            {product.description && (
              <div className="mb-6 pb-6 border-b border-gray-200">
                <h3 className="text-lg font-bold mb-3">Product Description</h3>
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Refund Policy */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <h3 className="text-lg font-bold mb-3">Refund and Return Policy</h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                {product.refund_policy || policies?.refund_policy || 
                  'Since each pair is custom made to particular size of your choice therefore no exchange or return is possible. But in case of the product being damaged we would allow exchange if the same issue is communicate through email info@knickgasm.com within 2 days.'}
              </p>
            </div>

            {/* Shipping Policy */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <h3 className="text-lg font-bold mb-3">Shipping Policy</h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                {product.shipping_policy || policies?.shipping_policy || 
                  'Since each pair is individually made to order and personalised therefore it takes approximately 1-2 weeks for shipping. Once shipped we will send tracking to given email id and contact number.'}
              </p>
            </div>

            {/* Additional Info */}
            <div className="text-sm text-gray-600 space-y-2">
              <p>Sneakers are the perfect choice.</p>
              <button className="text-black font-medium flex items-center gap-2 hover:gap-3 transition-all mt-4">
                View Full Details
                <span>→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
