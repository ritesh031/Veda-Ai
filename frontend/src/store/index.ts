import { create } from 'zustand';
import { Assignment, GeneratedPaper, WSMessage } from '@/types';
import api from '@/lib/api';

interface Store {
  assignments: Assignment[];
  current: Assignment | null;
  paper: GeneratedPaper | null;
  loading: boolean;
  generating: boolean;
  progress: number;
  progressMsg: string;
  error: string | null;

  fetchAll: () => Promise<void>;
  fetchOne: (id: string) => Promise<void>;
  create: (fd: FormData) => Promise<string>;
  regenerate: (id: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
  handleWS: (msg: WSMessage) => void;
  setGenerating: (v: boolean) => void;
  clearCurrent: () => void;
}

export const useStore = create<Store>((set, get) => ({
  assignments: [],
  current: null,
  paper: null,
  loading: false,
  generating: false,
  progress: 0,
  progressMsg: '',
  error: null,

  fetchAll: async () => {
    set({ loading: true });
    try {
      const { data } = await api.get('/assignments');
      set({ assignments: data, loading: false });
    } catch (e: any) { set({ loading: false, error: e.message }); }
  },

  fetchOne: async (id) => {
    set({ loading: true });
    try {
      const { data } = await api.get(`/assignments/${id}`);
      set({ current: data, loading: false });
      if (data.generatedPaper) set({ paper: data.generatedPaper });
    } catch (e: any) { set({ loading: false, error: e.message }); }
  },

  create: async (fd) => {
    set({ loading: true, generating: true, progress: 5, error: null });
    try {
      const { data } = await api.post('/assignments', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      set({ loading: false });
      return data.assignmentId;
    } catch (e: any) {
      set({ loading: false, generating: false });
      throw e;
    }
  },

  regenerate: async (id) => {
    set({ generating: true, progress: 5, paper: null, progressMsg: 'Restarting...' });
    await api.post(`/assignments/${id}/regenerate`);
  },

  remove: async (id) => {
    await api.delete(`/assignments/${id}`);
    set((s) => ({ assignments: s.assignments.filter((a) => a._id !== id) }));
  },

  handleWS: (msg) => {
    if (msg.type === 'progress') {
      set({ generating: true, progress: msg.progress || 0, progressMsg: msg.message || '' });
    } else if (msg.type === 'completed' && msg.paper) {
      set({ paper: msg.paper, generating: false, progress: 100, progressMsg: 'Done!' });
    } else if (msg.type === 'failed') {
      set({ generating: false, error: msg.error || 'Generation failed', progress: 0 });
    }
  },

  setGenerating: (v) => set({ generating: v }),
  clearCurrent: () => set({ current: null, paper: null, generating: false, progress: 0, progressMsg: '', error: null }),
}));
