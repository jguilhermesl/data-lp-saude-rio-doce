import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dispatchNotesAPI, CreateNoteData } from '@/services/api/dispatch-notes';

export function useDispatchNotes(itemId: string) {
  return useQuery({
    queryKey: ['dispatch-notes', itemId],
    queryFn: () => dispatchNotesAPI.getNotes(itemId),
    enabled: !!itemId,
  });
}

export function useCreateNote(itemId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (note: string) => dispatchNotesAPI.createNote({ itemId, note }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dispatch-notes', itemId] });
    },
  });
}

export function useDeleteNote(itemId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (noteId: string) => dispatchNotesAPI.deleteNote(noteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dispatch-notes', itemId] });
    },
  });
}
