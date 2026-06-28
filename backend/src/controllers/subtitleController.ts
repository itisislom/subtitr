import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { transcribeWithFallback } from '../services/whisper';
import { transcribeWithGemini } from '../services/gemini';
import { extractAudio, getVideoDuration, exportSRT, exportVTT, exportTXT, exportASS, burnSubtitles } from '../services/ffmpeg';
import { SubtitleItem, SubtitleStyle, SubtitlePreset, ProjectData, ApiResponse } from '../types';
import { addClient, sendProgress } from '../services/progressManager';

const projects = new Map<string, ProjectData>();

const PRESETS: SubtitlePreset[] = [
  {
    id: 'classic',
    name: 'Classic',
    style: {
      fontSize: 24, fontFamily: 'Inter, sans-serif', fontWeight: 400,
      color: '#FFFFFF', strokeColor: '#000000', strokeWidth: 1,
      shadow: '0 2px 4px rgba(0,0,0,0.5)', opacity: 1,
      background: 'rgba(0,0,0,0.5)', borderRadius: 4, padding: 8,
      position: 'bottom', alignment: 'center', letterSpacing: 0,
      lineHeight: 1.4, animationIn: 'fade', animationOut: 'fade', animationDuration: 0.3,
    },
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    style: {
      fontSize: 28, fontFamily: 'Montserrat, sans-serif', fontWeight: 700,
      color: '#FFFFFF', strokeColor: '#000000', strokeWidth: 2,
      shadow: '0 4px 8px rgba(0,0,0,0.6)', opacity: 1,
      background: 'rgba(0,0,0,0.4)', borderRadius: 8, padding: 12,
      position: 'bottom', alignment: 'center', letterSpacing: 1,
      lineHeight: 1.5, animationIn: 'pop', animationOut: 'fade', animationDuration: 0.2,
    },
  },
  {
    id: 'capcut',
    name: 'CapCut',
    style: {
      fontSize: 26, fontFamily: 'Poppins, sans-serif', fontWeight: 600,
      color: '#FFFFFF', strokeColor: '#1a1a2e', strokeWidth: 1.5,
      shadow: '0 2px 4px rgba(0,0,0,0.4)', opacity: 1,
      background: 'transparent', borderRadius: 0, padding: 6,
      position: 'bottom', alignment: 'center', letterSpacing: 0.5,
      lineHeight: 1.3, animationIn: 'slideUp', animationOut: 'slideDown', animationDuration: 0.3,
    },
  },
  {
    id: 'minimal',
    name: 'Minimal',
    style: {
      fontSize: 22, fontFamily: 'Inter, sans-serif', fontWeight: 300,
      color: '#FFFFFF', strokeColor: 'transparent', strokeWidth: 0,
      shadow: '0 1px 2px rgba(0,0,0,0.3)', opacity: 0.9,
      background: 'transparent', borderRadius: 0, padding: 4,
      position: 'bottom', alignment: 'center', letterSpacing: 0,
      lineHeight: 1.3, animationIn: 'fade', animationOut: 'fade', animationDuration: 0.3,
    },
  },
  {
    id: 'bold',
    name: 'Bold',
    style: {
      fontSize: 32, fontFamily: 'Inter, sans-serif', fontWeight: 800,
      color: '#FFFFFF', strokeColor: '#000000', strokeWidth: 3,
      shadow: '0 4px 8px rgba(0,0,0,0.7)', opacity: 1,
      background: 'rgba(0,0,0,0.6)', borderRadius: 6, padding: 10,
      position: 'bottom', alignment: 'center', letterSpacing: 1,
      lineHeight: 1.4, animationIn: 'scale', animationOut: 'fade', animationDuration: 0.25,
    },
  },
  {
    id: 'cinema',
    name: 'Cinema',
    style: {
      fontSize: 20, fontFamily: 'EB Garamond, serif', fontWeight: 400,
      color: '#F5F5F5', strokeColor: '#000000', strokeWidth: 1,
      shadow: '0 2px 6px rgba(0,0,0,0.5)', opacity: 1,
      background: 'rgba(0,0,0,0.3)', borderRadius: 2, padding: 6,
      position: 'bottom', alignment: 'center', letterSpacing: 1.5,
      lineHeight: 1.5, animationIn: 'fade', animationOut: 'fade', animationDuration: 0.5,
    },
  },
  {
    id: 'youtube',
    name: 'YouTube',
    style: {
      fontSize: 24, fontFamily: 'Roboto, sans-serif', fontWeight: 500,
      color: '#FFFFFF', strokeColor: '#000000', strokeWidth: 2,
      shadow: '0 2px 4px rgba(0,0,0,0.5)', opacity: 1,
      background: 'rgba(0,0,0,0.5)', borderRadius: 4, padding: 8,
      position: 'bottom', alignment: 'center', letterSpacing: 0,
      lineHeight: 1.4, animationIn: 'fade', animationOut: 'fade', animationDuration: 0.3,
    },
  },
  {
    id: 'instagram',
    name: 'Instagram',
    style: {
      fontSize: 30, fontFamily: 'Poppins, sans-serif', fontWeight: 600,
      color: '#FFFFFF', strokeColor: '#000000', strokeWidth: 2.5,
      shadow: '0 4px 12px rgba(0,0,0,0.6)', opacity: 1,
      background: 'rgba(0,0,0,0.3)', borderRadius: 10, padding: 14,
      position: 'bottom', alignment: 'center', letterSpacing: 0.5,
      lineHeight: 1.4, animationIn: 'pop', animationOut: 'fade', animationDuration: 0.25,
    },
  },
];

