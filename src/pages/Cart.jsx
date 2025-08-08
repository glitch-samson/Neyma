import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { formatPrice } from '../lib/utils';

export function Cart() {
  const { items, totalPrice, updateCartItem, removeFromCart, loading } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center bg-gray-50 min-h-screen">
        <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign in to view your cart</h2>
        <p className="text-gray-600 mb-8">You need to be logged in to access your shopping cart.</p>
        <Link to="/login">
          <Button>Sign In</Button>
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-900"></div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center bg-gray-50 min-h-screen">
        <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
        <p className="text-gray-600 mb-8">Looks like you haven't added anything to your cart yet.</p>
        <Link to="/categories">
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  const shipping = totalPrice >= 50000 ? 0 : 2500; // Free shipping over ₦50,000
  const finalTotal = totalPrice;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const product = item.product;
            if (!product) return null;

            const primaryImage = product.product_images?.find(img => img.is_primary)?.image_url || 
                               product.product_images?.[0]?.image_url || 
                               'https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg';

            return (
              <div key={item.id} className="bg-white rounded-lg shadow-sm border p-6 border-gray-200">
                <div className="flex items-start space-x-4">
                  <Link to={`/product/${product.id}`} className="flex-shrink-0">
                    <img
                      src={primaryImage}
                      alt={product.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  </Link>
                  
                  <div className="flex-1 min-w-0">
                    <Link to={`/product/${product.id}`}>
                      <h3 className="text-lg font-semibold text-gray-900 hover:text-amber-900 transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="text-sm text-gray-600 mt-1">{product.category?.name}</p>
                    
                    <div className="flex items-center space-x-4 mt-2">
                      {item.size && (
                        <span className="text-sm text-gray-600">Size: {item.size}</span>
                      )}
                      {item.color && (
                        <span className="text-sm text-gray-600">Color: {item.color}</span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => updateCartItem(item.id, Math.max(1, item.quantity - 1))}
                          className="p-1 border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-lg font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateCartItem(item.id, Math.min(product.stock, item.quantity + 1))}
                          className="p-1 border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <span className="text-lg font-bold text-amber-900">
                          {formatPrice(product.price * item.quantity)}
                        </span>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-24 border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{formatPrice(totalPrice)}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-green-700">
                    {formatPrice(finalTotal)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
              <p className="text-sm text-blue-800">
                ℹ️ Delivery charges may apply based on your location
              </p>
            </div>
            
            <Button
              onClick={() => navigate('/checkout')}
              size="lg"
              className="w-full mb-4"
            >
              Proceed to Checkout
            </Button>
            
            <Link to="/categories">
              <Button variant="outline" size="lg" className="w-full">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}