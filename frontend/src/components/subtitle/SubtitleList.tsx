import { useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, GripVertical, Search } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { SubtitleItem } from '@/types';
import { cn } from '@/utils/cn';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { v4 as uuidv4 } from 'uuid';

export function SubtitleList() {
  const {
    subtitles,
    setSubtitles,
    editor,
    setEditorState,
    video,
    setVideoState,
    searchQuery,
    setSearchQuery,
    deleteSubtitle,
    addSubtitle,
    pushUndo,
  } = useStore();

  const listRef = useRef<HTMLDivElement>(null);
  const activeItemRef = useRef<HTMLDivElement>(null);

  const filteredSubtitles = searchQuery
    ? subtitles.filter((s) =>
        s.text.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : subtitles;

  useEffect(() => {
    if (activeItemRef.current) {
      activeItemRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [editor.selectedSubtitleId]);

  const handleSeek = useCallback(
    (time: number) => {
      setVideoState({ currentTime: time });
    },
    [setVideoState]
  );

  const handleTextChange = useCallback(
    (id: string, text: string) => {
      pushUndo();
      setSubtitles(
        subtitles.map((s) =>
          s.id === id
            ? {
                ...s,
                text,
                words: text.split(' ').map((w, i) => ({
                  ...(s.words[i] || {
                    word: w,
                    start: s.start + i * 0.3,
                    end: s.start + (i + 1) * 0.3,
                    confidence: 1,
                  }),
                  word: w,
                })),
              }
            : s
        )
      );
    },
    [subtitles, setSubtitles, pushUndo]
  );

  const handleTimeChange = useCallback(
    (id: string, field: 'start' | 'end', value: string) => {
      pushUndo();
      const numValue = parseFloat(value);
      if (isNaN(numValue)) return;
      setSubtitles(
        subtitles.map((s) =>
          s.id === id ? { ...s, [field]: numValue } : s
        )
      );
    },
    [subtitles, setSubtitles, pushUndo]
  );

  const handleAddSubtitle = useCallback(() => {
    pushUndo();
    const lastSub = subtitles[subtitles.length - 1];
    const newSub: SubtitleItem = {
      id: uuidv4(),
      index: subtitles.length + 1,
      start: lastSub ? lastSub.end : 0,
      end: lastSub ? lastSub.end + 2 : 2,
      text: 'New subtitle',
      words: [{ word: 'New', start: lastSub ? lastSub.end : 0, end: lastSub ? lastSub.end + 2 : 2, confidence: 1 }],
    };
    addSubtitle(newSub);
    setEditorState({ selectedSubtitleId: newSub.id });
  }, [subtitles, addSubtitle, pushUndo, setEditorState]);

  const handleDelete = useCallback(
    (id: string) => {
      pushUndo();
      deleteSubtitle(id);
      setEditorState({ selectedSubtitleId: null });
    },
    [deleteSubtitle, pushUndo, setEditorState]
  );

  const formatTime = (seconds: number) => seconds.toFixed(2);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border/50 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Subtitles</h3>
          <span className="text-xs text-muted-foreground">{subtitles.length} lines</span>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
          <Input
            placeholder="Search subtitles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-9 text-sm"
          />
        </div>
      </div>

      <div ref={listRef} className="flex-1 overflow-y-auto py-2 px-2 space-y-1">
        <AnimatePresence>
          {filteredSubtitles.map((sub) => {
            const isActive = sub.id === editor.selectedSubtitleId;
            const isCurrentlyPlaying =
              video.currentTime >= sub.start && video.currentTime <= sub.end;

            return (
              <motion.div
                key={sub.id}
                ref={isActive ? activeItemRef : undefined}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20, height: 0 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  'rounded-2xl border transition-all duration-200 cursor-pointer overflow-hidden',
                  isActive
                    ? 'border-primary/30 bg-primary/5 shadow-sm'
                    : isCurrentlyPlaying
                      ? 'border-primary/20 bg-primary/3'
                      : 'border-transparent hover:border-border/50 hover:bg-secondary/30'
                )}
                onClick={() => {
                  setEditorState({ selectedSubtitleId: sub.id });
                  handleSeek(sub.start);
                }}
              >
                <div className="p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-3.5 h-3.5 text-muted-foreground/30 cursor-grab flex-shrink-0" />
                    <span className="text-xs font-medium text-muted-foreground/60 min-w-[24px]">
                      {sub.index}
                    </span>
                    <div className="flex items-center gap-1.5 ml-auto">
                      <input
                        type="text"
                        value={formatTime(sub.start)}
                        onChange={(e) => handleTimeChange(sub.id, 'start', e.target.value)}
                        className="w-16 px-1.5 py-0.5 text-[10px] text-muted-foreground bg-secondary/30 rounded-lg border border-transparent focus:border-primary/30 focus:outline-none text-center tabular-nums"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span className="text-[10px] text-muted-foreground/40">→</span>
                      <input
                        type="text"
                        value={formatTime(sub.end)}
                        onChange={(e) => handleTimeChange(sub.id, 'end', e.target.value)}
                        className="w-16 px-1.5 py-0.5 text-[10px] text-muted-foreground bg-secondary/30 rounded-lg border border-transparent focus:border-primary/30 focus:outline-none text-center tabular-nums"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(sub.id); }}
                        className="p-1 rounded-lg hover:bg-destructive/10 text-muted-foreground/40 hover:text-destructive transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <textarea
                    value={sub.text}
                    onChange={(e) => handleTextChange(sub.id, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className={cn(
                      'w-full bg-transparent text-sm text-foreground resize-none border-0 outline-none',
                      'placeholder:text-muted-foreground/40 leading-relaxed',
                      'scrollbar-none'
                    )}
                    rows={2}
                    style={{ minHeight: '2.5em' }}
                  />
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <div className="p-3 border-t border-border/50">
        <Button
          variant="glass"
          size="sm"
          className="w-full gap-2"
          onClick={handleAddSubtitle}
        >
          <Plus className="w-4 h-4" />
          Add Subtitle
        </Button>
      </div>
    </div>
  );
}
