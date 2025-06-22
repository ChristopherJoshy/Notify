import { MongoClient } from 'mongodb';

async function initializeDatabase() {
  // Use environment variable or default connection string
  const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://christopherjoshy:Fkak7nuijxr7YhaQ@cluster0.vx54pmn.mongodb.net/";
  
  console.log("Connecting to MongoDB...");
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log("Connected successfully to MongoDB");
    
    const db = client.db("studynotes");
    
    // Create collections
    console.log("Setting up collections...");
    
    // Check if collections exist, create if they don't
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    if (!collectionNames.includes("subjects")) {
      console.log("Creating subjects collection");
      await db.createCollection("subjects");
    }
    
    if (!collectionNames.includes("notes")) {
      console.log("Creating notes collection");
      await db.createCollection("notes");
    }
    
    if (!collectionNames.includes("counters")) {
      console.log("Creating counters collection");
      await db.createCollection("counters");
      
      // Initialize counters for auto-increment
      await db.collection("counters").insertMany([
        { _id: "subjects", sequence: 0 },
        { _id: "notes", sequence: 0 }
      ]);
    }
    
    // Create indexes
    console.log("Setting up indexes...");
    
    const subjectsCollection = db.collection("subjects");
    await subjectsCollection.createIndex({ name: 1 });
    
    const notesCollection = db.collection("notes");
    await notesCollection.createIndex({ subjectId: 1 });
    await notesCollection.createIndex({ title: "text", content: "text" });
    
    // Add default subjects if subjects collection is empty
    const subjectCount = await subjectsCollection.countDocuments();
    if (subjectCount === 0) {
      console.log("Adding default subjects...");
      
      // Get next sequence for subjects
      const countersCollection = db.collection("counters");
      
      // Default subjects to add
      const defaultSubjects = [
        { name: "Mathematics", icon: "fas fa-calculator", color: "blue" },
        { name: "Physics", icon: "fas fa-atom", color: "green" },
        { name: "Chemistry", icon: "fas fa-flask", color: "purple" },
        { name: "History", icon: "fas fa-landmark", color: "orange" },
        { name: "English Literature", icon: "fas fa-book-open", color: "red" }
      ];
      
      // Add each subject and update the counter
      for (const subject of defaultSubjects) {
        const counter = await countersCollection.findOneAndUpdate(
          { _id: "subjects" },
          { $inc: { sequence: 1 } },
          { upsert: true, returnDocument: "after" }
        );
        
        if (counter.value) {
          const id = counter.value.sequence;
          const newSubject = {
            ...subject,
            id,
            createdAt: new Date()
          };
          
          await subjectsCollection.insertOne(newSubject);
        }
      }
    }
    
    console.log("Database initialization complete");
  } catch (error) {
    console.error("Database initialization failed:", error);
  } finally {
    await client.close();
    console.log("MongoDB connection closed");
  }
}

// Run the initialization
initializeDatabase().catch(console.error); 