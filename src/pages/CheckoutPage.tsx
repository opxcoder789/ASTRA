import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, MapPin, User, CreditCard, Package, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import Loader from '../components/Loader';

interface ShippingAddress {
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string;
}

interface OrderItem {
  product_id: number;
  product_name: string;
  product_image: string;
  price: number;
  quantity: number;
  selected_size: string;
  selected_pack: string;
  selected_shoe_model: string;
  personalization_text: string;
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [currency, setCurrency] = useState<'usd' | 'inr'>('inr');

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'India',
    phone: ''
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [showSavedAddresses, setShowSavedAddresses] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/signin');
      return;
    }

    // Get order items from location state (from cart or direct buy)
    const items = location.state?.items || [];
    if (items.length === 0) {
      navigate('/cart');
      return;
    }
    setOrderItems(items);

    // Load user's saved address if available
    loadUserAddress();
  }, [user, location.state]);

  const loadUserAddress = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_addresses')
        .select('*')
        .eq('user_id', user.id);

      if (data && !error) {
        setSavedAddresses(data);
        const defaultAddr = data.find((a: any) => a.is_default);
        if (defaultAddr) {
          setShippingAddress({
            address_line1: defaultAddr.address_line1,
            address_line2: defaultAddr.address_line2 || '',
            city: defaultAddr.city,
            state: defaultAddr.state,
            postal_code: defaultAddr.postal_code,
            country: defaultAddr.country,
            phone: '' // Phone still needs to be entered unless we also save it in address
          });
        }
      }
    } catch (error) {
      console.log('Error loading addresses');
    }
  };

  const selectSavedAddress = (addr: any) => {
    setShippingAddress({
      address_line1: addr.address_line1,
      address_line2: addr.address_line2 || '',
      city: addr.city,
      state: addr.state,
      postal_code: addr.postal_code,
      country: addr.country,
      phone: shippingAddress.phone // Keep the current phone or update if addr has one
    });
    setShowSavedAddresses(false);
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!shippingAddress.address_line1.trim()) {
      newErrors.address_line1 = 'Address line 1 is required';
    }
    if (!shippingAddress.city.trim()) {
      newErrors.city = 'City is required';
    }
    if (!shippingAddress.state.trim()) {
      newErrors.state = 'State is required';
    }
    if (!shippingAddress.postal_code.trim()) {
      newErrors.postal_code = 'Postal code is required';
    }
    if (!shippingAddress.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s\-\(\)]{10,}$/.test(shippingAddress.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateTotal = () => {
    return orderItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const formatPrice = (price: number) => {
    const USD_TO_INR = 83;
    if (currency === 'inr') {
      return `₹${Math.round(price * USD_TO_INR).toLocaleString('en-IN')}`;
    }
    return `$${price.toFixed(2)}`;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      alert('Please fill in all required fields correctly');
      return;
    }

    setLoading(true);
    try {
      // Ensure user profile exists
      await ensureUserProfile();

      // Save shipping address
      await saveShippingAddress();

      // Create orders
      const orderPromises = orderItems.map(async (item) => {
        const totalAmount = item.price * item.quantity;

        const orderData = {
          user_id: user!.id,
          user_email: user!.primaryEmailAddress?.emailAddress || '',
          product_id: item.product_id,
          product_name: item.product_name,
          product_image: item.product_image,
          price: parseFloat(item.price.toFixed(4)),
          currency: currency,
          quantity: item.quantity,
          selected_size: item.selected_size || '',
          selected_pack: item.selected_pack || '',
          selected_shoe_model: item.selected_shoe_model || '',
          personalization_text: item.personalization_text || '',
          personalization_images: [],
          status: 'pending',
          total_amount: parseFloat(totalAmount.toFixed(4)),
          payment_status: 'pending',
          shipping_address: shippingAddress
        };

        return supabase.from('orders').insert(orderData);
      });

      const results = await Promise.all(orderPromises);
      const errors = results.filter(r => r.error);

      if (errors.length > 0) {
        console.error('Order errors:', errors);
        alert(`Error placing ${errors.length} orders. Please try again.`);
      } else {
        // Clear cart if items came from cart
        if (location.state?.fromCart) {
          await supabase.from('cart_items').delete().eq('user_id', user!.id);
        }

        alert('Orders placed successfully! Admin will review and approve your orders.');
        navigate('/cart?tab=orders');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Error during checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const ensureUserProfile = async () => {
    if (!user) return;

    try {
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (!existingProfile) {
        await supabase.from('user_profiles').insert({
          id: user.id,
          email: user.primaryEmailAddress?.emailAddress || '',
          first_name: user.firstName || '',
          last_name: user.lastName || ''
        });
      }
    } catch (error) {
      console.error('Error ensuring user profile:', error);
    }
  };

  const saveShippingAddress = async () => {
    if (!user) return;

    try {
      // Check if address already exists
      const { data: existingAddress } = await supabase
        .from('user_addresses')
        .select('id')
        .eq('user_id', user.id)
        .eq('address_line1', shippingAddress.address_line1)
        .eq('city', shippingAddress.city)
        .single();

      if (!existingAddress) {
        // Save new address
        await supabase.from('user_addresses').insert({
          user_id: user.id,
          ...shippingAddress,
          is_default: true
        });
      }
    } catch (error) {
      console.error('Error saving address:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader color="#ffffff" size="65px" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-3xl font-bold">Checkout</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Shipping Information */}
          <div className="lg:col-span-2 space-y-8">
            {/* Shipping Address */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <MapPin size={20} />
                  Shipping Address
                </h2>
                {savedAddresses.length > 0 && (
                  <button
                    onClick={() => setShowSavedAddresses(!showSavedAddresses)}
                    className="text-xs bg-white text-black px-3 py-1.5 rounded-full font-bold hover:bg-gray-200 transition-colors flex items-center gap-1"
                  >
                    {showSavedAddresses ? 'Hide Saved' : 'Use Saved Address'}
                    {showSavedAddresses ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                )}
              </div>

              {/* Saved Addresses List */}
              {showSavedAddresses && savedAddresses.length > 0 && (
                <div className="grid gap-3 mb-8">
                  {savedAddresses.map((addr) => (
                    <button
                      key={addr.id}
                      onClick={() => selectSavedAddress(addr)}
                      className="text-left p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all flex justify-between items-center group"
                    >
                      <div>
                        <p className="font-bold text-sm text-white">{addr.address_line1}</p>
                        <p className="text-xs text-gray-400">
                          {addr.city}, {addr.state} {addr.postal_code}
                        </p>
                      </div>
                      <div className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center group-hover:border-white/50">
                        <Check size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </button>
                  ))}
                  <div className="border-b border-white/10 my-2" />
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Address Line 1 *
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.address_line1}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, address_line1: e.target.value })}
                    className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 ${errors.address_line1 ? 'border-red-500' : 'border-white/20'
                      }`}
                    placeholder="Street address, apartment, suite, etc."
                  />
                  {errors.address_line1 && <p className="text-red-400 text-sm mt-1">{errors.address_line1}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Address Line 2
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.address_line2}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, address_line2: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50"
                    placeholder="Apartment, suite, unit, building, floor, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                    className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 ${errors.city ? 'border-red-500' : 'border-white/20'
                      }`}
                    placeholder="City"
                  />
                  {errors.city && <p className="text-red-400 text-sm mt-1">{errors.city}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.state}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                    className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 ${errors.state ? 'border-red-500' : 'border-white/20'
                      }`}
                    placeholder="State"
                  />
                  {errors.state && <p className="text-red-400 text-sm mt-1">{errors.state}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Postal Code *
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.postal_code}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, postal_code: e.target.value })}
                    className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 ${errors.postal_code ? 'border-red-500' : 'border-white/20'
                      }`}
                    placeholder="Postal Code"
                  />
                  {errors.postal_code && <p className="text-red-400 text-sm mt-1">{errors.postal_code}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Country
                  </label>
                  <select
                    value={shippingAddress.country}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                  >
                    <option value="India">India</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Canada">Canada</option>
                    <option value="Australia">Australia</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={shippingAddress.phone}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                    className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 ${errors.phone ? 'border-red-500' : 'border-white/20'
                      }`}
                    placeholder="Phone number for delivery updates"
                  />
                  {errors.phone && <p className="text-red-400 text-sm mt-1">{errors.phone}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10 sticky top-24">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Package size={20} />
                Order Summary
              </h2>

              <div className="space-y-4 mb-6">
                {orderItems.map((item, index) => (
                  <div key={index} className="flex gap-3">
                    <img
                      src={item.product_image}
                      alt={item.product_name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-sm">{item.product_name}</h3>
                      <p className="text-xs text-gray-400">
                        {item.selected_size && `Size: ${item.selected_size}`}
                        {item.selected_shoe_model && ` • Model: ${item.selected_shoe_model}`}
                      </p>
                      <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                      <p className="font-bold text-sm">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal</span>
                  <span>{formatPrice(calculateTotal())}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Shipping</span>
                  <span>Calculated after approval</span>
                </div>
                <div className="border-t border-white/10 pt-3">
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span>{formatPrice(calculateTotal())}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs border border-white/15 rounded-full px-1 py-0.5 bg-white/5 mb-6">
                <button
                  className={`px-3 py-1 rounded-full transition-colors ${currency === 'usd' ? 'bg-white text-black' : 'text-gray-300'}`}
                  onClick={() => setCurrency('usd')}
                >
                  USD
                </button>
                <button
                  className={`px-3 py-1 rounded-full transition-colors ${currency === 'inr' ? 'bg-white text-black' : 'text-gray-300'}`}
                  onClick={() => setCurrency('inr')}
                >
                  INR
                </button>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={loading}
                className="w-full bg-white text-black py-4 rounded-full font-bold text-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                {loading ? 'Placing Order...' : 'Place Order'}
              </button>

              <p className="text-xs text-gray-400 text-center mt-4">
                Orders will be reviewed by admin before processing
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}