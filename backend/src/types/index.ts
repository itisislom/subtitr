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

export interface TranscriptionResponse {
  id: string;
  subtitles: SubtitleItem[];
  language: string;
  duration: number;
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

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface UploadProgress {
  stage: 'uploading' | 'analyzing' | 'transcribing' | 'generating' | 'almostDone' | 'completed';
  progress: number;
  message?: string;
}