export const subtitleController = {
  async uploadVideo(req: Request, res: Response): Promise<void> {
    try {
      const file = req.file;
      if (!file) {
        res.status(400).json({ success: false, error: 'No file uploaded' } as ApiResponse);
        return;
      }

      const projectId = uuidv4();
      const videoPath = file.path;

      const duration = await getVideoDuration(videoPath);

      if (duration > 300) {
        fs.unlinkSync(videoPath);
        res.status(400).json({ success: false, error: 'Video duration exceeds 5 minutes' } as ApiResponse);
        return;
      }

      const project: ProjectData = {
        id: projectId,
        videoPath,
        subtitles: [],
        style: PRESETS[0].style,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      projects.set(projectId, project);

      res.json({
        success: true,
        data: { projectId, filename: file.originalname, duration },
      } as ApiResponse);
    } catch (error) {
      res.status(500).json({ success: false, error: 'Upload failed' } as ApiResponse);
    }
  },

  async transcribeProgress(req: Request, res: Response): Promise<void> {
    const { projectId } = req.params;
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });
    res.write(`data: ${JSON.stringify({ stage: 'connected', progress: 0 })}\n\n`);
    addClient(projectId, res);
  },

  async transcribe(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const project = projects.get(projectId);

      if (!project) {
        res.status(404).json({ success: false, error: 'Project not found' } as ApiResponse);
        return;
      }

      const audioPath = await extractAudio(project.videoPath);

      let result;
      try {
        result = await transcribeWithGemini(audioPath, (stage, progress) => {
          sendProgress(projectId, stage, progress);
        });
      } catch (geminiErr) {
        const err = geminiErr as Error;
        console.warn('Gemini failed, falling back to Whisper:', err.message);
        result = await transcribeWithFallback(audioPath, (stage, progress) => {
          sendProgress(projectId, stage, progress);
        });
      }

      project.subtitles = result.subtitles;
      project.updatedAt = new Date().toISOString();

      res.json({
        success: true,
        data: { subtitles: result.subtitles, language: result.language, duration: result.duration },
      } as ApiResponse);
    } catch (error) {
      res.status(500).json({ success: false, error: 'Transcription failed' } as ApiResponse);
    }
  },

  async getProject(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const project = projects.get(projectId);

      if (!project) {
        res.status(404).json({ success: false, error: 'Project not found' } as ApiResponse);
        return;
      }

      res.json({ success: true, data: project } as ApiResponse);
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to get project' } as ApiResponse);
    }
  },

  async updateSubtitles(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const { subtitles } = req.body as { subtitles: SubtitleItem[] };
      const project = projects.get(projectId);

      if (!project) {
        res.status(404).json({ success: false, error: 'Project not found' } as ApiResponse);
        return;
      }

      project.subtitles = subtitles;
      project.updatedAt = new Date().toISOString();

      res.json({ success: true, data: project } as ApiResponse);
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to update subtitles' } as ApiResponse);
    }
  },

  async updateStyle(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const { style } = req.body as { style: SubtitleStyle };
      const project = projects.get(projectId);

      if (!project) {
        res.status(404).json({ success: false, error: 'Project not found' } as ApiResponse);
        return;
      }

      project.style = style;
      project.updatedAt = new Date().toISOString();

      res.json({ success: true, data: project } as ApiResponse);
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to update style' } as ApiResponse);
    }
  },

  async exportSubtitles(req: Request, res: Response): Promise<void> {
    try {
      const { projectId, format } = req.params;
      const project = projects.get(projectId);

      if (!project) {
        res.status(404).json({ success: false, error: 'Project not found' } as ApiResponse);
        return;
      }

      let content: string;
      const ext = format as 'srt' | 'vtt' | 'txt' | 'ass';

      switch (ext) {
        case 'srt':
          content = exportSRT(project.subtitles);
          break;
        case 'vtt':
          content = exportVTT(project.subtitles);
          break;
        case 'txt':
          content = exportTXT(project.subtitles);
          break;
        case 'ass':
          content = exportASS(project.subtitles, project.style);
          break;
        default:
          res.status(400).json({ success: false, error: 'Invalid format' } as ApiResponse);
          return;
      }

      const filename = `subtitles.${ext}`;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(content);
    } catch (error) {
      res.status(500).json({ success: false, error: 'Export failed' } as ApiResponse);
    }
  },

  async burnIn(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const project = projects.get(projectId);

      if (!project) {
        res.status(404).json({ success: false, error: 'Project not found' } as ApiResponse);
        return;
      }

      const outputPath = path.join(__dirname, '../../output', `${projectId}_burned.mp4`);
      const srtPath = path.join(__dirname, '../../output', `${projectId}.srt`);

      const resultPath = await burnSubtitles(project.videoPath, project.subtitles, srtPath, outputPath);

      res.download(resultPath, 'subtitled_video.mp4', (err) => {
        if (err) {
          res.status(500).json({ success: false, error: 'Download failed' } as ApiResponse);
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Burn-in failed' } as ApiResponse);
    }
  },

  getPresets(_req: Request, res: Response): void {
    res.json({ success: true, data: PRESETS } as ApiResponse<SubtitlePreset[]>);
  },

  async streamVideo(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const project = projects.get(projectId);

      if (!project) {
        res.status(404).json({ success: false, error: 'Project not found' } as ApiResponse);
        return;
      }

      const videoPath = project.videoPath;
      const stat = fs.statSync(videoPath);
      const fileSize = stat.size;
      const range = req.headers.range;

      if (range) {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = end - start + 1;
        const file = fs.createReadStream(videoPath, { start, end });
        const head = {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': 'video/mp4',
        };
        res.writeHead(206, head);
        file.pipe(res);
      } else {
        const head = {
          'Content-Length': fileSize,
          'Content-Type': 'video/mp4',
        };
        res.writeHead(200, head);
        fs.createReadStream(videoPath).pipe(res);
      }
    } catch (error) {
      res.status(500).json({ success: false, error: 'Stream failed' } as ApiResponse);
    }
  },
};
