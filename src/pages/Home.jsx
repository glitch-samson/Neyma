import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Users, Award, Truck, Tag, Zap, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ProductCard } from '../components/ProductCard';
import { ImageSlider } from '../components/ImageSlider';
import { Button } from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';

export function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      // Fetch featured products
      const { data: products } = await supabase
        .from('products')
        .select(`
          *,
          product_images(*),
          category:categories(*)
        `)
        .eq('is_featured', true)
        .eq('is_active', true)
        .limit(8);

      // Fetch categories
      const { data: cats } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true);

      setFeaturedProducts(products || []);
      setCategories(cats || []);
    } catch (error) {
      console.error('Error fetching home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const sliderSlides = [
    {
      image: 'https://images.pexels.com/photos/994523/pexels-photo-994523.jpeg',
      title: 'New Arrivals',
      description: 'Discover the latest fashion trends for this season',
      buttonText: 'Shop Now',
      buttonLink: '/categories'
    },
    {
      image: 'https://images.pexels.com/photos/336372/pexels-photo-336372.jpeg',
      title: 'Flash Sale',
      description: 'Up to 50% off on selected items - Limited time only!',
      buttonText: 'Shop Sale',
      buttonLink: '/categories'
    },
    {
      image: 'https://images.pexels.com/photos/292999/pexels-photo-292999.jpeg',
      title: 'Premium Collection',
      description: 'Luxury shoes and accessories for the discerning customer',
      buttonText: 'Explore',
      buttonLink: '/categories'
    }
  ];

  const stats = [
    { icon: Users, label: 'Happy Customers', value: '10K+' },
    { icon: Star, label: 'Products Sold', value: '50K+' },
    { icon: Award, label: 'Years of Excellence', value: '15+' },
    { icon: Truck, label: 'Orders Delivered', value: '25K+' },
  ];

  const features = [
    {
      title: 'Premium Quality',
      description: 'Carefully curated products from trusted brands',
      icon: Award,
    },
    {
      title: 'Fast Delivery',
      description: 'Free shipping on orders over ₦50,000',
      icon: Truck,
    },
    {
      title: 'Easy Returns',
      description: '30-day hassle-free return policy',
      icon: Star,
    },
  ];

  const promotions = [
    {
      icon: Tag,
      title: 'Flash Sale',
      description: 'Up to 50% off selected items',
      color: 'bg-red-100 text-red-800'
    },
    {
      icon: Zap,
      title: 'New Arrivals',
      description: 'Latest fashion trends just in',
      color: 'bg-blue-100 text-blue-800'
    },
    {
      icon: Clock,
      title: 'Limited Time',
      description: 'Special offers ending soon',
      color: 'bg-amber-100 text-amber-800'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Image Slider */}
      <section className="relative bg-gradient-to-br from-amber-50 to-orange-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-12">
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                Discover Your
                <span className="block text-green-700">Perfect Style</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Explore our curated collection of premium shoes, bags, and clothing for men and women. Quality meets style in every piece.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to={user ? "/categories" : "/login"}>
                  <Button size="lg" className="w-full sm:w-auto">
                    Shop Our Collection
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                {!user && (
                  <Link to="/register">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto">
                      Create Account
                    </Button>
                  </Link>
                )}
              </div>
            </div>
            <div className="relative">
              <ImageSlider slides={sliderSlides} />
            </div>
          </div>

          {/* Promotions Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {promotions.map((promo, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-md border border-gray-200 text-center">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-4 ${promo.color}`}>
                  <promo.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{promo.title}</h3>
                <p className="text-gray-600">{promo.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Shop by Category</h2>
            <p className="text-xl text-gray-600">Discover our diverse range of products</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={user ? `/${category.gender}?category=${category.id}` : '/login'}
                className="group relative bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-200"
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={category.image_url || 'https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg'}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-white text-xl font-bold mb-1">{category.name}</h3>
                  <p className="text-white/80 text-sm capitalize">{category.gender}'s Collection</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Products</h2>
            <p className="text-xl text-gray-600">Handpicked items just for you</p>
            {!user && (
              <p className="text-amber-900 font-medium mt-2">Sign in to view and purchase products</p>
            )}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link to={user ? "/categories" : "/login"}>
              <Button variant="outline" size="lg">
                View All Products
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-green-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  <stat.icon className="w-12 h-12 text-white" />
                </div>
                <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-green-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Neyma?</h2>
            <p className="text-xl text-gray-600">Experience the difference of premium quality</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-8 rounded-2xl bg-gray-50 hover:bg-green-50 transition-colors border border-gray-200">
                <div className="flex justify-center mb-6">
                  <feature.icon className="w-16 h-16 text-green-700" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}