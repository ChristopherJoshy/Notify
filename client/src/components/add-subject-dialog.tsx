import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AddSubjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const subjectOptions = [
  { name: "Mathematics", icon: "fas fa-calculator", color: "blue" },
  { name: "Physics", icon: "fas fa-atom", color: "green" },
  { name: "Chemistry", icon: "fas fa-flask", color: "purple" },
  { name: "Biology", icon: "fas fa-leaf", color: "green" },
  { name: "History", icon: "fas fa-landmark", color: "orange" },
  { name: "English Literature", icon: "fas fa-book-open", color: "red" },
  { name: "Geography", icon: "fas fa-globe", color: "blue" },
  { name: "Computer Science", icon: "fas fa-laptop-code", color: "blue" },
  { name: "Economics", icon: "fas fa-chart-line", color: "green" },
  { name: "Psychology", icon: "fas fa-brain", color: "purple" },
];

const colorOptions = [
  { value: "blue", label: "Blue" },
  { value: "green", label: "Green" },
  { value: "purple", label: "Purple" },
  { value: "orange", label: "Orange" },
  { value: "red", label: "Red" },
  { value: "gray", label: "Gray" },
];

export default function AddSubjectDialog({ open, onOpenChange }: AddSubjectDialogProps) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("fas fa-book");
  const [color, setColor] = useState("blue");

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createSubjectMutation = useMutation({
    mutationFn: async (data: { name: string; icon: string; color: string }) => {
      const response = await apiRequest("POST", "/api/subjects", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subjects"] });
      toast({ title: "Subject created successfully" });
      onOpenChange(false);
      resetForm();
    },
    onError: () => {
      toast({ title: "Failed to create subject", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setName("");
    setIcon("fas fa-book");
    setColor("blue");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({ title: "Please enter a subject name", variant: "destructive" });
      return;
    }

    createSubjectMutation.mutate({
      name: name.trim(),
      icon,
      color,
    });
  };

  const handlePresetSelect = (preset: typeof subjectOptions[0]) => {
    setName(preset.name);
    setIcon(preset.icon);
    setColor(preset.color);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Subject</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Quick Presets */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Quick Select</Label>
            <div className="grid grid-cols-2 gap-2">
              {subjectOptions.slice(0, 6).map((preset) => (
                <Button
                  key={preset.name}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="justify-start"
                  onClick={() => handlePresetSelect(preset)}
                >
                  {preset.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Subject */}
          <div className="space-y-4 pt-4 border-t">
            <div>
              <Label htmlFor="name">Subject Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter subject name"
                required
              />
            </div>

            <div>
              <Label htmlFor="color">Color</Label>
              <Select value={color} onValueChange={setColor}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {colorOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createSubjectMutation.isPending}
            >
              {createSubjectMutation.isPending ? "Creating..." : "Create Subject"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
