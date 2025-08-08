import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, ShoppingCart, User, Search } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useCart } from '../../hooks/useCart'
import { Button } from '../ui/Button'

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user, profile, signOut } = useAuth()
  const { totalItems } = useCart()
  const location = useLocation()

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Men', href: '/men' },
    { name: 'Women', href: '/women' },
    { name: 'Categories', href: '/categories' },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-700 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">N</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Neyma</span>
            </Link>
          </div>

          {/* Desktop Navigation - Only show if user is authenticated */}
          {user && (
            <nav className="hidden md:flex space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'text-amber-900 border-b-2 border-amber-900'
                      : 'text-gray-700 hover:text-amber-900'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          )}

          {/* Right side icons */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <button className="text-gray-700 hover:text-amber-900 transition-colors">
                  <Search size={20} />
                </button>
                
                <Link
                  to="/cart"
                  className="relative text-gray-700 hover:text-amber-900 transition-colors group"
                >
                  <ShoppingCart size={20} />
                  {totalItems > 0 && (
                    <>
                      <span className="absolute -top-2 -right-2 bg-amber-900 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                        {totalItems}
                      </span>
                      <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                    </>
                  )}
                </Link>
                
                <div className="relative group">
                  <button className="flex items-center space-x-1 text-gray-700 hover:text-amber-900 transition-colors">
                    <User size={20} />
                    <span className="text-sm">{profile?.full_name}</span>
                  </button>
                  
                  {/* User dropdown */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 invisible group-hover:visible transition-all border border-gray-200">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-amber-50"
                    >
                      Profile
                    </Link>
                    <Link
                      to="/orders"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-amber-50"
                    >
                      Orders
                    </Link>
                    {profile?.role === 'admin' && (
                      <Link
                        to="/admin"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-amber-50"
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={signOut}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-amber-50"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>

                {/* Mobile menu button */}
                <button
                  className="md:hidden text-gray-700 hover:text-amber-900 transition-colors"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="outline" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu - Only show if user is authenticated */}
      {isMobileMenuOpen && user && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive(item.href)
                    ? 'text-green-700 bg-green-50'
                    : 'text-gray-700 hover:text-green-700 hover:bg-gray-50'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}