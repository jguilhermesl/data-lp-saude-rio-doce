'use client';

import { useState } from 'react';
import { X, MessageSquare, Send, Trash2, Loader2, User } from 'lucide-react';
import { useDispatchNotes, useCreateNote, useDeleteNote } from '@/hooks/useDispatchNotes';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { cn } from '@/lib/utils';

interface DispatchNotesModalProps {
  itemId: string;
  patientName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function DispatchNotesModal({ itemId, patientName, isOpen, onClose }: DispatchNotesModalProps) {
  const [noteText, setNoteText] = useState('');
  const { data: notes, isLoading } = useDispatchNotes(itemId);
  const createNote = useCreateNote(itemId);
  const deleteNote = useDeleteNote(itemId);
  const { user: currentUser } = useCurrentUser();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    try {
      await createNote.mutateAsync(noteText);
      setNoteText('');
    } catch (error) {
      console.error('Error creating note:', error);
    }
  };

  const handleDelete = async (noteId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta nota?')) return;

    try {
      await deleteNote.mutateAsync(noteId);
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Recife',
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#00000040] bg-opacity-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Notas do Paciente</h2>
              <p className="text-sm text-gray-500">{patientName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : notes && notes.length > 0 ? (
            notes.map((note) => (
              <div key={note.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 bg-gray-200 rounded-full">
                        <User className="w-3 h-3 text-gray-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {note.user.name || note.user.email}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(note.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                      {note.note}
                    </p>
                  </div>
                  {currentUser?.id === note.userId && (
                    <button
                      onClick={() => handleDelete(note.id)}
                      disabled={deleteNote.isPending}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600 hover:text-red-700 disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <MessageSquare className="w-12 h-12 text-gray-300 mb-2" />
              <p className="text-gray-500 text-sm">Nenhuma nota encontrada</p>
              <p className="text-gray-400 text-xs mt-1">Adicione a primeira nota abaixo</p>
            </div>
          )}
        </div>

        {/* Add Note Form */}
        <div className="p-6 border-t border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-3">
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Digite sua nota aqui..."
              rows={3}
              className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              disabled={createNote.isPending}
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Fechar
              </button>
              <button
                type="submit"
                disabled={!noteText.trim() || createNote.isPending}
                className={cn(
                  'px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors flex items-center gap-2',
                  noteText.trim() && !createNote.isPending
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-300 cursor-not-allowed'
                )}
              >
                {createNote.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Adicionar Nota
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
