// src/app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import BookGrid from './components/BookGrid';
import { booksApi, cartApi } from '@/lib/apiClient';
import type { Book } from './types';

export default function HomePage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setIsLoading(true);
        const response = await booksApi.getAll({ limit: 100 }); // Get all books

        if (response.success && response.data) {
          setBooks(response.data);
        } else {
          setError(response.error || 'Failed to load books');
        }
      } catch (err) {
        setError('Failed to connect to the server');
        console.error('Error fetching books:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooks();
  }, []);

  // Cart handler - uses Cart API
  const handleAddToCart = async (bookId: string) => {
    try {
      const response = await cartApi.add({ bookId });

      if (response.success) {
        console.log(`Added book ${bookId} to cart`);
        alert('Book added to cart!');
        window.dispatchEvent(new CustomEvent('cartUpdated'));
      } else {
        console.error('Failed to add to cart:', response.error);
        alert('Failed to add book to cart. Please try again.');
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
      alert('An error occurred. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading books...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-red-700 mb-2">Error Loading Books</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
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
      {/* Welcome Section */}
      <section className="text-center bg-blue-100 p-8 rounded-lg mb-12 shadow-md">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-2">Welcome to the Amana Bookstore!</h1>
        <p className="text-lg text-gray-600">
          Your one-stop shop for the best books. Discover new worlds and adventures.
        </p>
      </section>

      {/* Book Grid */}
      <BookGrid books={books} onAddToCart={handleAddToCart} />
    </div>
  );
}
