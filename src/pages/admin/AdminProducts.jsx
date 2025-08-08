import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Filter } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { formatPrice } from '../../lib/utils';

export function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    gender: 'unisex',
    stock: '',
    is_featured: false,
    sizes: '',
    colors: '',
    images: [],
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*),
          product_images(*)
        `)
        .order('created_at', { ascending: false });

      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true);

      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category_id: formData.category_id,
        gender: formData.gender,
        stock: parseInt(formData.stock),
        is_featured: formData.is_featured,
        sizes: formData.sizes ? formData.sizes.split(',').map(s => s.trim()) : [],
        colors: formData.colors ? formData.colors.split(',').map(c => c.trim()) : [],
      };

      let productId;
      if (editingProduct) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);

        if (error) throw error;
        productId = editingProduct.id;
      } else {
        // Create new product
        const { data: newProduct, error } = await supabase
          .from('products')
          .insert([productData])
          .select()
          .single();

        if (error) throw error;
        productId = newProduct.id;
      }

      // Handle image uploads
      if (formData.images.length > 0) {
        const imagePromises = formData.images.map(async (imageFile, index) => {
          // Convert file to base64 for storage (in a real app, you'd upload to storage)
          const reader = new FileReader();
          return new Promise((resolve) => {
            reader.onload = async () => {
              const { error: imageError } = await supabase
                .from('product_images')
                .insert([{
                  product_id: productId,
                  image_url: reader.result, // In production, upload to storage and use URL
                  alt_text: `${formData.name} image ${index + 1}`,
                  is_primary: index === 0,
                  sort_order: index
                }]);
              
              if (imageError) console.error('Error uploading image:', imageError);
              resolve();
            };
            reader.readAsDataURL(imageFile);
          });
        });
        
        await Promise.all(imagePromises);
      }

      resetForm();
      fetchProducts();
      alert('Product saved successfully!');
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      category_id: product.category_id,
      gender: product.gender,
      stock: product.stock.toString(),
      is_featured: product.is_featured,
      sizes: product.sizes?.join(', ') || '',
      colors: product.colors?.join(', ') || '',
      images: [],
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category_id: '',
      gender: 'unisex',
      stock: '',
      is_featured: false,
      sizes: '',
      colors: '',
      images: [],
    });
    setEditingProduct(null);
    setShowModal(false);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({ ...prev, images: files }));
  };
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600">Manage your product inventory</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="mt-4 sm:mt-0">
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
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
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
          <Select
            label="Category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            options={[
              { value: '', label: 'All Categories' },
              ...categories.map(cat => ({ value: cat.id, label: cat.name }))
            ]}
          />
          <div className="flex items-end">
            <Button variant="outline" onClick={() => { setSearchTerm(''); setSelectedCategory(''); }}>
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
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
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={product.product_images?.[0]?.image_url || 'https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg'}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500 capitalize">{product.gender}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.category?.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatPrice(product.price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.stock}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      {product.is_active ? (
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                          Inactive
                        </span>
                      )}
                      {product.is_featured && (
                        <span className="px-2 py-1 text-xs font-medium bg-amber-100 text-amber-800 rounded-full">
                          Featured
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-green-600 hover:text-green-900"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Modal */}
      <Modal
        isOpen={showModal}
        onClose={resetForm}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
        className="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Product Name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
            <Input
              label="Price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
              required
            />
            <Select
              label="Category"
              value={formData.category_id}
              onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
              options={[
                { value: '', label: 'Select Category' },
                ...categories.map(cat => ({ value: cat.id, label: cat.name }))
              ]}
              required
            />
            <Select
              label="Gender"
              value={formData.gender}
              onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
              options={[
                { value: 'men', label: 'Men' },
                { value: 'women', label: 'Women' },
                { value: 'unisex', label: 'Unisex' }
              ]}
            />
            <Input
              label="Stock"
              type="number"
              value={formData.stock}
              onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
              required
            />
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_featured"
                checked={formData.is_featured}
                onChange={(e) => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
                className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
              />
              <label htmlFor="is_featured" className="text-sm font-medium text-gray-700">
                Featured Product
              </label>
            </div>
          </div>
          
          <Input
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Sizes (comma-separated)"
              value={formData.sizes}
              onChange={(e) => setFormData(prev => ({ ...prev, sizes: e.target.value }))}
              placeholder="S, M, L, XL"
            />
            <Input
              label="Colors (comma-separated)"
              value={formData.colors}
              onChange={(e) => setFormData(prev => ({ ...prev, colors: e.target.value }))}
              placeholder="Red, Blue, Black"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Images
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-900"
            />
            <p className="text-sm text-gray-500 mt-1">
              Select multiple images. First image will be set as primary.
            </p>
            {formData.images.length > 0 && (
              <div className="mt-2">
                <p className="text-sm text-gray-600">
                  {formData.images.length} image(s) selected
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancel
            </Button>
            <Button type="submit">
              {editingProduct ? 'Update Product' : 'Add Product'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}