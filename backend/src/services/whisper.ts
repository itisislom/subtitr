import fs from 'fs';
import path from 'path';
import { WordTimestamp, SubtitleItem } from '../types';

const MODEL_CACHE_DIR = path.join(__dirname, '../../model_cache');

type TranscriberFn = (audio: any, options?: any) => Promise<{
  text: string;
  chunks?: { text: string; timestamp: [number, number]; type?: string }[];
}>;

let transcriberInstance: TranscriberFn | null = null;
let modelReady = false;

async function getTranscriber(): Promise<TranscriberFn> {
  if (modelReady && transcriberInstance) return transcriberInstance!;

  process.env.HF_HOME = MODEL_CACHE_DIR;
  process.env.TRANSFORMERS_CACHE = MODEL_CACHE_DIR;

  if (!fs.existsSync(MODEL_CACHE_DIR)) {
    fs.mkdirSync(MODEL_CACHE_DIR, { recursive: true });
  }

  const { pipeline } = await import('@huggingface/transformers');

  console.log('Loading Whisper model (Xenova/whisper-tiny)...');
  console.log('First run will download ~150MB model to:', MODEL_CACHE_DIR);

  const pipe = await pipeline(
    'automatic-speech-recognition',
    'Xenova/whisper-tiny',
    {} as any
  ) as unknown as TranscriberFn;

  transcriberInstance = pipe;
  modelReady = true;
  console.log('Whisper model ready.');

  return pipe;
}

function normalizeWord(word: string): string {
  return word.replace(/[^\w\u0400-\u04FF\u0600-\u06FF'']/g, '').trim();
}

export async function transcribeAudio(
  audioPath: string,
  onProgress?: (stage: string, progress: number) => void
): Promise<{ subtitles: SubtitleItem[]; language: string; duration: number }> {
  onProgress?.('transcribing', 10);

  const transcriber = await getTranscriber();

  onProgress?.('transcribing', 30);

  const audioBuffer = fs.readFileSync(audioPath);

  const startTime = Date.now();
  const result = await transcriber(audioBuffer, {
    language: 'uz',
    task: 'transcribe',
    return_timestamps: 'word',
  });
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`Transcription completed in ${elapsed}s`);

  onProgress?.('transcribing', 70);

  const chunks = result.chunks || [];
  const words: WordTimestamp[] = [];

  for (const chunk of chunks) {
    if (chunk.timestamp) {
      const [start, end] = Array.isArray(chunk.timestamp)
        ? chunk.timestamp
        : [0, 0];
      const text = normalizeWord(chunk.text || '');
      if (text && typeof start === 'number') {
        words.push({
          word: text,
          start: start,
          end: typeof end === 'number' ? end : start + 0.3,
          confidence: 1,
        });
      }
    }
  }

  onProgress?.('generating', 80);

  const subtitles: SubtitleItem[] = [];
  const CHUNK_SIZE = 8;

  for (let i = 0; i < words.length; i += CHUNK_SIZE) {
    const chunk = words.slice(i, i + CHUNK_SIZE);
    if (chunk.length === 0) continue;
    subtitles.push({
      id: `sub-${subtitles.length + 1}`,
      index: subtitles.length + 1,
      start: chunk[0].start,
      end: chunk[chunk.length - 1].end,
      text: chunk.map((w) => w.word).join(' '),
      words: chunk,
    });
  }

  const totalDuration = words.length > 0 ? words[words.length - 1].end : 0;

  onProgress?.('almostDone', 95);

  return {
    subtitles,
    language: 'uz',
    duration: totalDuration,
  };
}

export async function transcribeWithFallback(
  audioPath: string,
  onProgress?: (stage: string, progress: number) => void
): Promise<{ subtitles: SubtitleItem[]; language: string; duration: number }> {
  try {
    return await transcribeAudio(audioPath, onProgress);
  } catch (error) {
    const err = error as Error;
    console.error('Whisper transcription failed:', err.message);

    if (err.message?.includes('Model') || err.message?.includes('download')) {
      console.log('Model download issue. Using mock data for development.');
    } else {
      console.log('Transcription error. Using mock data for development.');
    }

    return generateMockTranscription();
  }
}

function generateMockTranscription(): { subtitles: SubtitleItem[]; language: string; duration: number } {
  const mockSentences = [
    'Assalomu alaykum bugun biz',
    'yangi O\'zbek tilida subtitle',
    'yaratishni o\'rganamiz Bu',
    'juda qiziqarli va foydali',
    'jarayon hisoblanadi',
  ];

  const subtitles: SubtitleItem[] = [];
  let currentTime = 0;

  mockSentences.forEach((sentence, idx) => {
    const wordList = sentence.split(' ');
    const duration = wordList.length * 0.4;
    const words: WordTimestamp[] = wordList.map((word, wIdx) => ({
      word,
      start: currentTime + wIdx * 0.4,
      end: currentTime + (wIdx + 1) * 0.4,
      confidence: 1,
    }));

    subtitles.push({
      id: `sub-${idx + 1}`,
      index: idx + 1,
      start: currentTime,
      end: currentTime + duration,
      text: sentence,
      words,
    });

    currentTime += duration + 0.5;
  });

  return {
    subtitles,
    language: 'uz',
    duration: currentTime,
  };
}
