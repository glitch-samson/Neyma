import React, { useState, useEffect } from 'react';
import { Eye, Package, Truck, CheckCircle, Clock, Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { formatPrice, formatDate } from '../../lib/utils';

export function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await supabase
        .from('orders')
        .select(`
          *,
          profile:profiles(full_name, email),
          order_items(
            *,
            product:products(name, product_images(image_url, is_primary))
          )
        `)
        .order('created_at', { ascending: false });

      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;
      
      fetchOrders();
      setShowModal(false);
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'processing':
        return <Package className="w-5 h-5 text-blue-500" />;
      case 'shipped':
        return <Truck className="w-5 h-5 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'cancelled':
        return <div className="w-5 h-5 bg-red-500 rounded-full" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'processing':
        return 'text-blue-600 bg-blue-50';
      case 'shipped':
        return 'text-purple-600 bg-purple-50';
      case 'delivered':
        return 'text-green-600 bg-green-50';
      case 'cancelled':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.profile?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-600">Manage customer orders and fulfillment</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          <Select
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: '', label: 'All Statuses' },
              { value: 'pending', label: 'Pending' },
              { value: 'processing', label: 'Processing' },
              { value: 'shipped', label: 'Shipped' },
              { value: 'delivered', label: 'Delivered' },
              { value: 'cancelled', label: 'Cancelled' }
            ]}
          />
          <div className="flex items-end">
            <Button variant="outline" onClick={() => { setSearchTerm(''); setStatusFilter(''); }}>
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      #{order.id.slice(-8)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {order.order_items?.length || 0} items
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {order.profile?.full_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {order.profile?.email}
                    </div>
                    {order.profile?.phone_number && (
                      <div className="text-sm text-gray-500">
                        📱 {order.profile.phone_number}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(order.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatPrice(order.total_amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="ml-2 capitalize">{order.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowModal(true);
                      }}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={selectedOrder ? `Order #${selectedOrder.id.slice(-8)}` : ''}
        className="max-w-4xl"
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Order Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Customer Information</h3>
                <div className="space-y-2">
                  <p><strong>Name:</strong> {selectedOrder.profile?.full_name}</p>
                  <p><strong>Email:</strong> {selectedOrder.profile?.email}</p>
                  {selectedOrder.profile?.phone_number && (
                    <p><strong>Phone:</strong> {selectedOrder.profile.phone_number}</p>
                  )}
                  <p><strong>Order Date:</strong> {formatDate(selectedOrder.created_at)}</p>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-3">Contact & Pickup Information</h3>
                <div className="text-sm text-gray-600">
                  <p>{selectedOrder.shipping_address?.full_name}</p>
                  {selectedOrder.shipping_address?.phone_number && (
                    <p><strong>Phone:</strong> {selectedOrder.shipping_address.phone_number}</p>
                  )}
                  {selectedOrder.shipping_address?.whatsapp_number && (
                    <p><strong>WhatsApp:</strong> {selectedOrder.shipping_address.whatsapp_number}</p>
                  )}
                  <p>{selectedOrder.shipping_address?.address}</p>
                  {selectedOrder.shipping_address?.pickup_location && (
                    <p><strong>Pickup Location:</strong> {selectedOrder.shipping_address.pickup_location}</p>
                  )}
                  <p>
                    {selectedOrder.shipping_address?.city}, {selectedOrder.shipping_address?.state} {selectedOrder.shipping_address?.zip_code}
                  </p>
                  <p>{selectedOrder.shipping_address?.country}</p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Order Items</h3>
              <div className="space-y-3">
                {selectedOrder.order_items?.map((item) => {
                  const product = item.product;
                  if (!product) return null;

                  const primaryImage = product.product_images?.find(img => img.is_primary)?.image_url || 
                                     product.product_images?.[0]?.image_url || 
                                     'https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg';

                  return (
                    <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <img
                        src={primaryImage}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium">{product.name}</h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>Qty: {item.quantity}</span>
                          {item.size && <span>Size: {item.size}</span>}
                          {item.color && <span>Color: {item.color}</span>}
                        </div>
                      </div>
                      <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Total */}
            <div className="border-t pt-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>{formatPrice(selectedOrder.total_amount)}</span>
              </div>
            </div>

            {/* Status Update */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-3">Update Status</h3>
              <div className="flex flex-wrap gap-2">
                {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                  <Button
                    key={status}
                    variant={selectedOrder.status === status ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => updateOrderStatus(selectedOrder.id, status)}
                    disabled={selectedOrder.status === status}
                  >
                    <span className="capitalize">{status}</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}