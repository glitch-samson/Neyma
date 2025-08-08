import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Filter, SlidersHorizontal, Grid, List, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ProductCard } from '../components/ProductCard';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { capitalizeFirst } from '../lib/utils';
import { useAuth } from '../hooks/useAuth';

export function ProductListing({ gender }) {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  
  // Filters
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [user, gender, selectedCategory, priceRange, sortBy]);

  const fetchCategories = async () => {
    try {
      const query = supabase
        .from('categories')
        .select('*')
        .eq('is_active', true);
      
      if (gender) {
        query.eq('gender', gender);
      }
      
      const { data } = await query;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      let query = supabase
        .from('products')
        .select(`
          *,
          product_images(*),
          category:categories(*)
        `)
        .eq('is_active', true);

      if (gender) {
        query = query.eq('gender', gender);
      }

      if (selectedCategory) {
        query = query.eq('category_id', selectedCategory);
      }

      if (priceRange.min) {
        query = query.gte('price', parseFloat(priceRange.min));
      }

      if (priceRange.max) {
        query = query.lte('price', parseFloat(priceRange.max));
      }

      // Sorting
      switch (sortBy) {
        case 'price_low':
          query = query.order('price', { ascending: true });
          break;
        case 'price_high':
          query = query.order('price', { ascending: false });
          break;
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        default:
          query = query.order('name', { ascending: true });
      }

      const { data } = await query;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setPriceRange({ min: '', max: '' });
    setSortBy('name');
  };

  const sortOptions = [
    { value: 'name', label: 'Name A-Z' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' },
    { value: 'newest', label: 'Newest First' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-900"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {gender ? `${capitalizeFirst(gender)}'s Collection` : 'All Products'}
        </h1>
        <p className="text-xl text-gray-600">
          Discover our premium selection of {gender ? `${gender}'s` : ''} fashion
        </p>
      </div>

      {/* Filters and Sort */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Filters */}
        <div className={`lg:w-64 ${showFilters ? 'block' : 'hidden lg:block'}`}>
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Filters</h3>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear All
              </Button>
            </div>

            {/* Category Filter */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                options={[
                  { value: '', label: 'All Categories' },
                  ...categories.map(cat => ({ value: cat.id, label: cat.name }))
                ]}
              />
            </div>

            {/* Price Range Filter */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Range (₦)
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-900"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-900"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Top Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div className="flex items-center space-x-4 mb-4 sm:mb-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
              
              <span className="text-sm text-gray-600">
                {products.length} products found
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                options={sortOptions}
                className="w-48"
              />
              
              <div className="flex border border-gray-300 rounded-md">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-green-700 text-white' : 'text-gray-600'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-green-700 text-white' : 'text-gray-600'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {products.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-gray-400 text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600">Try adjusting your filters or search criteria</p>
            </div>
          ) : (
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1'
            }`}>
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  className={viewMode === 'list' ? 'flex' : ''}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}