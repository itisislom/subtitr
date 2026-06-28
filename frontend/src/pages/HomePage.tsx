import { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadZone } from '@/components/upload/UploadZone';
import { ProcessingProgress } from '@/components/progress/ProcessingProgress';
import { useStore } from '@/store/useStore';
import { api } from '@/utils/api';

export function HomePage() {
  const {
    uploadProgress,
    setUploadProgress,
    setProjectId,
    setSubtitles,
    setPage,
    setPresets,
  } = useStore();

  const handleUpload = useCallback(async (file: File) => {
    try {
      setUploadProgress({ stage: 'uploading', progress: 0 });

      const { projectId } = await api.uploadVideo(file, (progress) => {
        setUploadProgress({ stage: 'uploading', progress });
      });
      setProjectId(projectId);

      setUploadProgress({ stage: 'analyzing', progress: 20 });

      setUploadProgress({ stage: 'transcribing', progress: 40 });

      const result = await api.transcribe(projectId, (stage, progress) => {
        const mappedStage = stage === 'generating'
          ? 'generating'
          : stage === 'almostDone'
            ? 'almostDone'
            : 'transcribing';
        setUploadProgress({ stage: mappedStage, progress: 40 + progress * 0.5 });
      });

      setUploadProgress({ stage: 'generating', progress: 90 });
      setSubtitles(result.subtitles);

      const presets = await api.getPresets();
      setPresets(presets);

      setUploadProgress({ stage: 'completed', progress: 100 });

      setTimeout(() => {
        setPage('editor');
      }, 800);
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadProgress({ stage: 'idle', progress: 0 });
    }
  }, [setUploadProgress, setProjectId, setSubtitles, setPage, setPresets]);

  const isProcessing = uploadProgress.stage !== 'idle';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      <motion.div
        className="flex flex-col items-center gap-4 mb-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        <motion.h1
          className="text-7xl md:text-8xl lg:text-9xl font-black tracking-tight text-gradient"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          Subtitr
        </motion.h1>
        <motion.p
          className="text-lg md:text-xl text-muted-foreground/70 font-light tracking-wide"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          AI Subtitle Generator
        </motion.p>
      </motion.div>

      <AnimatePresence mode="wait">
        {isProcessing ? (
          <ProcessingProgress
            key="progress"
            stage={uploadProgress.stage}
            progress={uploadProgress.progress}
          />
        ) : (
          <UploadZone
            key="upload"
            onUpload={handleUpload}
            isUploading={false}
          />
        )}
      </AnimatePresence>

      <motion.div
        className="mt-16 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <p className="text-xs text-muted-foreground/40 max-w-md mx-auto leading-relaxed">
          Powered by OpenAI Whisper &middot; O'zbekcha &middot; Word-level timestamps
        </p>
      </motion.div>
    </div>
  );
}
