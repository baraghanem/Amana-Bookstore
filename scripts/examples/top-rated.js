// scripts/examples/top-rated.js
// Get top rated books

const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017';
const dbName = 'amana_bookstore';

async function topRatedBooks(limit = 10) {
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db(dbName);

        const books = await db.collection('books')
            .find()
            .sort({ rating: -1, reviewCount: -1 })
            .limit(limit)
            .toArray();

        console.log(`\n⭐ Top ${limit} Rated Books:\n`);

        books.forEach((book, index) => {
            const stars = '⭐'.repeat(Math.round(book.rating));
            console.log(`${index + 1}. ${book.title}`);
            console.log(`   ${stars} ${book.rating}/5 (${book.reviewCount} reviews)`);
            console.log(`   by ${book.author} | $${book.price}`);
            console.log('');
        });

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await client.close();
    }
}

const limit = parseInt(process.argv[2]) || 10;
topRatedBooks(limit);
