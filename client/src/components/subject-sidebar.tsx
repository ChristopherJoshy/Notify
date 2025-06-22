import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useState } from "react";
import AddSubjectDialog from "./add-subject-dialog";
import type { Subject } from "@shared/schema";

interface SubjectSidebarProps {
  subjects: (Subject & { noteCount: number })[];
  selectedSubjectId: number | null;
  onSelectSubject: (id: number) => void;
}

const iconMap: Record<string, string> = {
  "fas fa-calculator": "🧮",
  "fas fa-atom": "⚛️",
  "fas fa-flask": "🧪",
  "fas fa-landmark": "🏛️",
  "fas fa-book-open": "📖",
  "fas fa-book": "📚",
};

const colorMap: Record<string, string> = {
  blue: "border-l-blue-500 bg-blue-50",
  green: "border-l-green-500 bg-green-50",
  purple: "border-l-purple-500 bg-purple-50",
  orange: "border-l-orange-500 bg-orange-50",
  red: "border-l-red-500 bg-red-50",
  gray: "border-l-gray-500 bg-gray-50",
};

export default function SubjectSidebar({ subjects, selectedSubjectId, onSelectSubject }: SubjectSidebarProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);

  return (
    <>
      <Card className="sticky top-24">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-black">Subjects</h2>
            <Button
              size="sm"
              className="w-8 h-8 rounded-full p-0"
              onClick={() => setShowAddDialog(true)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-2">
            {subjects.map((subject) => (
              <div
                key={subject.id}
                className={`p-3 rounded-lg cursor-pointer border-l-4 transition-colors ${
                  selectedSubjectId === subject.id
                    ? colorMap[subject.color] || colorMap.gray
                    : "border-l-transparent hover:bg-gray-50"
                }`}
                onClick={() => onSelectSubject(subject.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-black">{subject.name}</h3>
                    <p className="text-sm text-gray-700">{subject.noteCount} notes</p>
                  </div>
                  <div className="text-xl">
                    {iconMap[subject.icon] || "📚"}
                  </div>
                </div>
              </div>
            ))}
            
            {subjects.length === 0 && (
              <div className="text-center py-8 text-black">
                <p className="mb-2">No subjects yet</p>
                <p className="text-sm">Click + to add your first subject</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <AddSubjectDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
      />
    </>
  );
}
