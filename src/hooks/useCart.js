import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import { useAlert } from './useAlert'

export function useCart() {
  const { user } = useAuth()
  const { showSuccess, showError } = useAlert()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchCart()
    } else {
      setItems([])
      setLoading(false)
    }
  }, [user])

  const fetchCart = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          product:products(
            *,
            product_images(*)
          )
        `)
        .eq('user_id', user.id)

      if (error) {
        // Check if JWT is expired and sign out user
        if (error.code === 'PGRST301' || error.message?.includes('JWT expired')) {
          console.log('JWT expired, signing out user')
          await supabase.auth.signOut()
          return
        }
        console.error('Error fetching cart:', error)
      } else {
        setItems(data || [])
      }
    } catch (error) {
      // Check if JWT is expired and sign out user
      if (error.code === 'PGRST301' || error.message?.includes('JWT expired')) {
        console.log('JWT expired, signing out user')
        await supabase.auth.signOut()
        return
      }
      console.error('Error fetching cart:', error)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = async (productId, quantity = 1, size, color) => {
    if (!user) {
      showError('Please sign in to add items to cart');
      return
    }

    try {
      // Check if item already exists
      const existingItem = items.find(
        item => item.product_id === productId && item.size === size && item.color === color
      )

      if (existingItem) {
        // Update quantity
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + quantity })
          .eq('id', existingItem.id)

        if (error) {
          throw error
        }
        showSuccess('🛒 Cart updated! Item quantity increased.');
      } else {
        // Add new item
        const { error } = await supabase
          .from('cart_items')
          .insert([
            {
              user_id: user.id,
              product_id: productId,
              quantity,
              size,
              color,
            },
          ])

        if (error) {
          throw error
        }
        showSuccess('🛒 Great choice! Item added to your cart.');
      }

      fetchCart()
    } catch (error) {
      console.error('Error adding to cart:', error)
      showError('Failed to add item to cart')
      throw error
    }
  }

  const updateCartItem = async (id, quantity) => {
    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', id)

      if (error) {
        throw error
      }

      fetchCart()
      showSuccess('Cart updated successfully')
    } catch (error) {
      console.error('Error updating cart item:', error)
      showError('Failed to update cart item')
      throw error
    }
  }

  const removeFromCart = async (id) => {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', id)

      if (error) {
        throw error
      }

      fetchCart()
      showSuccess('Item removed from cart')
    } catch (error) {
      console.error('Error removing from cart:', error)
      showError('Failed to remove item from cart')
      throw error
    }
  }

  const clearCart = async () => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id)

      if (error) {
        throw error
      }

      setItems([])
    } catch (error) {
      console.error('Error clearing cart:', error)
      throw error
    }
  }

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0)

  return {
    items,
    loading,
    totalItems,
    totalPrice,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
  }
}