// data/migrate.js
// Migration script to load data into MongoDB
// Similar to PostgreSQL migration workflow

const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'amana_bookstore';

async function migrate() {
    const client = new MongoClient(MONGODB_URI);

    try {
        console.log('\n' + '='.repeat(80));
        console.log('📦 AMANA BOOKSTORE - DATA MIGRATION');
        console.log('='.repeat(80) + '\n');

        // Connect to MongoDB
        console.log('Connecting to MongoDB...');
        await client.connect();
        console.log('✅ Connected to MongoDB\n');

        const db = client.db(DB_NAME);

        // Read books data
        console.log('Reading data from books.json...');
        const booksData = JSON.parse(
            fs.readFileSync(path.join(__dirname, '../mongodb-data/books.json'), 'utf8')
        );

        // Read reviews data
        console.log('Reading data from reviews.json...');
        const reviewsData = JSON.parse(
            fs.readFileSync(path.join(__dirname, '../mongodb-data/reviews.json'), 'utf8')
        );

        console.log('\n' + '-'.repeat(80));
        console.log('📊 Data Summary:');
        console.log(`   Books: ${booksData.length}`);
        console.log(`   Reviews: ${reviewsData.length}`);
        console.log('-'.repeat(80) + '\n');

        // Clear existing collections
        console.log('Clearing existing collections...');
        await db.collection('books').deleteMany({});
        await db.collection('reviews').deleteMany({});
        console.log('✅ Collections cleared\n');

        // Migrate books
        console.log('📚 Migrating Books:');
        console.log('-'.repeat(80));

        for (const book of booksData) {
            await db.collection('books').insertOne(book);
            console.log(`✅ Migrated book ${book.id}: ${book.title}`);
        }

        console.log(`\n✅ ${booksData.length} books migrated successfully!\n`);

        // Migrate reviews
        console.log('⭐ Migrating Reviews:');
        console.log('-'.repeat(80));

        for (const review of reviewsData) {
            await db.collection('reviews').insertOne(review);
            console.log(`✅ Migrated review ${review.id}: "${review.title}" by ${review.author} (${review.rating}⭐)`);
        }

        console.log(`\n✅ ${reviewsData.length} reviews migrated successfully!\n`);

        // Create indexes
        console.log('📑 Creating Indexes:');
        console.log('-'.repeat(80));

        await db.collection('books').createIndex({ id: 1 }, { unique: true });
        console.log('✅ Created unique index on books.id');

        await db.collection('books').createIndex({ title: 'text', author: 'text', description: 'text' });
        console.log('✅ Created text search index on books');

        await db.collection('books').createIndex({ genre: 1 });
        console.log('✅ Created index on books.genre');

        await db.collection('books').createIndex({ price: 1 });
        console.log('✅ Created index on books.price');

        await db.collection('books').createIndex({ rating: -1 });
        console.log('✅ Created index on books.rating');

        await db.collection('reviews').createIndex({ id: 1 }, { unique: true });
        console.log('✅ Created unique index on reviews.id');

        await db.collection('reviews').createIndex({ bookId: 1 });
        console.log('✅ Created index on reviews.bookId');

        await db.collection('reviews').createIndex({ timestamp: -1 });
        console.log('✅ Created index on reviews.timestamp');

        console.log('\n' + '='.repeat(80));
        console.log('🎉 DATA MIGRATION COMPLETED SUCCESSFULLY!');
        console.log('='.repeat(80));
        console.log('\nDatabase Summary:');
        console.log(`   📚 Books: ${await db.collection('books').countDocuments()}`);
        console.log(`   ⭐ Reviews: ${await db.collection('reviews').countDocuments()}`);
        console.log(`   📑 Indexes: ${(await db.collection('books').indexes()).length + (await db.collection('reviews').indexes()).length}`);
        console.log('='.repeat(80) + '\n');

    } catch (error) {
        console.error('\n❌ Migration failed:', error.message);
        console.error(error);
        process.exit(1);
    } finally {
        await client.close();
        console.log('📡 Connection closed\n');
    }
}

// Run migration
migrate();
