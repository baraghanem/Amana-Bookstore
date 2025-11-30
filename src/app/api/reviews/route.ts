// src/app/api/reviews/route.ts
// Serverless API for reviews - GET reviews by bookId, POST new review

import { NextRequest, NextResponse } from 'next/server';
import { getReviewsCollection } from '@/lib/mongodb';
import type { Review } from '@/app/types';

// GET reviews for a specific book
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const bookId = searchParams.get('bookId');

        if (!bookId) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'bookId query parameter is required'
                },
                { status: 400 }
            );
        }

        const reviewsCollection = await getReviewsCollection();

        // Get reviews sorted by most recent first
        const reviews = await reviewsCollection
            .find({ bookId })
            .sort({ timestamp: -1 })
            .toArray();

        return NextResponse.json({
            success: true,
            data: reviews,
            count: reviews.length
        });

    } catch (error) {
        console.error('Error fetching reviews:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch reviews',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

// POST a new review
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate required fields
        const { bookId, author, rating, title, comment } = body;

        if (!bookId || !author || !rating || !title || !comment) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Missing required fields: bookId, author, rating, title, comment'
                },
                { status: 400 }
            );
        }

        // Validate rating
        if (rating < 1 || rating > 5) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Rating must be between 1 and 5'
                },
                { status: 400 }
            );
        }

        // Create new review
        const newReview: Review = {
            id: `review-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            bookId,
            author,
            rating,
            title,
            comment,
            timestamp: new Date().toISOString(),
            verified: false // New reviews are unverified by default
        };

        const reviewsCollection = await getReviewsCollection();
        const result = await reviewsCollection.insertOne(newReview);

        if (!result.acknowledged) {
            throw new Error('Failed to insert review');
        }

        return NextResponse.json({
            success: true,
            data: newReview,
            message: 'Review submitted successfully'
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating review:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to create review',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
