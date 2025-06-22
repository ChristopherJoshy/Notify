# MongoDB Setup for NotesNexus

This document provides instructions for setting up and using MongoDB with the NotesNexus application.

## Setup Instructions

1. **MongoDB Configuration**

   The application has been configured to use MongoDB with the following connection string:
   ```
   mongodb+srv://christopherjoshy:Fkak7nuijxr7YhaQ@cluster0.vx54pmn.mongodb.net/
   ```

   The database name used is `studynotes` which will be automatically created when the application connects.

2. **Database Initialization**

   To initialize the database with the required collections and indexes, run:
   ```bash
   npm run db:init
   ```

   This command will:
   - Connect to MongoDB
   - Create the following collections if they don't exist:
     - `subjects` - For storing subject information
     - `notes` - For storing note information
     - `counters` - For auto-incrementing IDs
   - Create necessary indexes for performance
   - Add default subjects if the subjects collection is empty

## Database Schema

### Collections

#### Subjects Collection
```javascript
{
  id: Number,           // Auto-incremented primary key
  name: String,         // Subject name (e.g., "Mathematics")
  icon: String,         // Font Awesome icon class (e.g., "fas fa-calculator")
  color: String,        // Color theme (blue, green, purple, orange, red, gray)
  createdAt: Date       // Creation timestamp
}
```

#### Notes Collection
```javascript
{
  id: Number,           // Auto-incremented primary key
  title: String,        // Note title
  content: String,      // Note content/body
  subjectId: Number,    // Foreign key to subjects collection
  tags: [String],       // Array of tags for categorization
  createdAt: Date,      // Creation timestamp
  updatedAt: Date       // Last modification timestamp
}
```

#### Counters Collection (Internal)
```javascript
{
  _id: String,          // Collection name ("subjects" or "notes")
  sequence: Number      // Current sequence number for auto-increment
}
```

### Database Indexes
- `subjects.name`: Index for subject name sorting
- `notes.subjectId`: Index for filtering notes by subject
- `notes.title` and `notes.content`: Text search index for full-text search

## Switching Between Storage Implementations

The application supports both MongoDB and in-memory storage. To switch between them:

1. Open `server/storage.ts`
2. Comment out the storage implementation you don't want to use and uncomment the one you want to use:

   ```javascript
   // For in-memory storage (development)
   // export const storage = new MemStorage();
   
   // For MongoDB (production)
   export const storage = new MongoStorage();
   ```

## Troubleshooting

- **Connection Issues**: If you encounter connection issues, check if the MongoDB connection string is correct and that your IP address is allowed in the MongoDB Atlas network access settings.

- **Authentication Issues**: Verify that the username and password in the connection string are correct.

- **Database Operations Failing**: Make sure the MongoDB user has the correct permissions to create collections and indexes.

- **Initialization Errors**: If the initialization script fails, check the error logs for specific issues.

## Additional Information

- The application uses auto-incrementing numerical IDs for both subjects and notes, which is implemented using the `counters` collection.
- When a subject is deleted, all associated notes are also deleted.
- The MongoDB implementation includes indexes for better query performance on frequently accessed fields. 