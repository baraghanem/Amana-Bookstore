// src/app/api/books/[id]/route.ts
// Serverless API for single book details - GET by ID

import { NextRequest, NextResponse } from 'next/server';
import { getBooksCollection } from '@/lib/mongodb';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        if (!id) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Book ID is required'
                },
                { status: 400 }
            );
        }

        const booksCollection = await getBooksCollection();
        const book = await booksCollection.findOne({ id });

        if (!book) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Book not found'
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: book
        });

    } catch (error) {
        console.error('Error fetching book:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch book',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
