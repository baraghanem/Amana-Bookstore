# Quick Setup Script for MongoDB Data Import
# Run this script after downloading MongoDB Database Tools

# You have two options:

## Option 1: Download MongoDB Database Tools (Recommended)
# 1. Go to: https://www.mongodb.com/try/download/database-tools
# 2. Download "MongoDB Database Tools" for Windows
# 3. Extract the ZIP file
# 4. Copy mongoimport.exe to: C:\Program Files\MongoDB\Tools\100\bin\
# 5. Then run the import commands below with full path

## Option 2: Use MongoDB Compass (GUI - Easiest)
# 1. Download MongoDB Compass: https://www.mongodb.com/try/download/compass
# 2. Install and open it
# 3. Connect to: mongodb://localhost:27017
# 4. Create database: amana_bookstore
# 5. Import JSON files using the GUI:
#    - Create collection "books" and import mongodb-data/books.json
#    - Create collection "reviews" and import mongodb-data/reviews.json

## Import Commands (after getting the tools):
# Assuming mongoimport is at: C:\Program Files\MongoDB\Tools\100\bin\mongoimport.exe

# Import books (45 items)
# & "C:\Program Files\MongoDB\Tools\100\bin\mongoimport.exe" --db amana_bookstore --collection books --file mongodb-data/books.json --jsonArray

# Import reviews (60 items)
# & "C:\Program Files\MongoDB\Tools\100\bin\mongoimport.exe" --db amana_bookstore --collection reviews --file mongodb-data/reviews.json --jsonArray

## After importing, create .env.local file:
# Create file: .env.local
# Add this line:
# MONGODB_URI=mongodb://localhost:27017/amana_bookstore

## Then restart your dev server:
# Stop current server (Ctrl+C)
# npm run dev
