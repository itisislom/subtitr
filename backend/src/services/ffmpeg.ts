import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import ffprobeInstaller from '@ffprobe-installer/ffprobe';
import path from 'path';
import fs from 'fs';
import { SubtitleItem, SubtitleStyle } from '../types';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);
ffmpeg.setFfprobePath(ffprobeInstaller.path);

function formatTimeSRT(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds - Math.floor(seconds)) * 1000);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
}

function formatTimeVTT(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toFixed(3).padStart(6, '0')}`;
}

export function exportSRT(subtitles: SubtitleItem[]): string {
  return subtitles
    .map(
      (sub, i) =>
        `${i + 1}\n${formatTimeSRT(sub.start)} --> ${formatTimeSRT(sub.end)}\n${sub.text}\n`
    )
    .join('\n');
}

export function exportVTT(subtitles: SubtitleItem[]): string {
  const header = 'WEBVTT\n\n';
  return (
    header +
    subtitles
      .map(
        (sub) =>
          `${formatTimeVTT(sub.start)} --> ${formatTimeVTT(sub.end)}\n${sub.text}\n`
      )
      .join('\n')
  );
}

export function exportTXT(subtitles: SubtitleItem[]): string {
  return subtitles.map((sub) => sub.text).join('\n\n');
}

export function exportASS(subtitles: SubtitleItem[], style: SubtitleStyle): string {
  const header = `[Script Info]
Title: Subtitr Generated Subtitles
ScriptType: v4.00+
WrapStyle: 0
ScaledBorderAndShadow: yes
YCbCr Matrix: None

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,${style.fontFamily},${style.fontSize},${hexToASS(style.color)},${hexToASS(style.color)},${hexToASS(style.strokeColor)},${hexToASS('#000000')},${style.fontWeight > 500 ? -1 : 0},0,0,0,100,100,${style.letterSpacing},0,1,${style.strokeWidth},${getShadowSize(style.shadow)},${getAlignment(style.alignment)},10,10,10,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

  const events = subtitles
    .map(
      (sub) =>
        `Dialogue: 0,${formatTimeASS(sub.start)},${formatTimeASS(sub.end)},Default,,0,0,0,,${sub.text}`
    )
    .join('\n');

  return header + events;
}

function hexToASS(hex: string): string {
  const color = hex.replace('#', '');
  const r = color.substring(0, 2);
  const g = color.substring(2, 4);
  const b = color.substring(4, 6);
  return `&H00${b}${g}${r}&`;
}

function getShadowSize(shadow: string): number {
  if (shadow === 'none') return 0;
  const match = shadow.match(/(\d+)/);
  return match ? parseInt(match[1]) : 2;
}

function getAlignment(align: 'left' | 'center' | 'right'): number {
  switch (align) {
    case 'left': return 1;
    case 'center': return 2;
    case 'right': return 3;
    default: return 2;
  }
}

function formatTimeASS(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(1, '0')}:${m.toString().padStart(2, '0')}:${s.toFixed(2).padStart(5, '0')}`;
}

export function extractAudio(videoPath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const outputPath = videoPath.replace(path.extname(videoPath), '.mp3');
    ffmpeg(videoPath)
      .output(outputPath)
      .audioCodec('libmp3lame')
      .audioBitrate(128)
      .on('end', () => resolve(outputPath))
      .on('error', (err) => {
        console.error('FFmpeg extractAudio error:', err.message);
        reject(err);
      })
      .run();
  });
}

export async function getVideoDuration(videoPath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) {
        console.error('FFprobe error:', err.message);
        reject(err);
      } else {
        resolve(metadata.format.duration || 0);
      }
    });
  });
}

export { getVideoDuration as getMediaDuration };

export async function burnSubtitles(
  videoPath: string,
  subtitles: SubtitleItem[],
  srtPath: string,
  outputPath: string
): Promise<string> {
  const srtContent = exportSRT(subtitles);
  fs.writeFileSync(srtPath, srtContent, 'utf-8');

  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .outputOptions([
        `-vf subtitles=${srtPath.replace(/\\/g, '/').replace(/:/g, '\\:')}`,
        '-c:a copy',
      ])
      .output(outputPath)
      .on('end', () => resolve(outputPath))
      .on('error', (err) => {
        console.error('FFmpeg burnSubtitles error:', err.message);
        reject(err);
      })
      .run();
  });
}
