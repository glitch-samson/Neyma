import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Package, ShoppingCart, TrendingUp, Eye, Edit, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatPrice, formatDate } from '../../lib/utils';
import { Button } from '../../components/ui/Button';

export function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalUsers: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch stats
      const [
        { count: productsCount },
        { count: ordersCount },
        { count: usersCount },
        { data: orders },
        { data: products }
      ] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*, order_items(*, product:products(*))').order('created_at', { ascending: false }).limit(5),
        supabase.from('products').select('*, product_images(*)').eq('is_featured', true).limit(5)
      ]);

      const totalRevenue = orders?.reduce((sum, order) => sum + order.total_amount, 0) || 0;

      setStats({
        totalProducts: productsCount || 0,
        totalOrders: ordersCount || 0,
        totalRevenue,
        totalUsers: usersCount || 0,
      });

      setRecentOrders(orders || []);
      setTopProducts(products || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Total Revenue',
      value: formatPrice(stats.totalRevenue),
      icon: TrendingUp,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Manage your Neyma store</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Link to="/admin/products" className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Manage Products</h3>
              <p className="text-gray-600">Add, edit, and organize products</p>
            </div>
            <Package className="w-8 h-8 text-green-600" />
          </div>
        </Link>
        
        <Link to="/admin/categories" className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Manage Categories</h3>
              <p className="text-gray-600">Organize product categories</p>
            </div>
            <Package className="w-8 h-8 text-amber-600" />
          </div>
        </Link>
        
        <Link to="/admin/orders" className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Manage Orders</h3>
              <p className="text-gray-600">Process and track orders</p>
            </div>
            <ShoppingCart className="w-8 h-8 text-amber-600" />
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
              <Link to="/admin/orders">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">#{order.id.slice(-8)}</p>
                    <p className="text-sm text-gray-600">{formatDate(order.created_at)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatPrice(order.total_amount)}</p>
                    <p className={`text-sm capitalize ${
                      order.status === 'delivered' ? 'text-green-600' : 
                      order.status === 'pending' ? 'text-yellow-600' : 'text-blue-600'
                    }`}>
                      {order.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Featured Products</h2>
              <Link to="/admin/products">
                <Button variant="outline" size="sm">Manage</Button>
              </Link>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {topProducts.map((product) => (
                <div key={product.id} className="flex items-center space-x-3">
                  <img
                    src={product.product_images?.[0]?.image_url || 'https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg'}
                    alt={product.name}
                    className="w-12 h-12 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-gray-600">{formatPrice(product.price)}</p>
                  </div>
                  <div className="flex space-x-1">
                    <button className="p-1 text-gray-400 hover:text-amber-600">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-amber-600">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}