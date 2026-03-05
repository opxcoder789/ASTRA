import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Check, X, Package, Truck, Eye } from 'lucide-react';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  };

  const updateOrderStatus = async (orderId: number, status: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (error) {
      alert('Error updating order: ' + error.message);
    } else {
      alert(`Order ${status}!`);
      fetchOrders();
      setSelectedOrder(null);
    }
  };

  const addTrackingNumber = async (orderId: number) => {
    if (!trackingNumber) {
      alert('Please enter tracking number');
      return;
    }

    const { error } = await supabase
      .from('orders')
      .update({ 
        tracking_number: trackingNumber,
        status: 'shipped',
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (error) {
      alert('Error adding tracking: ' + error.message);
    } else {
      alert('Tracking number added and order marked as shipped!');
      setTrackingNumber('');
      fetchOrders();
      setSelectedOrder(null);
    }
  };

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(o => o.status === filterStatus);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPrice = (price: number, currency: string) => {
    if (currency === 'inr') {
      return `₹${Math.round(price * 83).toLocaleString('en-IN')}`;
    }
    return `$${price.toFixed(2)}`;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
          <div className="flex gap-2">
            {['all', 'pending', 'approved', 'shipped', 'delivered', 'cancelled'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
                  filterStatus === status
                    ? 'bg-black text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-8 h-8 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <Package size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No orders found</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Order #{order.id}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                    {order.status.toUpperCase()}
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Customer Details</h4>
                    <p className="text-sm text-gray-600">Email: {order.user_email}</p>
                    <p className="text-sm text-gray-600">User ID: {order.user_id}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Product Details</h4>
                    <div className="flex gap-3">
                      {order.product_image && (
                        <img src={order.product_image} alt={order.product_name} className="w-16 h-16 object-cover rounded-lg" />
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{order.product_name}</p>
                        <p className="text-sm text-gray-600">Price: {formatPrice(order.price, order.currency)}</p>
                        <p className="text-sm text-gray-600">Quantity: {order.quantity}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-700 mb-2">Order Specifications</h4>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    {order.selected_shoe_model && (
                      <div>
                        <span className="text-gray-500">Shoe Model:</span>
                        <p className="font-medium">{order.selected_shoe_model}</p>
                      </div>
                    )}
                    {order.selected_size && (
                      <div>
                        <span className="text-gray-500">Size:</span>
                        <p className="font-medium">{order.selected_size}</p>
                      </div>
                    )}
                    {order.selected_pack && (
                      <div>
                        <span className="text-gray-500">Pack:</span>
                        <p className="font-medium">{order.selected_pack}</p>
                      </div>
                    )}
                  </div>
                </div>

                {order.personalization_text && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="font-semibold text-gray-700 mb-2">Personalization Request</h4>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{order.personalization_text}</p>
                  </div>
                )}

                {order.tracking_number && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="font-semibold text-gray-700 mb-2">Tracking Information</h4>
                    <p className="text-sm text-gray-700 font-mono bg-blue-50 p-3 rounded-lg">{order.tracking_number}</p>
                  </div>
                )}

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <Eye size={16} /> View Details
                  </button>
                  
                  {order.status === 'pending' && (
                    <>
                      <button
                        onClick={() => updateOrderStatus(order.id, 'approved')}
                        className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                      >
                        <Check size={16} /> Approve
                      </button>
                      <button
                        onClick={() => updateOrderStatus(order.id, 'cancelled')}
                        className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                      >
                        <X size={16} /> Reject
                      </button>
                    </>
                  )}

                  {order.status === 'approved' && (
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <Truck size={16} /> Add Tracking
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Order Detail Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedOrder(null)}>
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
                <h2 className="text-2xl font-bold">Order #{selectedOrder.id}</h2>
                <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {selectedOrder.status === 'approved' && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-3">Add Tracking Number</h3>
                    <input
                      type="text"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="Enter tracking number"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3"
                    />
                    <button
                      onClick={() => addTrackingNumber(selectedOrder.id)}
                      className="w-full bg-blue-500 text-white py-2 rounded-lg font-medium hover:bg-blue-600"
                    >
                      Add Tracking & Mark as Shipped
                    </button>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold mb-2">Customer Information</h3>
                  <p className="text-sm text-gray-600">Email: {selectedOrder.user_email}</p>
                  <p className="text-sm text-gray-600">User ID: {selectedOrder.user_id}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Product Information</h3>
                  <p className="text-sm text-gray-600">Product: {selectedOrder.product_name}</p>
                  <p className="text-sm text-gray-600">Price: {formatPrice(selectedOrder.price, selectedOrder.currency)}</p>
                  <p className="text-sm text-gray-600">Quantity: {selectedOrder.quantity}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Specifications</h3>
                  {selectedOrder.selected_shoe_model && <p className="text-sm text-gray-600">Shoe Model: {selectedOrder.selected_shoe_model}</p>}
                  {selectedOrder.selected_size && <p className="text-sm text-gray-600">Size: {selectedOrder.selected_size}</p>}
                  {selectedOrder.selected_pack && <p className="text-sm text-gray-600">Pack: {selectedOrder.selected_pack}</p>}
                </div>

                {selectedOrder.personalization_text && (
                  <div>
                    <h3 className="font-semibold mb-2">Personalization Request</h3>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedOrder.personalization_text}</p>
                  </div>
                )}

                {selectedOrder.status === 'pending' && (
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => updateOrderStatus(selectedOrder.id, 'approved')}
                      className="flex-1 bg-green-500 text-white py-3 rounded-lg font-bold hover:bg-green-600"
                    >
                      Approve Order
                    </button>
                    <button
                      onClick={() => updateOrderStatus(selectedOrder.id, 'cancelled')}
                      className="flex-1 bg-red-500 text-white py-3 rounded-lg font-bold hover:bg-red-600"
                    >
                      Reject Order
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
