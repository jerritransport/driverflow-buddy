import { useState } from 'react';
import { useDriverNotes, useAddDriverNote, useDeleteDriverNote } from '@/hooks/useDriverNotes';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Send, Loader2, Trash2, User } from 'lucide-react';
import { toast } from 'sonner';

interface NotesTabProps {
  driverId: string;
}

export function NotesTab({ driverId }: NotesTabProps) {
  const [newNote, setNewNote] = useState('');
  const { data: notes, isLoading, error } = useDriverNotes(driverId);
  const addNote = useAddDriverNote();
  const deleteNote = useDeleteDriverNote();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    try {
      await addNote.mutateAsync({ driverId, noteText: newNote.trim() });
      setNewNote('');
      toast.success('Note added');
    } catch {
      toast.error('Failed to add note');
    }
  };

  const handleDelete = async (noteId: string) => {
    try {
      await deleteNote.mutateAsync({ noteId, driverId });
      toast.success('Note deleted');
    } catch {
      toast.error('Failed to delete note');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive p-4">
        <p className="text-sm text-destructive">Failed to load notes</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Add Note Form */}
      <form onSubmit={handleSubmit} className="space-y-2">
        <Textarea
          placeholder="Add a note..."
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          className="min-h-[80px] resize-none"
        />
        <div className="flex justify-end">
          <Button
            type="submit"
            size="sm"
            disabled={!newNote.trim() || addNote.isPending}
          >
            {addNote.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            Add Note
          </Button>
        </div>
      </form>

      {/* Notes List */}
      {notes && notes.length > 0 ? (
        <div className="space-y-3">
          {notes.map((note) => (
            <div
              key={note.id}
              className="group rounded-lg border bg-card p-3 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <User className="h-3 w-3" />
                  <span>{note.user_email || 'System'}</span>
                  <span>•</span>
                  <span>
                    {note.created_at
                      ? formatDistanceToNow(new Date(note.created_at), { addSuffix: true })
                      : 'Just now'}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleDelete(note.id)}
                  disabled={deleteNote.isPending}
                >
                  {deleteNote.isPending ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                  )}
                </Button>
              </div>
              <p className="mt-2 text-sm whitespace-pre-wrap">{note.note_text}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <MessageSquare className="h-10 w-10 text-muted-foreground/50" />
          <p className="mt-2 text-sm text-muted-foreground">No notes yet</p>
          <p className="text-xs text-muted-foreground">Add a note to keep track of important information</p>
        </div>
      )}
    </div>
  );
}
