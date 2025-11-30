// scripts/examples/search-books.js
// Search books by keyword

const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017';
const dbName = 'amana_bookstore';

async function searchBooks(keyword) {
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db(dbName);

        // Search in title, author, or description
        const books = await db.collection('books').find({
            $or: [
                { title: { $regex: keyword, $options: 'i' } },
                { author: { $regex: keyword, $options: 'i' } },
                { description: { $regex: keyword, $options: 'i' } }
            ]
        }).toArray();

        console.log(`\n🔍 Search results for "${keyword}":`);
        console.log(`Found ${books.length} books\n`);

        books.forEach((book, index) => {
            console.log(`${index + 1}. "${book.title}" by ${book.author}`);
            console.log(`   Price: $${book.price} | Rating: ${book.rating}⭐ | Stock: ${book.inStock ? 'Yes' : 'No'}`);
            console.log(`   Genres: ${book.genre.join(', ')}`);
            console.log('');
        });

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await client.close();
    }
}

// Get search keyword from command line or use default
const keyword = process.argv[2] || 'physics';
searchBooks(keyword);
