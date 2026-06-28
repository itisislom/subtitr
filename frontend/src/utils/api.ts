import { SubtitleItem, SubtitleStyle, SubtitlePreset, ProjectData, ExportFormat } from '../types';

const API_BASE = '/api';

async function request<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  const json = await res.json();

  if (!json.success) {
    throw new Error(json.error || 'Request failed');
  }

  return json.data as T;
}

export const api = {
  async uploadVideo(file: File, onProgress?: (progress: number) => void): Promise<{ projectId: string; filename: string; duration: number }> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append('video', file);

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      });

      xhr.addEventListener('load', () => {
        try {
          const json = JSON.parse(xhr.responseText);
          if (json.success) resolve(json.data);
          else reject(new Error(json.error));
        } catch {
          reject(new Error('Failed to parse response'));
        }
      });

      xhr.addEventListener('error', () => reject(new Error('Upload failed')));
      xhr.open('POST', `${API_BASE}/upload`);
      xhr.send(formData);
    });
  },

  async transcribe(projectId: string, onProgress?: (stage: string, progress: number) => void): Promise<{ subtitles: SubtitleItem[]; language: string; duration: number }> {
    const eventSource = new EventSource(`${API_BASE}/transcribe/${projectId}/progress`);
    return new Promise((resolve, reject) => {
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.stage && onProgress) {
            onProgress(data.stage, data.progress);
          }
        } catch { }
      };

      eventSource.onerror = () => {
        console.warn('SSE connection error');
      };

      request<{ subtitles: SubtitleItem[]; language: string; duration: number }>(
        `/transcribe/${projectId}`,
        { method: 'POST' }
      )
        .then((data) => {
          eventSource.close();
          resolve(data);
        })
        .catch((err) => {
          eventSource.close();
          reject(err);
        });
    });
  },

  async getProject(projectId: string): Promise<ProjectData> {
    return request<ProjectData>(`/project/${projectId}`);
  },

  async updateSubtitles(projectId: string, subtitles: SubtitleItem[]): Promise<ProjectData> {
    return request<ProjectData>(`/project/${projectId}/subtitles`, {
      method: 'PUT',
      body: JSON.stringify({ subtitles }),
    });
  },

  async updateStyle(projectId: string, style: SubtitleStyle): Promise<ProjectData> {
    return request<ProjectData>(`/project/${projectId}/style`, {
      method: 'PUT',
      body: JSON.stringify({ style }),
    });
  },

  async exportSubtitles(projectId: string, format: ExportFormat): Promise<Blob> {
    const res = await fetch(`${API_BASE}/export/${projectId}/${format}`);
    return res.blob();
  },

  async burnSubtitles(projectId: string): Promise<Blob> {
    const res = await fetch(`${API_BASE}/burn/${projectId}`, { method: 'POST' });
    return res.blob();
  },

  async getPresets(): Promise<SubtitlePreset[]> {
    return request<SubtitlePreset[]>('/presets');
  },
};
