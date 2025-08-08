import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart, Lock } from 'lucide-react';
import { formatPrice } from '../lib/utils';
import { Button } from './ui/Button';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';

export function ProductCard({ product, className = '' }) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  
  const primaryImage = product.product_images?.find(img => img.is_primary)?.image_url || 
                      product.product_images?.[0]?.image_url || 
                      'https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg';

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!user) {
      // This shouldn't happen since ProductCard is only shown to authenticated users
      return;
    }
    
    try {
      await addToCart(product.id);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  return (
    <div className={`group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-200 ${className}`}>
      <Link to={`/product/${product.id}`}>
        <div className="aspect-square overflow-hidden relative">
          <img
            src={primaryImage}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        
        <div className="p-4">
          <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
          
          <div className="flex items-center justify-between mb-3">
            <span className="text-2xl font-bold text-green-700">{formatPrice(product.price)}</span>
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm text-gray-600">4.5</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </span>
            
            {product.stock > 0 && (
              <Button
                size="sm"
                onClick={handleAddToCart}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ShoppingCart className="w-4 h-4 mr-1" />
                Add to Cart
              </Button>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}