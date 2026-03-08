import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, Package, Truck, CheckCircle, Clock, ShoppingBag } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import Loader from '../components/Loader';

interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
  selected_size: string;
  selected_pack: string;
  selected_shoe_model: string;
  personalization_text: string;
  products: {
    id: number;
    name: string;
    price: number;
    image: string;
    discount_percent: number;
    in_stock: boolean;
  };
}

interface Order {
  id: number;
  product_name: string;
  product_image: string;
  price: number;
  quantity: number;
  status: string;
  tracking_number: string;
  created_at: string;
  selected_size: string;
  selected_pack: string;
  selected_shoe_model: string;
  total_amount: number;
}

export default function CartPage() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<'cart' | 'orders'>('cart');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState<'usd' | 'inr'>('inr');
  const [removedItems, setRemovedItems] = useState<string[]>([]);

  useEffect(() => {
    if (!user) {
      navigate('/signin');
      return;
    }
    fetchCartItems();
    fetchOrders();

    // Real-time subscription for cart updates
    const subscription = supabase
      .channel('cart_realtime')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cart_items',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchCartItems();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const fetchCartItems = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        *,
        products (
          id,
          name,
          price,
          image,
          discount_percent,
          in_stock
        )
      `)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching cart:', error);
    } else {
      const items = data || [];

      // Auto-remove out-of-stock items
      const outOfStockItems = items.filter(item => item.products && !item.products.in_stock);
      const inStockItems = items.filter(item => item.products && item.products.in_stock);

      if (outOfStockItems.length > 0) {
        // Remove from DB
        const idsToRemove = outOfStockItems.map(item => item.id);
        await supabase
          .from('cart_items')
          .delete()
          .in('id', idsToRemove);

        // Show notification
        const removedNames = outOfStockItems.map(item => item.products.name);
        setRemovedItems(removedNames);
        setTimeout(() => setRemovedItems([]), 5000);
      }

      setCartItems(inStockItems);
    }
    setLoading(false);
  };

  const fetchOrders = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
    } else {
      setOrders(data || []);
    }
  };

  const updateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;

    const { error } = await supabase
      .from('cart_items')
      .update({ quantity: newQuantity })
      .eq('id', itemId);

    if (error) {
      alert('Error updating quantity');
    } else {
      fetchCartItems();
    }
  };

  const removeFromCart = async (itemId: number) => {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId);

    if (error) {
      alert('Error removing item');
    } else {
      fetchCartItems();
    }
  };

  const checkout = async () => {
    if (!user || cartItems.length === 0) return;

    try {
      setLoading(true);

      // First, ensure user profile exists
      await ensureUserProfile();

      const orderPromises = cartItems.map(async (item) => {
        const basePrice = parseFloat(item.products.price.toString());
        const discountPercent = item.products.discount_percent || 0;
        const discountedPrice = basePrice * (1 - discountPercent / 100);
        const totalAmount = discountedPrice * item.quantity;

        // Ensure all numeric values are properly formatted
        const orderData = {
          user_id: user.id,
          user_email: user.primaryEmailAddress?.emailAddress || '',
          product_id: item.product_id,
          product_name: item.products.name,
          product_image: item.products.image,
          price: parseFloat(discountedPrice.toFixed(4)),
          currency: currency,
          quantity: item.quantity,
          selected_size: item.selected_size || '',
          selected_pack: item.selected_pack || '',
          selected_shoe_model: item.selected_shoe_model || '',
          personalization_text: item.personalization_text || '',
          personalization_images: [],
          status: 'pending',
          total_amount: parseFloat(totalAmount.toFixed(4)),
          payment_status: 'pending'
        };

        console.log('Creating order with data:', orderData);
        return supabase.from('orders').insert(orderData);
      });

      const results = await Promise.all(orderPromises);
      const errors = results.filter(r => r.error);

      if (errors.length > 0) {
        console.error('Order errors:', errors);
        alert(`Error placing ${errors.length} orders. Please try again.`);
      } else {
        // Clear cart after successful checkout
        const { error: clearError } = await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', user.id);

        if (clearError) {
          console.error('Error clearing cart:', clearError);
        }

        alert('All orders placed successfully! Admin will review and approve your orders.');
        fetchCartItems();
        fetchOrders();
        setActiveTab('orders');
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

  const formatPrice = (price: number) => {
    const USD_TO_INR = 83;
    if (currency === 'inr') {
      return `₹${Math.round(price * USD_TO_INR).toLocaleString('en-IN')}`;
    }
    return `$${price.toFixed(2)}`;
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const discountedPrice = item.products.price * (1 - (item.products.discount_percent || 0) / 100);
      return total + (discountedPrice * item.quantity);
    }, 0);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="text-yellow-500" size={20} />;
      case 'approved':
        return <CheckCircle className="text-blue-500" size={20} />;
      case 'shipped':
        return <Truck className="text-purple-500" size={20} />;
      case 'delivered':
        return <Package className="text-green-500" size={20} />;
      default:
        return <Clock className="text-gray-500" size={20} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <ShoppingBag size={32} />
            My Cart & Orders
          </h1>
          <div className="flex items-center gap-2 text-xs border border-white/15 rounded-full px-1 py-0.5 bg-white/5">
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
        </div>

        {/* Out of stock removal notification */}
        {removedItems.length > 0 && (
          <div className="mb-6 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-start gap-3">
            <span className="text-yellow-500 text-xl">⚠️</span>
            <div>
              <p className="text-yellow-300 font-medium text-sm">Items removed from cart (out of stock)</p>
              <p className="text-yellow-200/70 text-xs mt-1">
                {removedItems.join(', ')} — {removedItems.length === 1 ? 'this item is' : 'these items are'} no longer available.
              </p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-white/10">
          <button
            onClick={() => setActiveTab('cart')}
            className={`px-6 py-3 font-medium transition-colors ${activeTab === 'cart'
              ? 'text-white border-b-2 border-white'
              : 'text-gray-400 hover:text-gray-300'
              }`}
          >
            Cart ({cartItems.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-6 py-3 font-medium transition-colors ${activeTab === 'orders'
              ? 'text-white border-b-2 border-white'
              : 'text-gray-400 hover:text-gray-300'
              }`}
          >
            Orders ({orders.length})
          </button>
        </div>

        {/* Cart Tab */}
        {activeTab === 'cart' && (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cartItems.length === 0 ? (
                <div className="bg-white/5 rounded-2xl p-12 text-center border border-white/10">
                  <ShoppingBag size={64} className="mx-auto mb-4 text-gray-500" />
                  <p className="text-gray-400 text-lg mb-4">Your cart is empty</p>
                  <button
                    onClick={() => navigate('/store/category/all')}
                    className="px-6 py-3 bg-white text-black rounded-full font-medium hover:bg-gray-200 transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                cartItems.map((item) => {
                  const discountedPrice = item.products.price * (1 - (item.products.discount_percent || 0) / 100);
                  return (
                    <div
                      key={item.id}
                      className="bg-white/5 rounded-2xl p-4 sm:p-6 border border-white/10 hover:border-white/20 transition-all group relative"
                    >
                      {/* Delete button positioned for responsiveness */}
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="absolute top-4 right-4 text-gray-500 hover:text-red-400 transition-colors p-2 z-10"
                        title="Remove from cart"
                      >
                        <Trash2 size={20} />
                      </button>

                      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                        <img
                          src={item.products.image}
                          alt={item.products.name}
                          className="w-full sm:w-32 h-48 sm:h-32 object-cover rounded-xl"
                        />
                        <div className="flex-1 pr-8 sm:pr-0">
                          <h3 className="text-lg sm:text-xl font-bold mb-2 pr-4">{item.products.name}</h3>
                          <div className="space-y-1 text-xs sm:text-sm text-gray-400 mb-4">
                            {item.selected_size && <p>Size: {item.selected_size}</p>}
                            {item.selected_shoe_model && <p>Model: {item.selected_shoe_model}</p>}
                            {item.selected_pack && <p>Pack: {item.selected_pack}</p>}
                            {item.personalization_text && (
                              <p className="text-xs bg-white/5 p-2 rounded italic">Note: {item.personalization_text}</p>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-4 mt-auto">
                            <div className="flex items-center gap-3 bg-white/5 rounded-full p-1 border border-white/10">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="w-8 h-8 flex items-center justify-center bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                                disabled={item.quantity <= 1}
                              >
                                <Minus size={14} />
                              </button>
                              <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-8 h-8 flex items-center justify-center bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                              >
                                <Plus size={14} />
                              </button>
                            </div>

                            <div className="text-right">
                              <p className="text-xl sm:text-2xl font-bold text-white leading-none">
                                {formatPrice(discountedPrice * item.quantity)}
                              </p>
                              {item.products.discount_percent > 0 && (
                                <p className="text-xs sm:text-sm text-gray-500 line-through mt-1">
                                  {formatPrice(item.products.price * item.quantity)}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Order Summary */}
            {cartItems.length > 0 && (
              <div className="lg:col-span-1">
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10 sticky top-24">
                  <h2 className="text-xl font-bold mb-6">Order Summary</h2>
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-gray-400">
                      <span>Subtotal</span>
                      <span>{formatPrice(calculateTotal())}</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Shipping</span>
                      <span>Calculated at checkout</span>
                    </div>
                    <div className="border-t border-white/10 pt-4">
                      <div className="flex justify-between text-xl font-bold">
                        <span>Total</span>
                        <span>{formatPrice(calculateTotal())}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const items = cartItems.map(item => ({
                        product_id: item.product_id,
                        product_name: item.products.name,
                        product_image: item.products.image,
                        price: item.products.price * (1 - (item.products.discount_percent || 0) / 100),
                        quantity: item.quantity,
                        selected_size: item.selected_size || '',
                        selected_pack: item.selected_pack || '',
                        selected_shoe_model: item.selected_shoe_model || '',
                        personalization_text: item.personalization_text || ''
                      }));
                      navigate('/checkout', { state: { items, fromCart: true } });
                    }}
                    className="w-full bg-white text-black py-4 rounded-full font-bold text-lg hover:bg-gray-200 transition-colors"
                  >
                    Proceed to Checkout
                  </button>
                  <p className="text-xs text-gray-400 text-center mt-4">
                    Orders will be reviewed by admin before processing
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="bg-white/5 rounded-2xl p-12 text-center border border-white/10">
                <Package size={64} className="mx-auto mb-4 text-gray-500" />
                <p className="text-gray-400 text-lg">No orders yet</p>
              </div>
            ) : (
              orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white/5 rounded-2xl p-6 border border-white/10"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-sm text-gray-400">Order #{order.id}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(order.status)}
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-6">
                    <img
                      src={order.product_image}
                      alt={order.product_name}
                      className="w-24 h-24 object-cover rounded-xl"
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-bold mb-2">{order.product_name}</h3>
                      <div className="space-y-1 text-sm text-gray-400 mb-3">
                        {order.selected_size && <p>Size: {order.selected_size}</p>}
                        {order.selected_shoe_model && <p>Model: {order.selected_shoe_model}</p>}
                        {order.selected_pack && <p>Pack: {order.selected_pack}</p>}
                        <p>Quantity: {order.quantity}</p>
                      </div>
                      {order.tracking_number && (
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-3">
                          <p className="text-xs text-gray-400 mb-1">Tracking Number</p>
                          <p className="font-mono text-sm text-blue-400">{order.tracking_number}</p>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <p className="text-2xl font-bold">{formatPrice(order.total_amount || (order.price * order.quantity))}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
