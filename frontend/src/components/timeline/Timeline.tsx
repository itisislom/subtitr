import { useRef, useCallback, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { cn } from '@/utils/cn';
import { ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Timeline() {
  const {
    subtitles,
    video,
    setVideoState,
    editor,
    setEditorState,
    setSubtitles,
    pushUndo,
  } = useStore();

  const timelineRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [zoom, setZoom] = useState(50);

  const totalDuration = video.duration || 60;
  const pixelsPerSecond = zoom;
  const totalWidth = totalDuration * pixelsPerSecond;

  const handleTimelineClick = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - rect.left) / totalWidth;
      const time = x * totalDuration;
      setVideoState({ currentTime: Math.max(0, Math.min(time, totalDuration)) });
    },
    [totalWidth, totalDuration, setVideoState, isDragging]
  );

  const handleSubtitleDrag = useCallback(
    (id: string, newStart: number) => {
      pushUndo();
      const sub = subtitles.find((s) => s.id === id);
      if (!sub) return;
      const duration = sub.end - sub.start;
      const clampedStart = Math.max(0, Math.min(newStart, totalDuration - duration));
      setSubtitles(
        subtitles.map((s) =>
          s.id === id
            ? { ...s, start: clampedStart, end: clampedStart + duration }
            : s
        )
      );
    },
    [subtitles, totalDuration, setSubtitles, pushUndo]
  );

  const handleSubtitleResize = useCallback(
    (id: string, edge: 'start' | 'end', newTime: number) => {
      pushUndo();
      const sub = subtitles.find((s) => s.id === id);
      if (!sub) return;
      const clampedTime = Math.max(0, Math.min(newTime, totalDuration));

      setSubtitles(
        subtitles.map((s) =>
          s.id === id
            ? {
                ...s,
                ...(edge === 'start'
                  ? { start: Math.min(clampedTime, s.end - 0.5) }
                  : { end: Math.max(clampedTime, s.start + 0.5) }),
              }
            : s
        )
      );
    },
    [subtitles, totalDuration, setSubtitles, pushUndo]
  );

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const currentX = (video.currentTime / totalDuration) * totalWidth;

  const getSubtitleStyle = (sub: typeof subtitles[0]) => {
    const left = (sub.start / totalDuration) * totalWidth;
    const width = ((sub.end - sub.start) / totalDuration) * totalWidth;
    return { left: `${left}px`, width: `${width}px` };
  };

  return (
    <div className="glass rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Timeline
          </h4>
          <span className="text-[10px] text-muted-foreground/40">
            {subtitles.length} clips
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7"
            onClick={() => setZoom((z) => Math.max(20, z - 10))}
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </Button>
          <span className="text-[10px] text-muted-foreground min-w-[32px] text-center tabular-nums">
            {zoom}%
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7"
            onClick={() => setZoom((z) => Math.min(200, z + 10))}
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      <div
        ref={timelineRef}
        className="relative h-20 overflow-x-auto overflow-y-hidden rounded-xl bg-secondary/20 border border-border/30 cursor-pointer scrollbar-none"
        onClick={handleTimelineClick}
        style={{ scrollbarWidth: 'none' }}
      >
        <div className="relative h-full" style={{ width: `${totalWidth}px`, minWidth: '100%' }}>
          {Array.from({ length: Math.ceil(totalDuration) + 1 }, (_, i) => (
            <div
              key={i}
              className="absolute top-0 h-full border-l border-border/20"
              style={{ left: `${i * pixelsPerSecond}px` }}
            >
              {i % 5 === 0 && (
                <span className="absolute top-1 left-1 text-[9px] text-muted-foreground/40 tabular-nums">
                  {formatTime(i)}
                </span>
              )}
              <div
                className={cn(
                  'absolute bottom-0 left-0 w-full',
                  i % 5 === 0 ? 'h-full' : 'h-1/2',
                  i % 1 === 0 ? 'border-l border-border/10' : ''
                )}
              />
            </div>
          ))}

          {subtitles.map((sub) => {
            const { left, width } = getSubtitleStyle(sub);
            const isSelected = sub.id === editor.selectedSubtitleId;

            return (
              <TimelineClip
                key={sub.id}
                sub={sub}
                left={left}
                width={width}
                isSelected={isSelected}
                totalDuration={totalDuration}
                onDrag={(newStart) => handleSubtitleDrag(sub.id, newStart)}
                onResize={(edge, newTime) => handleSubtitleResize(sub.id, edge, newTime)}
                onClick={() => {
                  setEditorState({ selectedSubtitleId: sub.id });
                  setVideoState({ currentTime: sub.start });
                }}
              />
            );
          })}

          <div
            className="absolute top-0 w-0.5 h-full bg-primary shadow-lg shadow-primary/50 z-20 pointer-events-none"
            style={{ left: `${currentX}px` }}
          >
            <div className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-primary rounded-full shadow-lg shadow-primary/50" />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-[10px] text-muted-foreground/40">
        <div className="flex items-center gap-1">
          <ChevronLeft className="w-3 h-3" />
          <span>Drag to trim</span>
        </div>
        <div className="flex items-center gap-1">
          <span>Click to seek</span>
          <ChevronRight className="w-3 h-3" />
        </div>
      </div>
    </div>
  );
}

interface TimelineClipProps {
  sub: { id: string; start: number; end: number; text: string };
  left: string;
  width: string;
  isSelected: boolean;
  totalDuration: number;
  onDrag: (newStart: number) => void;
  onResize: (edge: 'start' | 'end', newTime: number) => void;
  onClick: () => void;
}

function TimelineClip({
  sub,
  left,
  width,
  isSelected,
  totalDuration,
  onDrag,
  onResize,
  onClick,
}: TimelineClipProps) {
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ mouseX: 0, subStart: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    dragStart.current = { mouseX: e.clientX, subStart: sub.start };
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const timeline = document.querySelector('[data-timeline]');
      if (!timeline) return;
      const rect = timeline.getBoundingClientRect();
      const dx = (e.clientX - dragStart.current.mouseX) / rect.width;
      const newStart = dragStart.current.subStart + dx * totalDuration;
      onDrag(newStart);
    };

    const handleMouseUp = () => setIsDragging(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, totalDuration, onDrag]);

  const parsedLeft = parseFloat(left);
  const parsedWidth = parseFloat(width);

  return (
    <div
      className={cn(
        'absolute top-2 h-16 rounded-lg transition-all duration-150 group',
        isSelected
          ? 'bg-primary/20 border-2 border-primary/50 shadow-sm shadow-primary/20 z-10'
          : 'bg-primary/10 border border-primary/20 hover:bg-primary/15 z-0'
      )}
      style={{ left, width }}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
    >
      {parsedWidth > 40 && (
        <span className="absolute inset-0 flex items-center justify-center text-[9px] text-primary/70 truncate px-2 leading-tight pointer-events-none">
          {sub.text}
        </span>
      )}

      <div
        className="absolute left-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-primary/40 rounded-l-lg transition-colors"
        onMouseDown={(e) => {
          e.stopPropagation();
          onResize('start', sub.start);
        }}
      />
      <div
        className="absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-primary/40 rounded-r-lg transition-colors"
        onMouseDown={(e) => {
          e.stopPropagation();
          onResize('end', sub.end);
        }}
      />

      <div
        className="absolute inset-x-1.5 top-0 bottom-0 cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
      />
    </div>
  );
}
