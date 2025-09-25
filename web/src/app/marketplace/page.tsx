'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingBagIcon,
  StarIcon,
  HeartIcon,
  CurrencyDollarIcon,
  SparklesIcon,
  GiftIcon,
  TruckIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
} from '@heroicons/react/24/outline';
import Layout from '@/components/Layout/Layout';
import SOVWallet from '@/components/SOVWallet/SOVWallet';
import InlineBonusDisplay from '@/components/UserTier/InlineBonusDisplay';
import ServiceBonusPreview from '@/components/Ranking/ServiceBonusPreview';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviews: number;
  category: string;
  brand: string;
  description: string;
  features: string[];
  inStock: boolean;
  discount?: number;
}

export default function MarketplacePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showSOVWallet, setShowSOVWallet] = useState(false);

  const categories = [
    { id: 'all', name: 'All Products', icon: Squares2X2Icon },
    { id: 'electronics', name: 'Electronics', icon: SparklesIcon },
    { id: 'fashion', name: 'Fashion', icon: HeartIcon },
    { id: 'home', name: 'Home & Garden', icon: ShieldCheckIcon },
    { id: 'sports', name: 'Sports', icon: TruckIcon },
  ];

  const mockProducts: Product[] = [
    {
      id: '1',
      name: 'iPhone 15 Pro Max',
      price: 25000000,
      originalPrice: 30000000,
      image: '/api/placeholder/300/300',
      rating: 4.8,
      reviews: 1250,
      category: 'electronics',
      brand: 'Apple',
      description: 'Latest iPhone with advanced camera system and A17 Pro chip',
      features: ['A17 Pro Chip', '48MP Camera', '5G Ready', 'Titanium Design'],
      inStock: true,
      discount: 17
    },
    {
      id: '2',
      name: 'Samsung Galaxy S24 Ultra',
      price: 22000000,
      originalPrice: 25000000,
      image: '/api/placeholder/300/300',
      rating: 4.7,
      reviews: 980,
      category: 'electronics',
      brand: 'Samsung',
      description: 'Premium Android smartphone with S Pen and advanced AI features',
      features: ['S Pen Included', '200MP Camera', 'AI Features', 'S Pen'],
      inStock: true,
      discount: 12
    },
    {
      id: '3',
      name: 'MacBook Pro M3',
      price: 35000000,
      originalPrice: 40000000,
      image: '/api/placeholder/300/300',
      rating: 4.9,
      reviews: 450,
      category: 'electronics',
      brand: 'Apple',
      description: 'Professional laptop with M3 chip and Liquid Retina XDR display',
      features: ['M3 Chip', 'Liquid Retina XDR', 'Up to 22h Battery', 'Pro Performance'],
      inStock: true,
      discount: 13
    },
    {
      id: '4',
      name: 'Nike Air Max 270',
      price: 2500000,
      originalPrice: 3000000,
      image: '/api/placeholder/300/300',
      rating: 4.6,
      reviews: 2100,
      category: 'fashion',
      brand: 'Nike',
      description: 'Comfortable running shoes with Air Max technology',
      features: ['Air Max Technology', 'Breathable Upper', 'Durable Outsole', 'Comfortable Fit'],
      inStock: true,
      discount: 17
    },
    {
      id: '5',
      name: 'Sony WH-1000XM5',
      price: 8000000,
      originalPrice: 10000000,
      image: '/api/placeholder/300/300',
      rating: 4.8,
      reviews: 3200,
      category: 'electronics',
      brand: 'Sony',
      description: 'Industry-leading noise canceling headphones with 30-hour battery life',
      features: ['Noise Canceling', '30h Battery', 'Hi-Res Audio', 'Comfortable'],
      inStock: true,
      discount: 20
    }
  ];

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setProducts(mockProducts);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'popular':
      default:
        return b.reviews - a.reviews;
    }
  });

  const renderProduct = (product: Product, index: number) => (
    <motion.div
      key={product.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300"
    >
      <div className="relative">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-48 object-cover"
        />
        {product.discount && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-sm font-bold">
            -{product.discount}%
          </div>
        )}
        <button className="absolute top-2 right-2 p-2 bg-white/80 rounded-full hover:bg-white transition-colors">
          <HeartIcon className="w-5 h-5 text-gray-600" />
        </button>
      </div>
      
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500">{product.brand}</span>
          <div className="flex items-center space-x-1">
            <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm text-gray-600">{product.rating}</span>
            <span className="text-sm text-gray-400">({product.reviews})</span>
          </div>
        </div>
        
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
        
        <div className="flex items-center space-x-2 mb-3">
          <span className="text-lg font-bold text-gray-900">{product.price.toLocaleString()} VND</span>
          {product.originalPrice && (
            <span className="text-sm text-gray-500 line-through">
              {product.originalPrice.toLocaleString()} VND
            </span>
          )}
        </div>
        
        {/* SOV Token Bonus Preview */}
        <div className="mb-3">
          <ServiceBonusPreview
            serviceType="marketplace"
            amount={product.price}
            category="shopping"
            compact={true}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium">
            Add to Cart
          </button>
          <button className="ml-2 p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
            <ShoppingBagIcon className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Marketplace</h1>
                <p className="text-gray-600 mt-1">Discover amazing products and earn SOV tokens</p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowSOVWallet(!showSOVWallet)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <CurrencyDollarIcon className="w-5 h-5" />
                  <span>SOV Wallet</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Bonus Display */}
          <InlineBonusDisplay
            serviceType="marketplace"
            amount={1000000}
            category="shopping"
            position="top"
            size="large"
          />

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Category Filter */}
              <div className="flex items-center space-x-2">
                <FunnelIcon className="w-5 h-5 text-gray-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div className="flex items-center space-x-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="popular">Most Popular</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>

              {/* View Mode */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <Squares2X2Icon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <ListBulletIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
            {loading ? (
              <div className="col-span-full flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : sortedProducts.length > 0 ? (
              sortedProducts.map((product, index) => renderProduct(product, index))
            ) : (
              <div className="col-span-full text-center py-12">
                <ShoppingBagIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </div>
        </div>

        {/* SOV Wallet Modal */}
        {showSOVWallet && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
              <SOVWallet />
              <button
                onClick={() => setShowSOVWallet(false)}
                className="mt-4 w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
