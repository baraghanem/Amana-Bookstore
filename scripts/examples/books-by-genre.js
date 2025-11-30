// scripts/examples/books-by-genre.js
// Get books by genre

const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017';
const dbName = 'amana_bookstore';

async function booksByGenre(genre) {
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db(dbName);

        // Find books with specified genre
        const books = await db.collection('books')
            .find({ genre: genre })
            .sort({ rating: -1 })
            .toArray();

        console.log(`\n📚 ${genre} Books (sorted by rating):`);
        console.log(`Found ${books.length} books\n`);

        books.forEach((book, index) => {
            console.log(`${index + 1}. ${book.title}`);
            console.log(`   Author: ${book.author}`);
            console.log(`   Price: $${book.price} | Rating: ${book.rating}⭐ (${book.reviewCount} reviews)`);
            console.log(`   Published: ${book.datePublished} | Pages: ${book.pages}`);
            console.log('');
        });

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await client.close();
    }
}

const genre = process.argv[2] || 'Physics';
booksByGenre(genre);
