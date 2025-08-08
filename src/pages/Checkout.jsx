import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, MapPin, User, CheckCircle } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { formatPrice } from '../lib/utils';

export function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [notificationSent, setNotificationSent] = useState(false);
  
  const [shippingInfo, setShippingInfo] = useState({
    full_name: profile?.full_name || '',
    email: profile?.email || '',
    phone_number: profile?.phone_number || '',
    whatsapp_number: '',
    pickup_location: '',
    city: '',
    state: '',
    country: 'Nigeria',
  });

  const handleInputChange = (section) => (e) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({ ...prev, [name]: value }));
  };

  const notifyAdmin = async (orderData, orderItems) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/notify-admin`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderData: {
            orderId: orderData.id,
            totalAmount: orderData.total_amount,
            status: orderData.status,
            shippingAddress: orderData.shipping_address,
            createdAt: orderData.created_at
          },
          userInfo: {
            userId: user.id,
            fullName: profile?.full_name,
            email: profile?.email
          },
          cartItems: orderItems.map(item => ({
            productId: item.product_id,
            productName: item.product?.name,
            quantity: item.quantity,
            price: item.price,
            size: item.size,
            color: item.color,
            totalPrice: item.price * item.quantity
          }))
        })
      });

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Error notifying admin:', error);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      // Calculate total
      const subtotal = totalPrice;
      const shipping = subtotal >= 50000 ? 0 : 2500; // Free shipping over ₦50,000
      const tax = subtotal * 0.075; // 7.5% VAT
      const total = subtotal + shipping + tax;

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            user_id: user.id,
            total_amount: total,
            shipping_address: shippingInfo,
            status: 'pending',
          },
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items with product details
      const orderItemsData = items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.product?.price || 0,
        size: item.size,
        color: item.color,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsData);

      if (itemsError) throw itemsError;

      // Prepare order items with product details for notification
      const orderItemsWithProducts = items.map(item => ({
        ...orderItemsData.find(orderItem => orderItem.product_id === item.product_id),
        product: item.product
      }));

      // Notify admin
      const adminNotified = await notifyAdmin(order, orderItemsWithProducts);
      setNotificationSent(adminNotified);

      // Clear cart
      await clearCart();

      // Show success state
      setOrderSubmitted(true);
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to process order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const subtotal = totalPrice;
  const total = subtotal;

  if (items.length === 0 && !orderSubmitted) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center bg-gray-50 min-h-screen">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
        <p className="text-gray-600 mb-8">Add some items to your cart before checkout.</p>
        <Button onClick={() => navigate('/categories')}>Continue Shopping</Button>
      </div>
    );
  }

  // Success state after order submission
  if (orderSubmitted) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-gray-50 min-h-screen">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Order Submitted Successfully!</h2>
          
          {notificationSent ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                Admin Notification Sent ✓
              </h3>
              <p className="text-green-700">
                Your order details have been successfully sent to our admin team. 
                You will be contacted shortly to confirm your order and arrange delivery.
              </p>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                Order Received
              </h3>
              <p className="text-yellow-700">
                Your order has been received. Our team will contact you soon to confirm the details.
              </p>
            </div>
          )}

          <div className="space-y-4">
            <p className="text-gray-600">
              Thank you for shopping with Neyma! 
            </p>
            <p className="text-sm text-gray-500">
              You can track your order status in your account dashboard.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Button onClick={() => navigate('/orders')}>
              View Order History
            </Button>
            <Button variant="outline" onClick={() => navigate('/categories')}>
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Checkout Form */}
        <div className="space-y-8">
          {/* Shipping Information */}
          <div className="bg-white rounded-lg shadow-sm border p-6 border-gray-200">
            <div className="flex items-center mb-4">
              <MapPin className="w-5 h-5 text-amber-900 mr-2" />
              <h2 className="text-xl font-semibold">Contact & Pickup Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                name="full_name"
                value={shippingInfo.full_name}
                onChange={handleInputChange()}
                required
              />
              <Input
                label="Email"
                name="email"
                type="email"
                value={shippingInfo.email}
                onChange={handleInputChange()}
                required
              />
              <Input
                label="Phone Number"
                name="phone_number"
                type="tel"
                value={shippingInfo.phone_number}
                onChange={handleInputChange()}
                placeholder="+234 XXX XXX XXXX"
              />
              <Input
                label="WhatsApp Number"
                name="whatsapp_number"
                value={shippingInfo.whatsapp_number}
                onChange={handleInputChange()}
                placeholder="+234 XXX XXX XXXX"
                required
              />
              <div />
              <Input
                label="Pickup Location"
                name="pickup_location"
                value={shippingInfo.pickup_location}
                onChange={handleInputChange()}
                className="md:col-span-2"
                placeholder="Preferred pickup location or address"
                required
              />
              <Input
                label="City"
                name="city"
                value={shippingInfo.city}
                onChange={handleInputChange()}
                required
              />
              <Input
                label="State"
                name="state"
                value={shippingInfo.state}
                onChange={handleInputChange()}
                required
              />
            </div>
          </div>

          {/* Order Information */}
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Order Process</h3>
                <div className="text-sm text-blue-800 space-y-2">
                  <p>• After submitting your order, our admin team will be notified immediately</p>
                  <p>• We will contact you via WhatsApp to confirm your order details</p>
                  <p>• Payment will be arranged during the confirmation call</p>
                  <p>• Pickup or delivery will be coordinated based on your preferred location</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-24 border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
            
            {/* Order Items */}
            <div className="space-y-3 mb-6">
              {items.map((item) => {
                const product = item.product;
                if (!product) return null;

                return (
                  <div key={item.id} className="flex items-center space-x-3">
                    <img
                      src={product.product_images?.[0]?.image_url || 'https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg'}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      {item.size && <p className="text-xs text-gray-500">Size: {item.size}</p>}
                      {item.color && <p className="text-xs text-gray-500">Color: {item.color}</p>}
                    </div>
                    <span className="text-sm font-medium">{formatPrice(product.price * item.quantity)}</span>
                  </div>
                );
              })}
            </div>
            
            {/* Totals */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-green-700">{formatPrice(total)}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
              <p className="text-sm text-blue-800">
                ℹ️ Final pricing including delivery charges will be confirmed during our call
              </p>
            </div>
            
            <Button
              type="submit"
              disabled={loading}
              size="lg"
              className="w-full"
            >
              {loading ? 'Submitting Order...' : `Submit Order - ${formatPrice(total)}`}
            </Button>

            <p className="text-center text-sm text-gray-600 mt-4">
              By submitting this order, you agree to be contacted via WhatsApp for order confirmation
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}