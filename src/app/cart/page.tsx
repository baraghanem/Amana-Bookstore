// src/app/cart/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CartItem from '../components/CartItem';
import { Book } from '../types';
import { cartApi } from '@/lib/apiClient';

export default function CartPage() {
  const [cartItems, setCartItems] = useState<{ book: Book; quantity: number; id: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCart = async () => {
    try {
      setIsLoading(true);
      const response = await cartApi.get();

      if (response.success && response.data) {
        // The API returns enriched items with book details
        // Filter out items where book is null and map to component state structure
        setCartItems(
          response.data.items
            .filter((item) => item.book !== null)
            .map((item) => ({
              book: item.book!,
              quantity: item.quantity,
              id: item.id // Cart item ID
            }))
        );
      } else {
        setError(response.error || 'Failed to load cart');
      }
    } catch (err) {
      console.error('Failed to load cart:', err);
      setError('Failed to load cart');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const updateQuantity = async (bookId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    // Find the item ID using bookId
    const item = cartItems.find(i => i.book.id === bookId);
    if (!item) return;

    try {
      const response = await cartApi.update({
        itemId: item.id,
        quantity: newQuantity
      });

      if (response.success) {
        loadCart();
        window.dispatchEvent(new CustomEvent('cartUpdated'));
      } else {
        alert('Failed to update quantity');
      }
    } catch (err) {
      console.error('Error updating quantity:', err);
      alert('Failed to update quantity');
    }
  };

  const removeItem = async (bookId: string) => {
    // Find the item ID using bookId
    const item = cartItems.find(i => i.book.id === bookId);
    if (!item) return;

    try {
      const response = await cartApi.remove(item.id);

      if (response.success) {
        loadCart();
        window.dispatchEvent(new CustomEvent('cartUpdated'));
      } else {
        alert('Failed to remove item');
      }
    } catch (err) {
      console.error('Error removing item:', err);
      alert('Failed to remove item');
    }
  };

  const clearCart = async () => {
    if (!confirm('Are you sure you want to clear your cart?')) return;

    try {
      // Remove all items one by one since we don't have a clear endpoint yet
      await Promise.all(cartItems.map(item => cartApi.remove(item.id)));
      loadCart();
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (err) {
      console.error('Error clearing cart:', err);
      alert('Failed to clear cart');
    }
  };

  const totalPrice = cartItems.reduce((total, item) => total + (item.book.price * item.quantity), 0);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading cart...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-red-700 mb-2">Error Loading Cart</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadCart}
            className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition-colors cursor-pointer"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <h2 className="text-xl text-gray-600 mb-4">Your cart is empty</h2>
          <Link href="/" className="bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 transition-colors cursor-pointer">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-md">
            {cartItems.map((item) => (
              <CartItem
                key={item.book.id}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemoveItem={removeItem}
              />
            ))}
          </div>

          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center text-xl font-bold mb-4 text-gray-800">
              <span>Total: ${totalPrice.toFixed(2)}</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/" className="flex-1 bg-gray-500 text-white text-center py-3 rounded-md hover:bg-gray-600 transition-colors cursor-pointer">
                Continue Shopping
              </Link>
              <button
                onClick={clearCart}
                className="flex-1 bg-red-500 text-white py-3 rounded-md hover:bg-red-600 transition-colors cursor-pointer"
              >
                Clear Cart
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}