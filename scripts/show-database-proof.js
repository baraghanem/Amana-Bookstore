// scripts/show-database-proof.js
// Display database contents for screenshot proof

const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'amana_bookstore';

async function showDatabaseProof() {
    const client = new MongoClient(MONGODB_URI);

    try {
        await client.connect();
        const db = client.db(DB_NAME);

        console.log('\n' + '='.repeat(80));
        console.log('📊 AMANA BOOKSTORE - DATABASE PROOF');
        console.log('='.repeat(80) + '\n');

        // Books Collection
        console.log('📚 BOOKS COLLECTION');
        console.log('-'.repeat(80));
        const booksCount = await db.collection('books').countDocuments();
        console.log(`✅ Total Books: ${booksCount}`);

        const sampleBooks = await db.collection('books').find().limit(3).toArray();
        console.log('\n🔍 Sample Books:\n');
        sampleBooks.forEach((book, index) => {
            console.log(`${index + 1}. "${book.title}"`);
            console.log(`   Author: ${book.author}`);
            console.log(`   Price: $${book.price}`);
            console.log(`   Genre: ${book.genre.join(', ')}`);
            console.log(`   Rating: ${book.rating}/5`);
            console.log(`   In Stock: ${book.inStock ? 'Yes' : 'No'}`);
            console.log('');
        });

        // Reviews Collection
        console.log('\n' + '-'.repeat(80));
        console.log('⭐ REVIEWS COLLECTION');
        console.log('-'.repeat(80));
        const reviewsCount = await db.collection('reviews').countDocuments();
        console.log(`✅ Total Reviews: ${reviewsCount}`);

        const sampleReviews = await db.collection('reviews').find().limit(3).toArray();
        console.log('\n🔍 Sample Reviews:\n');
        sampleReviews.forEach((review, index) => {
            console.log(`${index + 1}. "${review.title}" - ${review.rating}⭐`);
            console.log(`   By: ${review.author}`);
            console.log(`   For Book ID: ${review.bookId}`);
            console.log(`   Comment: ${review.comment.substring(0, 60)}...`);
            console.log('');
        });

        // Summary
        console.log('\n' + '='.repeat(80));
        console.log('✅ DATABASE VERIFICATION COMPLETE');
        console.log('='.repeat(80));
        console.log(`📚 Books: ${booksCount}`);
        console.log(`⭐ Reviews: ${reviewsCount}`);
        console.log(`🗄️  Database: ${DB_NAME}`);
        console.log(`🔗 Connection: ${MONGODB_URI}`);
        console.log('='.repeat(80) + '\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await client.close();
    }
}

showDatabaseProof();
