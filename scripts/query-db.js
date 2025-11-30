// scripts/query-db.js
// Simple MongoDB query script

const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017';
const dbName = 'amana_bookstore';

async function queryDatabase() {
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('✅ Connected to MongoDB\n');

        const db = client.db(dbName);

        // Count documents
        const booksCount = await db.collection('books').countDocuments();
        const reviewsCount = await db.collection('reviews').countDocuments();

        console.log('📊 Database Statistics:');
        console.log('  Books:', booksCount);
        console.log('  Reviews:', reviewsCount);
        console.log('');

        // Get first 3 books
        console.log('📚 Sample Books:');
        const books = await db.collection('books').find().limit(3).toArray();
        books.forEach(book => {
            console.log(`  - ${book.title} by ${book.author} ($${book.price})`);
        });
        console.log('');

        // Get books by genre
        console.log('🔬 Physics Books:');
        const physicsBooks = await db.collection('books').find({ genre: 'Physics' }).toArray();
        console.log(`  Found ${physicsBooks.length} physics books`);
        physicsBooks.slice(0, 3).forEach(book => {
            console.log(`  - ${book.title}`);
        });
        console.log('');

        // Get reviews for a book
        console.log('⭐ Reviews for Book ID 1:');
        const reviews = await db.collection('reviews').find({ bookId: '1' }).toArray();
        console.log(`  Found ${reviews.length} reviews`);
        reviews.forEach(review => {
            console.log(`  - ${review.title} (${review.rating}⭐) by ${review.author}`);
        });
        console.log('');

        // Featured books
        console.log('✨ Featured Books:');
        const featured = await db.collection('books').find({ featured: true }).toArray();
        console.log(`  Found ${featured.length} featured books`);

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await client.close();
        console.log('\n✅ Connection closed');
    }
}

queryDatabase();
