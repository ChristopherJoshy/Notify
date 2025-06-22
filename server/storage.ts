import { subjects, notes, type Subject, type Note, type InsertSubject, type InsertNote } from "@shared/schema";
import { MongoClient, Db, Collection, Document } from "mongodb";

// MongoDB document types
type MongoSubject = Subject & { _id?: any };
type MongoNote = Note & { _id?: any };
type MongoCounter = { _id: string; sequence: number };

export interface IStorage {
  // Subject operations
  getSubjects(): Promise<Subject[]>;
  getSubject(id: number): Promise<Subject | undefined>;
  createSubject(subject: InsertSubject): Promise<Subject>;
  updateSubject(id: number, subject: Partial<InsertSubject>): Promise<Subject | undefined>;
  deleteSubject(id: number): Promise<boolean>;

  // Note operations
  getNotes(): Promise<Note[]>;
  getNotesBySubject(subjectId: number): Promise<Note[]>;
  getNote(id: number): Promise<Note | undefined>;
  createNote(note: InsertNote): Promise<Note>;
  updateNote(id: number, note: Partial<InsertNote>): Promise<Note | undefined>;
  deleteNote(id: number): Promise<boolean>;
  searchNotes(query: string): Promise<Note[]>;
}

export class MemStorage implements IStorage {
  private subjects: Map<number, Subject>;
  private notes: Map<number, Note>;
  private currentSubjectId: number;
  private currentNoteId: number;

  constructor() {
    this.subjects = new Map();
    this.notes = new Map();
    this.currentSubjectId = 1;
    this.currentNoteId = 1;

    // Initialize with some default subjects
    this.createSubject({ name: "Mathematics", icon: "fas fa-calculator", color: "blue" });
    this.createSubject({ name: "Physics", icon: "fas fa-atom", color: "green" });
    this.createSubject({ name: "Chemistry", icon: "fas fa-flask", color: "purple" });
    this.createSubject({ name: "History", icon: "fas fa-landmark", color: "orange" });
    this.createSubject({ name: "English Literature", icon: "fas fa-book-open", color: "red" });
  }

