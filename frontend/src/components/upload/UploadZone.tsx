import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Film, FileVideo, AlertCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface UploadZoneProps {
  onUpload: (file: File) => void;
  isUploading: boolean;
}

const ALLOWED_TYPES = ['video/mp4', 'video/quicktime', 'video/avi', 'video/x-matroska', 'video/webm'];
const MAX_SIZE = 500 * 1024 * 1024;

export function UploadZone({ onUpload, isUploading }: UploadZoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: { errors: readonly { message: string }[] }[]) => {
      setError(null);

      if (fileRejections.length > 0) {
        setError(fileRejections[0].errors[0].message);
        return;
      }

      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        if (file.size > MAX_SIZE) {
          setError('File size exceeds 500 MB limit');
          return;
        }
        onUpload(file);
      }
    },
    [onUpload]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.mov', '.avi', '.mkv', '.webm'],
    },
    maxFiles: 1,
    maxSize: MAX_SIZE,
    disabled: isUploading,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <div
        {...getRootProps()}
        className={cn(
          'relative cursor-pointer rounded-3xl border-2 border-dashed transition-all duration-500',
          'drop-area p-16 md:p-24',
          isDragActive
            ? 'border-primary/50 bg-primary/5 shadow-lg shadow-primary/10 scale-[1.02]'
            : 'border-border/50 hover:border-primary/30 hover:bg-primary/3 hover:shadow-xl hover:shadow-primary/5',
          isUploading && 'pointer-events-none opacity-50'
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-6 text-center">
          <motion.div
            animate={isDragActive ? { scale: 1.1, rotate: [0, -5, 5, 0] } : { scale: 1 }}
            transition={{ duration: 0.3 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl" />
            <div className={cn(
              'relative flex items-center justify-center w-24 h-24 rounded-full',
              'bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20',
              'shadow-2xl shadow-primary/10'
            )}>
              {isDragActive ? (
                <Film className="w-10 h-10 text-primary" />
              ) : (
                <Upload className="w-10 h-10 text-primary/80" />
              )}
            </div>
          </motion.div>

          <div className="space-y-2">
            <h3 className="text-2xl font-semibold text-foreground tracking-tight">
              {isDragActive ? 'Drop your video here' : 'Upload Video'}
            </h3>
            <p className="text-muted-foreground/80 text-sm max-w-md mx-auto leading-relaxed">
              Drag and drop your video file here, or click to browse
            </p>
          </div>

          <div className="flex flex-wrap gap-3 justify-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/50 text-xs text-muted-foreground border border-border/50">
              <FileVideo className="w-3.5 h-3.5" />
              MP4, MOV, AVI, MKV, WEBM
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/50 text-xs text-muted-foreground border border-border/50">
              Max 500 MB
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/50 text-xs text-muted-foreground border border-border/50">
              5 minutes max
            </span>
          </div>
        </div>

        <AnimatePresence>
          {isDragActive && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 rounded-3xl border-2 border-primary/30 pointer-events-none"
            />
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 flex items-center gap-2 px-4 py-3 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
