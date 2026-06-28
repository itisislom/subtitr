import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { ProgressStage } from '@/types';

interface ProcessingProgressProps {
  stage: ProgressStage;
  progress: number;
}

const STAGES: { key: ProgressStage; label: string; icon: typeof Loader2 }[] = [
  { key: 'uploading', label: 'Uploading...', icon: Loader2 },
  { key: 'analyzing', label: 'Analyzing...', icon: Loader2 },
  { key: 'transcribing', label: 'Transcribing...', icon: Loader2 },
  { key: 'generating', label: 'Generating subtitles...', icon: Loader2 },
  { key: 'almostDone', label: 'Almost done...', icon: Sparkles },
  { key: 'completed', label: 'Completed', icon: CheckCircle2 },
];

function getCurrentStageIndex(stage: ProgressStage): number {
  return STAGES.findIndex((s) => s.key === stage);
}

export function ProcessingProgress({ stage, progress }: ProcessingProgressProps) {
  const currentIndex = getCurrentStageIndex(stage);
  const [displayProgress, setDisplayProgress] = useState(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (stage === 'completed') {
      setDisplayProgress(100);
      return;
    }
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setDisplayProgress((prev) => {
        if (prev >= progress) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return progress;
        }
        return prev + 1;
      });
    }, 50);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [progress, stage]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-lg mx-auto"
    >
      <div className="glass-strong rounded-3xl p-8 subtle-shadow">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Processing</h3>
            <span className="text-sm text-muted-foreground tabular-nums">{displayProgress}%</span>
          </div>

          <div className="relative h-2 rounded-full bg-secondary overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary to-violet-400"
              initial={{ width: 0 }}
              animate={{ width: `${displayProgress}%` }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />
            <div
              className="absolute inset-0 rounded-full shine opacity-30"
              style={{ width: `${displayProgress}%` }}
            />
          </div>

          <div className="space-y-3">
            {STAGES.map((s, i) => {
              const isActive = i === currentIndex && stage !== 'completed';
              const isDone = i < currentIndex || (stage === 'completed' && i === currentIndex);
              const Icon = s.icon;

              return (
                <motion.div
                  key={s.key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={cn(
                    'flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-all duration-300',
                    isActive && 'bg-primary/10 border border-primary/20 shadow-sm',
                    isDone && 'opacity-80',
                    !isActive && !isDone && 'opacity-40'
                  )}
                >
                  <div className={cn(
                    'flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-300',
                    isDone && 'bg-primary/20 text-primary',
                    isActive && 'bg-primary/20 text-primary',
                    !isActive && !isDone && 'bg-secondary/50 text-muted-foreground'
                  )}>
                    {isActive && s.key !== 'completed' ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                      >
                        <Icon className="w-4 h-4" />
                      </motion.div>
                    ) : (
                      <Icon className={cn(
                        'w-4 h-4',
                        isDone && 'text-primary'
                      )} />
                    )}
                  </div>
                  <span className={cn(
                    'text-sm font-medium transition-all duration-300',
                    isActive && 'text-foreground',
                    isDone && 'text-foreground/80',
                    !isActive && !isDone && 'text-muted-foreground'
                  )}>
                    {s.label}
                  </span>
                  {isActive && (
                    <motion.div
                      className="ml-auto flex gap-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-primary"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                        />
                      ))}
                    </motion.div>
                  )}
                  {isDone && (
                    <CheckCircle2 className="w-4 h-4 ml-auto text-primary" />
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
