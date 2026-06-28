import fs from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { WordTimestamp, SubtitleItem } from '../types';
import { getMediaDuration } from './ffmpeg';

const apiKey = process.env.GEMINI_API_KEY;
let model: any = null;

function getModel() {
  if (model) return model;
  if (!apiKey) throw new Error('GEMINI_API_KEY not set');
  model = new GoogleGenerativeAI(apiKey).getGenerativeModel({ model: 'gemini-2.0-flash' });
  return model;
}

export async function transcribeWithGemini(
  audioPath: string,
  onProgress?: (stage: string, progress: number) => void
): Promise<{ subtitles: SubtitleItem[]; language: string; duration: number }> {
  onProgress?.('transcribing', 10);

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not set');
  }

  const model = getModel();

  onProgress?.('transcribing', 30);

  const audioData = fs.readFileSync(audioPath);
  const mimeType = 'audio/mpeg';

  const prompt = `Transcribe this audio to text. Return ONLY the raw transcribed text, no explanations, no timestamps. Preserve the original language as spoken in the audio. If speech is not in a language you recognize, still transcribe it phonetically.`;

  const result = await model.generateContent([
    { text: prompt },
    {
      inlineData: {
        mimeType,
        data: audioData.toString('base64'),
      },
    },
  ]);

  onProgress?.('transcribing', 70);

  const text: string = result.response.text();
  const wordList: string[] = text.split(/\s+/).filter((w: string) => w.length > 0);

  if (wordList.length === 0) {
    throw new Error('Gemini returned empty transcription');
  }

  onProgress?.('generating', 80);

  let duration = 0;
  try {
    duration = await getMediaDuration(audioPath);
  } catch {
    duration = wordList.length * 0.35;
  }

  const words: WordTimestamp[] = wordList.map((word: string, i: number) => ({
    word,
    start: (i / wordList.length) * duration,
    end: ((i + 1) / wordList.length) * duration,
    confidence: 1,
  }));

  const subtitles: SubtitleItem[] = [];
  const CHUNK_SIZE = 10;
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

  onProgress?.('almostDone', 95);

  return { subtitles, language: 'auto', duration };
}
