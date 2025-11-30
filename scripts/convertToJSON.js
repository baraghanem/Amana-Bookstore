// scripts/convertToJSON.js
// Utility script to convert TypeScript data files to JSON for MongoDB import

const fs = require('fs');
const path = require('path');

// Read and parse the books TypeScript file
const booksContent = fs.readFileSync(
  path.join(__dirname, '../src/app/data/books.ts'),
  'utf-8'
);

// Read and parse the reviews TypeScript file
const reviewsContent = fs.readFileSync(
  path.join(__dirname, '../src/app/data/reviews.ts'),
  'utf-8'
);

// Extract the array content using regex
function extractArray(content, arrayName) {
  const regex = new RegExp(`export const ${arrayName}.*?=\\s*(\\[[\\s\\S]*?\\]);`, 'm');
  const match = content.match(regex);
  
  if (!match) {
    throw new Error(`Could not find ${arrayName} array in content`);
  }
  
  // Remove TypeScript-specific syntax and evaluate as JavaScript
  let arrayContent = match[1];
  
  // Remove TypeScript type annotations
  arrayContent = arrayContent.replace(/: Book\[\]|: Review\[\]/g, '');
  
  // Use eval in a safe context (we control the input)
  const result = eval(`(${arrayContent})`);
  return result;
}

try {
  // Extract books and reviews
  const books = extractArray(booksContent, 'books');
  const reviews = extractArray(reviewsContent, 'reviews');
  
  // Create mongodb-data directory if it doesn't exist
  const dataDir = path.join(__dirname, '../mongodb-data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  // Write JSON files
  fs.writeFileSync(
    path.join(dataDir, 'books.json'),
    JSON.stringify(books, null, 2)
  );
  
  fs.writeFileSync(
    path.join(dataDir, 'reviews.json'),
    JSON.stringify(reviews, null, 2)
  );
  
  console.log('✅ Successfully converted data files to JSON!');
  console.log(`📚 Books: ${books.length} items`);
  console.log(`⭐ Reviews: ${reviews.length} items`);
  console.log(`📁 Output directory: ${dataDir}`);
  
} catch (error) {
  console.error('❌ Error converting files:', error.message);
  process.exit(1);
}
