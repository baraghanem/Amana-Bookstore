// scripts/examples/database-stats.js
// Get comprehensive database statistics

const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017';
const dbName = 'amana_bookstore';

async function getDatabaseStats() {
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db(dbName);

        console.log('\n📊 DATABASE STATISTICS\n');
        console.log('='.repeat(50));

        // Document counts
        const booksCount = await db.collection('books').countDocuments();
        const reviewsCount = await db.collection('reviews').countDocuments();

        console.log('\n📚 Collections:');
        console.log(`   Books: ${booksCount}`);
        console.log(`   Reviews: ${reviewsCount}`);

        // Books stats
        const books = await db.collection('books').find().toArray();
        const avgPrice = books.reduce((sum, b) => sum + b.price, 0) / books.length;
        const avgRating = books.reduce((sum, b) => sum + b.rating, 0) / books.length;
        const totalReviews = books.reduce((sum, b) => sum + b.reviewCount, 0);
        const inStock = books.filter(b => b.inStock).length;
        const featured = books.filter(b => b.featured).length;

        console.log('\n💰 Price Stats:');
        console.log(`   Average: $${avgPrice.toFixed(2)}`);
        console.log(`   Cheapest: $${Math.min(...books.map(b => b.price)).toFixed(2)}`);
        console.log(`   Most expensive: $${Math.max(...books.map(b => b.price)).toFixed(2)}`);

        console.log('\n⭐ Rating Stats:');
        console.log(`   Average rating: ${avgRating.toFixed(2)}`);
        console.log(`   Total reviews: ${totalReviews}`);
        console.log(`   Avg reviews per book: ${(totalReviews / booksCount).toFixed(1)}`);

        console.log('\n📦 Inventory:');
        console.log(`   In stock: ${inStock} (${(inStock / booksCount * 100).toFixed(1)}%)`);
        console.log(`   Out of stock: ${booksCount - inStock}`);
        console.log(`   Featured: ${featured}`);

        // Genre breakdown
        const genreMap = {};
        books.forEach(book => {
            book.genre.forEach(g => {
                genreMap[g] = (genreMap[g] || 0) + 1;
            });
        });

        console.log('\n📖 Books by Genre:');
        Object.entries(genreMap)
            .sort((a, b) => b[1] - a[1])
            .forEach(([genre, count]) => {
                console.log(`   ${genre}: ${count}`);
            });

        // Top rated books
        const topRated = [...books]
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 3);

        console.log('\n🏆 Top 3 Rated Books:');
        topRated.forEach((book, i) => {
            console.log(`   ${i + 1}. "${book.title}" - ${book.rating}⭐ (${book.reviewCount} reviews)`);
        });

        // Most reviewed
        const mostReviewed = [...books]
            .sort((a, b) => b.reviewCount - a.reviewCount)
            .slice(0, 3);

        console.log('\n💬 Most Reviewed Books:');
        mostReviewed.forEach((book, i) => {
            console.log(`   ${i + 1}. "${book.title}" - ${book.reviewCount} reviews`);
        });

        console.log('\n' + '='.repeat(50) + '\n');

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await client.close();
    }
}

getDatabaseStats();
