export interface WordTimestamp {
  word: string;
  start: number;
  end: number;
  confidence: number;
}

export interface SubtitleItem {
  id: string;
  index: number;
  start: number;
  end: number;
  text: string;
  words: WordTimestamp[];
}

export interface SubtitleStyle {
  fontSize: number;
  fontFamily: string;
  fontWeight: number;
  color: string;
  strokeColor: string;
  strokeWidth: number;
  shadow: string;
  opacity: number;
  background: string;
  borderRadius: number;
  padding: number;
  position: 'top' | 'middle' | 'bottom';
  alignment: 'left' | 'center' | 'right';
  letterSpacing: number;
  lineHeight: number;
  animationIn: AnimationType;
  animationOut: AnimationType;
  animationDuration: number;
}

export type AnimationType =
  | 'fade'
  | 'pop'
  | 'scale'
  | 'slideUp'
  | 'slideDown'
  | 'bounce'
  | 'zoom'
  | 'blur'
  | 'typewriter'
  | 'wordByWord'
  | 'letterByLetter'
  | 'kineticTypography';

export type ExportFormat = 'srt' | 'vtt' | 'txt' | 'ass';

export interface SubtitlePreset {
  id: string;
  name: string;
  style: SubtitleStyle;
}

export interface ProjectData {
  id: string;
  videoPath: string;
  subtitles: SubtitleItem[];
  style: SubtitleStyle;
  createdAt: string;
  updatedAt: string;
}

export interface UploadProgress {
  stage: ProgressStage;
  progress: number;
  message?: string;
}

export type ProgressStage =
  | 'uploading'
  | 'analyzing'
  | 'transcribing'
  | 'generating'
  | 'almostDone'
  | 'completed'
  | 'idle';

export interface VideoState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playbackRate: number;
}

export interface EditorState {
  selectedSubtitleId: string | null;
  selectedWordIndex: number | null;
  isDragging: boolean;
  isResizing: boolean;
  zoom: number;
}

export const DEFAULT_STYLE: SubtitleStyle = {
  fontSize: 24,
  fontFamily: 'Inter, sans-serif',
  fontWeight: 400,
  color: '#FFFFFF',
  strokeColor: '#000000',
  strokeWidth: 1,
  shadow: '0 2px 4px rgba(0,0,0,0.5)',
  opacity: 1,
  background: 'rgba(0,0,0,0.5)',
  borderRadius: 4,
  padding: 8,
  position: 'bottom',
  alignment: 'center',
  letterSpacing: 0,
  lineHeight: 1.4,
  animationIn: 'fade',
  animationOut: 'fade',
  animationDuration: 0.3,
};
