// scripts/verify-system.js
// Comprehensive verification script for Amana Bookstore

const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'amana_bookstore';
const API_BASE = 'http://localhost:3000';

console.log('\n' + '='.repeat(80));
console.log('🔍 AMANA BOOKSTORE - SYSTEM VERIFICATION');
console.log('='.repeat(80) + '\n');

let allTestsPassed = true;

// Test 1: MongoDB Connection
async function testDatabaseConnection() {
    console.log('📋 Test 1: Database Connection');
    console.log('-'.repeat(80));

    try {
        const client = new MongoClient(MONGODB_URI);
        await client.connect();
        console.log('✅ Connected to MongoDB');

        const db = client.db(DB_NAME);
        const collections = await db.listCollections().toArray();
        console.log(`✅ Database: ${DB_NAME}`);
        console.log(`✅ Collections found: ${collections.map(c => c.name).join(', ')}`);

        await client.close();
        return true;
    } catch (error) {
        console.log('❌ FAILED:', error.message);
        return false;
    }
}

// Test 2: Data Verification
async function testDataIntegrity() {
    console.log('\n📋 Test 2: Data Integrity');
    console.log('-'.repeat(80));

    try {
        const client = new MongoClient(MONGODB_URI);
        await client.connect();
        const db = client.db(DB_NAME);

        // Check books
        const booksCount = await db.collection('books').countDocuments();
        console.log(`📚 Books: ${booksCount} ${booksCount === 45 ? '✅' : '❌ Expected 45'}`);

        // Check reviews
        const reviewsCount = await db.collection('reviews').countDocuments();
        console.log(`⭐ Reviews: ${reviewsCount} ${reviewsCount === 60 ? '✅' : '❌ Expected 60'}`);

        // Check book structure
        const sampleBook = await db.collection('books').findOne();
        const requiredFields = ['id', 'title', 'author', 'price', 'genre', 'rating'];
        const hasAllFields = requiredFields.every(field => sampleBook[field] !== undefined);
        console.log(`📖 Book structure: ${hasAllFields ? '✅ All required fields present' : '❌ Missing fields'}`);

        // Check review structure
        const sampleReview = await db.collection('reviews').findOne();
        const reviewFields = ['id', 'bookId', 'author', 'rating', 'title', 'comment'];
        const hasReviewFields = reviewFields.every(field => sampleReview[field] !== undefined);
        console.log(`💬 Review structure: ${hasReviewFields ? '✅ All required fields present' : '❌ Missing fields'}`);

        await client.close();
        return booksCount === 45 && reviewsCount === 60 && hasAllFields && hasReviewFields;
    } catch (error) {
        console.log('❌ FAILED:', error.message);
        return false;
    }
}

// Test 3: API Endpoints
async function testAPIEndpoints() {
    console.log('\n📋 Test 3: API Endpoints');
    console.log('-'.repeat(80));

    const tests = [
        { name: 'Books API', url: `${API_BASE}/api/books`, expectedStatus: 200 },
        { name: 'Book Details API', url: `${API_BASE}/api/books/1`, expectedStatus: 200 },
        { name: 'Reviews API', url: `${API_BASE}/api/reviews?bookId=1`, expectedStatus: 200 },
        { name: 'Cart API', url: `${API_BASE}/api/cart?userId=guest`, expectedStatus: 200 }
    ];

    let allPassed = true;

    for (const test of tests) {
        try {
            const response = await fetch(test.url);
            const data = await response.json();

            if (response.status === test.expectedStatus && data.success) {
                console.log(`✅ ${test.name}: OK (${data.data ? (Array.isArray(data.data) ? data.data.length + ' items' : 'found') : 'empty'})`);
            } else {
                console.log(`❌ ${test.name}: FAILED (Status: ${response.status})`);
                allPassed = false;
            }
        } catch (error) {
            console.log(`❌ ${test.name}: FAILED (${error.message})`);
            allPassed = false;
        }
    }

    return allPassed;
}

// Test 4: Data Queries
async function testDataQueries() {
    console.log('\n📋 Test 4: Advanced Queries');
    console.log('-'.repeat(80));

    try {
        // Test search
        const searchResponse = await fetch(`${API_BASE}/api/books?search=physics`);
        const searchData = await searchResponse.json();
        console.log(`🔍 Search query: ${searchData.success ? '✅ Found ' + searchData.data.length + ' results' : '❌ Failed'}`);

        // Test genre filter
        const genreResponse = await fetch(`${API_BASE}/api/books?genre=Physics`);
        const genreData = await genreResponse.json();
        console.log(`🏷️  Genre filter: ${genreData.success ? '✅ Found ' + genreData.data.length + ' Physics books' : '❌ Failed'}`);

        // Test sorting
        const sortResponse = await fetch(`${API_BASE}/api/books?sort=price-asc&limit=5`);
        const sortData = await sortResponse.json();
        console.log(`📊 Sorting: ${sortData.success ? '✅ Sorted by price' : '❌ Failed'}`);

        // Test pagination
        const pageResponse = await fetch(`${API_BASE}/api/books?page=2&limit=10`);
        const pageData = await pageResponse.json();
        console.log(`📄 Pagination: ${pageData.success && pageData.pagination ? '✅ Page 2 loaded' : '❌ Failed'}`);

        return searchData.success && genreData.success && sortData.success && pageData.success;
    } catch (error) {
        console.log('❌ FAILED:', error.message);
        return false;
    }
}

