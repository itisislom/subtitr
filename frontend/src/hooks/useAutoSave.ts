import { useEffect, useRef } from 'react';
import { useStore } from '@/store/useStore';
import { api } from '@/utils/api';

export function useAutoSave() {
  const { projectId, subtitles, style, page } = useStore();
  const lastSave = useRef<string>('');

  useEffect(() => {
    if (page !== 'editor' || !projectId) return;

    const interval = setInterval(async () => {
      const currentState = JSON.stringify({ subtitles, style });
      if (currentState === lastSave.current) return;

      try {
        await api.updateSubtitles(projectId, subtitles);
        await api.updateStyle(projectId, style);
        lastSave.current = currentState;
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [projectId, subtitles, style, page]);
}
