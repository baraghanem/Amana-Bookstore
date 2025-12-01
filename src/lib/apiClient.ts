// lib/apiClient.ts
// Client-side utility functions for making API calls

import { Book, Review, CartItem } from '@/app/types';

export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
}

// Cart response type with enriched items
export interface CartResponse {
    items: Array<CartItem & { book: Book | null }>;
    subtotal: number;
    itemCount: number;
}

// Books API
export const booksApi = {
    /**
     * Fetch books with optional filters, search, and pagination
     */
    getAll: async (params?: {
        search?: string;
        genre?: string;
        sort?: string;
        page?: number;
        limit?: number;
        featured?: boolean;
        inStock?: boolean;
    }): Promise<ApiResponse<Book[]>> => {
        const searchParams = new URLSearchParams();

        if (params?.search) searchParams.set('search', params.search);
        if (params?.genre) searchParams.set('genre', params.genre);
        if (params?.sort) searchParams.set('sort', params.sort);
        if (params?.page) searchParams.set('page', params.page.toString());
        if (params?.limit) searchParams.set('limit', params.limit.toString());
        if (params?.featured) searchParams.set('featured', 'true');
        if (params?.inStock) searchParams.set('inStock', 'true');

        const url = `/api/books?${searchParams.toString()}`;
        const response = await fetch(url);
        return response.json();
    },

    /**
     * Get a single book by ID
     */
    getById: async (id: string): Promise<ApiResponse<Book>> => {
        const response = await fetch(`/api/books/${id}`);
        return response.json();
    }
};

// Reviews API
export const reviewsApi = {
    /**
     * Get reviews for a specific book
     */
    getByBookId: async (bookId: string): Promise<ApiResponse<Review[]>> => {
        const response = await fetch(`/api/reviews?bookId=${bookId}`);
        return response.json();
    },

    /**
     * Submit a new review
     */
    create: async (reviewData: {
        bookId: string;
        author: string;
        rating: number;
        title: string;
        comment: string;
    }): Promise<ApiResponse> => {
        const response = await fetch('/api/reviews', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reviewData)
        });
        return response.json();
    }
};

// Cart API
export const cartApi = {
    /**
     * Get cart items for a user
     */
    get: async (userId: string = 'guest'): Promise<ApiResponse<CartResponse>> => {
        const response = await fetch(`/api/cart?userId=${userId}`);
        return response.json();
    },

    /**
     * Add item to cart
     */
    add: async (data: {
        userId?: string;
        bookId: string;
        quantity?: number;
    }): Promise<ApiResponse<CartItem>> => {
        const response = await fetch('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: data.userId || 'guest',
                bookId: data.bookId,
                quantity: data.quantity || 1
            })
        });
        return response.json();
    },

    /**
     * Update cart item quantity
     */
    update: async (data: {
        userId?: string;
        itemId: string;
        quantity: number;
    }): Promise<ApiResponse<void>> => {
        const response = await fetch('/api/cart', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: data.userId || 'guest',
                itemId: data.itemId,
                quantity: data.quantity
            })
        });
        return response.json();
    },

    /**
     * Remove item from cart
     */
    remove: async (itemId: string, userId: string = 'guest'): Promise<ApiResponse<void>> => {
        const response = await fetch(`/api/cart?itemId=${itemId}&userId=${userId}`, {
            method: 'DELETE'
        });
        return response.json();
    }
};

// Helper function for error handling
export const handleApiError = (error: unknown): string => {
    if (typeof error === 'object' && error !== null) {
        if ('error' in error && typeof error.error === 'string') {
            return error.error;
        }
        if ('message' in error && typeof error.message === 'string') {
            return error.message;
        }
    }
    return 'An unexpected error occurred';
};