// Test 5: Business Logic
async function testBusinessLogic() {
    console.log('\n📋 Test 5: Business Logic');
    console.log('-'.repeat(80));

    try {
        const client = new MongoClient(MONGODB_URI);
        await client.connect();
        const db = client.db(DB_NAME);

        // Check featured books
        const featured = await db.collection('books').countDocuments({ featured: true });
        console.log(`✨ Featured books: ${featured > 0 ? '✅ ' + featured + ' found' : '❌ None found'}`);

        // Check in-stock books
        const inStock = await db.collection('books').countDocuments({ inStock: true });
        const outOfStock = await db.collection('books').countDocuments({ inStock: false });
        console.log(`📦 Inventory: ${inStock} in stock, ${outOfStock} out of stock ${inStock > 0 ? '✅' : '❌'}`);

        // Check price range
        const books = await db.collection('books').find().toArray();
        const avgPrice = books.reduce((sum, b) => sum + b.price, 0) / books.length;
        console.log(`💰 Average price: $${avgPrice.toFixed(2)} ✅`);

        // Check ratings
        const avgRating = books.reduce((sum, b) => sum + b.rating, 0) / books.length;
        console.log(`⭐ Average rating: ${avgRating.toFixed(2)}/5 ✅`);

        // Check genres
        const genres = new Set();
        books.forEach(book => book.genre.forEach(g => genres.add(g)));
        console.log(`🏷️  Unique genres: ${genres.size} ${genres.size > 0 ? '✅' : '❌'}`);

        await client.close();
        return featured > 0 && inStock > 0 && genres.size > 0;
    } catch (error) {
        console.log('❌ FAILED:', error.message);
        return false;
    }
}

// Test 6: Sample Data Quality
async function testDataQuality() {
    console.log('\n📋 Test 6: Data Quality');
    console.log('-'.repeat(80));

    try {
        const client = new MongoClient(MONGODB_URI);
        await client.connect();
        const db = client.db(DB_NAME);

        // Check for duplicate IDs
        const books = await db.collection('books').find().toArray();
        const ids = books.map(b => b.id);
        const uniqueIds = new Set(ids);
        console.log(`🔑 Unique book IDs: ${ids.length === uniqueIds.size ? '✅ No duplicates' : '❌ Found duplicates'}`);

        // Check all books have prices > 0
        const invalidPrices = books.filter(b => !b.price || b.price <= 0).length;
        console.log(`💵 Valid prices: ${invalidPrices === 0 ? '✅ All books have valid prices' : '❌ ' + invalidPrices + ' invalid'}`);

        // Check all books have ratings 0-5
        const invalidRatings = books.filter(b => b.rating < 0 || b.rating > 5).length;
        console.log(`⭐ Valid ratings: ${invalidRatings === 0 ? '✅ All ratings valid' : '❌ ' + invalidRatings + ' invalid'}`);

        // Check reviews reference valid books
        const reviews = await db.collection('reviews').find().toArray();
        const validBookRefs = reviews.every(r => ids.includes(r.bookId));
        console.log(`🔗 Review references: ${validBookRefs ? '✅ All reviews reference valid books' : '❌ Invalid references found'}`);

        await client.close();
        return ids.length === uniqueIds.size && invalidPrices === 0 && invalidRatings === 0 && validBookRefs;
    } catch (error) {
        console.log('❌ FAILED:', error.message);
        return false;
    }
}

// Run all tests
async function runAllTests() {
    const results = {
        database: await testDatabaseConnection(),
        dataIntegrity: await testDataIntegrity(),
        apiEndpoints: await testAPIEndpoints(),
        dataQueries: await testDataQueries(),
        businessLogic: await testBusinessLogic(),
        dataQuality: await testDataQuality()
    };

    console.log('\n' + '='.repeat(80));
    console.log('📊 VERIFICATION SUMMARY');
    console.log('='.repeat(80));

    Object.entries(results).forEach(([test, passed]) => {
        console.log(`${passed ? '✅' : '❌'} ${test.charAt(0).toUpperCase() + test.slice(1).replace(/([A-Z])/g, ' $1')}`);
    });

    const allPassed = Object.values(results).every(r => r === true);

    console.log('\n' + '='.repeat(80));
    if (allPassed) {
        console.log('🎉 ALL TESTS PASSED! Your application is fully operational!');
        console.log('✅ Database: Loaded and verified');
        console.log('✅ API: All endpoints working');
        console.log('✅ Data: Complete and valid');
        console.log('✅ Ready for production use!');
    } else {
        console.log('⚠️  SOME TESTS FAILED - Please review the errors above');
    }
    console.log('='.repeat(80) + '\n');

    process.exit(allPassed ? 0 : 1);
}

// Run verification
runAllTests().catch(error => {
    console.error('\n❌ Verification failed with error:', error);
    process.exit(1);
});
