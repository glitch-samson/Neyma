import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, ShoppingCart, Heart, Share2, Minus, Plus, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { formatPrice, formatDate } from '../lib/utils';

export function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { user } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (id) {
      fetchProduct();
      fetchReviews();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_images(*),
          category:categories(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      
      setProduct(data);
      if (data.sizes?.length > 0) {
        setSelectedSize(data.sizes[0]);
      }
      if (data.colors?.length > 0) {
        setSelectedColor(data.colors[0]);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const { data } = await supabase
        .from('reviews')
        .select(`
          *,
          profile:profiles(full_name)
        `)
        .eq('product_id', id)
        .order('created_at', { ascending: false });

      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      // Redirect to login if not authenticated
      window.location.href = '/login';
      return;
    }
    
    if (!product) return;
    
    try {
      await addToCart(product.id, quantity, selectedSize, selectedColor);
      // Show success message or redirect to cart
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-900"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h2>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  const images = product.product_images || [];
  const primaryImage = images.find(img => img.is_primary) || images[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 min-h-screen">
      {/* Breadcrumb */}
      <button
        onClick={() => window.history.back()}
        className="flex items-center text-gray-600 hover:text-amber-900 mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Products
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
            <img
              src={images[selectedImage]?.image_url || primaryImage?.image_url || 'https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImage === index ? 'border-amber-900' : 'border-gray-200'
                  }`}
                >
                  <img
                    src={image.image_url}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6 bg-white p-8 rounded-lg shadow-md border border-gray-200">
          <div>
            <p className="text-sm text-gray-600 mb-2">{product.category?.name}</p>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
            
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(averageRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="text-sm text-gray-600 ml-2">
                  ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                </span>
              </div>
            </div>
            
            <p className="text-4xl font-bold text-amber-900 mb-6">{formatPrice(product.price)}</p>
          </div>

          {product.description && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>
          )}

          {/* Product Options */}
          <div className="space-y-4">
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
                <Select
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                  options={product.sizes.map(size => ({ value: size, label: size }))}
                />
              </div>
            )}

            {product.colors && product.colors.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                <Select
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  options={product.colors.map(color => ({ value: color, label: color }))}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-lg font-medium px-4">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Stock Status */}
          <div className="text-sm">
            {product.stock > 0 ? (
              <p className="text-green-600">✓ In stock ({product.stock} available)</p>
            ) : (
              <p className="text-red-600">✗ Out of stock</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              size="lg"
              className="w-full"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Add to Cart
            </Button>
            
            <div className="flex space-x-4">
              <Button variant="outline" size="lg" className="flex-1">
                <Heart className="w-5 h-5 mr-2" />
                Save for Later
              </Button>
              <Button variant="outline" size="lg" className="flex-1">
                <Share2 className="w-5 h-5 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-16 bg-white p-8 rounded-lg shadow-md border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Customer Reviews</h2>
        
        {reviews.length === 0 ? (
          <p className="text-gray-600">No reviews yet. Be the first to review this product!</p>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-gray-900">{review.profile?.full_name}</h4>
                    <div className="flex items-center space-x-1 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">{formatDate(review.created_at)}</span>
                </div>
                {review.comment && (
                  <p className="text-gray-600 leading-relaxed">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}