  // Subject operations
  async getSubjects(): Promise<Subject[]> {
    return Array.from(this.subjects.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  async getSubject(id: number): Promise<Subject | undefined> {
    return this.subjects.get(id);
  }

  async createSubject(insertSubject: InsertSubject): Promise<Subject> {
    const id = this.currentSubjectId++;
    const subject: Subject = {
      id,
      name: insertSubject.name,
      icon: insertSubject.icon || "fas fa-book", // Default icon
      color: insertSubject.color || "gray",      // Default color
      createdAt: new Date(),
    };
    this.subjects.set(id, subject);
    return subject;
  }

  async updateSubject(id: number, updateData: Partial<InsertSubject>): Promise<Subject | undefined> {
    const subject = this.subjects.get(id);
    if (!subject) return undefined;

    const updatedSubject: Subject = { ...subject, ...updateData };
    this.subjects.set(id, updatedSubject);
    return updatedSubject;
  }

  async deleteSubject(id: number): Promise<boolean> {
    // Also delete all notes for this subject
    const subjectNotes = Array.from(this.notes.values()).filter(note => note.subjectId === id);
    subjectNotes.forEach(note => this.notes.delete(note.id));
    
    return this.subjects.delete(id);
  }

  // Note operations
  async getNotes(): Promise<Note[]> {
    return Array.from(this.notes.values()).sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  async getNotesBySubject(subjectId: number): Promise<Note[]> {
    return Array.from(this.notes.values())
      .filter(note => note.subjectId === subjectId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  async getNote(id: number): Promise<Note | undefined> {
    return this.notes.get(id);
  }

  async createNote(insertNote: InsertNote): Promise<Note> {
    const id = this.currentNoteId++;
    const now = new Date();
    const note: Note = {
      id,
      title: insertNote.title,
      content: insertNote.content || "",  // Default content
      subjectId: insertNote.subjectId,
      tags: insertNote.tags || [],        // Default tags
      createdAt: now,
      updatedAt: now,
    };
    this.notes.set(id, note);
    return note;
  }

  async updateNote(id: number, updateData: Partial<InsertNote>): Promise<Note | undefined> {
    const note = this.notes.get(id);
    if (!note) return undefined;

    const updatedNote: Note = {
      ...note,
      ...updateData,
      updatedAt: new Date(),
    };
    this.notes.set(id, updatedNote);
    return updatedNote;
  }

  async deleteNote(id: number): Promise<boolean> {
    return this.notes.delete(id);
  }

  async searchNotes(query: string): Promise<Note[]> {
    const searchTerm = query.toLowerCase();
    return Array.from(this.notes.values())
      .filter(note => 
        note.title.toLowerCase().includes(searchTerm) ||
        note.content.toLowerCase().includes(searchTerm) ||
        note.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      )
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }
}

// MongoDB Storage Implementation
export class MongoStorage implements IStorage {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private subjectsCollection: Collection<MongoSubject> | null = null;
  private notesCollection: Collection<MongoNote> | null = null;

  constructor() {
    // Get MongoDB connection string from environment variable or use default for local development
    const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://christopherjoshy:Fkak7nuijxr7YhaQ@cluster0.vx54pmn.mongodb.net/";
    this.connect(MONGODB_URI);
  }

  private async connect(uri: string): Promise<void> {
    try {
      this.client = new MongoClient(uri);
      await this.client.connect();
      this.db = this.client.db("studynotes"); // You can change the database name
      this.subjectsCollection = this.db.collection<MongoSubject>("subjects");
      this.notesCollection = this.db.collection<MongoNote>("notes");
      
      // Create indexes for better performance
      await this.subjectsCollection.createIndex({ name: 1 });
      await this.notesCollection.createIndex({ subjectId: 1 });
      await this.notesCollection.createIndex({ title: "text", content: "text" });
      
      console.log("Connected to MongoDB successfully");
    } catch (error) {
      console.error("Failed to connect to MongoDB:", error);
      throw error;
    }
  }

  private ensureConnected(): void {
    if (!this.db || !this.subjectsCollection || !this.notesCollection) {
      throw new Error("MongoDB not connected. Please provide connection string.");
    }
  }

  // Subject operations
  async getSubjects(): Promise<Subject[]> {
    this.ensureConnected();
    const subjects = await this.subjectsCollection!.find().sort({ name: 1 }).toArray();
    return subjects.map(doc => this.convertMongoDocument<Subject>(doc));
  }

  async getSubject(id: number): Promise<Subject | undefined> {
    this.ensureConnected();
    const subject = await this.subjectsCollection!.findOne({ id });
    return subject ? this.convertMongoDocument<Subject>(subject) : undefined;
  }

  async createSubject(subject: InsertSubject): Promise<Subject> {
    this.ensureConnected();
    const id = await this.getNextSequence("subjects");
    const newSubject: MongoSubject = {
      id,
      name: subject.name,
      icon: subject.icon || "fas fa-book", // Default icon
      color: subject.color || "gray",      // Default color
      createdAt: new Date(),
    };
    await this.subjectsCollection!.insertOne(newSubject);
    return this.convertMongoDocument<Subject>(newSubject);
  }

  async updateSubject(id: number, subject: Partial<InsertSubject>): Promise<Subject | undefined> {
    this.ensureConnected();
    const result = await this.subjectsCollection!.findOneAndUpdate(
      { id },
      { $set: subject },
      { returnDocument: "after" }
    );
    
    return result ? this.convertMongoDocument<Subject>(result) : undefined;
  }

  async deleteSubject(id: number): Promise<boolean> {
    this.ensureConnected();
    // Delete all notes for this subject first
    await this.notesCollection!.deleteMany({ subjectId: id });
    const result = await this.subjectsCollection!.deleteOne({ id });
    return result.deletedCount > 0;
  }

  // Note operations
  async getNotes(): Promise<Note[]> {
    this.ensureConnected();
    const notes = await this.notesCollection!.find().sort({ updatedAt: -1 }).toArray();
    return notes.map(doc => this.convertMongoDocument<Note>(doc));
  }

  async getNotesBySubject(subjectId: number): Promise<Note[]> {
    this.ensureConnected();
    const notes = await this.notesCollection!.find({ subjectId }).sort({ updatedAt: -1 }).toArray();
    return notes.map(doc => this.convertMongoDocument<Note>(doc));
  }

  async getNote(id: number): Promise<Note | undefined> {
    this.ensureConnected();
    const note = await this.notesCollection!.findOne({ id });
    return note ? this.convertMongoDocument<Note>(note) : undefined;
  }

  async createNote(note: InsertNote): Promise<Note> {
    this.ensureConnected();
    const id = await this.getNextSequence("notes");
    const now = new Date();
    const newNote: MongoNote = {
      id,
      title: note.title,
      content: note.content || "",  // Default content
      subjectId: note.subjectId,
      tags: note.tags || [],        // Default tags
      createdAt: now,
      updatedAt: now,
    };
    await this.notesCollection!.insertOne(newNote);
    return this.convertMongoDocument<Note>(newNote);
  }

  async updateNote(id: number, note: Partial<InsertNote>): Promise<Note | undefined> {
    this.ensureConnected();
    const result = await this.notesCollection!.findOneAndUpdate(
      { id },
      { $set: { ...note, updatedAt: new Date() } },
      { returnDocument: "after" }
    );
    
    return result ? this.convertMongoDocument<Note>(result) : undefined;
  }

  async deleteNote(id: number): Promise<boolean> {
    this.ensureConnected();
    const result = await this.notesCollection!.deleteOne({ id });
    return result.deletedCount > 0;
  }

  async searchNotes(query: string): Promise<Note[]> {
    this.ensureConnected();
    const notes = await this.notesCollection!.find({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { content: { $regex: query, $options: "i" } },
        { tags: { $in: [new RegExp(query, "i")] } }
      ]
    }).sort({ updatedAt: -1 }).toArray();
    return notes.map(doc => this.convertMongoDocument<Note>(doc));
  }

  // Helper methods
  private async getNextSequence(collectionName: string): Promise<number> {
    const countersCollection = this.db!.collection<MongoCounter>("counters");
    const result = await countersCollection.findOneAndUpdate(
      { _id: collectionName },
      { $inc: { sequence: 1 } },
      { upsert: true, returnDocument: "after" }
    );
    
    return result?.sequence || 1; // Default to 1 if result is null
  }

  private convertMongoDocument<T>(doc: T & { _id?: any }): T {
    // Create a new object without the _id field
    const { _id, ...rest } = doc;
    return rest as T;
  }

  async close(): Promise<void> {
    if (this.client) {
      await this.client.close();
      console.log("MongoDB connection closed");
    }
  }
}

export const storage = new MongoStorage();
