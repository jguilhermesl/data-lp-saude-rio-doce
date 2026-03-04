import { api } from '@/lib/axios';

export interface DispatchNote {
  id: string;
  dispatchItemId: string;
  userId: string;
  note: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

export interface CreateNoteData {
  itemId: string;
  note: string;
}

export const dispatchNotesAPI = {
  getNotes: async (itemId: string): Promise<DispatchNote[]> => {
    const response = await api.get(`/dispatches/items/${itemId}/notes`);
    return response.data.data;
  },

  createNote: async (data: CreateNoteData): Promise<DispatchNote> => {
    const response = await api.post(`/dispatches/items/${data.itemId}/notes`, {
      note: data.note,
    });
    return response.data.data;
  },

  deleteNote: async (noteId: string): Promise<void> => {
    await api.delete(`/dispatches/notes/${noteId}`);
  },
};
