// scripts/examples/book-reviews.js
// Get reviews for a specific book

const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017';
const dbName = 'amana_bookstore';

async function getBookReviews(bookId) {
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db(dbName);

        // Get book details
        const book = await db.collection('books').findOne({ id: bookId });

        if (!book) {
            console.log(`❌ Book with ID "${bookId}" not found`);
            return;
        }

        // Get reviews
        const reviews = await db.collection('reviews')
            .find({ bookId })
            .sort({ timestamp: -1 })
            .toArray();

        console.log(`\n📖 "${book.title}" by ${book.author}`);
        console.log(`   Rating: ${book.rating}⭐ (${book.reviewCount} reviews)\n`);

        if (reviews.length === 0) {
            console.log('No reviews yet.\n');
            return;
        }

        console.log(`💬 Reviews (${reviews.length}):\n`);

        reviews.forEach((review, index) => {
            const stars = '⭐'.repeat(review.rating);
            const verified = review.verified ? '✓ Verified' : '';
            console.log(`${index + 1}. ${stars} ${review.rating}/5 ${verified}`);
            console.log(`   "${review.title}"`);
            console.log(`   ${review.comment}`);
            console.log(`   - ${review.author}, ${new Date(review.timestamp).toLocaleDateString()}`);
            console.log('');
        });

        // Calculate average
        const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        console.log(`📊 Average rating from reviews: ${avgRating.toFixed(2)}⭐`);

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await client.close();
    }
}

const bookId = process.argv[2] || '1';
getBookReviews(bookId);
