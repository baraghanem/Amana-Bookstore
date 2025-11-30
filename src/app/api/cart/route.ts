// src/app/api/cart/route.ts
// Serverless API for cart operations - GET, POST, PUT, DELETE

import { NextRequest, NextResponse } from 'next/server';
import { getCartItemsCollection, getBooksCollection } from '@/lib/mongodb';
import type { CartItem } from '@/app/types';

// GET cart items for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'guest';

    const cartCollection = await getCartItemsCollection();
    const booksCollection = await getBooksCollection();

    // Get cart items for the user
    const cartItems = await cartCollection
      .find({ userId })
      .sort({ addedAt: -1 })
      .toArray();

    // Enrich cart items with book details
    const enrichedCart = await Promise.all(
      cartItems.map(async (item) => {
        const book = await booksCollection.findOne({ id: item.bookId });
        return {
          ...item,
          book: book || null
        };
      })
    );

    // Calculate totals
    const subtotal = enrichedCart.reduce((sum, item) => {
      if (item.book) {
        return sum + (item.book.price * item.quantity);
      }
      return sum;
    }, 0);

    const itemCount = enrichedCart.reduce((sum, item) => sum + item.quantity, 0);

    return NextResponse.json({
      success: true,
      data: {
        items: enrichedCart,
        subtotal: parseFloat(subtotal.toFixed(2)),
        itemCount
      }
    });

  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch cart',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST - Add item to cart
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId = 'guest', bookId, quantity = 1 } = body;

    if (!bookId) {
      return NextResponse.json(
        {
          success: false,
          error: 'bookId is required'
        },
        { status: 400 }
      );
    }

    // Validate quantity
    if (quantity < 1) {
      return NextResponse.json(
        {
          success: false,
          error: 'Quantity must be at least 1'
        },
        { status: 400 }
      );
    }

    // Check if book exists
    const booksCollection = await getBooksCollection();
    const book = await booksCollection.findOne({ id: bookId });

    if (!book) {
      return NextResponse.json(
        {
          success: false,
          error: 'Book not found'
        },
        { status: 404 }
      );
    }

    // Check if book is in stock
    if (!book.inStock) {
      return NextResponse.json(
        {
          success: false,
          error: 'Book is out of stock'
        },
        { status: 400 }
      );
    }

    const cartCollection = await getCartItemsCollection();

    // Check if item already exists in cart
    const existingItem = await cartCollection.findOne({ userId, bookId });

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + quantity;
      await cartCollection.updateOne(
        { userId, bookId },
        { $set: { quantity: newQuantity } }
      );

      return NextResponse.json({
        success: true,
        message: 'Cart updated successfully',
        data: {
          ...existingItem,
          quantity: newQuantity
        }
      });
    } else {
      // Add new item
      const newItem: CartItem = {
        id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId,
        bookId,
        quantity,
        addedAt: new Date().toISOString()
      };

      await cartCollection.insertOne(newItem);

      return NextResponse.json({
        success: true,
        message: 'Item added to cart',
        data: newItem
      }, { status: 201 });
    }

  } catch (error) {
    console.error('Error adding to cart:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to add item to cart',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT - Update cart item quantity
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId = 'guest', itemId, quantity } = body;

    if (!itemId || quantity === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: 'itemId and quantity are required'
        },
        { status: 400 }
      );
    }

    if (quantity < 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Quantity cannot be negative'
        },
        { status: 400 }
      );
    }

    const cartCollection = await getCartItemsCollection();

    if (quantity === 0) {
      // Remove item if quantity is 0
      const result = await cartCollection.deleteOne({ id: itemId, userId });

      if (result.deletedCount === 0) {
        return NextResponse.json(
          {
            success: false,
            error: 'Cart item not found'
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Item removed from cart'
      });
    } else {
      // Update quantity
      const result = await cartCollection.updateOne(
        { id: itemId, userId },
        { $set: { quantity } }
      );

      if (result.matchedCount === 0) {
        return NextResponse.json(
          {
            success: false,
            error: 'Cart item not found'
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Cart updated successfully'
      });
    }

  } catch (error) {
    console.error('Error updating cart:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update cart',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE - Remove item from cart
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');
    const userId = searchParams.get('userId') || 'guest';

    if (!itemId) {
      return NextResponse.json(
        {
          success: false,
          error: 'itemId query parameter is required'
        },
        { status: 400 }
      );
    }

    const cartCollection = await getCartItemsCollection();
    const result = await cartCollection.deleteOne({ id: itemId, userId });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cart item not found'
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Item removed from cart'
    });

  } catch (error) {
    console.error('Error removing from cart:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to remove item from cart',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}