import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Search, X, ArrowRight } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { formatPrice } from '../lib/utils'
import { Modal } from './ui/Modal'

export function SearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef(null)
  const resultsRef = useRef([])

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Search products as user types
  useEffect(() => {
    const searchProducts = async () => {
      if (!query.trim()) {
        setResults([])
        return
      }

      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('products')
          .select(`
            id,
            name,
            description,
            price,
            stock,
            product_images(image_url, is_primary),
            category:categories(name)
          `)
          .eq('is_active', true)
          .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
          .order('name')
          .limit(8)

        if (error) throw error
        setResults(data || [])
      } catch (error) {
        console.error('Error searching products:', error)
        setResults([])
      } finally {
        setLoading(false)
      }
    }

    const debounceTimer = setTimeout(searchProducts, 300)
    return () => clearTimeout(debounceTimer)
  }, [query])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => Math.min(prev + 1, results.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => Math.max(prev - 1, -1))
          break
        case 'Enter':
          e.preventDefault()
          if (selectedIndex >= 0 && results[selectedIndex]) {
            handleResultClick(results[selectedIndex])
          }
          break
        case 'Escape':
          onClose()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, results, selectedIndex, onClose])

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && resultsRef.current[selectedIndex]) {
      resultsRef.current[selectedIndex].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      })
    }
  }, [selectedIndex])

  const handleResultClick = (product) => {
    onClose()
    setQuery('')
    setResults([])
    setSelectedIndex(-1)
  }

  const handleClose = () => {
    onClose()
    setQuery('')
    setResults([])
    setSelectedIndex(-1)
  }

  const getPrimaryImage = (product) => {
    return product.product_images?.find(img => img.is_primary)?.image_url || 
           product.product_images?.[0]?.image_url || 
           'https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg'
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose}
      className="max-w-2xl"
    >
      <div className="relative">
        {/* Search Input */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search for products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900 focus:border-amber-900 text-lg"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Search Results */}
        <div className="max-h-96 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-900"></div>
              <span className="ml-2 text-gray-600">Searching...</span>
            </div>
          )}

          {!loading && query && results.length === 0 && (
            <div className="text-center py-8">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No products found for "{query}"</p>
              <p className="text-sm text-gray-500 mt-1">Try different keywords</p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600 mb-3">
                Found {results.length} product{results.length !== 1 ? 's' : ''}
              </p>
              
              {results.map((product, index) => (
                <Link
                  key={product.id}
                  to={`/product/${product.id}`}
                  onClick={() => handleResultClick(product)}
                  ref={(el) => resultsRef.current[index] = el}
                  className={`flex items-center p-3 rounded-lg transition-colors border ${
                    index === selectedIndex 
                      ? 'bg-amber-50 border-amber-200' 
                      : 'hover:bg-gray-50 border-transparent'
                  }`}
                >
                  <img
                    src={getPrimaryImage(product)}
                    alt={product.name}
                    className="w-12 h-12 object-cover rounded-md flex-shrink-0"
                  />
                  
                  <div className="ml-3 flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-600 truncate">
                      {product.category?.name}
                    </p>
                    <p className="text-sm font-semibold text-amber-900">
                      {formatPrice(product.price)}
                    </p>
                  </div>

                  <div className="ml-3 flex-shrink-0">
                    {product.stock > 0 ? (
                      <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                        In Stock
                      </span>
                    ) : (
                      <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded-full">
                        Out of Stock
                      </span>
                    )}
                  </div>

                  <ArrowRight className="w-4 h-4 text-gray-400 ml-2 flex-shrink-0" />
                </Link>
              ))}
            </div>
          )}

          {!query && (
            <div className="text-center py-8">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">Start typing to search products</p>
              <p className="text-sm text-gray-500 mt-1">Search by name or description</p>
            </div>
          )}
        </div>

        {/* Keyboard Hints */}
        {results.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>↑↓ Navigate</span>
              <span>↵ Select</span>
              <span>ESC Close</span>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
