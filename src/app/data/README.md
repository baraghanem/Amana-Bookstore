# ⚠️ DEPRECATION NOTICE

**These static data files are no longer used by the application.**

The Amana Bookstore application now fetches all data from MongoDB through the serverless API endpoints. These TypeScript files are kept for reference only.

## Migration Status

✅ **Application migrated to MongoDB** - All data is now stored in and fetched from the database.

### API Endpoints Used Instead

- `/api/books` - Replaces `books.ts`
- `/api/reviews` - Replaces `reviews.ts`  
- `/api/cart` - New cart functionality

### Files Affected

- `books.ts` - **Not used** (data in MongoDB `books` collection)
- `reviews.ts` - **Not used** (data in MongoDB `reviews` collection)
- `cart.ts` - **Not used** (cart uses localStorage temporarily)

## Safe to Delete

These files can be safely deleted without affecting the application, as long as:

1. MongoDB is running
2. Data has been imported (`mongodb-data/*.json`)
3. Environment is configured (`.env.local`)

## Keeping for Reference

If you want to keep these files for reference or to re-import data, they can stay. They have zero impact on the running application.

---

**Last Updated**: 2025-11-28
**Migration Guide**: See `FRONTEND_MIGRATION.md`
