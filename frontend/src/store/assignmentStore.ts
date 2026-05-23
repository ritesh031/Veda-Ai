import { create } from 'zustand';
import { Assignment, GeneratedPaper, WSMessage } from '@/types';
import api from '@/lib/api';

interface AssignmentStore {
  assignments: Assignment[];
  currentAssignment: Assignment | null;
  currentPaper: GeneratedPaper | null;
  isLoading: boolean;
  isGenerating: boolean;
  progress: number;
  progressMessage: string;
  wsConnected: boolean;
  error: string | null;

  // Actions
  fetchAssignments: () => Promise<void>;
  fetchAssignment: (id: string) => Promise<void>;
  createAssignment: (formData: FormData) => Promise<string>;
  regenerate: (id: string) => Promise<void>;
  setProgress: (progress: number, message?: string) => void;
  setGenerating: (val: boolean) => void;
  handleWSMessage: (msg: WSMessage) => void;
  setWsConnected: (val: boolean) => void;
  clearCurrent: () => void;
}

export const useAssignmentStore = create<AssignmentStore>((set, get) => ({
  assignments: [],
  currentAssignment: null,
  currentPaper: null,
  isLoading: false,
  isGenerating: false,
  progress: 0,
  progressMessage: '',
  wsConnected: false,
  error: null,

  fetchAssignments: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get('/assignments');
      set({ assignments: data, isLoading: false });
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
    }
  },

  fetchAssignment: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get(`/assignments/${id}`);
      set({ currentAssignment: data, isLoading: false });
      if (data.generatedPaper) {
        set({ currentPaper: data.generatedPaper });
      }
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
    }
  },

  createAssignment: async (formData: FormData) => {
    set({ isLoading: true, error: null, isGenerating: true, progress: 5 });
    try {
      const { data } = await api.post('/assignments', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      set({ isLoading: false });
      return data.assignmentId;
    } catch (e: any) {
      set({ error: e.message, isLoading: false, isGenerating: false });
      throw e;
    }
  },

  regenerate: async (id: string) => {
    set({ isGenerating: true, progress: 5, progressMessage: 'Starting regeneration...' });
    try {
      await api.post(`/assignments/${id}/regenerate`);
    } catch (e: any) {
      set({ error: e.message, isGenerating: false });
    }
  },

  setProgress: (progress, message = '') => {
    set({ progress, progressMessage: message });
  },

  setGenerating: (val) => {
    set({ isGenerating: val });
  },

  handleWSMessage: (msg: WSMessage) => {
    if (msg.type === 'status') {
      set({
        progress: msg.progress || 0,
        progressMessage: msg.message || '',
        isGenerating: true,
      });
    } else if (msg.type === 'completed' && msg.paper) {
      set({
        currentPaper: msg.paper,
        isGenerating: false,
        progress: 100,
        progressMessage: 'Generation complete!',
      });
    } else if (msg.type === 'failed') {
      set({
        isGenerating: false,
        error: msg.error || 'Generation failed',
        progress: 0,
      });
    }
  },

  setWsConnected: (val) => set({ wsConnected: val }),

  clearCurrent: () => set({
    currentAssignment: null,
    currentPaper: null,
    isGenerating: false,
    progress: 0,
    progressMessage: '',
    error: null,
  }),
}));
