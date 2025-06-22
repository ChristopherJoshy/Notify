import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Save, X, Bold, Italic, Underline, List, ListOrdered, Link, Image } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Note } from "@shared/schema";

interface NoteEditorProps {
  note: Note | undefined;
  subjectId: number | null;
  onNoteChange: (noteId: number | null) => void;
}

export default function NoteEditor({ note, subjectId, onNoteChange }: NoteEditorProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [isAutoSave, setIsAutoSave] = useState(true);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Update form when note changes
  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setTags(note.tags);
    } else {
      setTitle("");
      setContent("");
      setTags([]);
    }
  }, [note]);

  const createNoteMutation = useMutation({
    mutationFn: async (data: { title: string; content: string; subjectId: number; tags: string[] }) => {
      const response = await apiRequest("POST", "/api/notes", data);
      return response.json();
    },
    onSuccess: (newNote) => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/subjects"] });
      onNoteChange(newNote.id);
      toast({ title: "Note created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create note", variant: "destructive" });
    },
  });

  const updateNoteMutation = useMutation({
    mutationFn: async (data: { id: number; title: string; content: string; tags: string[] }) => {
      const { id, ...updateData } = data;
      const response = await apiRequest("PUT", `/api/notes/${id}`, updateData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      toast({ title: "Note saved" });
    },
    onError: () => {
      toast({ title: "Failed to save note", variant: "destructive" });
    },
  });

  const handleSave = () => {
    if (!title.trim()) {
      toast({ title: "Please enter a title", variant: "destructive" });
      return;
    }

    if (!subjectId) {
      toast({ title: "Please select a subject", variant: "destructive" });
      return;
    }

    if (note) {
      updateNoteMutation.mutate({
        id: note.id,
        title: title.trim(),
        content: content.trim(),
        tags,
      });
    } else {
      createNoteMutation.mutate({
        title: title.trim(),
        content: content.trim(),
        subjectId,
        tags,
      });
    }
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newTag.trim()) {
      e.preventDefault();
      const trimmedTag = newTag.trim().toLowerCase();
      if (!tags.includes(trimmedTag)) {
        setTags([...tags, trimmedTag]);
      }
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const isEditing = note !== undefined;
  const hasChanges = note ? (
    title !== note.title || content !== note.content || JSON.stringify(tags) !== JSON.stringify(note.tags)
  ) : (title.trim() || content.trim() || tags.length > 0);

  return (
    <Card className="h-full">
      <CardContent className="p-0 h-full flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-black">
              {isEditing ? "Edit Note" : "New Note"}
            </h2>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-orange-500"
                onClick={() => setIsAutoSave(!isAutoSave)}
              >
                <Save className="h-4 w-4 mr-1" />
                Auto-save {isAutoSave ? "ON" : "OFF"}
              </Button>
              <Button
                onClick={handleSave}
                disabled={!hasChanges || createNoteMutation.isPending || updateNoteMutation.isPending}
              >
                Save
              </Button>
            </div>
          </div>
          
          {/* Title Input */}
          <Input
            type="text"
            placeholder="Note title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg font-medium mb-4"
          />
          
          {/* Tags Section */}
          <div>
            <Input
              type="text"
              placeholder="Add tags (press Enter)"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={handleAddTag}
              className="text-sm mb-2"
            />
            <div className="flex items-center space-x-2 flex-wrap">
              {tags.map((tag, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="flex items-center space-x-1"
                >
                  <span>{tag}</span>
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        </div>
        
        {/* Editor */}
        <div className="flex-1 flex flex-col p-6">
          {/* Toolbar */}
          <div className="flex items-center space-x-2 mb-4 pb-4 border-b border-gray-200">
            <Button variant="ghost" size="sm" className="p-2">
              <Bold className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="p-2">
              <Italic className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="p-2">
              <Underline className="h-4 w-4" />
            </Button>
            <div className="border-l border-gray-300 h-6 mx-2"></div>
            <Button variant="ghost" size="sm" className="p-2">
              <List className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="p-2">
              <ListOrdered className="h-4 w-4" />
            </Button>
            <div className="border-l border-gray-300 h-6 mx-2"></div>
            <Button variant="ghost" size="sm" className="p-2">
              <Link className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="p-2">
              <Image className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Text Area */}
          <Textarea
            placeholder={subjectId ? "Start typing your notes here..." : "Please select a subject first"}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-1 resize-none border-0 focus:ring-0 text-sm leading-relaxed"
            disabled={!subjectId}
          />
        </div>
      </CardContent>
    </Card>
  );
}
