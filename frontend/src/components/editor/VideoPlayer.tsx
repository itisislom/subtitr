import { useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { SubtitleItem } from '@/types';
import { cn } from '@/utils/cn';

function getActiveSubtitle(subtitles: SubtitleItem[], currentTime: number): SubtitleItem | null {
  return subtitles.find((s) => currentTime >= s.start && currentTime <= s.end) || null;
}

function getActiveWordIndex(words: { start: number; end: number }[], currentTime: number): number {
  return words.findIndex((w) => currentTime >= w.start && currentTime <= w.end);
}

export function VideoPlayer() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    subtitles,
    style,
    projectId,
    video,
    setVideoState,
  } = useStore();

  const activeSubtitle = getActiveSubtitle(subtitles, video.currentTime);
  const activeWordIndex = activeSubtitle ? getActiveWordIndex(activeSubtitle.words, video.currentTime) : -1;

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      setVideoState({ currentTime: videoRef.current.currentTime });
    }
  }, [setVideoState]);

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setVideoState({
        duration: videoRef.current.duration,
        isPlaying: !videoRef.current.paused,
      });
    }
  }, [setVideoState]);

  const handlePlay = useCallback(() => {
    setVideoState({ isPlaying: true });
    videoRef.current?.play();
  }, [setVideoState]);

  const handlePause = useCallback(() => {
    setVideoState({ isPlaying: false });
    videoRef.current?.pause();
  }, [setVideoState]);

  const togglePlay = useCallback(() => {
    if (videoRef.current?.paused) {
      handlePlay();
    } else {
      handlePause();
    }
  }, [handlePlay, handlePause]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = video.volume;
      videoRef.current.playbackRate = video.playbackRate;
    }
  }, [video.volume, video.playbackRate]);

  const seekTo = useCallback((time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setVideoState({ currentTime: time });
    }
  }, [setVideoState]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const getAnimationStyle = () => {
    const base: React.CSSProperties = {
      fontFamily: style.fontFamily,
      fontSize: `${style.fontSize}px`,
      fontWeight: style.fontWeight,
      color: style.color,
      WebkitTextStroke: `${style.strokeWidth}px ${style.strokeColor}`,
      textShadow: style.shadow || undefined,
      opacity: style.opacity,
      background: style.background !== 'transparent' ? style.background : undefined,
      borderRadius: `${style.borderRadius}px`,
      padding: `${style.padding}px`,
      letterSpacing: `${style.letterSpacing}px`,
      lineHeight: style.lineHeight,
      textAlign: style.alignment,
    };
    return base;
  };

  const positionClass = {
    top: 'top-8',
    middle: 'top-1/2 -translate-y-1/2',
    bottom: 'bottom-12',
  }[style.position];

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl group cursor-pointer"
      onClick={togglePlay}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setVideoState({ isPlaying: true })}
        onPause={() => setVideoState({ isPlaying: false })}
        onEnded={() => setVideoState({ isPlaying: false })}
        preload="auto"
      >
        <source src={`/api/video/${projectId}`} type="video/mp4" />
      </video>

      <AnimatedSubtitle
        subtitle={activeSubtitle}
        activeWordIndex={activeWordIndex}
        style={getAnimationStyle()}
        positionClass={positionClass}
        animationIn={style.animationIn}
        animationDuration={style.animationDuration}
      />

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="flex items-center gap-3">
          <button
            onClick={(e) => { e.stopPropagation(); togglePlay(); }}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all"
          >
            <span className="text-white text-lg">
              {video.isPlaying ? '⏸' : '▶'}
            </span>
          </button>

          <div className="flex-1 relative h-1.5 bg-white/20 rounded-full cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              const rect = e.currentTarget.getBoundingClientRect();
              const x = (e.clientX - rect.left) / rect.width;
              seekTo(x * video.duration);
            }}
          >
            <motion.div
              className="absolute inset-y-0 left-0 bg-primary rounded-full"
              style={{ width: `${(video.currentTime / video.duration) * 100}%` }}
            />
          </div>

          <span className="text-white/80 text-xs tabular-nums min-w-[80px] text-right">
            {formatTime(video.currentTime)} / {formatTime(video.duration)}
          </span>
        </div>
      </div>
    </div>
  );
}

interface AnimatedSubtitleProps {
  subtitle: SubtitleItem | null;
  activeWordIndex: number;
  style: React.CSSProperties;
  positionClass: string;
  animationIn: string;
  animationDuration: number;
}

function AnimatedSubtitle({
  subtitle,
  activeWordIndex,
  style,
  positionClass,
  animationIn,
  animationDuration,
}: AnimatedSubtitleProps) {
  const getAnimationProps = () => {
    const duration = animationDuration;
    switch (animationIn) {
      case 'fade':
        return { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration } };
      case 'pop':
        return { initial: { opacity: 0, scale: 0.8 }, animate: { opacity: 1, scale: 1 }, transition: { duration, type: 'spring' as const } };
      case 'scale':
        return { initial: { opacity: 0, scale: 0.5 }, animate: { opacity: 1, scale: 1 }, transition: { duration } };
      case 'slideUp':
        return { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration } };
      case 'slideDown':
        return { initial: { opacity: 0, y: -20 }, animate: { opacity: 1, y: 0 }, transition: { duration } };
      case 'bounce':
        return { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 }, transition: { duration: duration, type: 'spring' as const, bounce: 0.5 } };
      case 'zoom':
        return { initial: { opacity: 0, scale: 1.5 }, animate: { opacity: 1, scale: 1 }, transition: { duration } };
      default:
        return { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration } };
    }
  };

  if (!subtitle) return null;

  const animProps = getAnimationProps();

  return (
    <motion.div
      key={subtitle.id}
      className={`absolute left-1/2 -translate-x-1/2 ${positionClass} px-6`}
      {...animProps}
    >
      <div style={style} className="inline-flex flex-wrap justify-center gap-x-2">
        {subtitle.words.map((word, idx) => (
          <motion.span
            key={idx}
            className={cn(
              'transition-all duration-150',
              idx === activeWordIndex ? 'text-primary font-bold scale-110' : 'text-white',
              idx < activeWordIndex && 'opacity-60'
            )}
            initial={idx === activeWordIndex ? { scale: 1 } : {}}
            animate={idx === activeWordIndex ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            {word.word}
          </motion.span>
        ))}
      </div>
    </motion.div>
  );
}
