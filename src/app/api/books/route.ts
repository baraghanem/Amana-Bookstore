// src/app/api/books/route.ts
// Serverless API for books - GET all books with search, filter, sort, pagination

import { NextRequest, NextResponse } from 'next/server';
import { getBooksCollection } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Get query parameters
    const search = searchParams.get('search') || '';
    const genre = searchParams.get('genre') || '';
    const sort = searchParams.get('sort') || 'title';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const featured = searchParams.get('featured');
    const inStock = searchParams.get('inStock');

    // Build MongoDB query
    const query: Record<string, any> = {};

    // Text search across multiple fields
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by genre
    if (genre && genre !== 'all') {
      query.genre = genre;
    }

    // Filter featured books
    if (featured === 'true') {
      query.featured = true;
    }

    // Filter in-stock items
    if (inStock === 'true') {
      query.inStock = true;
    }

    // Build sort object
    const sortObj: Record<string, any> = {};
    switch (sort) {
      case 'price-asc':
        sortObj.price = 1;
        break;
      case 'price-desc':
        sortObj.price = -1;
        break;
      case 'rating':
        sortObj.rating = -1;
        break;
      case 'newest':
        sortObj.datePublished = -1;
        break;
      case 'title':
      default:
        sortObj.title = 1;
    }

    // Get collection
    const booksCollection = await getBooksCollection();

    // Get total count for pagination
    const total = await booksCollection.countDocuments(query);

    // Get books with pagination
    const books = await booksCollection
      .find(query)
      .sort(sortObj)
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      success: true,
      data: books,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    });

  } catch (error) {
    console.error('Error fetching books:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch books',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}