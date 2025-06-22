import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSubjectSchema, insertNoteSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint for monitoring
  app.get("/api/health", async (req, res) => {
    try {
      // Check MongoDB connection
      await storage.getSubjects();
      res.status(200).json({ status: "ok", message: "Service is healthy" });
    } catch (error) {
      console.error("Health check failed:", error);
      res.status(500).json({ status: "error", message: "Service is unhealthy" });
    }
  });

  // Subject routes
  app.get("/api/subjects", async (req, res) => {
    try {
      const subjects = await storage.getSubjects();
      const subjectsWithNoteCounts = await Promise.all(
        subjects.map(async (subject) => {
          const notes = await storage.getNotesBySubject(subject.id);
          return { ...subject, noteCount: notes.length };
        })
      );
      res.json(subjectsWithNoteCounts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch subjects" });
    }
  });

  app.post("/api/subjects", async (req, res) => {
    try {
      const validatedData = insertSubjectSchema.parse(req.body);
      const subject = await storage.createSubject(validatedData);
      res.status(201).json(subject);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid subject data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create subject" });
      }
    }
  });

  app.put("/api/subjects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertSubjectSchema.partial().parse(req.body);
      const subject = await storage.updateSubject(id, validatedData);
      
      if (!subject) {
        res.status(404).json({ message: "Subject not found" });
        return;
      }
      
      res.json(subject);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid subject data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update subject" });
      }
    }
  });

  app.delete("/api/subjects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteSubject(id);
      
      if (!deleted) {
        res.status(404).json({ message: "Subject not found" });
        return;
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete subject" });
    }
  });

  // Note routes
  app.get("/api/notes", async (req, res) => {
    try {
      const { subjectId, search } = req.query;
      
      let notes;
      if (search) {
        notes = await storage.searchNotes(search as string);
      } else if (subjectId) {
        notes = await storage.getNotesBySubject(parseInt(subjectId as string));
      } else {
        notes = await storage.getNotes();
      }
      
      res.json(notes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notes" });
    }
  });

  app.get("/api/notes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const note = await storage.getNote(id);
      
      if (!note) {
        res.status(404).json({ message: "Note not found" });
        return;
      }
      
      res.json(note);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch note" });
    }
  });

  app.post("/api/notes", async (req, res) => {
    try {
      const validatedData = insertNoteSchema.parse(req.body);
      const note = await storage.createNote(validatedData);
      res.status(201).json(note);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid note data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create note" });
      }
    }
  });

  app.put("/api/notes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertNoteSchema.partial().parse(req.body);
      const note = await storage.updateNote(id, validatedData);
      
      if (!note) {
        res.status(404).json({ message: "Note not found" });
        return;
      }
      
      res.json(note);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid note data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update note" });
      }
    }
  });

  app.delete("/api/notes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteNote(id);
      
      if (!deleted) {
        res.status(404).json({ message: "Note not found" });
        return;
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete note" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
