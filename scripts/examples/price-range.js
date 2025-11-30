// scripts/examples/price-range.js
// Get books in price range

const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017';
const dbName = 'amana_bookstore';

async function booksByPriceRange(min, max) {
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db(dbName);

        const books = await db.collection('books')
            .find({
                price: { $gte: min, $lte: max }
            })
            .sort({ price: 1 })
            .toArray();

        console.log(`\n💰 Books between $${min} and $${max}:`);
        console.log(`Found ${books.length} books\n`);

        books.forEach((book, index) => {
            console.log(`${index + 1}. $${book.price.toFixed(2)} - ${book.title}`);
            console.log(`   by ${book.author} | ${book.rating}⭐`);
            console.log('');
        });

        // Calculate stats
        if (books.length > 0) {
            const avgPrice = books.reduce((sum, b) => sum + b.price, 0) / books.length;
            console.log('📊 Stats:');
            console.log(`   Average price: $${avgPrice.toFixed(2)}`);
            console.log(`   Cheapest: $${books[0].price.toFixed(2)}`);
            console.log(`   Most expensive: $${books[books.length - 1].price.toFixed(2)}`);
        }

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await client.close();
    }
}

const min = parseFloat(process.argv[2]) || 0;
const max = parseFloat(process.argv[3]) || 100;
booksByPriceRange(min, max);
