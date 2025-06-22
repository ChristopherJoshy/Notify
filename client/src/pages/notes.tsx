import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, User, Plus } from "lucide-react";
import SubjectSidebar from "@/components/subject-sidebar";
import NotesList from "@/components/notes-list";
import NoteEditor from "@/components/note-editor";
import type { Subject, Note } from "@shared/schema";

export default function NotesPage() {
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
  const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: subjects = [] } = useQuery<(Subject & { noteCount: number })[]>({
    queryKey: ["/api/subjects"],
  });

  const { data: notes = [] } = useQuery<Note[]>({
    queryKey: ["/api/notes", selectedSubjectId, searchQuery],
    queryFn: () => {
      const params = new URLSearchParams();
      if (selectedSubjectId) params.set("subjectId", selectedSubjectId.toString());
      if (searchQuery) params.set("search", searchQuery);
      return fetch(`/api/notes?${params}`).then(res => res.json());
    },
  });

  const selectedSubject = subjects.find(s => s.id === selectedSubjectId);
  const selectedNote = notes.find(n => n.id === selectedNoteId);

  // Auto-select first subject if none selected
  if (!selectedSubjectId && subjects.length > 0) {
    setSelectedSubjectId(subjects[0].id);
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is automatically triggered by the query dependency
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="text-white text-2xl mr-3">📝</div>
              <h1 className="text-white text-xl font-medium">Notify</h1>
            </div>
            
            {/* Search Bar */}
            <div className="flex-1 max-w-lg mx-8">
              <form onSubmit={handleSearch} className="relative">
                <Input
                  type="text"
                  placeholder="Search notes by keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 bg-white/90 text-black placeholder-gray-600 border-0 focus:ring-2 focus:ring-white/50"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              </form>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="text-white hover:text-gray-200">
                <User className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Subjects Sidebar */}
          <div className="lg:col-span-1">
            <SubjectSidebar
              subjects={subjects}
              selectedSubjectId={selectedSubjectId}
              onSelectSubject={setSelectedSubjectId}
            />
          </div>
          
          {/* Notes List and Editor */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Notes List */}
              <div className="xl:col-span-1">
                <NotesList
                  notes={notes}
                  selectedSubject={selectedSubject}
                  selectedNoteId={selectedNoteId}
                  onSelectNote={setSelectedNoteId}
                />
              </div>
              
              {/* Note Editor */}
              <div className="xl:col-span-1">
                <NoteEditor
                  note={selectedNote}
                  subjectId={selectedSubjectId}
                  onNoteChange={setSelectedNoteId}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile FAB */}
      <Button
        className="lg:hidden fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg z-40"
        onClick={() => {
          // Create new note for selected subject
          if (selectedSubjectId) {
            // This will be handled by the NoteEditor component
            setSelectedNoteId(null);
          }
        }}
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
}
