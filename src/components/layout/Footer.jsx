import React from 'react'
import { Link } from 'react-router-dom'
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <span className="text-xl font-bold">Tima's Collection</span>
            </div>
            <p className="text-gray-400">
              Your destination for premium shoes, bags, and clothing for men and women.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-amber-600 transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-green-600 transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-green-600 transition-colors">
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-green-600 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/men" className="text-gray-400 hover:text-green-600 transition-colors">
                  Men's Collection
                </Link>
              </li>
              <li>
                <Link to="/women" className="text-gray-400 hover:text-green-600 transition-colors">
                  Women's Collection
                </Link>
              </li>
              <li>
                <Link to="/categories" className="text-gray-400 hover:text-green-600 transition-colors">
                  Categories
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-green-600 transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="text-gray-400 hover:text-green-600 transition-colors">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link to="/returns" className="text-gray-400 hover:text-green-600 transition-colors">
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link to="/size-guide" className="text-gray-400 hover:text-green-600 transition-colors">
                  Size Guide
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <MapPin size={16} className="text-green-600" />
                <span className="text-gray-400 text-sm">123 Fashion Street, City, State 12345</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone size={16} className="text-green-600" />
                <span className="text-gray-400 text-sm">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail size={16} className="text-green-600" />
                <span className="text-gray-400 text-sm">info@neyma.com</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            © 2024 Neyma. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}