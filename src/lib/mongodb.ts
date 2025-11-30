// lib/mongodb.ts
// MongoDB connection utility for Next.js

import { MongoClient, Db } from 'mongodb';

if (!process.env.MONGODB_URI) {
    throw new Error('Please add your MongoDB URI to .env.local');
}

const uri: string = process.env.MONGODB_URI;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
    // In development mode, use a global variable to preserve the value
    // across module reloads caused by HMR (Hot Module Replacement)
    let globalWithMongo = global as typeof globalThis & {
        _mongoClientPromise?: Promise<MongoClient>;
    };

    if (!globalWithMongo._mongoClientPromise) {
        client = new MongoClient(uri, options);
        globalWithMongo._mongoClientPromise = client.connect();
    }
    clientPromise = globalWithMongo._mongoClientPromise;
} else {
    // In production mode, it's best to not use a global variable
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
}

// Export a module-scoped MongoClient promise
export default clientPromise;

// Helper function to get the database
export async function getDatabase(): Promise<Db> {
    const client = await clientPromise;
    return client.db('amana_bookstore');
}

// Helper functions for collections
export async function getBooksCollection() {
    const db = await getDatabase();
    return db.collection('books');
}

export async function getReviewsCollection() {
    const db = await getDatabase();
    return db.collection('reviews');
}

export async function getCartItemsCollection() {
    const db = await getDatabase();
    return db.collection('cart_items');
}
