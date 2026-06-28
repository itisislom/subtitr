import { create } from 'zustand';
import {
  SubtitleItem,
  SubtitleStyle,
  SubtitlePreset,
  UploadProgress,
  VideoState,
  EditorState,
  DEFAULT_STYLE,
  ProjectData,
  ExportFormat,
} from '../types';

interface UndoRedoEntry {
  subtitles: SubtitleItem[];
  style: SubtitleStyle;
}

interface AppState {
  page: 'home' | 'editor';
  projectId: string | null;
  project: ProjectData | null;
  subtitles: SubtitleItem[];
  style: SubtitleStyle;
  presets: SubtitlePreset[];
  uploadProgress: UploadProgress;
  video: VideoState;
  editor: EditorState;
  searchQuery: string;
  isExporting: boolean;
  undoStack: UndoRedoEntry[];
  redoStack: UndoRedoEntry[];

  setPage: (page: 'home' | 'editor') => void;
  setProjectId: (id: string | null) => void;
  setProject: (project: ProjectData | null) => void;
  setSubtitles: (subtitles: SubtitleItem[]) => void;
  updateSubtitle: (id: string, updates: Partial<SubtitleItem>) => void;
  deleteSubtitle: (id: string) => void;
  addSubtitle: (subtitle: SubtitleItem) => void;
  setStyle: (style: SubtitleStyle) => void;
  setPresets: (presets: SubtitlePreset[]) => void;
  applyPreset: (preset: SubtitlePreset) => void;
  setUploadProgress: (progress: UploadProgress) => void;
  setVideoState: (state: Partial<VideoState>) => void;
  setEditorState: (state: Partial<EditorState>) => void;
  setSearchQuery: (query: string) => void;
  setIsExporting: (isExporting: boolean) => void;

  pushUndo: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  reset: () => void;
}

const initialState = {
  page: 'home' as const,
  projectId: null,
  project: null,
  subtitles: [],
  style: DEFAULT_STYLE,
  presets: [],
  uploadProgress: { stage: 'idle' as const, progress: 0 },
  video: { isPlaying: false, currentTime: 0, duration: 0, volume: 1, playbackRate: 1 },
  editor: { selectedSubtitleId: null, selectedWordIndex: null, isDragging: false, isResizing: false, zoom: 1 },
  searchQuery: '',
  isExporting: false,
  undoStack: [],
  redoStack: [],
};

export const useStore = create<AppState>((set, get) => ({
  ...initialState,

  setPage: (page) => set({ page }),
  setProjectId: (projectId) => set({ projectId }),
  setProject: (project) => set({ project }),
  setSubtitles: (subtitles) => set({ subtitles }),
  updateSubtitle: (id, updates) =>
    set((state) => ({
      subtitles: state.subtitles.map((s) =>
        s.id === id ? { ...s, ...updates } : s
      ),
    })),
  deleteSubtitle: (id) =>
    set((state) => ({
      subtitles: state.subtitles.filter((s) => s.id !== id),
    })),
  addSubtitle: (subtitle) =>
    set((state) => ({
      subtitles: [...state.subtitles, subtitle],
    })),
  setStyle: (style) => set({ style }),
  setPresets: (presets) => set({ presets }),
  applyPreset: (preset) => set({ style: { ...preset.style } }),
  setUploadProgress: (uploadProgress) => set({ uploadProgress }),
  setVideoState: (state) =>
    set((prev) => ({ video: { ...prev.video, ...state } })),
  setEditorState: (state) =>
    set((prev) => ({ editor: { ...prev.editor, ...state } })),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setIsExporting: (isExporting) => set({ isExporting }),

  pushUndo: () =>
    set((state) => ({
      undoStack: [
        ...state.undoStack.slice(-49),
        { subtitles: JSON.parse(JSON.stringify(state.subtitles)), style: JSON.parse(JSON.stringify(state.style)) },
      ],
      redoStack: [],
    })),

  undo: () =>
    set((state) => {
      if (state.undoStack.length === 0) return state;
      const prev = state.undoStack[state.undoStack.length - 1];
      return {
        undoStack: state.undoStack.slice(0, -1),
        redoStack: [
          ...state.redoStack,
          { subtitles: JSON.parse(JSON.stringify(state.subtitles)), style: JSON.parse(JSON.stringify(state.style)) },
        ],
        subtitles: prev.subtitles,
        style: prev.style,
      };
    }),

  redo: () =>
    set((state) => {
      if (state.redoStack.length === 0) return state;
      const next = state.redoStack[state.redoStack.length - 1];
      return {
        redoStack: state.redoStack.slice(0, -1),
        undoStack: [
          ...state.undoStack,
          { subtitles: JSON.parse(JSON.stringify(state.subtitles)), style: JSON.parse(JSON.stringify(state.style)) },
        ],
        subtitles: next.subtitles,
        style: next.style,
      };
    }),

  canUndo: () => get().undoStack.length > 0,
  canRedo: () => get().redoStack.length > 0,

  reset: () => set(initialState),
}));
