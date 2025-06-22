import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Subject, Note } from "@shared/schema";

interface NotesListProps {
  notes: Note[];
  selectedSubject: (Subject & { noteCount: number }) | undefined;
  selectedNoteId: number | null;
  onSelectNote: (id: number | null) => void;
}

export default function NotesList({ notes, selectedSubject, selectedNoteId, onSelectNote }: NotesListProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const deleteNoteMutation = useMutation({
    mutationFn: async (noteId: number) => {
      await apiRequest("DELETE", `/api/notes/${noteId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/subjects"] });
      toast({ title: "Note deleted successfully" });
      if (selectedNoteId) {
        onSelectNote(null);
      }
    },
    onError: () => {
      toast({ title: "Failed to delete note", variant: "destructive" });
    },
  });

  const handleCreateNote = () => {
    onSelectNote(null); // This will trigger the editor to show create mode
  };

  const handleDeleteNote = (noteId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this note?")) {
      deleteNoteMutation.mutate(noteId);
    }
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffHours < 48) return "1 day ago";
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} days ago`;
    return d.toLocaleDateString();
  };

  const colorMap: Record<string, string> = {
    algebra: "bg-blue-100 text-blue-700",
    calculus: "bg-green-100 text-green-700",
    trigonometry: "bg-purple-100 text-purple-700",
    statistics: "bg-orange-100 text-orange-700",
    equations: "bg-gray-200 text-gray-700",
    integration: "bg-gray-200 text-gray-700",
    functions: "bg-gray-200 text-gray-700",
    probability: "bg-gray-200 text-gray-700",
  };

  return (
    <Card>
      <CardContent className="p-0">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-medium text-black">
                {selectedSubject ? `${selectedSubject.name} Notes` : "All Notes"}
              </h2>
              <p className="text-sm text-gray-700 mt-1">{notes.length} notes total</p>
            </div>
            <Button
              onClick={handleCreateNote}
              className="flex items-center"
              disabled={!selectedSubject}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Note
            </Button>
          </div>
        </div>
        
        <div className="p-4">
          {notes.length === 0 ? (
            <div className="text-center py-12 text-black">
              <p className="mb-2">No notes yet</p>
              <p className="text-sm">
                {selectedSubject 
                  ? "Click 'New Note' to create your first note for this subject"
                  : "Select a subject to view its notes"
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className={`p-4 border rounded-lg cursor-pointer hover:shadow-md transition-shadow ${
                    selectedNoteId === note.id
                      ? "border-primary bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => onSelectNote(note.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-black truncate flex-1 mr-4">
                      {note.title || "Untitled Note"}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-orange-500 p-1 h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectNote(note.id);
                        }}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-red-500 p-1 h-6 w-6"
                        onClick={(e) => handleDeleteNote(note.id, e)}
                        disabled={deleteNoteMutation.isPending}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <p className="text-sm text-black line-clamp-2 mb-3">
                    {note.content ? note.content.substring(0, 150) + "..." : "No content"}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {note.tags.slice(0, 2).map((tag, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className={`text-xs ${colorMap[tag.toLowerCase()] || "bg-gray-200 text-gray-700"}`}
                        >
                          {tag}
                        </Badge>
                      ))}
                      {note.tags.length > 2 && (
                        <span className="text-xs text-black">+{note.tags.length - 2}</span>
                      )}
                    </div>
                    <span className="text-xs text-black">
                      {formatDate(note.updatedAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
